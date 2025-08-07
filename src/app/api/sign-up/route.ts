import dbConnect from "@/lib/dbconnect";
import UserModel from "@/model/User";
import bcrypt from "bcrypt";
import { sendverificationEmail } from "@/helpers/sendVericationEmail";

export async function POST(request: Request) {
  await dbConnect();

  try {
    const { username, email, password } = await request.json();

    const existingUserVerifiedByUsername = await UserModel.findOne({
      username,
      isverified: true,
    });

    if (existingUserVerifiedByUsername) {
      return Response.json(
        {
          success: false,
          message: "User already registered",
        },
        {
          status: 400,
        }
      );
    }

    const existingUserByEmail = await UserModel.findOne({ email });

    const verifytoken = Math.floor(100000 + Math.random() * 900000).toString();

    if (existingUserByEmail) {
      if (existingUserByEmail.isverified) {
        return Response.json({
          success: false,
          message: "User already exist with this email",
        });
      } else {
        const hashedPassword = await bcrypt.hash(password, 10);
        existingUserByEmail.verifytoken = verifytoken;
        existingUserByEmail.password = hashedPassword;
        existingUserByEmail.verifytokenExpiry = new Date(Date.now() + 3600000);
        await existingUserByEmail.save();
      }
    } else {
      const hashedPassword = await bcrypt.hash(password, 10);

      const expiryDate = new Date(); // this new gives an object and it dosent matter whether object is const or var
      expiryDate.setHours(expiryDate.getHours() + 1);

      const newUser = new UserModel({
        username,
        email,
        password: hashedPassword,
        verifytoken,
        verifytokenExpiry: expiryDate,
        isverified: false,
        isAcceptingMessages: true,
        message: [],
      });

      await newUser.save();
    }
    // send verification email

    const emailResponse = await sendverificationEmail(
      email,
      username,
      verifytoken
    );

    if (!emailResponse.success) {
      return Response.json({
        success: false,
        message: emailResponse.message,
      });
    }

    return Response.json(
      {
        success: true,
        message: "User registered successfully, Please verify your email ",
      },
      {
        status: 201,
      }
    );
  } catch (error) {
    console.log("Error registering User", error);
    return Response.json(
      {
        success: false,
        message: "Failed to register User",
      },
      {
        status: 500,
      }
    );
  }
}
