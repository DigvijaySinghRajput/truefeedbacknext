import { authoptions } from "../../auth/[...nextauth]/options";
import UserModel from "@/model/User";
import dbConnect from "@/lib/dbconnect";
import { getServerSession, User } from "next-auth";

export async function DELETE(
  request: Request,
  { params }: { params: { messageid: string } }
) {
  const messageid = params.messageid;
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
  try {
    const updateResult = await UserModel.updateOne(
      { _id: user._id },
      {
        $pull: {
          message /*here it should messages but User model has message*/: {
            _id: messageid,
          },
        },
      }
    );
    if (updateResult.modifiedCount == 0) {
      return Response.json(
        {
          success: false,
          message: "Message not found or already deleted",
        },
        {
          status: 404,
        }
      );
    }
    return Response.json(
      {
        success: true,
        message: "Message Deleted",
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.log("Error in deleting message", error);
    return Response.json(
      {
        success: false,
        message: "Error deleting message ",
      },
      {
        status: 500,
      }
    );
  }
}
