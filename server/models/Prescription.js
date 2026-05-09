// server/models/Prescription.js
import mongoose from "mongoose";

const prescriptionSchema = new mongoose.Schema(
  {
    doctor: { type: mongoose.Schema.Types.ObjectId, ref: "Doctor", required: true },
    hospital: { type: mongoose.Schema.Types.ObjectId, ref: "Hospital", required: true },
    patient: { type: mongoose.Schema.Types.ObjectId, ref: "Patient", required: true },
    appointmentId: { type: mongoose.Schema.Types.ObjectId, ref: "Appointment" },
    date: { type: Date, default: Date.now },
    diagnosis: { type: String, required: true },
    
    medicines: [
      {
        name: { type: String, required: true },
        dosage: { type: String, required: true }, // e.g., "500mg"
        timing: { type: String, required: true }, // e.g., "1-0-1" or "Morning/Evening"
        duration: { type: String, required: true }, // e.g., "5 days"
        instructions: { type: String }, // e.g., "After food"
      }
    ],
    
    testsRecommended: [{ type: String }],
    followUpDate: { type: Date },
    notes: { type: String },
    
    // For cryptographic verification in future phases
    qrVerificationId: { type: String, unique: true, required: true },
  },
  { timestamps: true }
);

export default mongoose.model("Prescription", prescriptionSchema);
