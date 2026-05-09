// src/services/hospitalService.js
// All hospital-related API calls

import api from '../api/axios';

// ── Profile ──────────────────────────────────────────────────

export const getHospitalProfile = () =>
  api.get('/hospital/profile');

// ── Patient Search ────────────────────────────────────────────

export const searchPatientByHealthId = (healthId) =>
  api.post('/hospital/search-patient', { healthId });

export const getHospitalPatients = () =>
  api.get('/hospital/patients');

// ── Records ───────────────────────────────────────────────────

export const uploadRecord = (formData) =>
  api.post('/record/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

export const getPatientRecords = (patientId) =>
  api.get(`/record/patient/${patientId}`);

// ── Consent ───────────────────────────────────────────────────

export const requestConsent = (data) =>
  api.post('/consent/request', data);

// ── Appointments ──────────────────────────────────────────────

export const getHospitalAppointments = () =>
  api.get('/hospital/appointments');

export const updateAppointmentStatus = (appointmentId, status) =>
  api.put(`/hospital/appointments/${appointmentId}`, { status });

// ── Doctors ───────────────────────────────────────────────────

export const getHospitalDoctors = () =>
  api.get('/hospital/doctors');

export const addDoctor = (data) =>
  api.post('/hospital/doctors', data);

export const updateDoctor = (doctorId, data) =>
  api.put(`/hospital/doctors/${doctorId}`, data);

export const removeDoctor = (doctorId) =>
  api.delete(`/hospital/doctors/${doctorId}`);

// ── Queue ─────────────────────────────────────────────────────

export const getQueue = () =>
  api.get('/hospital/queue');

export const callNextToken = () =>
  api.post('/hospital/queue/next');

export const completeToken = (tokenId) =>
  api.put(`/hospital/queue/${tokenId}/complete`);
