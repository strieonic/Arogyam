// server/routes/doctorRoutes.js
import express from "express";
import { requireAuth, requireHospitalAdmin } from "../middleware/rbac.js";
import { inviteDoctor, getHospitalDoctors } from "../controllers/hospitalDoctorController.js";

const router = express.Router();

// Routes for hospital to manage their doctors
router.post("/", requireAuth, requireHospitalAdmin, inviteDoctor);
router.get("/", requireAuth, requireHospitalAdmin, getHospitalDoctors);

export default router;
