// src/services/reminderService.js
import api from '../api/axios';

export const getReminders   = ()          => api.get('/reminders');
export const addReminder    = (data)      => api.post('/reminders', data);
export const updateReminder = (id, data)  => api.put(`/reminders/${id}`, data);
export const deleteReminder = (id)        => api.delete(`/reminders/${id}`);
