// server/models/Doctor.js
import mongoose from "mongoose";

const doctorSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String }, // Can be null initially until doctor sets it
    phone: { type: String },
    specialization: { type: String, required: true },
    experienceYears: { type: Number },
    licenseNumber: { type: String, required: true },
    hospitalId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Hospital",
      required: true,
      index: true,
    },
    profilePhoto: { type: String },
    bio: { type: String },
    qualification: { type: String },
    languages: [{ type: String }],
    
    // Weekly Availability Matrix
    availability: [
      {
        day: { type: String, enum: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"] },
        startTime: String, // e.g. "09:00"
        endTime: String,   // e.g. "17:00"
      }
    ],

    status: {
      type: String,
      enum: ["invited", "active", "inactive", "suspended"],
      default: "invited",
    },
    isVerified: { type: Boolean, default: false },
    lastLogin: { type: Date },
    createdByHospital: { type: mongoose.Schema.Types.ObjectId, ref: "Hospital" },
  },
  { timestamps: true }
);

export default mongoose.model("Doctor", doctorSchema);
