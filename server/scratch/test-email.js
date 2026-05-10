import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: "aarogyamhealthapp2026@gmail.com",
    pass: "kqwnhuppyehowcfj",
  },
});

async function test() {
  try {
    console.log("Verifying transporter...");
    await transporter.verify();
    console.log("Transporter verified!");

    console.log("Sending test email...");
    const info = await transporter.sendMail({
      from: '"Arogyam Test" <aarogyamhealthapp2026@gmail.com>',
      to: "aarogyamhealthapp2026@gmail.com", // Send to self
      subject: "Test Email from Arogyam",
      text: "If you see this, email is working!",
    });
    console.log("Email sent successfully:", info.messageId);
  } catch (err) {
    console.error("Test failed:", err);
  }
}

test();
