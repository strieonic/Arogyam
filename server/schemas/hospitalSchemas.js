// server/schemas/hospitalSchemas.js
// Zod validation schemas for hospital-side operations
import { z } from "zod";

/* ── Consent Request ── */
export const consentRequestSchema = z.object({
  healthId: z
    .string()
    .min(3, "Arogyam ID required")
    .max(30, "Invalid Arogyam ID"),
  purpose: z
    .string()
    .min(5, "Purpose must be at least 5 characters")
    .max(300, "Purpose too long")
    .optional(),
  durationDays: z
    .number({ invalid_type_error: "Duration must be a number" })
    .int()
    .min(1, "Minimum 1 day")
    .max(365, "Maximum 365 days")
    .default(7)
    .optional(),
});

/* ── Record Upload ── */
export const uploadRecordSchema = z.object({
  healthId: z.string().min(3, "Arogyam ID required"),
  recordType: z.enum(
    ["Prescription", "Lab Report", "Imaging", "Radiology", "Discharge Summary", "Vaccination", "Other"],
    { message: "Invalid record type" }
  ),
  notes: z.string().max(1000, "Notes too long").optional(),
  date: z.string().optional(),
});

/* ── Search Patient ── */
export const searchPatientSchema = z.object({
  healthId: z.string().min(1, "Arogyam ID is required").max(30),
});
