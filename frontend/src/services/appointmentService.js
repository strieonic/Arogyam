// src/services/appointmentService.js
import api from '../api/axios';

/* ── Patient ── */
export const getApprovedHospitals  = ()          => api.get('/appointments/hospitals');
export const bookAppointment       = (data)      => api.post('/appointments/book', data);
export const getMyAppointments     = (status)    => api.get('/appointments/mine', { params: { status } });
export const cancelAppointment     = (id)        => api.patch(`/appointments/${id}/cancel`);

/* ── Hospital ── */
export const getHospitalAppointments   = (params) => api.get('/appointments/hospital', { params });
export const updateAppointmentStatus   = (id, data) => api.patch(`/appointments/${id}/status`, data);
