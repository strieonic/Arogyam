// src/services/reportService.js
// All medical report related API calls

import api from '../api/axios';

/**
 * Upload a medical report
 * @param {FormData} formData - includes file, patientId, category, notes
 */
export const uploadReport = (formData) =>
  api.post('/record/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

/**
 * Get all reports for the logged-in patient
 */
export const getMyReports = () =>
  api.get('/patient/records');

/**
 * Get reports for a specific patient (hospital view)
 * @param {string} patientId
 */
export const getPatientReports = (patientId) =>
  api.get(`/record/patient/${patientId}`);

/**
 * Get a single report by ID
 * @param {string} reportId
 */
export const getReportById = (reportId) =>
  api.get(`/record/${reportId}`);

/**
 * Delete a report by ID
 * @param {string} reportId
 */
export const deleteReport = (reportId) =>
  api.delete(`/record/${reportId}`);
