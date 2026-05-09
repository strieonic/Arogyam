import Hospital from "../models/Hospital.js";
import Patient from "../models/Patient.js";
import MedicalRecord from "../models/MedicalRecord.js";
import Consent from "../models/Consent.js";
import AdminLog from "../models/AdminLog.js";
import Doctor from "../models/Doctor.js";
import Appointment from "../models/Appointment.js";
import Prescription from "../models/Prescription.js";
import Notification from "../models/Notification.js";
import { sendHospitalVerificationEmail } from "../services/emailService.js";
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

    if (hospital.verificationStatus === "approved") {
      return res.status(400).json({
        message: "Hospital is already approved",
      });
    }

    hospital.verificationStatus = "approved";
    hospital.verifiedByAdmin = true;
    hospital.verifiedAt = new Date();
    hospital.verifiedBy = req.user?.id || null;

    await hospital.save();

    // Log action
    if (req.user?.id) {
      await AdminLog.create({
        adminId: req.user.id,
        action: "approve",
        targetType: "Hospital",
        targetId: hospital._id,
        details: `Hospital ${hospital.hospitalName} approved.`
      });
    }

    // Create Notification
    await Notification.create({
      recipientId: hospital._id,
      recipientModel: "Hospital",
      type: "hospital_approved",
      title: "Account Approved",
      message: "Your hospital account has been approved. You can now use all platform features.",
    });

    // Send Email
    await sendHospitalVerificationEmail(hospital.email, hospital.hospitalName, "approved");

    res.status(200).json({
      message: "Hospital approved successfully",
      verificationStatus: hospital.verificationStatus,
    });
  } catch (error) {
    console.error("HOSPITAL APPROVAL ERROR:", error);
    res.status(500).json({ message: "Approval failed" });
  }
};
/* ======================================================
   REJECT HOSPITAL
====================================================== */
export const rejectHospital = async (req, res) => {
  try {
    const { reason } = req.body;
    const hospital = await Hospital.findById(req.params.id);

    if (!hospital) {
      return res.status(404).json({ message: "Hospital not found" });
    }

    if (hospital.verificationStatus === "rejected") {
      return res.status(400).json({
        message: "Hospital is already rejected",
      });
    }

    hospital.verificationStatus = "rejected";
    hospital.verifiedByAdmin = false;
    hospital.rejectionReason = reason || "Application did not meet requirements.";

    await hospital.save();

    // Log action
    if (req.user?.id) {
      await AdminLog.create({
        adminId: req.user.id,
        action: "reject",
        targetType: "Hospital",
        targetId: hospital._id,
        details: `Hospital ${hospital.hospitalName} rejected. Reason: ${reason}`
      });
    }

    // Create Notification
    await Notification.create({
      recipientId: hospital._id,
      recipientModel: "Hospital",
      type: "hospital_rejected",
      title: "Account Rejected",
      message: `Your hospital registration was rejected. Reason: ${reason}`,
    });

    // Send Email
    await sendHospitalVerificationEmail(hospital.email, hospital.hospitalName, "rejected", reason);

    res.status(200).json({
      message: "Hospital rejected successfully",
      verificationStatus: hospital.verificationStatus,
    });
  } catch (error) {
    res.status(500).json({ message: "Rejection failed" });
  }
};

/* ======================================================
   SUSPEND HOSPITAL
====================================================== */
export const suspendHospital = async (req, res) => {
  try {
    const { reason } = req.body;
    const hospital = await Hospital.findById(req.params.id);

    if (!hospital) {
      return res.status(404).json({ message: "Hospital not found" });
    }

    hospital.verificationStatus = "suspended";
    hospital.verificationNotes = reason || "Suspended by admin.";
    hospital.verifiedByAdmin = false;

    await hospital.save();

    if (req.user?.id) {
      await AdminLog.create({
        adminId: req.user.id,
        action: "suspend",
        targetType: "Hospital",
        targetId: hospital._id,
        details: `Hospital ${hospital.hospitalName} suspended. Reason: ${reason}`
      });
    }

    // Create Notification
    await Notification.create({
      recipientId: hospital._id,
      recipientModel: "Hospital",
      type: "hospital_suspended",
      title: "Account Suspended",
      message: `Your hospital account was suspended. Reason: ${reason}`,
    });

    // Send Email
    await sendHospitalVerificationEmail(hospital.email, hospital.hospitalName, "suspended", reason);

    res.status(200).json({
      message: "Hospital suspended successfully",
      verificationStatus: hospital.verificationStatus,
    });
  } catch (error) {
    res.status(500).json({ message: "Suspension failed" });
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

    const pendingHospitals = await Hospital.countDocuments({ verificationStatus: "pending" });
    const approvedHospitals = await Hospital.countDocuments({ verificationStatus: "approved" });
    const rejectedHospitals = await Hospital.countDocuments({ verificationStatus: "rejected" });

    const totalDoctors = await Doctor.countDocuments();
    const totalAppointments = await Appointment.countDocuments();
    const totalPrescriptions = await Prescription.countDocuments();
    const complaintsOpen = 0; // Mock until Complaint system is built

    const approvedConsents = await Consent.countDocuments({ status: "approved" });
    const pendingConsents = await Consent.countDocuments({ status: "pending" });

    // Recent counts (last 7 days)
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const recentPatients = await Patient.countDocuments({ createdAt: { $gte: sevenDaysAgo } });
    const recentHospitals = await Hospital.countDocuments({ createdAt: { $gte: sevenDaysAgo } });
    const recentRecords = await MedicalRecord.countDocuments({ createdAt: { $gte: sevenDaysAgo } });

    // ── Charts Data ──
    // 1. Monthly Registrations (Last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1);
    
    const monthlyRegistrationsAgg = await Patient.aggregate([
      { $match: { createdAt: { $gte: sixMonthsAgo } } },
      { $group: { _id: { year: { $year: "$createdAt" }, month: { $month: "$createdAt" } }, count: { $sum: 1 } } },
      { $sort: { "_id.year": 1, "_id.month": 1 } }
    ]);
    const monthlyRegistrations = monthlyRegistrationsAgg.map(d => ({
      month: `${d._id.month}/${d._id.year}`,
      patients: d.count
    }));

    // 2. Daily Appointments (Last 7 days)
    const dailyAppointmentsAgg = await Appointment.aggregate([
      { $match: { createdAt: { $gte: sevenDaysAgo } } },
      { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }, count: { $sum: 1 } } },
      { $sort: { "_id": 1 } }
    ]);
    const dailyAppointments = dailyAppointmentsAgg.map(d => ({
      date: d._id,
      appointments: d.count
    }));

    // 3. Hospital Approval Status
    const hospitalStatusData = [
      { name: "Approved", value: approvedHospitals },
      { name: "Pending", value: pendingHospitals },
      { name: "Rejected", value: rejectedHospitals }
    ];

    res.status(200).json({
      totalPatients,
      totalHospitals,
      totalRecords,
      totalConsents,
      totalDoctors,
      totalAppointments,
      totalPrescriptions,
      complaintsOpen,
      pendingHospitals,
      approvedHospitals,
      rejectedHospitals,
      approvedConsents,
      pendingConsents,
      recentPatients,
      recentHospitals,
      recentRecords,
      charts: {
        monthlyRegistrations,
        dailyAppointments,
        hospitalStatusData
      }
    });
  } catch (error) {
    console.log("Admin Stats Error:", error);
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
