// src/constants/config.js
// App-level config constants

export const APP_NAME = 'Arogyam';
export const APP_TAGLINE = 'Your Health, Your Control';
export const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

export const APPOINTMENT_STATUSES = {
  REQUESTED: 'requested',
  APPROVED: 'approved',
  SCHEDULED: 'scheduled',
  CHECKED_IN: 'checked_in',
  IN_QUEUE: 'in_queue',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
};

export const RECORD_CATEGORIES = {
  BLOOD_TEST: 'blood_test',
  XRAY: 'xray',
  PRESCRIPTION: 'prescription',
  SCAN: 'scan',
  GENERAL: 'general',
};

export const HOSPITAL_STATUSES = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  SUSPENDED: 'suspended',
};

export const MAX_ACTIVE_APPOINTMENTS = 5;
export const OTP_EXPIRY_SECONDS = 120;
export const OTP_RESEND_COOLDOWN_SECONDS = 30;
export const OTP_MAX_ATTEMPTS = 5;
export const OTP_BLOCK_MINUTES = 15;
