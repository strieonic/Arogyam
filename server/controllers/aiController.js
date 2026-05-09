import axios from "axios";
import MedicalRecord from "../models/MedicalRecord.js";
import SymptomHistory from "../models/SymptomHistory.js";
import pdf from "pdf-parse";
import sharp from "sharp";
import Tesseract from "tesseract.js";

/**
 * AI ANALYZE FROM DATABASE RECORD (BEST APPROACH)
 */
export const analyzeMedicalReport = async (req, res) => {
  if (process.env.ENABLE_AI === "false") {
    return res.status(503).json({ message: "AI Analysis is currently disabled for maintenance." });
  }
  try {
    const { recordId } = req.params;

    if (!recordId) {
      return res.status(400).json({ message: "recordId is required" });
    }

    // 1. Get record from DB
    const record = await MedicalRecord.findById(recordId);

    if (!record) {
      return res.status(404).json({ message: "Medical record not found" });
    }

    if (!record.fileUrl) {
      return res.status(400).json({ message: "No file attached" });
    }

    // 2. Download PDF from Cloudinary
    const fileResponse = await axios.get(record.fileUrl, {
      responseType: "arraybuffer",
    });

    const buffer = Buffer.from(fileResponse.data);

    // 3. Extract text from PDF
    const pdfData = await pdf(buffer);
    const text = pdfData.text;

    if (!text || text.length < 30) {
      return res.status(400).json({
        message: "Could not extract meaningful text",
      });
    }

    // 4. Groq Prompt
    const prompt = `
You are a careful medical assistant for Indian patients. Your goal is to explain the following medical report in simple, plain English that a non-doctor can understand.

CRITICAL RULES:
1. NEVER diagnose the patient.
2. NEVER prescribe medication.
3. Be objective, safe, and cautious.
4. Output MUST be valid JSON, using exactly this structure:
{
  "summary": "Plain language summary of the report in 2-3 sentences.",
  "normalFindings": ["List of normal results"],
  "abnormalFindings": ["List of abnormal results, if any"],
  "possibleConcerns": ["What these abnormalities might mean (non-diagnostic)"],
  "recommendedSpecialist": "E.g., General Physician, Cardiologist, or None",
  "followUpSuggestions": ["General lifestyle or follow-up advice"]
}

REPORT TEXT:
${text}
`;

    // 5. Call Groq API
    const response = await axios.post(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        model: "llama-3.1-70b-versatile",
        messages: [
          {
            role: "system",
            content:
              "You are a careful medical report assistant for non-doctors.",
          },
          { role: "user", content: prompt },
        ],
        temperature: 0.3,
        response_format: { type: "json_object" },
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
          "Content-Type": "application/json",
        },
      },
    );

    let result;
    try {
      result = JSON.parse(response.data.choices[0].message.content);
    } catch (parseErr) {
      console.error("AI JSON Parse Error (Medical Report):", parseErr);
      // Fallback response if AI output is malformed
      result = {
        summary: "The AI was unable to parse the report details into a structured format, but the text was successfully extracted. Please review the original report document.",
        normalFindings: [],
        abnormalFindings: [],
        possibleConcerns: ["Unable to categorize findings automatically."],
        recommendedSpecialist: "General Physician",
        followUpSuggestions: ["Consult your doctor to review this report manually."]
      };
    }

    // ✅ Schema Validation
    if (!result.summary) result.summary = "AI analysis completed, but summary is unavailable.";
    if (!Array.isArray(result.normalFindings)) result.normalFindings = [];
    if (!Array.isArray(result.abnormalFindings)) result.abnormalFindings = [];
    if (!Array.isArray(result.possibleConcerns)) result.possibleConcerns = [];
    if (!result.recommendedSpecialist) result.recommendedSpecialist = "General Physician";
    if (!Array.isArray(result.followUpSuggestions)) result.followUpSuggestions = [];

    return res.status(200).json({
      message: result.summary.includes("unable to parse") ? "AI analysis completed with fallback" : "AI analysis successful",
      result,
    });
  } catch (err) {
    console.error(
      "🔥 AI ERROR FULL:",
      err?.response?.data || err.message || err,
    );

    return res.status(500).json({
      message: "AI analysis failed",
      error: err?.response?.data || err.message,
    });
  }
};

