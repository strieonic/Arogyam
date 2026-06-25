import express from "express";
import { memoryUpload } from "../middleware/uploadMiddleware.js";

import {
  uploadRecord,
  getPatientRecords,
} from "../controllers/recordController.js";

import { protectHospital } from "../middleware/hospitalAuth.js";
import { validate } from "../middleware/validate.js";
import { uploadRecordSchema } from "../schemas/hospitalSchemas.js";

const router = express.Router();

/* =========================
   UPLOAD MEDICAL RECORD
========================= */
router.post(
  "/upload",
  protectHospital,
  memoryUpload.single("file"),
  validate(uploadRecordSchema),
  uploadRecord,
);

/* =========================
   GET PATIENT RECORDS
========================= */
router.get("/:healthId", protectHospital, getPatientRecords);

export default router;
