import { z } from "zod";
import { verifySchema } from "@/schemas/verifySchema";
import { usernameValidation } from "@/schemas/signUpSchema";
import dbConnect from "@/lib/dbconnect";
import UserModel from "@/model/User";

const usercodeverifychema = z.object({
  username: usernameValidation,
  verifytoken: verifySchema,
});

export async function POST(request: Request) {
  await dbConnect();
  try {
    const body = await request.json();
    const { searchParams } = new URL(request.url);
    const queryParam = {
      username: body.username || searchParams.get("username"),
      verifytoken: {
        token: body.verifytoken || searchParams.get("verifytoken"),
      },
    };
    if (!queryParam.username || !queryParam.verifytoken) {
      return Response.json(
        {
          success: false,
          message: "Username and Verification token required",
        },
        {
          status: 400,
        }
      );
    }
    const result = usercodeverifychema.safeParse(queryParam);
    if (!result.success) {
      const codeerror = result.error.issues || [];
      return Response.json(
        {
          success: false,
          message:
            codeerror?.length > 0
              ? codeerror.map((e) => e.message).join(", ")
              : "Invalid query parameter",
        },
        {
          status: 400,
        }
      );
    }
    const { verifytoken, username } = result.data;
    const user = await UserModel.findOne({ username: queryParam.username });
    if (!user) {
      return Response.json(
        {
          success: false,
          message: "Error while verifying user",
        },
        {
          status: 500,
        }
      );
    }

    const iscodeValide = user.verifytoken === verifytoken.token;
    const iscodeNotExpired = new Date(user.verifytokenExpiry) > new Date();

    if (iscodeNotExpired && iscodeValide) {
      user.isverified = true;
      await user.save();
      return Response.json({
        success: true,
        message: "User verified successfully",
      });
    } else {
      return Response.json(
        {
          success: false,
          message: "Verification code is invalid or has expired",
        },
        {
          status: 400,
        }
      );
    }
  } catch (error) {
    console.error(
      "Error while verifying user:",
      error instanceof Error ? error.stack : error
    );
    return Response.json(
      {
        success: false,
        message: "Error while verifying user",
      },
      {
        status: 500,
      }
    );
  }
}
