import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

let transporter = null;

const getTransporter = () => {
  if (transporter) return transporter;

  // Use explicit host settings with family: 4 to resolve DNS/IPv6 issues on Render
  transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false, // Use STARTTLS for 587
    requireTLS: true,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    family: 4, // Force IPv4 to avoid ENETUNREACH errors on cloud hosts
    connectionTimeout: 5000, // 5 seconds
    greetingTimeout: 5000,
    socketTimeout: 5000,
  });
  return transporter;
};

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

  // 🚀 Resend API Transport (HTTPS/443 - extremely reliable on Render)
  if (process.env.RESEND_API_KEY) {
    try {
      console.log(`📧 [Resend] Attempting to send email to: ${to}`);
      const fromEmail = process.env.EMAIL_FROM || "onboarding@resend.dev";
      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: `Arogyam <${fromEmail}>`,
          to: [to],
          subject: subject,
          html: html,
        }),
      });

      const resData = await response.json();
      if (response.ok) {
        console.log("✅ Email Sent Successfully via Resend API:", resData.id);
        return true;
      } else {
        console.error("❌ Resend API Error:", resData);
        console.log("⚠️ Resend failed, falling back to SMTP...");
      }
    } catch (resendError) {
      console.error("🔥 Resend API Fetch Error:", resendError.message);
      console.log("⚠️ Resend failed, falling back to SMTP...");
    }
  }

  // 📧 Fallback: SMTP Transport via Nodemailer
  try {
    console.log(`📧 Attempting to send email via SMTP to: ${to} from: ${sender}`);
    const info = await getTransporter().sendMail({
      from: sender,
      to,
      subject,
      text: html.replace(/<[^>]*>/g, ''), // Plain text fallback
      html,
    });

    console.log("✅ Email Sent Successfully via SMTP:", info.messageId);
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
