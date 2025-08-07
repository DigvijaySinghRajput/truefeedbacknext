import dbConnect from "@/lib/dbconnect";
import UserModel from "@/model/User";
import { Message } from "@/model/User";

export async function POST(request: Request) {
  await dbConnect();
  const { username, content } = await request.json();

  try {
    const user = await UserModel.findOne({ username });
    if (!user) {
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
    if (!user.isAcceptingMessages) {
      return Response.json(
        {
          success: false,
          message: "User is not Accepting Messages",
        },
        {
          status: 403,
        }
      );
    }

    const newMessage = { content, createdAt: new Date() };
    user.message.push(newMessage as Message);
    await user.save();

    return Response.json(
      {
        success: true,
        message: "Message sent successfully ",
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.log("Error while sending message", error);
    return Response.json(
      {
        success: false,
        message: "Error while sending message",
      },
      {
        status: 500,
      }
    );
  }
}