/**
 * OCR PRESCRIPTION EXTRACTOR (Phase 6)
 * Pipeline: Sharp (Preprocess) -> Tesseract (OCR) -> Groq (Structure to JSON)
 */
export const extractPrescription = async (req, res) => {
  if (process.env.ENABLE_OCR === "false") {
    return res.status(503).json({ message: "OCR features are currently disabled for maintenance." });
  }
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No image file provided" });
    }

    // 1. Image Preprocessing (grayscale, contrast boost, normalize)
    // This dramatically improves Tesseract accuracy for handwritten/low quality images
    const processedImageBuffer = await sharp(req.file.buffer)
      .grayscale()
      .normalize()
      .linear(1.5, -0.2) // increase contrast
      .toBuffer();

    // 2. Tesseract OCR Extraction
    const { data: { text: rawText } } = await Tesseract.recognize(
      processedImageBuffer,
      'eng',
      { 
        logger: m => {
          if (process.env.NODE_ENV === "development") {
            console.log("OCR Progress:", m.status, Math.round(m.progress * 100) + "%");
          }
        }
      }
    );

    if (!rawText || rawText.trim().length < 5) {
      return res.status(400).json({ message: "Could not extract text from the image. Please try a clearer picture." });
    }

    // 3. Groq Cleanup and Structuring
    const prompt = `
You are an expert medical transcriptionist. Extract the prescribed medicines from the following raw OCR text. The OCR text might have spelling mistakes or garbage characters.

RAW OCR TEXT:
${rawText}

RULES:
1. Ignore unrelated text (doctor names, addresses, clinic names).
2. Clean up spelling mistakes in medicine names.
3. If you find no medicines, return an empty array.
4. Output MUST be valid JSON, using exactly this structure:
{
  "confidence": 0.0 to 1.0, // Your confidence score that the data is accurate
  "medicines": [
    {
      "medicine": "Name of medicine",
      "dosage": "e.g., 500mg, 1 tablet",
      "timing": "e.g., Morning, Night, After meals",
      "duration": "e.g., 5 days",
      "instructions": "Any specific instructions"
    }
  ]
}
`;

    const response = await axios.post(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        model: "llama-3.1-70b-versatile",
        messages: [
          { role: "system", content: "You are an expert at parsing messy OCR prescription data." },
          { role: "user", content: prompt },
        ],
        temperature: 0.1,
        response_format: { type: "json_object" },
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    let result;
    try {
      result = JSON.parse(response.data.choices[0].message.content);
    } catch (parseErr) {
      console.error("AI JSON Parse Error (Prescription):", parseErr);
      result = {
        confidence: 0,
        medicines: []
      };
    }

    // ✅ Schema Validation
    if (!Array.isArray(result.medicines)) {
      result.medicines = [];
    }
    if (typeof result.confidence !== "number") {
      result.confidence = 0;
    }

    return res.status(200).json({
      message: result.medicines.length > 0 ? "Prescription extracted successfully" : "No medicines found or parsing failed",
      data: result
    });

  } catch (err) {
    console.error("🔥 OCR ERROR:", err?.response?.data || err.message || err);
    return res.status(500).json({
      message: "Failed to extract prescription data",
      error: err?.response?.data || err.message
    });
  }
};

/**
 * AI SYMPTOM CHECKER (Phase 6)
 * Pipeline: Emergency override check -> Groq (Triage) -> Save to DB
 */
