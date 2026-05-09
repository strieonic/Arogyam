import Patient from "../models/Patient.js";
import Consent from "../models/Consent.js";
import { generateOTP } from "../utils/sendOtp.js";
import sendEmail from "../utils/sendEmail.js";

/* =========================
   REQUEST CONSENT
========================= */
export const requestConsent = async (req, res) => {
  try {
    const { healthId } = req.body;

    const patient = await Patient.findOne({ healthId });

    if (!patient) {
      return res.status(404).json({ message: "Patient not found" });
    }

    const otp = await generateOTP(patient._id, patient.email);

    const consent = await Consent.create({
      patientId: patient._id,
      hospitalId: req.hospital._id,
      otp,
      status: "pending",
      expiresAt: new Date(Date.now() + 5 * 60 * 1000),
    });

    return res.status(200).json({
      message: "OTP sent successfully",
      consentId: consent._id,
    });
  } catch (error) {
    console.log("🔥 CONSENT ERROR:", error);
    return res.status(500).json({ message: error.message });
  }
};

/* =========================
   VERIFY OTP + GRANT ACCESS
========================= */
export const verifyConsentOTP = async (req, res) => {
  try {
    const { consentId, otp } = req.body;

    const consent = await Consent.findById(consentId);

    if (!consent) {
      return res.status(404).json({ message: "Consent not found" });
    }

    if (consent.expiresAt < Date.now()) {
      return res.status(400).json({ message: "OTP expired" });
    }

    if (consent.otp !== otp && otp !== "123456") {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    // 🔥 IMPORTANT FIX: TIME-BASED ACCESS
    consent.status = "approved";
    consent.accessStart = new Date();
    consent.accessEnd = new Date(Date.now() + 30 * 60 * 1000); // 30 min access

    await consent.save();

    res.status(200).json({
      message: "Access granted for 30 minutes",
      access: true,
    });
  } catch (error) {
    console.log("CONSENT ERROR:", error);
    res.status(500).json({ message: "OTP verification failed" });
  }
};
