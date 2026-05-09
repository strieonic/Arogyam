// server/controllers/prescriptionController.js
import Prescription from "../models/Prescription.js";
import Appointment from "../models/Appointment.js";
import crypto from "crypto";

/**
 * @desc Generate a new Prescription
 * @route POST /api/doctor/prescriptions
 * @access Doctor
 */
export const generatePrescription = async (req, res, next) => {
  try {
    const doctorId = req.user.id;
    const { appointmentId, patientId, diagnosis, medicines, testsRecommended, followUpDate, notes } = req.body;

    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) return res.status(404).json({ success: false, message: "Appointment not found" });

    // Ensure authorization
    if (appointment.doctor.toString() !== doctorId) {
      return res.status(403).json({ success: false, message: "Unauthorized to prescribe for this appointment" });
    }

    // Generate unique verification ID for QR code future phase
    const qrVerificationId = crypto.randomBytes(16).toString('hex');

    const prescription = new Prescription({
      doctor: doctorId,
      hospital: appointment.hospital,
      patient: patientId,
      appointmentId,
      diagnosis,
      medicines,
      testsRecommended,
      followUpDate,
      notes,
      qrVerificationId
    });

    await prescription.save();

    // Link back to appointment
    appointment.prescriptionId = prescription._id;
    appointment.status = "completed"; // Automatically mark as completed
    await appointment.save();

    res.status(201).json({
      success: true,
      message: "Prescription generated successfully",
      prescription
    });
  } catch (error) {
    next(error);
  }
};
