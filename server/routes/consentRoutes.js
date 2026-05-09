// server/routes/consentRoutes.js
import express from "express";
import {
  requestConsent,
  verifyConsentOTP,
} from "../controllers/consentController.js";

import { requireHospital } from "../middleware/rbac.js";
import { validate } from "../middleware/validate.js";
import { consentRequestSchema } from "../schemas/hospitalSchemas.js";

const router = express.Router();

/* ── Request Consent (sends OTP to patient) ── */
router.post("/request", requireHospital, validate(consentRequestSchema), requestConsent);

/* ── Verify OTP (grants access) ── */
router.post("/verify", requireHospital, verifyConsentOTP);

export default router;
