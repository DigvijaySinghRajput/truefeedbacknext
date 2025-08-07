import { z } from "zod";
import { usernameValidation } from "@/schemas/signUpSchema";
import dbConnect from "@/lib/dbconnect";
import UserModel from "@/model/User";

const Usernamevalidate = z.object({
  username: usernameValidation,
});

export async function GET(request: Request) {
  await dbConnect();
  try {
    const { searchParams } = new URL(request.url);
    const queryParam = {
      username: searchParams.get("username"),
    };
    //validate with zod
    const result = Usernamevalidate.safeParse(queryParam);
    if (!result.success) {
      const usernameError = result.error.issues || [];
      return Response.json(
        {
          success: false,
          message:
            usernameError?.length > 0
              ? usernameError[0].message
              : "Invalid query parameter",
        },
        {
          status: 400,
        }
      );
    }
    const { username } = result.data;

    const existinguser = await UserModel.findOne({
      username,
      isverified: true,
    });

    if (existinguser) {
      return Response.json(
        {
          success: false,
          message: "Username is already Exist",
        },
        { status: 400 }
      );
    }

    return Response.json(
      {
        success: true,
        message: "Username Available",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error while checking username", error);
    return Response.json(
      {
        success: false,
        message: "Error checking username",
      },
      {
        status: 500,
      }
    );
  }
}
