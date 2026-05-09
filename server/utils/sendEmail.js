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
  if (process.env.ENABLE_EMAILS === "false") {
    console.log("📧 Email sending is disabled via ENABLE_EMAILS flag.");
    return true; // Return true to avoid breaking flows that depend on email success
  }
  try {
    const info = await transporter.sendMail({
      from: `"Arogyam" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    });

    console.log("Email Sent:", info.messageId);
    return true;
  } catch (error) {
    console.error("Email Error:", error);
    return false;
  }
};

export default sendEmail;
