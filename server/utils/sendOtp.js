import otpGenerator from "otp-generator";
import sendEmail from "./sendEmail.js";

/**
 * Generates a 6-digit numeric OTP and sends it via email.
 * This version is simplified to remove redundant DB calls 
 * (OTP is now stored directly in the Patient document).
 */
export const generateOTP = async (email) => {
  const otp = otpGenerator.generate(6, {
    upperCaseAlphabets: false,
    specialChars: false,
    lowerCaseAlphabets: false,
  });

  console.log(`\n========================================\nDEBUG: OTP for ${email} is: ${otp}\n========================================\n`);

  try {
    await sendEmail(
      email,
      "Arogyam OTP Verification",
      `
      <div style="font-family: sans-serif; color: #333;">
        <h2>Arogyam OTP Verification</h2>
        <p>Your One-Time Password (OTP) for login is:</p>
        <h1 style="color: #00f2fe; letter-spacing: 5px;">${otp}</h1>
        <p>This OTP is valid for 5 minutes. Do not share it with anyone.</p>
        <hr />
        <p style="font-size: 0.8rem; color: #777;">If you did not request this, please ignore this email.</p>
      </div>
      `,
    );
  } catch (err) {
    console.error("Failed to send OTP email:", err);
    // Continue anyway as devOTP is logged for debugging
  }

  return otp;
};
