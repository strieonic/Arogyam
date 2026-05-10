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

  console.log(`
  **************************************************
  🔑 OTP GENERATED: ${otp}
  📧 RECIPIENT: ${email}
  ⏰ TIME: ${new Date().toISOString()}
  **************************************************
  `);

  // Send email in background - do not await to prevent blocking the UI
  if (email) {
    sendEmail(
      email,
      "Your Arogyam Login OTP",
      `Your One-Time Password for Arogyam login is: <b>${otp}</b>. It will expire in 5 minutes.`
    ).catch(err => {
      console.error("Background OTP Email Error:", err);
    });
  } else {
    console.warn("No email provided for OTP generation - skipping email send.");
  }

  return otp;
};
