// server/routes/adminRoutes.js
import express from "express";
import { adminLogin } from "../controllers/adminController.js";
import { requireAdmin } from "../middleware/rbac.js";
import { validate } from "../middleware/validate.js";
import { authLimiter } from "../middleware/security.js";
import { adminLoginSchema } from "../schemas/authSchemas.js";
import {
  getAllHospitals,
  getHospitalDetails,
  approveHospital,
  rejectHospital,
  suspendHospital,
  getAdminStats,
  getAllPatients,
  getAllRecords,
  getAllConsents,
  deleteHospital,
  deletePatient,
} from "../controllers/adminController.js";

const router = express.Router();

/* ── Admin Login (rate limited + validated) ── */
router.post("/login", authLimiter, validate(adminLoginSchema), adminLogin);

/* ── Protected admin actions — all require requireAdmin ── */
router.get("/stats",            requireAdmin, getAdminStats);
router.get("/hospitals",        requireAdmin, getAllHospitals);
router.get("/hospitals/:id",    requireAdmin, getHospitalDetails);
router.put("/hospitals/:id/approve", requireAdmin, approveHospital);
router.put("/hospitals/:id/reject",  requireAdmin, rejectHospital);
router.put("/hospitals/:id/suspend", requireAdmin, suspendHospital);
router.delete("/hospitals/:id",      requireAdmin, deleteHospital);


router.get("/patients",         requireAdmin, getAllPatients);
router.delete("/patients/:id",  requireAdmin, deletePatient);

router.get("/records",          requireAdmin, getAllRecords);
router.get("/consents",         requireAdmin, getAllConsents);

export default router;
