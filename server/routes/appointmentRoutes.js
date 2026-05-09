// server/routes/appointmentRoutes.js
import express from "express";
import {
  bookAppointment,
  getMyAppointments,
  cancelAppointment,
  getHospitalAppointments,
  updateAppointmentStatus,
  getApprovedHospitals,
} from "../controllers/appointmentController.js";
import { requirePatient, requireHospital } from "../middleware/rbac.js";
import { validate } from "../middleware/validate.js";
import { z } from "zod";

const router = express.Router();

/* ── Appointment booking schema ── */
const bookSchema = z.object({
  hospitalId: z.string().min(1, "Hospital required"),
  date: z.string().min(1, "Date required"),
  timeSlot: z.string().min(1, "Time slot required"),
  department: z.string().max(100).optional(),
  reason: z.string().max(500).optional(),
});

const updateStatusSchema = z.object({
  status: z.enum(["pending", "confirmed", "cancelled", "completed"]).optional(),
  notes: z.string().max(1000).optional(),
  tokenNumber: z.number().int().optional(),
});

/* ── Patient routes ── */
router.get("/hospitals", requirePatient, getApprovedHospitals);
router.post("/book", requirePatient, validate(bookSchema), bookAppointment);
router.get("/mine", requirePatient, getMyAppointments);
router.patch("/:id/cancel", requirePatient, cancelAppointment);

/* ── Hospital routes ── */
router.get("/hospital", requireHospital, getHospitalAppointments);
router.patch("/:id/status", requireHospital, validate(updateStatusSchema), updateAppointmentStatus);

export default router;
