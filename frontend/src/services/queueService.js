// src/services/queueService.js
import api from '../api/axios';

export const getQueueStatus = (hospitalId, department = 'General OPD') => {
  return api.get(`/queue/${hospitalId}?department=${encodeURIComponent(department)}`);
};

export const assignToken = (appointmentId) => {
  return api.post('/queue/assign-token', { appointmentId });
};

export const advanceQueue = (department, tokenNumber) => {
  return api.post('/queue/advance', { department, tokenNumber });
};
