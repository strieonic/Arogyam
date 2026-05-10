import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

transporter
  .verify()
  .then(() => console.log("SMTP READY"))
  .catch((err) => console.log("SMTP ERROR:", err));

const sendEmail = async (to, subject, html) => {
  const sender = process.env.EMAIL_USER || "aarogyamhealthapp2026@gmail.com";
  
  if (process.env.ENABLE_EMAILS === "false") {
    console.log(`📧 Email disabled. Would have sent to: ${to}`);
    return true;
  }

  if (!to) {
    console.error("❌ Email Error: No recipient address provided.");
    return false;
  }

  try {
    console.log(`📧 Attempting to send email to: ${to} from: ${sender}`);
    const info = await transporter.sendMail({
      from: sender,
      to,
      subject,
      text: html.replace(/<[^>]*>/g, ''), // Plain text fallback
      html,
    });

    console.log("✅ Email Sent Successfully:", info.messageId);
    return true;
  } catch (error) {
    console.error("🔥 Detailed Email Error:", {
      message: error.message,
      code: error.code,
      command: error.command,
      recipient: to
    });
    return false;
  }
};

export default sendEmail;
