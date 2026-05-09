// server/routes/hospitalRoutes.js
import express from "express";
import {
  getHospitalProfile,
  searchPatient,
  getHospitalPatients,
} from "../controllers/hospitalController.js";


import { requireHospitalAdmin, requireApprovedHospitalAdmin } from "../middleware/rbac.js";
import { validate } from "../middleware/validate.js";
import { searchPatientSchema } from "../schemas/hospitalSchemas.js";

const router = express.Router();

/* ── All hospital routes require at least authenticated hospital JWT ── */
router.use(requireHospitalAdmin);

/* ── Profile (Accessible by Pending Hospitals) ── */
router.get("/profile", getHospitalProfile);

/* ── Operational Routes (Require Approved Status) ── */
router.use(requireApprovedHospitalAdmin);


/* ── Smart Search Patient ── */
router.get("/search-patient", searchPatient);


/* ── Hospital Patient Directory ── */
router.get("/patients", getHospitalPatients);

export default router;
