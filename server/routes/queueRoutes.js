// server/routes/queueRoutes.js
import express from "express";
import { requireAuth, requireHospital } from "../middleware/rbac.js";
import { getQueueStatus, assignToken, advanceQueue } from "../controllers/queueController.js";
import { rateLimit } from "express-rate-limit";

const router = express.Router();

// Polling fallback limiter
const queueLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 60, // allow 1 req/sec basically
  message: { success: false, message: "Too many queue requests. Rely on WebSockets." },
});

// Patient / Public (Needs Auth to prevent abuse, but not Hospital)
router.get("/:hospitalId", requireAuth, queueLimiter, getQueueStatus);

// Hospital Only Operations
router.post("/assign-token", requireAuth, requireHospital, assignToken);
router.post("/advance", requireAuth, requireHospital, advanceQueue);

export default router;
