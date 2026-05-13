import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
});

api.interceptors.request.use(
  (config) => {
    const isPublicRoute = config.url.startsWith('/public');
    if (isPublicRoute) return config;

    const isAdminRoute = config.url.startsWith('/admin');
    const token = isAdminRoute ? sessionStorage.getItem('adminToken') : sessionStorage.getItem('token');

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
