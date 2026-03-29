import nodemailer from "nodemailer";

const getTransporter = () =>
  nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: Number(process.env.SMTP_PORT) || 587,
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

export const sendOTPEmail = async (email, otp, purpose) => {
  const isRegister = purpose === "register";
  const subject = isRegister
    ? "Verify your SkillHire Recruiter account"
    : "Your SkillHire login code";

  const html = `
    <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px;">
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:24px;">
        <div style="background:#6366f1;border-radius:10px;width:36px;height:36px;display:flex;align-items:center;justify-content:center;">
          <span style="color:#fff;font-size:18px;font-weight:bold;">S</span>
        </div>
        <span style="font-size:20px;font-weight:700;color:#111;">SkillHire</span>
      </div>
      <h2 style="margin:0 0 8px;font-size:22px;color:#111;">
        ${isRegister ? "Welcome to SkillHire!" : "Sign in to SkillHire"}
      </h2>
      <p style="color:#555;margin:0 0 24px;">
        ${isRegister
      ? "Use the code below to verify your recruiter account."
      : "Use the code below to complete your sign in."}
      </p>
      <div style="background:#f5f5f5;border-radius:12px;padding:24px;text-align:center;margin-bottom:24px;">
        <span style="font-size:40px;font-weight:800;letter-spacing:12px;color:#6366f1;font-family:monospace;">${otp}</span>
      </div>
      <p style="color:#888;font-size:13px;margin:0;">
        This code expires in <strong>10 minutes</strong>. Do not share it with anyone.
      </p>
    </div>
  `;

  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.log(`\n📧 OTP for ${email}: ${otp} (purpose: ${purpose})\n`);
    return;
  }

  await getTransporter().sendMail({
    from: `"SkillHire" <${process.env.SMTP_USER}>`,
    to: email,
    subject,
    html,
  });
};
