import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    recipientId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: "recipientModel",
    },
    recipientModel: {
      type: String,
      required: true,
      enum: ["Patient", "Hospital", "Doctor"], // Expand as needed
    },
    type: {
      type: String,
      required: true,
      enum: [
        "hospital_invite",      // Doctor invited by hospital
        "hospital_approved",    // Hospital approved by admin
        "hospital_rejected",    // Hospital rejected by admin
        "hospital_suspended",   // Hospital suspended by admin
        "consent_requested",    // Hospital requests consent from patient
        "consent_granted",      // Patient granted consent
        "consent_revoked",      // Patient revoked consent
        "appointment_booked",   // New appointment for doctor/patient
        "appointment_cancelled",// Appointment cancelled
        "record_uploaded",      // New record uploaded
        "system_alert",         // General system alert
      ],
    },
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    relatedId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null, // ID of related appointment, consent, record, etc.
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    actionUrl: {
      type: String, // Optional URL to navigate to when clicked
    },
  },
  { timestamps: true }
);

// Index for efficient querying by recipient
notificationSchema.index({ recipientId: 1, isRead: 1 });

export default mongoose.model("Notification", notificationSchema);
