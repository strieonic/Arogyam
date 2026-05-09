import Patient from "../models/Patient.js";
import MedicalRecord from "../models/MedicalRecord.js";
import Consent from "../models/Consent.js";
import Appointment from "../models/Appointment.js";
import Prescription from "../models/Prescription.js";
import generateHealthId from "../utils/generateHealthId.js";

import generateQR from "../utils/qrGenerator.js";


/* ======================================================
   1️⃣ GET PROFILE
====================================================== */
export const getPatientProfile = async (req, res) => {
  try {
    const patient = await Patient.findById(req.patient._id).populate(
      "familyMembers",
      "name relation healthId qrCode",
    );

    res.status(200).json(patient);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch profile" });
  }
};

/* ======================================================
   2️⃣ UPDATE MEDICAL PROFILE
====================================================== */
export const updateMedicalProfile = async (req, res) => {
  try {
    const { bloodGroup, allergies, emergencyContact, address, phone, aadhaar } = req.body;

    const patient = await Patient.findById(req.patient._id);

    if (!patient) return res.status(404).json({ message: "Patient not found" });

    if (bloodGroup) patient.bloodGroup = bloodGroup;
    if (allergies) patient.allergies = allergies;
    if (emergencyContact) patient.emergencyContact = emergencyContact;
    if (address) patient.address = address;
    if (phone) patient.phone = phone;
    if (aadhaar) patient.aadhaar = aadhaar;

    await patient.save();

    res.json({
      message: "Medical profile updated",
      patient,
    });
  } catch (error) {
    console.log("Update Profile Error:", error);
    res.status(500).json({ message: "Update failed", error: error.message });
  }
};

