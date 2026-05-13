import mongoose from "mongoose";

const adminLogSchema = new mongoose.Schema(
  {
    adminId: {
      type: String,
      required: true,
    },
    action: {
      type: String,
      required: true,
      enum: ["approve", "reject", "suspend", "resolve_complaint", "other"],
    },
    targetType: {
      type: String,
      required: true,
      enum: ["Hospital", "Doctor", "Patient", "Complaint", "System"],
    },
    targetId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    details: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("AdminLog", adminLogSchema);
