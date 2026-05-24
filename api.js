import axios from 'axios';

const api = axios.create({
  // Uses the environment variable if defined, otherwise falls back to the Vite proxy for local dev
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api'
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;