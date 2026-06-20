import axios from 'axios';

// Ensure baseURL always ends with /api if it's pointing to the server root
const getBaseURL = () => {
  const url = import.meta.env.VITE_API_URL || "http://localhost:8000/api";
  return url.endsWith("/api") ? url : `${url.replace(/\/$/, "")}/api`;
};

const api = axios.create({
  baseURL: getBaseURL(),
  withCredentials: true,
});

api.interceptors.request.use(
  (config) => {
    // Detect public routes (both with and without leading slash)
    const isPublicRoute = config.url.includes('/public') || config.url.startsWith('public');
    if (isPublicRoute) return config;

    const isAdminRoute = config.url.includes('/admin') || config.url.startsWith('admin');
    const token = isAdminRoute ? sessionStorage.getItem('adminToken') : sessionStorage.getItem('token');

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
