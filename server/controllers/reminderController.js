// server/controllers/reminderController.js
import MedicineReminder from "../models/MedicineReminder.js";

/* ── 1. Add reminder ── */
export const addReminder = async (req, res) => {
  try {
    const { medicineName, dosage, frequency, times, startDate, endDate, notes } = req.body;

    const reminder = await MedicineReminder.create({
      patient: req.patient._id,
      medicineName,
      dosage,
      frequency,
      times: times || [],
      startDate: new Date(startDate),
      endDate: endDate ? new Date(endDate) : null,
      notes,
    });

    res.status(201).json({ success: true, message: "Reminder added.", reminder });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to add reminder." });
  }
};

/* ── 2. Get my reminders ── */
export const getMyReminders = async (req, res) => {
  try {
    const reminders = await MedicineReminder.find({
      patient: req.patient._id,
      isActive: true,
    }).sort({ createdAt: -1 });

    res.json({ success: true, total: reminders.length, reminders });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to fetch reminders." });
  }
};

/* ── 3. Update reminder ── */
export const updateReminder = async (req, res) => {
  try {
    const reminder = await MedicineReminder.findById(req.params.id);
    if (!reminder) return res.status(404).json({ success: false, message: "Not found." });
    if (reminder.patient.toString() !== req.patient._id.toString()) {
      return res.status(403).json({ success: false, message: "Unauthorized." });
    }

    const fields = ["medicineName", "dosage", "frequency", "times", "startDate", "endDate", "notes", "isActive"];
    fields.forEach((f) => {
      if (req.body[f] !== undefined) reminder[f] = req.body[f];
    });

    await reminder.save();
    res.json({ success: true, message: "Reminder updated.", reminder });
  } catch (err) {
    res.status(500).json({ success: false, message: "Update failed." });
  }
};

/* ── 4. Delete reminder ── */
export const deleteReminder = async (req, res) => {
  try {
    const reminder = await MedicineReminder.findById(req.params.id);
    if (!reminder) return res.status(404).json({ success: false, message: "Not found." });
    if (reminder.patient.toString() !== req.patient._id.toString()) {
      return res.status(403).json({ success: false, message: "Unauthorized." });
    }

    await reminder.deleteOne();
    res.json({ success: true, message: "Reminder deleted." });
  } catch (err) {
    res.status(500).json({ success: false, message: "Delete failed." });
  }
};
