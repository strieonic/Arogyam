// server/controllers/hospitalDoctorController.js
import Doctor from "../models/Doctor.js";
import jwt from "jsonwebtoken";

/**
 * @desc Create/Invite a new Doctor
 * @route POST /api/hospital/doctors
 * @access Hospital Admin
 */
export const inviteDoctor = async (req, res, next) => {
  try {
    const hospitalId = req.user.id;
    const { name, email, phone, specialization, experienceYears, licenseNumber } = req.body;

    const existingDoctor = await Doctor.findOne({ email });
    if (existingDoctor) {
      return res.status(400).json({ success: false, message: "Doctor with this email already exists" });
    }

    const doctor = new Doctor({
      name,
      email,
      phone,
      specialization,
      experienceYears,
      licenseNumber,
      hospitalId,
      createdByHospital: hospitalId,
      status: "invited",
      // Default availability template
      availability: [
        { day: "Monday", startTime: "09:00", endTime: "17:00" },
        { day: "Tuesday", startTime: "09:00", endTime: "17:00" },
        { day: "Wednesday", startTime: "09:00", endTime: "17:00" },
        { day: "Thursday", startTime: "09:00", endTime: "17:00" },
        { day: "Friday", startTime: "09:00", endTime: "17:00" },
      ]
    });

    await doctor.save();

    // Generate Invite Token
    const secret = process.env.JWT_SECRET || "arogyam_default_secret_123";
    const inviteToken = jwt.sign(
      { doctorId: doctor._id, hospitalId },
      secret,
      { expiresIn: "7d" }
    );

    // In a real application, send this via email using Nodemailer.
    // For now, return it in the response for frontend dev/testing.
    const clientUrl = req.get('origin') || process.env.CLIENT_URL || 'http://localhost:5173';
    const setupLink = `${clientUrl}/doctor/setup?token=${inviteToken}`;

    res.status(201).json({
      success: true,
      message: "Doctor invited successfully.",
      doctor,
      inviteLink: setupLink // Exposed for prototype flow
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Get all doctors for this hospital
 * @route GET /api/hospital/doctors
 * @access Hospital Admin
 */
export const getHospitalDoctors = async (req, res, next) => {
  try {
    const hospitalId = req.user.id;
    const doctors = await Doctor.find({ hospitalId }).select("-password");
    res.json({ success: true, count: doctors.length, doctors });
  } catch (error) {
    next(error);
  }
};
