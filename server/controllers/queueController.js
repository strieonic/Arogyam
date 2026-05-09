// server/controllers/queueController.js
import HospitalQueue from "../models/HospitalQueue.js";
import Appointment from "../models/Appointment.js";
import { getIO } from "../config/socket.js";

// Helper to get today's YYYY-MM-DD string in local timezone (IST)
const getTodayStr = () => {
  const d = new Date();
  // Adjust to IST (+5:30) for Arogyam
  d.setMinutes(d.getMinutes() + 330);
  return d.toISOString().split("T")[0];
};

/**
 * @desc Get current live queue status (Public/Patient)
 * @route GET /api/queue/:hospitalId?department=...
 */
export const getQueueStatus = async (req, res, next) => {
  try {
    const { hospitalId } = req.params;
    const department = req.query.department || "General OPD";
    const today = getTodayStr();

    const queue = await HospitalQueue.findOne({ hospital: hospitalId, department, date: today });

    res.json({
      success: true,
      currentToken: queue ? queue.currentToken : 0,
      lastAssigned: queue ? queue.lastTokenAssigned : 0,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Assign token to an appointment
 * @route POST /api/queue/assign-token
 * @access Hospital
 */
export const assignToken = async (req, res, next) => {
  try {
    const hospitalId = req.user._id;
    const { appointmentId } = req.body;

    const appointment = await Appointment.findOne({ _id: appointmentId, hospital: hospitalId });
    if (!appointment) return res.status(404).json({ success: false, message: "Appointment not found" });

    // Only assign tokens to confirmed/pending appointments today
    const apptDateStr = new Date(appointment.date).toISOString().split("T")[0];
    const todayStr = getTodayStr();

    if (apptDateStr !== todayStr) {
      return res.status(400).json({ success: false, message: "Can only assign tokens for today's appointments" });
    }

    // Find or create today's queue
    const queue = await HospitalQueue.findOneAndUpdate(
      { hospital: hospitalId, department: appointment.department, date: todayStr },
      { $setOnInsert: { currentToken: 0 }, $inc: { lastTokenAssigned: 1 } },
      { new: true, upsert: true }
    );

    appointment.tokenNumber = queue.lastTokenAssigned;
    appointment.status = "confirmed";
    await appointment.save();

    res.json({ success: true, tokenNumber: appointment.tokenNumber, appointment });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Advance queue (Update current token)
 * @route POST /api/queue/advance
 * @access Hospital
 */
export const advanceQueue = async (req, res, next) => {
  try {
    const hospitalId = req.user._id;
    const { department, tokenNumber } = req.body; // Hospital sends the token number they are calling next
    const today = getTodayStr();

    const queue = await HospitalQueue.findOneAndUpdate(
      { hospital: hospitalId, department: department || "General OPD", date: today },
      { $set: { currentToken: tokenNumber } },
      { new: true }
    );

    if (!queue) {
      return res.status(404).json({ success: false, message: "Queue not found for today" });
    }

    // Mark corresponding appointment as completed (optional logic)
    await Appointment.findOneAndUpdate(
      { hospital: hospitalId, department: queue.department, tokenNumber: tokenNumber - 1, date: { $gte: new Date(today) } },
      { status: "completed" }
    );

    // EMIT SOCKET EVENT
    const io = getIO();
    io.to(`hospital_${hospitalId}`).emit("queue:update", {
      department: queue.department,
      currentToken: queue.currentToken,
      updatedAt: new Date().toISOString()
    });

    res.json({ success: true, currentToken: queue.currentToken });
  } catch (error) {
    next(error);
  }
};
