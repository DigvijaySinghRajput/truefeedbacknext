import { authoptions } from "../auth/[...nextauth]/options";
import UserModel from "@/model/User";
import dbConnect from "@/lib/dbconnect";
import mongoose from "mongoose";
import { getServerSession, User } from "next-auth";

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

  const userId = new mongoose.Types.ObjectId(user._id);
  try {
    const user = await UserModel.aggregate([
      { $match: { _id: userId } },
      { $unwind: "$message" },
      { $sort: { "message.createdAt": -1 } },
      { $group: { _id: "$_id", message: { $push: "$message" } } },
    ]);
    if (!user || user.length === 0) {
      return Response.json(
        {
          success: false,
          message: "No Messages to display",
        },
        {
          status: 401,
        }
      );
    }
    return Response.json(
      {
        success: true,
        messages: user[0].message,
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.log("Error while getting Messages", error);
    return Response.json(
      {
        success: false,
        message: "Error while getting Messages",
      },
      { status: 500 }
    );
  }
}
