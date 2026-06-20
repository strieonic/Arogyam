import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

const sendEmail = async (to, subject, html) => {
  const senderEmail = process.env.EMAIL_USER || "aarogyamhealthapp2026@gmail.com";
  const apiKey = process.env.BREVO_API_KEY;

  if (process.env.ENABLE_EMAILS === "false") {
    console.log(`📧 Email disabled. Would have sent to: ${to}`);
    return true;
  }

  if (!to) {
    console.error("❌ Email Error: No recipient address provided.");
    return false;
  }

  if (!apiKey) {
    console.error("❌ Email Error: BREVO_API_KEY is not defined in environment variables.");
    return false;
  }

  try {
    console.log(`📧 Attempting to send email via Brevo to: ${to} from: ${senderEmail}`);
    
    const response = await axios.post(
      "https://api.brevo.com/v3/smtp/email",
      {
        sender: {
          name: "Arogyam",
          email: senderEmail,
        },
        to: [
          {
            email: to,
          },
        ],
        subject: subject,
        htmlContent: html,
        textContent: html.replace(/<[^>]*>/g, ""), // Plain text fallback
      },
      {
        headers: {
          accept: "application/json",
          "api-key": apiKey,
          "content-type": "application/json",
        },
      }
    );

    console.log("✅ Email Sent Successfully via Brevo:", response.data.messageId || response.data);
    return true;
  } catch (error) {
    console.error("🔥 Detailed Brevo Email Error:", {
      message: error.message,
      response: error.response ? error.response.data : "No response body",
      recipient: to,
    });
    return false;
  }
};

export default sendEmail;
