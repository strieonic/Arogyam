import fs from "fs";
import Tesseract from "tesseract.js";
import pdfParse from "pdf-parse";

/* ======================================================
   TEXT EXTRACTION (Fallback to Mock if Image-based PDF)
====================================================== */
export const extractTextFromPDF = async (filePath) => {
  try {
    const dataBuffer = fs.readFileSync(filePath);
    console.log("📄 Extracting text from PDF via pdf-parse...");
    const data = await pdfParse(dataBuffer);

    if (data.text && data.text.trim().length > 5) {
      return data.text;
    }

    throw new Error("No embedded text found, might be a scanned image.");
  } catch (error) {
    console.log("PDF extraction error (falling back to mock):", error.message);
    throw error;
  }
};

/* ======================================================
   IMAGE OCR (for doctor uploads later)
====================================================== */
export const extractTextFromImage = async (imagePath) => {
  try {
    const result = await Tesseract.recognize(imagePath, "eng", {
      logger: (m) => {
        if (process.env.NODE_ENV === "development") {
          console.log("OCR:", m.status);
        }
      },
    });

    return result.data.text || "";
  } catch (error) {
    console.log("Image OCR error:", error.message);
    return "";
  }
};
