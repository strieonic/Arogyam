// server/middleware/security.js
// Helmet + rate limiters — applied globally and per-route
import helmet from "helmet";
import rateLimit from "express-rate-limit";

/* ── Helmet — secure HTTP headers ── */
export const helmetMiddleware = helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }, // allow Cloudinary images
  contentSecurityPolicy: false,                           // CSP handled at CDN level
});

/* ── General API limiter: 1000 req / 15 min per IP ── */
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  standardHeaders: true,
  legacyHeaders: false,
  validate: false,
  message: { success: false, message: "Too many requests. Please try again later." },
  skip: (req) => {
    // Skip rate limiting for authenticated admin actions to prevent dashboard lockouts
    return req.originalUrl && req.originalUrl.includes("/api/admin");
  },
});

/* ── Auth limiter: 10 attempts / 15 min (login / OTP) ── */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  validate: false,
  message: { success: false, message: "Too many auth attempts. Please wait 15 minutes." },
  skipSuccessfulRequests: true, // only count failed attempts
});

/* ── OTP limiter: 5 sends / 10 min per IP ── */
export const otpLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  validate: false,
  message: { success: false, message: "Too many OTP requests. Please wait 10 minutes." },
});

/* ── AI limiters (User-based) ── */
export const aiSummaryLimiter = rateLimit({
  windowMs: 24 * 60 * 60 * 1000, // 24 hours
  max: 20, // 20 per day per user
  keyGenerator: (req) => req.user?.id || req.ip,
  validate: false,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Daily medical summary limit reached (20/day)." },
});

export const aiOcrLimiter = rateLimit({
  windowMs: 24 * 60 * 60 * 1000,
  max: 50, // 50 per day per hospital
  keyGenerator: (req) => req.user?.id || req.ip,
  validate: false,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Daily OCR extraction limit reached (50/day)." },
});

export const aiSymptomLimiter = rateLimit({
  windowMs: 24 * 60 * 60 * 1000,
  max: 30, // 30 per day per user
  keyGenerator: (req) => req.user?.id || req.ip,
  validate: false,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Daily symptom checker limit reached (30/day)." },
});
