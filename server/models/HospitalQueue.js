// server/models/HospitalQueue.js
import mongoose from "mongoose";

const hospitalQueueSchema = new mongoose.Schema(
  {
    hospital: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Hospital",
      required: true,
      index: true,
    },
    department: { type: String, default: "General OPD" },
    date: { type: String, required: true }, // Format: YYYY-MM-DD
    currentToken: { type: Number, default: 0 },
    lastTokenAssigned: { type: Number, default: 0 }, // Used to assign token numbers sequentially
  },
  { timestamps: true }
);

// Ensure unique queue per hospital per department per day
hospitalQueueSchema.index({ hospital: 1, department: 1, date: 1 }, { unique: true });

export default mongoose.model("HospitalQueue", hospitalQueueSchema);
