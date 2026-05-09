// src/services/adminService.js
// All admin-related API calls

import api from '../api/axios';

// ── Stats ─────────────────────────────────────────────────────

export const getAdminStats = () =>
  api.get('/admin/stats');

// ── Hospitals ─────────────────────────────────────────────────

export const getAllHospitals = () =>
  api.get('/admin/hospitals');

export const getHospitalById = (id) =>
  api.get(`/admin/hospitals/${id}`);

export const approveHospital = (id) => api.put(`/admin/hospitals/${id}/approve`);
export const rejectHospital = (id, reason) => api.put(`/admin/hospitals/${id}/reject`, { reason });
export const suspendHospital = (id, reason) => api.put(`/admin/hospitals/${id}/suspend`, { reason });
export const deleteHospital = (id) => api.delete(`/admin/hospitals/${id}`);

// ── Patients ──────────────────────────────────────────────────

export const getAllPatients = () =>
  api.get('/admin/patients');

export const deletePatient = (id) =>
  api.delete(`/admin/patients/${id}`);

// ── Records & Consents ────────────────────────────────────────

export const getAllRecords = () =>
  api.get('/admin/records');

export const getAllConsents = () =>
  api.get('/admin/consents');

// ── Audit Logs ────────────────────────────────────────────────

export const getAuditLogs = (params) =>
  api.get('/admin/audit-logs', { params });
