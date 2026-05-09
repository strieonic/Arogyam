// server/routes/doctorSelfRoutes.js
import express from "express";
import { requireDoctor, requireAuth } from "../middleware/rbac.js";
import Doctor from "../models/Doctor.js";
import Appointment from "../models/Appointment.js";
import { generatePrescription } from "../controllers/prescriptionController.js";


const router = express.Router();


/**
 * @desc Get logged-in doctor profile
 * @route GET /api/doctor/profile
 * @access Doctor
 */
router.get("/profile", requireAuth, requireDoctor, async (req, res, next) => {
  try {
    const doctor = await Doctor.findById(req.user.id)
      .select("-password")
      .populate("hospitalId", "hospitalName regNumber");
      
    if (!doctor) {
      return res.status(404).json({ success: false, message: "Doctor not found" });
    }
    
    res.json(doctor);
  } catch (error) {
    next(error);
  }
});

/**
 * @desc Update Doctor Availability (Weekly config)
 * @route PUT /api/doctor/availability
 */
router.put("/availability", requireAuth, requireDoctor, async (req, res, next) => {
  try {
    const { availability } = req.body;
    
    if (!Array.isArray(availability)) {
      return res.status(400).json({ success: false, message: "Availability must be an array" });
    }

    const doctor = await Doctor.findByIdAndUpdate(
      req.user.id,
      { availability },
      { new: true, runValidators: true }
    ).select("-password");

    res.json({ success: true, message: "Availability updated", doctor });
  } catch (error) {
    next(error);
  }
});

/**
 * @desc Get Doctor Appointments (Daily Agenda)
 * @route GET /api/doctor/appointments
 */
router.get("/appointments", requireAuth, requireDoctor, async (req, res, next) => {
  try {
    const { date } = req.query; // Format: YYYY-MM-DD
    
    let query = { doctor: req.user.id };
    
    if (date) {
      // Find appointments matching the exact date (ignoring time)
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);
      query.date = { $gte: startOfDay, $lte: endOfDay };
    }

    const appointments = await Appointment.find(query)
      .populate("patient", "name healthId gender age")
      .sort({ timeSlot: 1, date: 1 });

    res.json({ success: true, count: appointments.length, appointments });
  } catch (error) {
    next(error);
  }
});

/**
 * @desc Update Appointment Status (Doctor)
 * @route PATCH /api/doctor/appointments/:id/status
 */
router.patch("/appointments/:id/status", requireAuth, requireDoctor, async (req, res, next) => {
  try {
    const { status, consultationNotes } = req.body;
    const appointment = await Appointment.findOneAndUpdate(
      { _id: req.params.id, doctor: req.user.id },
      { status, consultationNotes },
      { new: true }
    );
    
    if (!appointment) return res.status(404).json({ success: false, message: "Appointment not found" });
    res.json({ success: true, appointment });
  } catch (error) {
    next(error);
  }
});

/**
 * @desc Generate Prescription
 * @route POST /api/doctor/prescriptions
 */
router.post("/prescriptions", requireAuth, requireDoctor, generatePrescription);

export default router;


