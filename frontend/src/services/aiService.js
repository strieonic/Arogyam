// src/services/aiService.js
// AI feature API calls (Groq-powered, free tier)

import api from '../api/axios';

/**
 * Get AI-generated plain-English summary of a medical report using record ID
 * @param {string} recordId - DB ID of the Medical Record
 * @returns {Promise<any>}
 */
export const getMedicalSummary = (recordId) =>
  api.post(`/ai/analyze-report/${recordId}`);

/**
 * Extract structured data from a prescription image (OCR)
 * @param {FormData} formData - includes image file
 * @returns {{ medicines: [], doctorName: string, date: string, hospital: string }}
 */
export const extractPrescription = (formData) =>
  api.post('/ai/extract-prescription', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

/**
 * Symptom checker — informational only, no diagnosis
 * @param {string[]} symptoms - array of symptom strings
 * @returns {{ possibleCauses: [], recommendedSpecialist: string, urgencyLevel: string }}
 */
export const checkSymptoms = (symptomsData) =>
  api.post('/ai/check-symptoms', symptomsData);

export const getSymptomHistory = () =>
  api.get('/ai/symptom-history');
