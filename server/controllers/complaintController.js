import Complaint from "../models/Complaint.js";
import Notification from "../models/Notification.js";
import sendEmail from "../utils/sendEmail.js";
import cloudinary from "../config/cloudinary.js";
import fs from "fs";

/* ======================================================
   UPLOAD UTILS
====================================================== */
const uploadToCloudinary = async (filePath, folder) => {
  try {
    const result = await cloudinary.uploader.upload(filePath, { folder });
    // Remove file from local after upload
    fs.unlinkSync(filePath);
    return {
      url: result.secure_url,
      publicId: result.public_id,
      type: result.resource_type === "image" ? "image" : "pdf",
    };
  } catch (error) {
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    throw new Error("Failed to upload file to Cloudinary");
  }
};

/* ======================================================
   CREATE COMPLAINT
====================================================== */
export const createComplaint = async (req, res) => {
  try {
    const { category, priority, subject, description, userRole, userName } = req.body;
    const userId = req.user.id;

    if (!category || !subject || !description) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const complaintData = {
      userId,
      userRole,
      userName,
      category,
      priority: priority || "medium",
      subject,
      description,
      status: "open",
      attachments: [],
    };

    // Handle attachments if any
    if (req.files && req.files.length > 0) {
      if (req.files.length > 3) {
        return res.status(400).json({ message: "Maximum 3 attachments allowed" });
      }

      for (const file of req.files) {
        // Validate size (< 5MB)
        if (file.size > 5 * 1024 * 1024) {
          fs.unlinkSync(file.path);
          return res.status(400).json({ message: "Each file must be less than 5MB" });
        }
        
        // Validate type (jpg, png, pdf)
        const allowedTypes = ["image/jpeg", "image/png", "application/pdf"];
        if (!allowedTypes.includes(file.mimetype)) {
          fs.unlinkSync(file.path);
          return res.status(400).json({ message: "Only JPG, PNG, and PDF allowed" });
        }

        const uploaded = await uploadToCloudinary(file.path, "arogyam/complaints");
        complaintData.attachments.push(uploaded);
      }
    }

    const complaint = await Complaint.create(complaintData);

    // Notify Admin (Assume Admin will check dashboard, or you can broadcast via socket)

    res.status(201).json({
      message: "Complaint submitted successfully",
      complaint,
    });
  } catch (error) {
    console.error("Create Complaint Error:", error);
    res.status(500).json({ message: "Failed to create complaint" });
  }
};

/* ======================================================
   GET USER COMPLAINTS
====================================================== */
export const getUserComplaints = async (req, res) => {
  try {
    const userId = req.user.id;
    const complaints = await Complaint.find({ userId }).sort({ updatedAt: -1 });
    res.status(200).json({ complaints });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch complaints" });
  }
};

/* ======================================================
   GET COMPLAINT BY ID
====================================================== */
export const getComplaintById = async (req, res) => {
  try {
    const { id } = req.params;
    const complaint = await Complaint.findById(id);

    if (!complaint) {
      return res.status(404).json({ message: "Complaint not found" });
    }

    // Role check: Only the creator or Admin can view
    const isAdmin = req.user.role === "admin";
    if (!isAdmin && complaint.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: "Access denied" });
    }

    res.status(200).json({ complaint });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch complaint" });
  }
};

/* ======================================================
   REPLY TO COMPLAINT (Thread)
====================================================== */
export const replyToComplaint = async (req, res) => {
  try {
    const { id } = req.params;
    const { message, senderName, senderModel } = req.body;
    const senderId = req.user.id;
    const isAdmin = req.user.role === "admin";

    const complaint = await Complaint.findById(id);
    if (!complaint) {
      return res.status(404).json({ message: "Complaint not found" });
    }

    if (!isAdmin && complaint.userId.toString() !== senderId) {
      return res.status(403).json({ message: "Access denied" });
    }

    // Add reply
    complaint.replies.push({
      sender: senderId,
      senderModel,
      senderName,
      message,
    });

    // Auto-update status based on who replied
    if (isAdmin) {
      complaint.status = "awaiting_user_response";
    } else {
      complaint.status = "in_review";
    }

    await complaint.save();

    // Trigger Notification to the other party
    if (isAdmin) {
      await Notification.create({
        recipientId: complaint.userId,
        recipientModel: complaint.userRole,
        type: "system_alert",
        title: `Reply on Ticket ${complaint.ticketNumber}`,
        message: `Admin replied: ${message.substring(0, 50)}...`,
        actionUrl: `/${complaint.userRole.toLowerCase()}/support/${complaint._id}`,
      });
    }

    res.status(200).json({
      message: "Reply added successfully",
      complaint,
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to add reply" });
  }
};

/* ======================================================
   ADMIN: GET ALL COMPLAINTS (PAGINATED)
====================================================== */
export const getAllComplaints = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const [complaints, total] = await Promise.all([
      Complaint.find().sort({ updatedAt: -1 }).skip(skip).limit(limit),
      Complaint.countDocuments(),
    ]);

    res.status(200).json({
      success: true,
      complaints,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      }
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch all complaints" });
  }
};

/* ======================================================
   ADMIN: UPDATE COMPLAINT STATUS
====================================================== */
export const updateComplaintStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, resolutionNotes, assignedAdmin } = req.body;

    const complaint = await Complaint.findById(id);
    if (!complaint) {
      return res.status(404).json({ message: "Complaint not found" });
    }

    if (status) complaint.status = status;
    if (resolutionNotes) complaint.resolutionNotes = resolutionNotes;
    if (assignedAdmin) complaint.assignedAdmin = assignedAdmin;

    if (status === "resolved" || status === "closed") {
      complaint.resolvedAt = new Date();
    }

    await complaint.save();

    // Notification
    await Notification.create({
      recipientId: complaint.userId,
      recipientModel: complaint.userRole,
      type: "system_alert",
      title: `Ticket ${complaint.ticketNumber} Updated`,
      message: `Your ticket has been marked as ${status.replace("_", " ")}.`,
    });

    // Send email if resolved/closed
    if (status === "resolved" || status === "closed") {
      let emailToSend = ""; // We need to fetch user's email.
      // Easiest is to populate or fetch manually
      const mongoose = await import("mongoose");
      const UserModal = mongoose.model(complaint.userRole);
      const user = await UserModal.findById(complaint.userId);
      
      if (user && user.email) {
        const subject = `Arogyam Support - Ticket ${complaint.ticketNumber} ${status}`;
        const html = `
          <h3>Hello ${complaint.userName},</h3>
          <p>Your support ticket <strong>${complaint.ticketNumber}</strong> has been marked as <strong>${status}</strong>.</p>
          <p><strong>Subject:</strong> ${complaint.subject}</p>
          ${resolutionNotes ? `<p><strong>Admin Notes:</strong> ${resolutionNotes}</p>` : ''}
          <br/>
          <p>Thank you for using Arogyam.</p>
        `;
        await sendEmail(user.email, subject, html);
      }
    }

    res.status(200).json({
      message: "Complaint updated successfully",
      complaint,
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to update complaint" });
  }
};
