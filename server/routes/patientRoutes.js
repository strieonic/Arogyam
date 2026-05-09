// server/routes/patientRoutes.js
import express from "express";
import {
  getPatientProfile,
  updateMedicalProfile,
  addFamilyMember,
  getFamilyMembers,
  removeFamilyMember,
  updateFamilyMedical,
  getMyRecords,
  getMyConsents,
  getHealthCard,
  getTimeline,
  getProfileCompletion,
} from "../controllers/patientController.js";

import { requirePatient } from "../middleware/rbac.js";
import { validate } from "../middleware/validate.js";
import {
  updateMedicalSchema,
  addFamilyMemberSchema,
} from "../schemas/patientSchemas.js";

const router = express.Router();

/* ── All patient routes require valid patient JWT ── */
router.use(requirePatient);

/* ── Profile ── */
router.get("/profile", getPatientProfile);
router.put("/profile/update-medical", validate(updateMedicalSchema), updateMedicalProfile);
router.get("/profile/completion", getProfileCompletion);

/* ── Family Management ── */
router.post("/family/add", validate(addFamilyMemberSchema), addFamilyMember);
router.get("/family", getFamilyMembers);
router.delete("/family/:memberId", removeFamilyMember);
router.put("/family/:memberId/medical", validate(updateMedicalSchema), updateFamilyMedical);

/* ── Records & Consents ── */
router.get("/records", getMyRecords);
router.get("/consents", getMyConsents);

/* ── Timeline (merged events) ── */
router.get("/timeline", getTimeline);

/* ── Health Card ── */
router.get("/healthcard", getHealthCard);

export default router;
