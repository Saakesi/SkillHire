import { google } from "googleapis";
import dotenv from "dotenv";
dotenv.config();

const hasGmailOAuthConfig = () =>
  Boolean(
    process.env.GMAIL_USER &&
    process.env.GMAIL_CLIENT_ID &&
    process.env.GMAIL_CLIENT_SECRET &&
    process.env.GMAIL_REFRESH_TOKEN
  );

export const sendOTPEmail = async (email, otp, purpose) => {
  const isRegister = purpose === "register";

  const subject = isRegister
    ? "Verify your SkillHire Recruiter account"
    : "Your SkillHire login code";

  const html = `
<table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f5f7fb;padding:20px 0;font-family:Arial,Helvetica,sans-serif;">
  <tr>
    <td align="center">
      
      <table width="480" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;padding:32px;">
        
        <!-- Logo -->
        <tr>
          <td align="center" style="padding-bottom:20px;">
            <div style="background:#6366f1;color:#fff;width:40px;height:40px;line-height:40px;border-radius:10px;font-weight:bold;font-size:18px;">
              S
            </div>
            <div style="margin-top:8px;font-size:20px;font-weight:700;color:#111;">
              SkillHire
            </div>
          </td>
        </tr>

        <!-- Heading -->
        <tr>
          <td align="center" style="font-size:22px;font-weight:700;color:#111;padding-bottom:8px;">
            ${isRegister ? "Welcome to SkillHire!" : "Sign in to SkillHire"}
          </td>
        </tr>

        <!-- Description -->
        <tr>
          <td align="center" style="color:#555;font-size:14px;padding-bottom:24px;">
            ${isRegister
      ? "Use the code below to verify your recruiter account."
      : "Use the code below to complete your sign in."
    }
          </td>
        </tr>

        <!-- OTP Box -->
        <tr>
          <td align="center" style="padding-bottom:24px;">
            <div style="background:#f3f4f6;border-radius:10px;padding:20px;">
              <span style="font-size:36px;font-weight:800;letter-spacing:10px;color:#6366f1;">
                ${otp}
              </span>
            </div>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td align="center" style="font-size:12px;color:#888;">
            This code expires in <b>10 minutes</b>.<br/>
            Do not share it with anyone.
          </td>
        </tr>

      </table>

    </td>
  </tr>
</table>
`;

  if (!hasGmailOAuthConfig()) {
    console.warn(
      `\n⚠️ Gmail OAuth not configured.\nOTP for ${email}: ${otp} (purpose: ${purpose})\n`
    );
    return;
  }

  try {
    // 🔐 Setup OAuth client
    const oauth2Client = new google.auth.OAuth2(
      process.env.GMAIL_CLIENT_ID,
      process.env.GMAIL_CLIENT_SECRET,
      process.env.GMAIL_REDIRECT_URI || "https://developers.google.com/oauthplayground"
    );

    oauth2Client.setCredentials({
      refresh_token: process.env.GMAIL_REFRESH_TOKEN,
    });

    const gmail = google.gmail({
      version: "v1",
      auth: oauth2Client,
    });

    // 📧 Build email
    const message =
      `From: SkillHire <${process.env.GMAIL_USER}>\r\n` +
      `To: ${email}\r\n` +
      `Subject: ${subject}\r\n` +
      `Content-Type: text/html; charset=utf-8\r\n` +
      `\r\n` +   //  (separator)
      `${html}`;

    // 🔁 Encode email
    const encodedMessage = Buffer.from(message)
      .toString("base64")
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");

    // 🚀 Send email
    await gmail.users.messages.send({
      userId: "me",
      requestBody: {
        raw: encodedMessage,
      },
    });

    console.log(`✅ OTP email sent to ${email}`);
  } catch (error) {
    console.error(`❌ Failed to send OTP email to ${email}:`, error.message);
    throw error;
  }
};