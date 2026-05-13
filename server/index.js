// server/index.js
import dotenv from "dotenv";
dotenv.config();
import "./config/cloudinary.js";

import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import http from "http";
import { initSocket } from "./config/socket.js";


import connectDB from "./config/db.js";

// Security middleware
import { helmetMiddleware, generalLimiter } from "./middleware/security.js";
import { httpLogger } from "./middleware/logger.js";
import compression from "compression";

// Routes
import authRoutes from "./routes/authRoutes.js";
import patientRoutes from "./routes/patientRoutes.js";
import hospitalRoutes from "./routes/hospitalRoutes.js";
import consentRoutes from "./routes/consentRoutes.js";
import medicalRecordRoutes from "./routes/recordRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import aiRoutes from "./routes/aiRoutes.js";
import publicRoutes from "./routes/publicRoutes.js";
import appointmentRoutes from "./routes/appointmentRoutes.js";
import reminderRoutes from "./routes/reminderRoutes.js";
import queueRoutes from "./routes/queueRoutes.js";
import doctorRoutes from "./routes/doctorRoutes.js";
import doctorSelfRoutes from "./routes/doctorSelfRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import complaintRoutes from "./routes/complaintRoutes.js";





const app = express();

/* ======================================================
   HTTP LOGGING (Morgan)
====================================================== */
app.use(httpLogger);

/* ======================================================
   RESPONSE COMPRESSION
====================================================== */
app.use(compression({
  // Only compress responses larger than 1kb
  threshold: 1024,
  // Don't compress SSE streams (socket.io)
  filter: (req, res) => {
    if (req.headers['x-no-compression']) return false;
    return compression.filter(req, res);
  },
}));

/* ======================================================
   SECURITY HEADERS
====================================================== */
app.use(helmetMiddleware);

/* ======================================================
   CORS
====================================================== */
const allowedOrigins = [
  process.env.CLIENT_URL || "http://localhost:5173",
  "http://localhost:5174",
  "https://arogyam.vercel.app",
  "https://health1-lilac.vercel.app",
  "https://health1-hh2haa8ga-strieonics-projects.vercel.app",
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      
      const isAllowedVercel = origin.endsWith(".vercel.app");
      const isLocal = origin.includes("localhost");
      
      if (isAllowedVercel || isLocal || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      
      callback(new Error(`CORS blocked: ${origin}`));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

/* ======================================================
   BODY PARSERS
====================================================== */
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser());
app.use("/uploads", express.static("uploads"));

/* ======================================================
   GLOBAL RATE LIMITER — 100 req / 15 min per IP
====================================================== */
app.use("/api", generalLimiter);

/* ======================================================
   ROUTES
====================================================== */
app.use("/api/auth", authRoutes);
app.use("/api/patient", patientRoutes);
app.use("/api/hospital", hospitalRoutes);
app.use("/api/hospital/doctors", doctorRoutes);
app.use("/api/doctor", doctorSelfRoutes);
app.use("/api/consent", consentRoutes);


app.use("/api/records", medicalRecordRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/public", publicRoutes);
app.use("/api/appointments", appointmentRoutes);
app.use("/api/reminders", reminderRoutes);
app.use("/api/queue", queueRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/complaints", complaintRoutes);



/* ======================================================
   HEALTH CHECK
====================================================== */
app.get("/health", (_, res) => res.json({ status: "ok", service: "arogyam-server" }));

/* ======================================================
   GLOBAL ERROR HANDLER
====================================================== */
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  let status = err.status || err.statusCode || 500;
  let message = err.message || "Internal server error.";

  // Handle Mongoose Validation Error
  if (err.name === "ValidationError") {
    status = 400;
    message = Object.values(err.errors).map(val => val.message).join(", ");
  }

  // Handle Mongoose Cast Error (Invalid ID)
  if (err.name === "CastError") {
    status = 400;
    message = `Invalid ${err.path}: ${err.value}`;
  }

  // Handle JWT Errors
  if (err.name === "JsonWebTokenError") {
    status = 401;
    message = "Invalid token. Please log in again.";
  }
  if (err.name === "TokenExpiredError") {
    status = 401;
    message = "Your session has expired. Please log in again.";
  }

  // Production safety
  // if (process.env.NODE_ENV === "production" && status === 500) {
  //   message = "An unexpected server error occurred.";
  // }

  console.error(`[${new Date().toISOString()}] ${req.method} ${req.path} → ${status}: ${err.message}`);
  if (status === 500) console.error(err.stack);

  res.status(status).json({ 
    success: false, 
    message,
    ...(process.env.NODE_ENV !== "production" && { stack: err.stack })
  });
});

/* ======================================================
   START
====================================================== */
const PORT = process.env.PORT || 8000;
const server = http.createServer(app);

// Initialize Socket.io
initSocket(server);

const startServer = async () => {
  try {
    console.log("⏳ Connecting MongoDB...");
    await connectDB();
    console.log("✅ MongoDB connected");
    server.listen(PORT, "0.0.0.0", () => {
      console.log(`🚀 Arogyam server (HTTP & WS) running on port ${PORT}`);
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
};

startServer();

