// server/models/Appointment.js
import mongoose from "mongoose";

const appointmentSchema = new mongoose.Schema(
  {
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Patient",
      required: true,
      index: true,
    },
    hospital: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Hospital",
      required: true,
      index: true,
    },
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor",
      default: null,
    },
    date: { type: Date, required: true },
    timeSlot: { type: String, required: true }, // e.g. "10:30 AM"
    department: { type: String, default: "General OPD" },
    reason: { type: String, maxlength: 500 },
    status: {
      type: String,
      enum: ["pending", "confirmed", "cancelled", "completed"],
      default: "pending",
    },
    notes: { type: String, maxlength: 1000 },
    tokenNumber: { type: Number, default: null },
    
    // New fields
    startTime: { type: String }, // optional exact start
    endTime: { type: String },   // optional exact end
    consultationNotes: { type: String },
    prescriptionId: { type: mongoose.Schema.Types.ObjectId, ref: "Prescription" },
    appointmentType: { 
      type: String, 
      enum: ["consultation", "follow-up", "emergency", "report review"],
      default: "consultation"
    }
  },
  { timestamps: true }
);

// Compound indexes for typical query patterns
appointmentSchema.index({ patient: 1, date: -1 });         // Patient's appointments sorted by date
appointmentSchema.index({ hospital: 1, date: 1, status: 1 }); // Hospital daily queue
appointmentSchema.index({ doctor: 1, date: 1 });           // Doctor's schedule

export default mongoose.model("Appointment", appointmentSchema);
