// server/controllers/doctorAuthController.js
import Doctor from "../models/Doctor.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

/**
 * @desc Doctor Login
 * @route POST /api/auth/doctor/login
 */
export const doctorLogin = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ success: false, message: "Email and password required" });

    const doctor = await Doctor.findOne({ email }).populate("hospitalId", "hospitalName");
    if (!doctor) return res.status(401).json({ success: false, message: "Invalid credentials" });

    if (doctor.status === "invited") return res.status(403).json({ success: false, message: "Please activate your account via the invitation link sent to your email." });
    if (doctor.status !== "active") return res.status(403).json({ success: false, message: "Account is not active." });

    const isMatch = await bcrypt.compare(password, doctor.password);
    if (!isMatch) return res.status(401).json({ success: false, message: "Invalid credentials" });

    const secret = process.env.JWT_SECRET || "arogyam_default_secret_123";
    const token = jwt.sign(
      { id: doctor._id, role: "doctor", hospitalId: doctor.hospitalId._id },
      secret,
      { expiresIn: "7d" }
    );

    doctor.lastLogin = new Date();
    await doctor.save();

    const docData = doctor.toObject();
    delete docData.password;

    res.json({ success: true, token, doctor: docData });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Setup Doctor Password (Activation)
 * @route POST /api/auth/doctor/setup
 */
export const setupDoctorAccount = async (req, res, next) => {
  try {
    const { token, password } = req.body; // In a real app, token is emailed.
    
    // For this prototype, we'll assume the hospital sends a JWT invite token
    const secret = process.env.JWT_SECRET || "arogyam_default_secret_123";
    let decoded;
    try {
      decoded = jwt.verify(token, secret);
    } catch (e) {
      return res.status(400).json({ success: false, message: "Invalid or expired invitation link." });
    }

    const doctor = await Doctor.findById(decoded.doctorId);
    if (!doctor || doctor.status !== "invited") {
      return res.status(400).json({ success: false, message: "Account already active or invalid." });
    }

    const salt = await bcrypt.genSalt(10);
    doctor.password = await bcrypt.hash(password, salt);
    doctor.status = "active";
    doctor.isVerified = true;
    
    await doctor.save();

    res.json({ success: true, message: "Account activated successfully. You can now log in." });
  } catch (error) {
    next(error);
  }
};
