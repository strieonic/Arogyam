// server/models/MedicineReminder.js
import mongoose from "mongoose";

const medicineReminderSchema = new mongoose.Schema(
  {
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Patient",
      required: true,
      index: true,
    },
    medicineName: { type: String, required: true, maxlength: 150 },
    dosage: { type: String, default: "" },       // e.g. "500mg", "1 tablet"
    frequency: {
      type: String,
      enum: ["once_daily", "twice_daily", "thrice_daily", "weekly", "custom"],
      default: "once_daily",
    },
    times: [{ type: String }],                   // e.g. ["08:00", "20:00"]
    startDate: { type: Date, required: true },
    endDate: { type: Date, default: null },       // null = indefinite
    notes: { type: String, maxlength: 300 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model("MedicineReminder", medicineReminderSchema);
