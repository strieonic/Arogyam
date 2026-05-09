// server/routes/reminderRoutes.js
import express from "express";
import {
  addReminder, getMyReminders, updateReminder, deleteReminder,
} from "../controllers/reminderController.js";
import { requirePatient } from "../middleware/rbac.js";
import { validate } from "../middleware/validate.js";
import { z } from "zod";

const router = express.Router();

const reminderSchema = z.object({
  medicineName: z.string().min(1, "Medicine name required").max(150),
  dosage: z.string().max(50).optional(),
  frequency: z.enum(["once_daily", "twice_daily", "thrice_daily", "weekly", "custom"]).optional(),
  times: z.array(z.string().regex(/^\d{2}:\d{2}$/, "Time must be HH:MM")).max(6).optional(),
  startDate: z.string().min(1, "Start date required"),
  endDate: z.string().optional(),
  notes: z.string().max(300).optional(),
});

router.use(requirePatient);

router.post("/", validate(reminderSchema), addReminder);
router.get("/", getMyReminders);
router.put("/:id", updateReminder);
router.delete("/:id", deleteReminder);

export default router;
