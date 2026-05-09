import mongoose from "mongoose";

const replySchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  senderModel: {
    type: String,
    required: true,
    enum: ["Patient", "Hospital", "Doctor", "Admin"],
  },
  senderName: {
    type: String,
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

const attachmentSchema = new mongoose.Schema({
  url: { type: String, required: true },
  type: { type: String, required: true },
  publicId: { type: String, required: true },
});

const complaintSchema = new mongoose.Schema(
  {
    ticketNumber: {
      type: String,
      required: true,
      unique: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: "userRole",
    },
    userRole: {
      type: String,
      required: true,
      enum: ["Patient", "Hospital", "Doctor"],
    },
    userName: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
      enum: [
        "technical_issue",
        "hospital_issue",
        "doctor_issue",
        "account_problem",
        "appointment_issue",
        "report_issue",
        "billing_issue",
        "other",
      ],
    },
    priority: {
      type: String,
      required: true,
      enum: ["low", "medium", "high", "urgent"],
      default: "medium",
    },
    subject: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    attachments: [attachmentSchema],
    status: {
      type: String,
      required: true,
      enum: ["open", "in_review", "awaiting_user_response", "resolved", "closed"],
      default: "open",
    },
    replies: [replySchema],
    resolutionNotes: {
      type: String,
    },
    assignedAdmin: {
      type: mongoose.Schema.Types.ObjectId, // Future proofing
      default: null,
    },
    resolvedAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

// Pre-save hook to generate ticketNumber
complaintSchema.pre("validate", async function (next) {
  if (!this.ticketNumber) {
    const generateTicketNumber = async () => {
      const randomNum = Math.floor(1000 + Math.random() * 9000);
      return `ARO-SUP-${randomNum}`;
    };

    let isUnique = false;
    while (!isUnique) {
      const newTicketNumber = await generateTicketNumber();
      const existing = await mongoose.models.Complaint.findOne({ ticketNumber: newTicketNumber });
      if (!existing) {
        this.ticketNumber = newTicketNumber;
        isUnique = true;
      }
    }
  }
  next();
});

// Indexes for common admin query patterns
complaintSchema.index({ status: 1, createdAt: -1 });          // Admin listing by status
complaintSchema.index({ userId: 1, createdAt: -1 });           // User's own tickets
complaintSchema.index({ priority: 1, status: 1 });             // Urgent open tickets

export default mongoose.model("Complaint", complaintSchema);

