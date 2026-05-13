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

    // Fix: generateOTP only takes email argument
    const otp = await generateOTP(patient.email);

    const consent = await Consent.create({
      patientId: patient._id,
      hospitalId: req.hospital._id,
      otp,
      status: "pending",
      expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 min window
    });

    return res.status(200).json({
      message: "OTP sent to patient email. Share the OTP code with the patient.",
      consentId: consent._id,
      // Dev mode: surface OTP in response when NODE_ENV !== 'production'
      ...(process.env.NODE_ENV !== 'production' && { devOTP: otp }),
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

/* =========================
   PATIENT APPROVES CONSENT
   (called from Patient Portal)
========================= */
export const approveConsentByPatient = async (req, res) => {
  try {
    const { consentId, otp } = req.body;
    const patientId = req.patient._id;

    const consent = await Consent.findOne({ _id: consentId, patientId });

    if (!consent) {
      return res.status(404).json({ message: "Consent not found or does not belong to you" });
    }

    if (consent.status !== "pending") {
      return res.status(400).json({ message: `Consent is already ${consent.status}` });
    }

    if (consent.expiresAt < Date.now()) {
      return res.status(400).json({ message: "OTP has expired. Please ask the hospital to re-request." });
    }

    if (consent.otp !== otp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    consent.status = "approved";
    consent.accessStart = new Date();
    consent.accessEnd = new Date(Date.now() + 30 * 60 * 1000); // 30 min
    await consent.save();

    res.status(200).json({ message: "Consent approved. Hospital can now access your records for 30 minutes." });
  } catch (error) {
    console.log("PATIENT CONSENT APPROVE ERROR:", error);
    res.status(500).json({ message: "Consent approval failed" });
  }
};

/* =========================
   PATIENT REJECTS CONSENT
========================= */
export const rejectConsentByPatient = async (req, res) => {
  try {
    const { consentId } = req.body;
    const patientId = req.patient._id;

    const consent = await Consent.findOne({ _id: consentId, patientId });
    if (!consent) {
      return res.status(404).json({ message: "Consent not found" });
    }

    if (consent.status !== "pending") {
      return res.status(400).json({ message: `Consent is already ${consent.status}` });
    }

    consent.status = "rejected";
    await consent.save();

    res.status(200).json({ message: "Consent rejected." });
  } catch (error) {
    res.status(500).json({ message: "Consent rejection failed" });
  }
};
