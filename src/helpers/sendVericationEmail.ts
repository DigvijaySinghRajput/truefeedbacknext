import { resend } from "@/lib/resend";
import resendVerifacationEmailTemplate from "../../react-email-starter/emails/resendVerificationEmailTemplate";
import { ApiResponse } from "@/types/ApiResponse";

export async function sendverificationEmail(
  email: string,
  username: string,
  verifytoken: string
): Promise<ApiResponse> {
  try {
    await resend.emails.send({
      from: "rajputds@resend.dev",
      to: email,
      subject: "Truefeedback || Email Verification",
      react: resendVerifacationEmailTemplate({ username, otp: verifytoken }),
    });
    return {
      success: true,
      message: "Verification email sent successfully",
    };
  } catch (emailerror) {
    console.log("Error while sending Verification Email", emailerror);
    return {
      success: false,
      message: "Error while sending Verification Email",
    };
  }
}
