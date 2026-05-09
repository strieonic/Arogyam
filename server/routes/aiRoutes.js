// server/routes/aiRoutes.js
import express from "express";
import { analyzeMedicalReport, extractPrescription, checkSymptoms, getSymptomHistory } from "../controllers/aiController.js";
import { requireAuth, requireHospital, requirePatient } from "../middleware/rbac.js";
import { aiSummaryLimiter, aiOcrLimiter, aiSymptomLimiter } from "../middleware/security.js";
import multer from "multer";

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });

const router = express.Router();

/* ── AI Summarization ── */
router.post(
  "/analyze-report/:recordId",
  aiSummaryLimiter,
  requireAuth,
  analyzeMedicalReport
);

/* ── OCR Prescription Extractor ── */
router.post(
  "/extract-prescription",
  aiOcrLimiter,
  requireHospital,
  upload.single("image"),
  extractPrescription
);

/* ── Symptom Checker ── */
router.post(
  "/check-symptoms",
  aiSymptomLimiter,
  requirePatient,
  checkSymptoms
);

router.get(
  "/symptom-history",
  requirePatient,
  getSymptomHistory
);

export default router;
