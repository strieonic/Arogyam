import mongoose from "mongoose";
const medicalRecordSchema = new mongoose.Schema({
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Patient",
    required: true,
  },

  hospital: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Hospital",
    required: true,
  },

  recordType: {
    type: String,
    enum: ["LAB", "XRAY", "PRESCRIPTION", "REPORT"],
    required: true,
  },

  fileUrl: String,
  notes: String,

  // ⭐ OPTIONAL BUT USEFUL (audit/security)
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Hospital",
  },

  createdAt: { type: Date, default: Date.now },
});

// Indexes: most queries filter by patient, then sort by date
medicalRecordSchema.index({ patient: 1, createdAt: -1 });
medicalRecordSchema.index({ patient: 1, recordType: 1 });
medicalRecordSchema.index({ hospital: 1, createdAt: -1 });

export default mongoose.model("MedicalRecord", medicalRecordSchema);

