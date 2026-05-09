// src/services/authService.js
// All authentication API calls — patient, hospital, doctor, admin

import api from '../api/axios';

// ── Patient Auth ─────────────────────────────────────────────
export const sendOTP = (identifier) =>
  api.post('/auth/patient/send-otp', { identifier });

export const verifyOTP = (identifier, otp) =>
  api.post('/auth/patient/verify-otp', { identifier, otp });

export const registerPatient = (data) =>
  api.post('/auth/patient/register', data);


// ── Hospital Auth ─────────────────────────────────────────────

export const registerHospital = (formData) =>
  api.post('/auth/hospital/register', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

export const loginHospital = (email, password) =>
  api.post('/auth/hospital/login', { email, password });

// ── Doctor Auth ───────────────────────────────────────────────

export const loginDoctor = (email, password) =>
  api.post('/auth/doctor/login', { email, password });

// ── Admin Auth ─────────────────────────────────────────────────

export const loginAdmin = (email, password) =>
  api.post('/admin/login', { email, password });
