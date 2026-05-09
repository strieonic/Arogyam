// server/schemas/patientSchemas.js
// Zod validation schemas for patient-side operations
import { z } from "zod";

/* ── Medical Profile Update ── */
export const updateMedicalSchema = z.object({
  bloodGroup: z
    .enum(["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"])
    .optional(),
  allergies: z.array(z.string().max(100)).max(20).optional(),
  chronicConditions: z.array(z.string().max(100)).max(20).optional(),
  currentMedications: z.array(z.string().max(100)).max(30).optional(),
  emergencyContact: z
    .object({
      name: z.string().max(80).optional(),
      phone: z.string().max(20).optional(),
      relation: z.string().max(50).optional(),
    })
    .optional(),
});

/* ── Add Family Member ── */
export const addFamilyMemberSchema = z.object({
  name: z.string().min(2).max(80),
  relation: z.enum(["Spouse", "Child", "Parent", "Sibling", "Other"]),
  dob: z.string().min(1, "Date of birth required"),
  gender: z.enum(["Male", "Female", "Other"]),
  bloodGroup: z
    .enum(["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"])
    .optional(),
});
