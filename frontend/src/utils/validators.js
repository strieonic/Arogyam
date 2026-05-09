// src/utils/validators.js
// Client-side validation helpers (mirrors server Zod schemas)

export const isValidEmail = (email) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

export const isValidPhone = (phone) =>
  /^[6-9]\d{9}$/.test(phone.replace(/\s/g, ''));

export const isStrongPassword = (password) =>
  password.length >= 8 &&
  /[A-Z]/.test(password) &&
  /[0-9]/.test(password);

export const isValidHospitalRegNumber = (regNo) =>
  /^[A-Z]{2,5}[-/]?\d{4,8}$/.test(regNo.toUpperCase());

export const ALLOWED_REPORT_TYPES = ['application/pdf', 'image/jpeg', 'image/png'];
export const MAX_REPORT_SIZE_MB = 5;

export const isValidReportFile = (file) => {
  if (!file) return { valid: false, error: 'No file selected' };
  if (!ALLOWED_REPORT_TYPES.includes(file.type)) {
    return { valid: false, error: 'Only PDF, JPEG, or PNG files are allowed' };
  }
  if (file.size > MAX_REPORT_SIZE_MB * 1024 * 1024) {
    return { valid: false, error: `File must be under ${MAX_REPORT_SIZE_MB}MB` };
  }
  return { valid: true };
};

export const getPasswordStrength = (password) => {
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  if (score <= 2) return { label: 'Weak', color: '#ef4444' };
  if (score <= 3) return { label: 'Fair', color: '#f59e0b' };
  return { label: 'Strong', color: '#22c55e' };
};
