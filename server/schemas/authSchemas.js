// server/schemas/authSchemas.js
// Zod validation schemas for all auth endpoints
import { z } from "zod";

/* ── Shared primitives ── */
const phone = z
  .string()
  .regex(/^[6-9]\d{9}$/, "Must be a valid 10-digit Indian mobile number");

const password = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .max(64, "Password too long");

const name = z
  .string()
  .min(2, "Name must be at least 2 characters")
  .max(80, "Name too long")
  .regex(/^[a-zA-Z\s'.]+$/, "Name can only contain letters, spaces, apostrophes");

const email = z.string().email("Invalid email address");

/* ── Patient Registration ── */
export const patientRegisterSchema = z.object({
  name: name,
  phone: phone,
  dob: z.string().min(1, "Date of birth is required"),
  gender: z.enum(["Male", "Female", "Other"], { message: "Gender must be Male, Female, or Other" }),
  bloodGroup: z
    .enum(["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"])
    .optional(),
  address: z.string().max(300, "Address too long").optional(),
  emergencyContact: z.string().optional(),
});

/* ── Patient OTP send ── */
export const sendOtpSchema = z.object({
  identifier: z.string().min(1, "Identifier is required"),
});

/* ── Patient OTP verify ── */
export const verifyOtpSchema = z.object({
  identifier: z.string().min(1, "Identifier is required"),
  otp: z
    .string()
    .length(6, "OTP must be exactly 6 digits")
    .regex(/^\d{6}$/, "OTP must contain only digits"),
});

/* ── Hospital Registration ── */
export const hospitalRegisterSchema = z.object({
  hospitalName: z.string().min(2, "Hospital name required").max(150),
  email: email,
  password: password,
  regNumber: z.string().min(3, "Registration number required").max(50),
  phone: z.string().min(7, "Phone required").max(20),
  address: z.string().max(300).optional(),
});

/* ── Hospital Login ── */
export const hospitalLoginSchema = z.object({
  email: email,
  password: z.string().min(1, "Password is required"),
});

/* ── Admin Login ── */
export const adminLoginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});
