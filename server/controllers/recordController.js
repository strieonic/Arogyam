import MedicalRecord from "../models/MedicalRecord.js";
import Patient from "../models/Patient.js";
import Consent from "../models/Consent.js";
import { uploadBufferToCloudinary } from "../middleware/uploadMiddleware.js";
import { extractTextFromPDF } from "../utils/ocrScan.js";
import fs from "fs";
import path from "path";

/* =========================
   UPLOAD RECORD (SECURE FIXED)
========================= */
export const uploadRecord = async (req, res) => {
  try {
    const { healthId, recordType, notes } = req.body;

    const patient = await Patient.findOne({ healthId });
    if (!patient) {
      return res.status(404).json({ message: "Patient not found" });
    }

    const consent = await Consent.findOne({
      patientId: patient._id,
      hospitalId: req.hospital._id,
    });

    if (!consent) {
      return res.status(403).json({ message: "No consent found" });
    }

    // ✅ FIX 1: status check
    if (consent.status !== "approved") {
      return res.status(403).json({ message: "Consent not approved" });
    }

    // ✅ FIX 2: proper Date comparison
    if (
      !consent.accessEnd ||
      new Date(consent.accessEnd).getTime() < Date.now()
    ) {
      return res.status(403).json({ message: "Access expired" });
    }

    if (!req.file) {
      return res.status(400).json({ message: "File required" });
    }

    const uploadResult = await uploadBufferToCloudinary(
      req.file.buffer,
      "arogyam/records",
    );

    // 📄 Extract text for AI analysis later
    let extractedText = "";
    if (recordType.toLowerCase().includes("report") || recordType.toLowerCase().includes("lab")) {
      try {
        // Save temp file for pdf-parse if buffer is not enough or use buffer directly
        const tempPath = path.join("uploads", `temp-${Date.now()}.pdf`);
        if (!fs.existsSync("uploads")) fs.mkdirSync("uploads");
        fs.writeFileSync(tempPath, req.file.buffer);
        
        extractedText = await extractTextFromPDF(tempPath);
        
        // Clean up temp file
        fs.unlinkSync(tempPath);
      } catch (ocrErr) {
        console.log("OCR EXTRACTION FAILED:", ocrErr.message);
      }
    }

    const record = await MedicalRecord.create({
      patient: patient._id,
      hospital: req.hospital._id,
      recordType,
      fileUrl: uploadResult.secure_url,
      notes,
      extractedText: extractedText || "",
      aiSummary: "",
    });

    return res.status(201).json({
      message: "Record uploaded successfully",
      record,
    });
  } catch (err) {
    console.log("UPLOAD ERROR:", err);
    return res.status(500).json({ message: "Upload failed", error: err.message, stack: err.stack });
  }
};

/* =========================
   GET RECORDS (SECURE FIXED)
========================= */
export const getPatientRecords = async (req, res) => {
  try {
    const { healthId } = req.params;

    const patient = await Patient.findOne({ healthId: healthId.trim() });

    if (!patient) {
      return res.status(404).json({ message: "Patient not found" });
    }

    const consent = await Consent.findOne({
      patientId: patient._id,
      hospitalId: req.hospital._id,
    });

    if (!consent) {
      return res.status(403).json({ message: "No consent found" });
    }

    if (consent.status !== "approved") {
      return res.status(403).json({ message: "Consent not approved" });
    }

    if (
      !consent.accessEnd ||
      new Date(consent.accessEnd).getTime() < Date.now()
    ) {
      return res.status(403).json({ message: "Access expired" });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const [records, total] = await Promise.all([
      MedicalRecord.find({
        patient: patient._id,
      })
      .populate("hospital", "hospitalName")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
      MedicalRecord.countDocuments({ patient: patient._id })
    ]);

    return res.json({
      success: true,
      accessRemainingMinutes: Math.max(
        0,
        Math.floor(
          (new Date(consent.accessEnd).getTime() - Date.now()) / 60000,
        ),
      ),
      records,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      }
    });
  } catch (err) {
    console.log("ERROR:", err);
    return res.status(500).json({ message: "Fetch failed" });
  }
};
