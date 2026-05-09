// server/controllers/appointmentController.js
import Appointment from "../models/Appointment.js";
import Hospital from "../models/Hospital.js";
import Patient from "../models/Patient.js";

/* ── 1. Book Appointment (patient) ── */
export const bookAppointment = async (req, res) => {
  try {
    const { hospitalId, date, timeSlot, department, reason } = req.body;

    const hospital = await Hospital.findById(hospitalId);
    if (!hospital) return res.status(404).json({ success: false, message: "Hospital not found." });
    if (hospital.status !== "approved") {
      return res.status(403).json({ success: false, message: "Hospital not approved." });
    }

    const appointment = await Appointment.create({
      patient: req.patient._id,
      hospital: hospitalId,
      date: new Date(date),
      timeSlot,
      department: department || "General OPD",
      reason,
    });

    await appointment.populate("hospital", "hospitalName address phone");

    res.status(201).json({ success: true, message: "Appointment booked.", appointment });
  } catch (err) {
    res.status(500).json({ success: false, message: "Booking failed.", error: err.message });
  }
};

/* ── 2. Get my appointments (patient) ── */
export const getMyAppointments = async (req, res) => {
  try {
    const { status } = req.query;
    const filter = { patient: req.patient._id };
    if (status && status !== "all") filter.status = status;

    const appointments = await Appointment.find(filter)
      .populate("hospital", "hospitalName address phone")
      .sort({ date: 1, createdAt: -1 });

    res.json({ success: true, total: appointments.length, appointments });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to fetch appointments." });
  }
};

/* ── 3. Cancel appointment (patient) ── */
export const cancelAppointment = async (req, res) => {
  try {
    const apt = await Appointment.findById(req.params.id);
    if (!apt) return res.status(404).json({ success: false, message: "Appointment not found." });
    if (apt.patient.toString() !== req.patient._id.toString()) {
      return res.status(403).json({ success: false, message: "Not your appointment." });
    }
    if (["cancelled", "completed"].includes(apt.status)) {
      return res.status(400).json({ success: false, message: `Cannot cancel a ${apt.status} appointment.` });
    }

    apt.status = "cancelled";
    await apt.save();
    res.json({ success: true, message: "Appointment cancelled." });
  } catch (err) {
    res.status(500).json({ success: false, message: "Cancel failed." });
  }
};

/* ── 4. Get hospital's appointments (hospital) ── */
export const getHospitalAppointments = async (req, res) => {
  try {
    const { status, date } = req.query;
    const filter = { hospital: req.hospital._id };
    if (status && status !== "all") filter.status = status;
    if (date) {
      const d = new Date(date);
      const next = new Date(date);
      next.setDate(next.getDate() + 1);
      filter.date = { $gte: d, $lt: next };
    }

    const appointments = await Appointment.find(filter)
      .populate("patient", "name healthId phone bloodGroup")
      .sort({ date: 1, timeSlot: 1 });

    res.json({ success: true, total: appointments.length, appointments });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to fetch appointments." });
  }
};

/* ── 5. Update appointment status (hospital) ── */
export const updateAppointmentStatus = async (req, res) => {
  try {
    const { status, notes, tokenNumber } = req.body;
    const apt = await Appointment.findById(req.params.id);
    if (!apt) return res.status(404).json({ success: false, message: "Not found." });
    if (apt.hospital.toString() !== req.hospital._id.toString()) {
      return res.status(403).json({ success: false, message: "Not your appointment." });
    }

    apt.status = status || apt.status;
    if (notes !== undefined) apt.notes = notes;
    if (tokenNumber !== undefined) apt.tokenNumber = tokenNumber;
    await apt.save();

    res.json({ success: true, message: "Appointment updated.", appointment: apt });
  } catch (err) {
    res.status(500).json({ success: false, message: "Update failed." });
  }
};

/* ── 6. Available hospitals list (patient booking page) ── */
export const getApprovedHospitals = async (req, res) => {
  try {
    const hospitals = await Hospital.find({ status: "approved" })
      .select("hospitalName address phone email")
      .sort({ hospitalName: 1 });
    res.json({ success: true, hospitals });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to fetch hospitals." });
  }
};
