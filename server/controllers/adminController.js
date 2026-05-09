import Hospital from "../models/Hospital.js";
import Patient from "../models/Patient.js";
import MedicalRecord from "../models/MedicalRecord.js";
import Consent from "../models/Consent.js";
import jwt from "jsonwebtoken";

/* ======================================================
   ADMIN LOGIN
====================================================== */
export const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (
      email !== process.env.ADMIN_EMAIL ||
      password !== process.env.ADMIN_PASSWORD
    ) {
      return res.status(401).json({ message: "Invalid admin credentials" });
    }

    // create admin JWT
    const token = jwt.sign({ role: "admin" }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.status(200).json({
      message: "Admin login successful",
      token,
    });
  } catch (error) {
    res.status(500).json({ message: "Admin login failed" });
  }
};

/* ======================================================
   GET ALL HOSPITALS (PENDING / APPROVED / REJECTED)
====================================================== */
export const getAllHospitals = async (req, res) => {
  try {
    const hospitals = await Hospital.find().select("-password");

    res.status(200).json({
      total: hospitals.length,
      hospitals,
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch hospitals" });
  }
};
/* ======================================================
   GET SINGLE HOSPITAL DETAILS
====================================================== */
export const getHospitalDetails = async (req, res) => {
  try {
    const hospital = await Hospital.findById(req.params.id).select("-password");

    if (!hospital) {
      return res.status(404).json({ message: "Hospital not found" });
    }

    res.status(200).json(hospital);
  } catch (error) {
    res.status(500).json({ message: "Error fetching hospital" });
  }
};
/* ======================================================
   APPROVE HOSPITAL
====================================================== */
export const approveHospital = async (req, res) => {
  try {
    const hospital = await Hospital.findById(req.params.id);

    if (!hospital) {
      return res.status(404).json({ message: "Hospital not found" });
    }

    // ✅ Only pending can be approved
    if (hospital.status !== "pending") {
      return res.status(400).json({
        message: `Hospital already ${hospital.status}`,
      });
    }

    hospital.status = "approved";
    hospital.verifiedByAdmin = true;

    await hospital.save();

    res.status(200).json({
      message: "Hospital approved successfully",
      trustScore: hospital.trustScore,
    });
  } catch (error) {
    res.status(500).json({ message: "Approval failed" });
  }
};
/* ======================================================
   REJECT HOSPITAL
====================================================== */
export const rejectHospital = async (req, res) => {
  try {
    const hospital = await Hospital.findById(req.params.id);

    if (!hospital) {
      return res.status(404).json({ message: "Hospital not found" });
    }

    // ✅ Only pending can be rejected
    if (hospital.status !== "pending") {
      return res.status(400).json({
        message: `Hospital already ${hospital.status}`,
      });
    }

    hospital.status = "rejected";
    hospital.verifiedByAdmin = false;

    await hospital.save();

    res.status(200).json({
      message: "Hospital rejected successfully",
      trustScore: hospital.trustScore,
    });
  } catch (error) {
    res.status(500).json({ message: "Rejection failed" });
  }
};

/* ======================================================
   GET DASHBOARD STATS
====================================================== */
export const getAdminStats = async (req, res) => {
  try {
    const totalPatients = await Patient.countDocuments();
    const totalHospitals = await Hospital.countDocuments();
    const totalRecords = await MedicalRecord.countDocuments();
    const totalConsents = await Consent.countDocuments();

    const pendingHospitals = await Hospital.countDocuments({ status: "pending" });
    const approvedHospitals = await Hospital.countDocuments({ status: "approved" });
    const rejectedHospitals = await Hospital.countDocuments({ status: "rejected" });
    const approvedConsents = await Consent.countDocuments({ status: "approved" });
    const pendingConsents = await Consent.countDocuments({ status: "pending" });

    // Recent counts (last 7 days)
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const recentPatients = await Patient.countDocuments({ createdAt: { $gte: sevenDaysAgo } });
    const recentHospitals = await Hospital.countDocuments({ createdAt: { $gte: sevenDaysAgo } });
    const recentRecords = await MedicalRecord.countDocuments({ createdAt: { $gte: sevenDaysAgo } });

    res.status(200).json({
      totalPatients,
      totalHospitals,
      totalRecords,
      totalConsents,
      pendingHospitals,
      approvedHospitals,
      rejectedHospitals,
      approvedConsents,
      pendingConsents,
      recentPatients,
      recentHospitals,
      recentRecords,
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch stats" });
  }
};

/* ======================================================
   GET ALL PATIENTS
====================================================== */
export const getAllPatients = async (req, res) => {
  try {
    const patients = await Patient.find().sort({ createdAt: -1 });
    res.status(200).json({
      total: patients.length,
      patients,
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch patients" });
  }
};

/* ======================================================
   GET ALL RECORDS
====================================================== */
export const getAllRecords = async (req, res) => {
  try {
    const records = await MedicalRecord.find()
      .populate("patient", "name healthId")
      .populate("hospital", "hospitalName")
      .sort({ createdAt: -1 });
    res.status(200).json({
      total: records.length,
      records,
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch records" });
  }
};

/* ======================================================
   GET ALL CONSENTS
====================================================== */
export const getAllConsents = async (req, res) => {
  try {
    const consents = await Consent.find()
      .populate("patientId", "name healthId")
      .populate("hospitalId", "hospitalName")
      .sort({ createdAt: -1 });
    res.status(200).json({
      total: consents.length,
      consents,
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch consents" });
  }
};/* ======================================================
   DELETE HOSPITAL
====================================================== */
export const deleteHospital = async (req, res) => {
  try {
    const hospital = await Hospital.findByIdAndDelete(req.params.id);
    if (!hospital) {
      return res.status(404).json({ message: "Hospital not found" });
    }
    // Also delete associated medical records? (Optional but good for cleanup)
    await MedicalRecord.deleteMany({ hospital: req.params.id });
    
    res.status(200).json({ message: "Hospital and associated records deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete hospital" });
  }
};

/* ======================================================
   DELETE PATIENT
====================================================== */
export const deletePatient = async (req, res) => {
  try {
    const patient = await Patient.findByIdAndDelete(req.params.id);
    if (!patient) {
      return res.status(404).json({ message: "Patient not found" });
    }
    // Cleanup: remove from familyMembers of other patients
    await Patient.updateMany(
      { familyMembers: req.params.id },
      { $pull: { familyMembers: req.params.id } }
    );
    // Delete associated medical records
    await MedicalRecord.deleteMany({ patient: req.params.id });
    // Delete associated consents
    await Consent.deleteMany({ patientId: req.params.id });

    res.status(200).json({ message: "Patient and all associated data deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete patient" });
  }
};
