import mongoose from "mongoose";

const patientSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },

    // ================= LOGIN / CONTACT =================
    phone: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
      default: undefined, // 🔥 prevents null insertion issue
    },

    email: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
      default: undefined,
    },

    dob: {
      type: String,
    },

    // ================= IDENTITY =================
    aadhaar: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
      default: undefined,
    },

    healthId: {
      type: String,
      unique: true,
      required: true,
    },

    qrCode: String,

    // ================= OTP LOGIN =================
    loginOTP: String,
    otpExpiry: Date,

    // ================= MEDICAL INFO =================
    bloodGroup: String,
    allergies: String,
    emergencyContact: String,
    address: String,

    // ================= FAMILY SYSTEM =================

    role: {
      type: String,
      enum: ["PRIMARY", "FAMILY"],
      required: true,
    },

    familyMembers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Patient",
      },
    ],

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Patient",
      default: null,
    },

    relation: String,
    age: Number,
    gender: {
      type: String,
      enum: ["Male", "Female", "Other", "Prefer not to say"],
    },
  },
  { timestamps: true },
);

export default mongoose.model("Patient", patientSchema);
