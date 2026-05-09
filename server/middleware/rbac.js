// server/middleware/rbac.js
// Role-Based Access Control — protect routes by role
// Roles: patient | hospital_admin | doctor | admin
import jwt from "jsonwebtoken";
import Patient from "../models/Patient.js";
import Hospital from "../models/Hospital.js";
import Doctor from "../models/Doctor.js";
import Admin from "../models/Admin.js";

/* ─── Generic token extractor ─── */
const extractToken = (req) => {
  if (req.headers.authorization?.startsWith("Bearer ")) {
    return req.headers.authorization.split(" ")[1];
  }
  return req.cookies?.token || null;
};

/* ─── Patient auth ─── */
export const requirePatient = async (req, res, next) => {
  try {
    const token = extractToken(req);
    if (!token) return res.status(401).json({ success: false, message: "Authentication required." });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role && decoded.role !== "patient") {
      return res.status(403).json({ success: false, message: "Patient access only." });
    }

    const patient = await Patient.findById(decoded.id).select("-password -otp -otpExpiry");
    if (!patient) return res.status(401).json({ success: false, message: "Patient account not found." });

    req.patient = patient;
    req.user = { id: patient._id, _id: patient._id, role: "patient", data: patient };
    next();
  } catch {
    res.status(401).json({ success: false, message: "Invalid or expired token." });
  }
};

/* ─── Hospital Admin auth ─── */
export const requireHospitalAdmin = async (req, res, next) => {
  try {
    const token = extractToken(req);
    if (!token) return res.status(401).json({ success: false, message: "Authentication required." });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== "hospital") {
      return res.status(403).json({ success: false, message: "Hospital access only." });
    }

    const hospital = await Hospital.findById(decoded.id).select("-password");
    if (!hospital) return res.status(401).json({ success: false, message: "Hospital account not found." });

    req.hospital = hospital;
    req.user = { 
      id: hospital._id, 
      _id: hospital._id, 
      role: "hospital", 
      status: hospital.verificationStatus,
      data: hospital 
    };
    next();
  } catch (error) {
    res.status(401).json({ success: false, message: "Invalid or expired token." });
  }
};

/**
 * Ensures the Hospital is FULLY APPROVED before accessing clinical/operational routes.
 */
export const requireApprovedHospitalAdmin = async (req, res, next) => {
  try {
    // This should ideally be used AFTER requireHospitalAdmin
    const hospital = req.hospital || (req.user?.role === "hospital" ? req.user.data : null);

    if (!hospital) {
      return res.status(401).json({ success: false, message: "Hospital not authenticated." });
    }
    
    if (hospital.verificationStatus !== "approved") {
      return res.status(403).json({ 
        success: false, 
        message: "Your account is pending verification. Access to this feature is restricted.",
        verificationStatus: hospital.verificationStatus 
      });
    }

    next();
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error during authorization." });
  }
};

/* ─── Doctor auth ─── */
export const requireDoctor = async (req, res, next) => {
  try {
    const token = extractToken(req);
    if (!token) return res.status(401).json({ success: false, message: "Authentication required." });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role && decoded.role !== "doctor") {
      return res.status(403).json({ success: false, message: "Doctor access only." });
    }

    const doctor = await Doctor.findById(decoded.id).select("-password");
    if (!doctor) return res.status(401).json({ success: false, message: "Doctor account not found." });
    
    if (doctor.status !== "active") {
      return res.status(403).json({ success: false, message: "Doctor account is not active." });
    }

    req.doctor = doctor;
    req.user = { 
      id: doctor._id, 
      _id: doctor._id, 
      role: "doctor", 
      status: doctor.status,
      data: doctor 
    };
    next();
  } catch {
    res.status(401).json({ success: false, message: "Invalid or expired token." });
  }
};

/* ─── Admin auth ─── */
export const requireAdmin = async (req, res, next) => {
  try {
    const token = extractToken(req);
    if (!token) return res.status(401).json({ success: false, message: "Authentication required." });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== "admin") {
      return res.status(403).json({ success: false, message: "Admin access only." });
    }

    const admin = await Admin.findById(decoded.id).select("-password");
    if (!admin) return res.status(401).json({ success: false, message: "Admin account not found." });

    req.admin = admin;
    req.user = { id: admin._id, _id: admin._id, role: "admin", data: admin };
    next();
  } catch {
    res.status(401).json({ success: false, message: "Invalid or expired token." });
  }
};

/* ─── Any authenticated user ─── */
export const requireAuth = async (req, res, next) => {
  try {
    const token = extractToken(req);
    if (!token) return res.status(401).json({ success: false, message: "Authentication required." });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch {
    res.status(401).json({ success: false, message: "Invalid or expired token." });
  }
};

/* ─── Aliases for backward compatibility ─── */
export const requireHospital = requireHospitalAdmin;
