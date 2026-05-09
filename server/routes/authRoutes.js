// server/routes/authRoutes.js
import express from "express";
import {
  registerPatient,
  sendPatientOTP,
  verifyPatientOTP,
  registerHospital,
  loginHospital,
} from "../controllers/authController.js";
import { doctorLogin, setupDoctorAccount } from "../controllers/doctorAuthController.js";
import { memoryUpload } from "../middleware/uploadMiddleware.js";

import { validate } from "../middleware/validate.js";
import { authLimiter, otpLimiter } from "../middleware/security.js";
import {
  patientRegisterSchema,
  sendOtpSchema,
  verifyOtpSchema,
  hospitalRegisterSchema,
  hospitalLoginSchema,
} from "../schemas/authSchemas.js";

const router = express.Router();

/* ======================================================
   PATIENT AUTH
====================================================== */
// Register — validate body + light rate limit
router.post(
  "/patient/register",
  authLimiter,
  validate(patientRegisterSchema),
  registerPatient
);

// Send OTP — strict OTP limiter
router.post(
  "/patient/send-otp",
  otpLimiter,
  validate(sendOtpSchema),
  sendPatientOTP
);

// Verify OTP — auth limiter (counts failures only)
router.post(
  "/patient/verify-otp",
  authLimiter,
  validate(verifyOtpSchema),
  verifyPatientOTP
);

/* ======================================================
   HOSPITAL AUTH
====================================================== */
router.post(
  "/hospital/register",
  authLimiter,
  memoryUpload.single("file"),
  // Note: Zod runs after multer so req.body is parsed
  validate(hospitalRegisterSchema),
  registerHospital
);

router.post(
  "/hospital/login",
  authLimiter,
  validate(hospitalLoginSchema),
  loginHospital
);

/* ======================================================
   DOCTOR AUTH
====================================================== */
router.post("/doctor/login", authLimiter, doctorLogin);
router.post("/doctor/setup", authLimiter, setupDoctorAccount);

export default router;