/* ======================================================
   3️⃣ ADD FAMILY MEMBER (AADHAAR BASED)
====================================================== */
export const addFamilyMember = async (req, res) => {
  try {
    const { name, phone, aadhaar, relation, age, bloodGroup, allergies } =
      req.body;

    const mainPatient = await Patient.findById(req.patient._id);

    if (!mainPatient) {
      return res.status(404).json({ message: "Patient not found" });
    }

    /* 🔍 CHECK EXISTING BY AADHAAR */
    let existing = null;

    if (aadhaar) {
      existing = await Patient.findOne({ aadhaar });
    }

    if (existing) {
      if (mainPatient.familyMembers.includes(existing._id)) {
        return res.status(400).json({
          message: "Family member already added",
        });
      }

      mainPatient.familyMembers.push(existing._id);
      await mainPatient.save();

      return res.json({
        message: "Existing family member linked",
        member: existing,
      });
    }

    /* 🆕 CREATE NEW MEMBER */

    const cleanPhone = phone && phone.trim() !== "" ? phone.trim() : undefined;

    const uniqueBase = aadhaar || cleanPhone || `${name}-${Date.now()}`;

    const healthId = generateHealthId(uniqueBase);
    const qrCode = await generateQR(healthId);

    const newMember = await Patient.create({
      name,
      phone: cleanPhone,
      aadhaar,
      age,
      relation,
      bloodGroup,
      allergies,
      healthId,
      qrCode,
      createdBy: req.patient._id,
      role: "FAMILY", // ⭐ IMPORTANT
    });

    mainPatient.familyMembers.push(newMember._id);
    await mainPatient.save();

    return res.status(201).json({
      message: "Family member added",
      member: newMember,
    });
  } catch (error) {
    console.log("Add Family Error:", error);
    return res.status(500).json({ message: "Failed to add member" });
  }
};
/* ======================================================
   4️⃣ GET FAMILY MEMBERS
====================================================== */
export const getFamilyMembers = async (req, res) => {
  try {
    const patient = await Patient.findById(req.patient._id).populate(
      "familyMembers",
      "-aadhaar -loginOTP -otpExpiry",
    );

    res.json({
      total: patient.familyMembers.length,
      familyMembers: patient.familyMembers,
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch family" });
  }
};

/* ======================================================
   5️⃣ REMOVE FAMILY MEMBER
====================================================== */
export const removeFamilyMember = async (req, res) => {
  try {
    const { memberId } = req.params;

    const patient = await Patient.findById(req.patient._id);

    patient.familyMembers = patient.familyMembers.filter(
      (id) => id.toString() !== memberId,
    );

    await patient.save();

    res.json({ message: "Family member removed" });
  } catch (error) {
    res.status(500).json({ message: "Remove failed" });
  }
};

/* ======================================================
   6️⃣ UPDATE FAMILY MEMBER MEDICAL
====================================================== */
export const updateFamilyMedical = async (req, res) => {
  try {
    const { memberId } = req.params;
    const { bloodGroup, allergies, emergencyContact } = req.body;

    const member = await Patient.findById(memberId);

    if (!member) return res.status(404).json({ message: "Member not found" });

    // 🔐 only owner can edit
    if (member.createdBy?.toString() !== req.patient._id.toString()) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    if (bloodGroup) member.bloodGroup = bloodGroup;
    if (allergies) member.allergies = allergies;
    if (emergencyContact) member.emergencyContact = emergencyContact;

    await member.save();

    res.json({
      message: "Family medical updated",
      member,
    });
  } catch (error) {
    res.status(500).json({ message: "Update failed" });
  }
};

/* ======================================================
   7️⃣ GET MY RECORDS (PAGINATED)
====================================================== */
export const getMyRecords = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const [records, prescriptions] = await Promise.all([
      MedicalRecord.find({
        patient: req.patient._id,
      }).populate("hospital", "hospitalName email"),
      Prescription.find({
        patient: req.patient._id,
      }).populate("hospital", "hospitalName email").populate("doctor", "name specialization")
    ]);

    // Format prescriptions to match records for the frontend
    const formattedPrescriptions = prescriptions.map(p => ({
      ...p.toObject(),
      recordType: 'prescription',
      fileUrl: null, // UI will render it natively rather than link to PDF
      notes: p.notes || p.diagnosis
    }));

    const allRecords = [...records, ...formattedPrescriptions].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    // Slice for pagination
    const paginatedRecords = allRecords.slice(skip, skip + limit);

    res.json({
      success: true,
      totalRecords: allRecords.length,
      records: paginatedRecords,
      pagination: {
        total: allRecords.length,
        page,
        limit,
        pages: Math.ceil(allRecords.length / limit),
      }
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch records" });
  }
};


/* ======================================================
   8️⃣ GET MY CONSENTS
====================================================== */
export const getMyConsents = async (req, res) => {
  try {
    const consents = await Consent.find({
      patientId: req.patient._id,
    }).populate("hospitalId", "hospitalName email");

    res.json(consents);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch consents" });
  }
};

/* ======================================================
   9️⃣ GET HEALTH CARD (EMERGENCY READY)
====================================================== */
export const getHealthCard = async (req, res) => {
  try {
    const patient = await Patient.findById(req.patient._id);

    res.json({
      name: patient.name,
      healthId: patient.healthId,
      qrCode: patient.qrCode,
      bloodGroup: patient.bloodGroup,
      allergies: patient.allergies,
      emergencyContact: patient.emergencyContact,
      aadhaar: patient.aadhaar,
      phone: patient.phone,
      address: patient.address,
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch card" });
  }
};

/* ======================================================
   🔟 MEDICAL TIMELINE (records + consents + appointments merged)
====================================================== */
export const getTimeline = async (req, res) => {
  try {
    const patientId = req.patient._id;

    const [records, consents, appointments, prescriptions] = await Promise.all([
      MedicalRecord.find({ patient: patientId })
        .populate("hospital", "hospitalName")
        .sort({ createdAt: -1 })
        .limit(50),
      Consent.find({ patientId })
        .populate("hospitalId", "hospitalName")
        .sort({ createdAt: -1 })
        .limit(30),
      Appointment.find({ patient: patientId })
        .populate("hospital", "hospitalName")
        .populate("doctor", "name")
        .sort({ date: -1 })
        .limit(30),
      Prescription.find({ patient: patientId })
        .populate("hospital", "hospitalName")
        .populate("doctor", "name")
        .sort({ createdAt: -1 })
        .limit(30),
    ]);

    // Normalise into a unified event list
    const events = [
      ...records.map((r) => ({
        id: r._id,
        type: "record",
        title: `${r.recordType} uploaded`,
        subtitle: r.hospital?.hospitalName || "Unknown hospital",
        notes: r.notes,
        date: r.createdAt,
        fileUrl: r.fileUrl,
      })),
      ...consents.map((c) => ({
        id: c._id,
        type: "consent",
        title: `Access ${c.status}`,
        subtitle: c.hospitalId?.hospitalName || "Unknown hospital",
        notes: null,
        date: c.createdAt,
        status: c.status,
      })),
      ...appointments.map((a) => ({
        id: a._id,
        type: "appointment",
        title: `Appointment — ${a.department}`,
        subtitle: a.doctor ? `Dr. ${a.doctor.name} (${a.hospital?.hospitalName})` : (a.hospital?.hospitalName || "Unknown hospital"),
        notes: a.reason,
        date: a.date,
        status: a.status,
        timeSlot: a.timeSlot,
      })),
      ...prescriptions.map((p) => ({
        id: p._id,
        type: "prescription",
        title: `Digital Prescription Issued`,
        subtitle: `Dr. ${p.doctor?.name} (${p.hospital?.hospitalName})`,
        notes: `Diagnosis: ${p.diagnosis}. ${p.medicines.length} medicines prescribed.`,
        date: p.createdAt,
      }))
    ].sort((a, b) => new Date(b.date) - new Date(a.date));

    res.json({ success: true, total: events.length, events });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to build timeline." });
  }
};


/* ======================================================
   1️⃣1️⃣ PROFILE COMPLETION SCORE
====================================================== */
export const getProfileCompletion = async (req, res) => {
  try {
    const patient = await Patient.findById(req.patient._id);

    const checks = [
      { label: "Name",             done: !!patient.name },
      { label: "Phone",            done: !!patient.phone },
      { label: "Blood Group",      done: !!patient.bloodGroup },
      { label: "Emergency Contact",done: !!patient.emergencyContact },
      { label: "Address",          done: !!patient.address },
      { label: "Allergies",        done: !!patient.allergies },
    ];

    const completed = checks.filter((c) => c.done).length;
    const score = Math.round((completed / checks.length) * 100);

    res.json({ success: true, score, completed, total: checks.length, checks });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to compute score." });
  }
};
