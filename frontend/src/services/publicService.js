// src/services/publicService.js
// Public (unauthenticated) API calls

import api from '../api/axios';

/** Get platform-wide stats for the landing page */
export const getPublicStats = () =>
  api.get('/public/stats');
