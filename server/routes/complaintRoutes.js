import express from "express";
import { requireAuth, requireAdmin } from "../middleware/rbac.js";
import {
  createComplaint,
  getUserComplaints,
  getComplaintById,
  replyToComplaint,
  getAllComplaints,
  updateComplaintStatus,
} from "../controllers/complaintController.js";
import multer from "multer";

const upload = multer({ dest: "uploads/" }); // Temporary local storage before Cloudinary
const router = express.Router();

// User endpoints (Patient/Hospital/Doctor)
router.post("/", requireAuth, upload.array("attachments", 3), createComplaint);
router.get("/my-tickets", requireAuth, getUserComplaints);
router.get("/:id", requireAuth, getComplaintById);
router.post("/:id/reply", requireAuth, replyToComplaint);

// Admin endpoints
router.get("/admin/all", requireAuth, requireAdmin, getAllComplaints);
router.put("/admin/:id/status", requireAuth, requireAdmin, updateComplaintStatus);

export default router;
