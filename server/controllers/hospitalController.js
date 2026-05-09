import Hospital from "../models/Hospital.js";
import HospitalPatient from "../models/HospitalPatient.js";
import Patient from "../models/Patient.js";
import Consent from "../models/Consent.js";
import Appointment from "../models/Appointment.js";


/* =========================
   🏥 PROFILE
========================= */
export const getHospitalProfile = async (req, res) => {
  try {
    const hospital = await Hospital.findById(req.hospital._id).select(
      "-password",
    );

    res.status(200).json(hospital);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch profile" });
  }
};

/* =========================
   🔎 SMART SEARCH PATIENT
========================= */
export const searchPatient = async (req, res) => {
  try {
    const { q, filter } = req.query; // e.g. ?q=rahul&filter=recent

    if (!q) {
      return res.status(400).json({ success: false, message: "Search query required" });
    }

    const hospitalId = req.user?.id || req.hospital?._id;

    // 1️⃣ Find all authorized patient IDs for this hospital
    const [consents, appointments, hospitalPatients] = await Promise.all([
      Consent.find({ hospitalId, status: "GRANTED" }).select("patientId"),
      Appointment.find({ hospital: hospitalId }).select("patient"),
      HospitalPatient.find({ hospitalId }).select("patientId")
    ]);

    const authorizedPatientIds = new Set([
      ...consents.map(c => c.patientId.toString()),
      ...appointments.map(a => a.patient.toString()),
      ...hospitalPatients.map(h => h.patientId.toString())
    ]);

    if (authorizedPatientIds.size === 0) {
      return res.json({ success: true, patients: [] });
    }

    // 2️⃣ Build Smart Query
    const searchQuery = { _id: { $in: Array.from(authorizedPatientIds) } };
    const queryStr = q.trim();

    if (/^\d{10}$/.test(queryStr)) {
      // Phone
      searchQuery.phone = queryStr;
    } else if (queryStr.includes('@')) {
      // Email
      searchQuery.email = queryStr;
    } else if (queryStr.toUpperCase().startsWith('ARO-')) {
      // Health ID
      searchQuery.healthId = queryStr.toUpperCase();
    } else {
      // Partial Name Search
      searchQuery.name = { $regex: queryStr, $options: "i" };
    }

    // Optional lightweight filters
    if (filter === 'recent') {
      // We handle sorting later
    } else if (filter && filter.startsWith('blood_')) {
      searchQuery.bloodGroup = filter.split('_')[1]; // e.g. blood_O+
    }

    const patients = await Patient.find(searchQuery)
      .select("name healthId phone bloodGroup emergencyContact age gender")
      .limit(20);

    res.status(200).json({ success: true, patients });
  } catch (err) {
    console.error("Smart Search Error:", err);
    res.status(500).json({ success: false, message: "Search failed" });
  }
};


/* =========================
   📁 HOSPITAL PATIENT DIRECTORY
========================= */
export const getHospitalPatients = async (req, res) => {
  try {
    const data = await HospitalPatient.find({
      hospitalId: req.hospital._id,
    })
      .populate("patientId", "name healthId bloodGroup phone emergencyContact")
      .sort({ lastVisit: -1 }); // 🔥 latest first

    res.status(200).json({
      total: data.length,
      patients: data,
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch patients" });
  }
};
