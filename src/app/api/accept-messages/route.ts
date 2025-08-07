import { getServerSession } from "next-auth";
import { authoptions } from "../auth/[...nextauth]/options";
import UserModel from "@/model/User";
import { acceptMessageSchema } from "@/schemas/acceptMessageSchema";
import dbConnect from "@/lib/dbconnect";
import { User } from "next-auth";
import { z } from "zod";

export async function POST(request: Request) {
  await dbConnect();

  const session = await getServerSession(authoptions);
  const user: User = session?.user as User;

  if (!session || !session.user) {
    return Response.json(
      {
        success: false,
        message: "Not Authenticated",
      },
      {
        status: 401,
      }
    );
  }

  const userId = user._id;

  const AcceptmsgSchema = z.object({
    isAcceptingMessage: acceptMessageSchema,
  });

  const { acceptmessage } = await request.json();

  const Acceptmsgobj = {
    isAcceptingMessage: { acceptMessage: acceptmessage },
  };

  const result = AcceptmsgSchema.safeParse(Acceptmsgobj);
  const acceptMessage = result.data;
  if (!result.success) {
    const acceptmsgerr = result.error.issues || [];
    return Response.json(
      {
        success: false,
        message:
          acceptmsgerr?.length > 0
            ? acceptmsgerr.map((e) => e.message).join(", ")
            : "Invalid query parameter",
      },
      {
        status: 400,
      }
    );
  }
  try {
    const updatedUser = await UserModel.findByIdAndUpdate(
      userId,
      {
        isAcceptingMessages: acceptMessage,
      },
      { new: true }
    );
    if (!updatedUser) {
      return Response.json(
        {
          success: false,
          message: "failed to update user status to accept messages",
        },
        { status: 500 }
      );
    }
    return Response.json(
      {
        success: true,
        message: "Message acceptance status updated successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    console.log("failed to update user status to accept messages");
    return Response.json(
      {
        success: false,
        message: "failed to update user status to accept messages",
      },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  await dbConnect();

  const session = await getServerSession(authoptions);
  const user: User = session?.user as User;

  if (!session || !session.user) {
    return Response.json(
      {
        success: false,
        message: "Not Authenticated",
      },
      {
        status: 401,
      }
    );
  }

  const userId = user._id;

  try {
    const founduser = await UserModel.findById(userId);
    if (!founduser) {
      return Response.json(
        {
          success: false,
          message: "User not found",
        },
        {
          status: 404,
        }
      );
    }
    return Response.json(
      {
        success: true,
        isAcceptingMessage: founduser.isAcceptingMessages,
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.log("Error in getting message acceptance status");
    return Response.json(
      {
        success: false,
        message: "Error in getting message acceptance status",
      },
      { status: 500 }
    );
  }
}
