import axios from 'axios';

const api = axios.create({
  // Proxied through Vite to target http://localhost:8080/api during development to avoid CORS
  baseURL: '/api'
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;