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

  const { acceptMessage } = await request.json();

  const Acceptmsgobj = {
    /*this should match with the object key you made above*/ isAcceptingMessage:
      {
        /*this part if from schema should match schema key*/ acceptMessage:
          /*this is destructured from frontend*/ acceptMessage,
      },
  };

  const result = AcceptmsgSchema.safeParse(Acceptmsgobj); // passed the above object to z.object made above

  const Message = result.data;
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
        isAcceptingMessages: Message?.isAcceptingMessage.acceptMessage, // as message is same as z.object made here so to get message first . for isAcceptingMessage and second . for acceptMessage
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