export const checkSymptoms = async (req, res) => {
  if (process.env.ENABLE_AI === "false") {
    return res.status(503).json({ message: "AI Symptom Checker is currently disabled for maintenance." });
  }
  try {
    const { symptoms } = req.body;
    
    if (!symptoms || !Array.isArray(symptoms) || symptoms.length === 0) {
      return res.status(400).json({ message: "Please provide an array of symptoms." });
    }

    const symptomsString = symptoms.join(", ").toLowerCase();

    // 1. HARDCODED EMERGENCY OVERRIDE
    const emergencyKeywords = ["chest pain", "stroke", "seizure", "loss of consciousness", "breathing difficulty", "heart attack", "fainting"];
    const isEmergency = emergencyKeywords.some(keyword => symptomsString.includes(keyword));

    if (isEmergency) {
      const emergencyData = {
        urgencyLevel: "emergency",
        possibleCauses: ["Potentially life-threatening condition detected"],
        recommendedSpecialist: "Emergency Room / Hospital",
        recommendations: ["SEEK EMERGENCY MEDICAL ATTENTION IMMEDIATELY. Do not wait."]
      };

      // Save history
      await SymptomHistory.create({
        patient: req.user._id,
        symptoms,
        ...emergencyData
      });

      return res.status(200).json({
        message: "Symptom check completed",
        data: emergencyData
      });
    }

    // 2. GROQ Triage
    const prompt = `
You are a medical triage assistant. Analyze the following symptoms provided by a patient:
[${symptomsString}]

CRITICAL RULES:
1. NEVER diagnose the patient. Use phrases like "Possible causes may include...".
2. Assess the urgency level strictly as one of: "low", "moderate", "high", "emergency".
3. Recommend the best medical specialist to consult (e.g., General Physician, Cardiologist, Dermatologist).
4. Provide general recommendations (e.g., "Drink fluids", "Rest").
5. Output MUST be valid JSON, using exactly this structure:
{
  "urgencyLevel": "low | moderate | high | emergency",
  "possibleCauses": ["list of possible causes"],
  "recommendedSpecialist": "E.g., General Physician",
  "recommendations": ["list of general recommendations"]
}
`;

    const response = await axios.post(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        model: "llama-3.1-70b-versatile",
        messages: [
          { role: "system", content: "You are a safe, non-diagnosing medical triage assistant." },
          { role: "user", content: prompt },
        ],
        temperature: 0.1,
        response_format: { type: "json_object" },
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    let result;
    try {
      result = JSON.parse(response.data.choices[0].message.content);
    } catch (parseErr) {
      console.error("AI JSON Parse Error (Symptom Checker):", parseErr);
      result = {
        urgencyLevel: "moderate",
        possibleCauses: ["Unable to determine causes due to technical error"],
        recommendedSpecialist: "General Physician",
        recommendations: ["Please consult a doctor for a professional evaluation."]
      };
    }

    // ✅ Schema Validation
    if (!["low", "moderate", "high", "emergency"].includes(result.urgencyLevel)) {
      result.urgencyLevel = "moderate";
    }
    if (!Array.isArray(result.possibleCauses)) result.possibleCauses = [];
    if (!result.recommendedSpecialist) result.recommendedSpecialist = "General Physician";
    if (!Array.isArray(result.recommendations)) result.recommendations = [];

    // 3. Save to History
    await SymptomHistory.create({
      patient: req.user._id,
      symptoms,
      ...result
    });

    return res.status(200).json({
      message: "Symptom check completed",
      data: result
    });

  } catch (err) {
    console.error("🔥 SYMPTOM CHECK ERROR:", err?.response?.data || err.message || err);
    return res.status(500).json({
      message: "Failed to check symptoms",
      error: err?.response?.data || err.message
    });
  }
};

export const getSymptomHistory = async (req, res) => {
  try {
    const history = await SymptomHistory.find({ patient: req.user._id })
      .sort({ createdAt: -1 })
      .limit(20);

    return res.status(200).json({
      message: "Symptom history fetched",
      history
    });
  } catch (err) {
    return res.status(500).json({
      message: "Failed to fetch symptom history",
      error: err.message
    });
  }
};
