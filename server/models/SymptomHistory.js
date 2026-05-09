// server/models/SymptomHistory.js
import mongoose from "mongoose";

const symptomHistorySchema = new mongoose.Schema(
  {
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Patient",
      required: true,
    },
    symptoms: [
      {
        type: String,
        required: true,
      },
    ],
    urgencyLevel: {
      type: String,
      enum: ["low", "moderate", "high", "emergency"],
      required: true,
    },
    possibleCauses: [
      {
        type: String,
      },
    ],
    recommendedSpecialist: {
      type: String,
      required: true,
    },
    recommendations: [
      {
        type: String,
      },
    ],
  },
  { timestamps: true }
);

// Index: history queries always filter by patient, sorted by most recent
symptomHistorySchema.index({ patient: 1, createdAt: -1 });

export default mongoose.model("SymptomHistory", symptomHistorySchema);
