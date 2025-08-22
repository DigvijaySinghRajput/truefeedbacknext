import { NextAuthOptions } from "next-auth";
import bcrypt from "bcrypt";
import dbConnect from "@/lib/dbconnect";
import UserModel from "@/model/User";
import CredentialsProvider from "next-auth/providers/credentials";

export const authoptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      id: "credentials",
      name: "Credentials",
      credentials: {
        email: {
          label: "Email",
          type: "text",
          placeholder: "Enter Your Email",
        },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials: any): Promise<any> {
        dbConnect();
        try {
          const user = await UserModel.findOne({
            $or: [
              { email: credentials.identifier },
              { username: credentials.identifier }, // making this future proof if incase username is used
            ],
          });

          if (!user) {
            throw new Error("No user found.Please check email");
          }

          if (!user.isverified) {
            throw new Error("User not verified please verify your account");
          }

          const isPasswordCorrect = await bcrypt.compare(
            credentials.password,
            user.password
          );

          if (!isPasswordCorrect) {
            throw new Error("Enter correct password");
          }

          return user;
        } catch (err: any) {
          throw new Error(err);
        }
      },
    }),
  ],
  pages: {
    signIn: "/sign-in",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token._id = user._id?.toString();
        token.isverified = user.isverified;
        token.isAcceptingMessages = user.isAcceptingMessage;
        token.username = user.username;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user._id = token._id;
        session.user.isverified = token.isverified;
        session.user.isAcceptingMessage = token.isAcceptingMessage;
        session.user.username = token.username;
      }
      return session;
    },
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET!,
};
