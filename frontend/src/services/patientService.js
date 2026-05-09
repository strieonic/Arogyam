// src/services/patientService.js
// All patient-related API calls
import api from '../api/axios';

// ── Profile ──────────────────────────────────────────────────
export const getPatientProfile     = ()       => api.get('/patient/profile');
export const updatePatientProfile  = (data)   => api.put('/patient/profile/update-medical', data);
export const getProfileCompletion  = ()       => api.get('/patient/profile/completion');

// ── Timeline ─────────────────────────────────────────────────
export const getTimeline           = ()       => api.get('/patient/timeline');

// ── Medical Records ───────────────────────────────────────────
export const getPatientRecords     = ()       => api.get('/patient/records');

// ── Consents ──────────────────────────────────────────────────
export const getPatientConsents    = ()       => api.get('/patient/consents');
export const respondToConsent      = (id, a)  => api.put(`/patient/consents/${id}`, { action: a });

// ── Health Card ───────────────────────────────────────────────
export const getHealthCard         = ()       => api.get('/patient/healthcard');

// ── Hospitals (accessed by patient) ──────────────────────────
export const getPatientHospitals   = ()       => api.get('/patient/hospitals');

// ── Family Members ────────────────────────────────────────────
export const getFamilyMembers      = ()       => api.get('/patient/family');
export const addFamilyMember       = (data)   => api.post('/patient/family/add', data);
export const removeFamilyMember    = (id)     => api.delete(`/patient/family/${id}`);

