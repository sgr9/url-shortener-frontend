import axios from 'axios';

const api = axios.create({
  // Keep this as the backend root. Calls include their /api prefix, matching the working project.
  baseURL: import.meta.env.VITE_BACKEND_URL || import.meta.env.VITE_API_BASE_URL || ''
});

export const getPublicShortUrl = (shortUrl) => {
  const apiBaseUrl = import.meta.env.VITE_BACKEND_URL || import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';
  const baseUrl = import.meta.env.VITE_PUBLIC_SHORT_URL_BASE || apiBaseUrl.replace(/\/api\/?$/, '');
  return `${baseUrl.replace(/\/$/, '')}/${shortUrl}`;
};

export const getApiErrorMessage = (err, fallback = 'Something went wrong') => {
  const data = err.response?.data;

  if (typeof data === 'string') return data;
  if (data?.message) return data.message;
  if (data?.error && data?.status) return `${data.error} (${data.status})`;
  if (err.code === 'ERR_NETWORK') return 'Could not reach the server. Check the backend URL and CORS settings.';

  return fallback;
};

api.interceptors.request.use((config) => {
  const storedToken = localStorage.getItem('JWT_TOKEN') || localStorage.getItem('token');
  const token = storedToken?.startsWith('"') ? JSON.parse(storedToken) : storedToken;

  config.headers.Accept = 'application/json';

  if (config.data) {
    config.headers['Content-Type'] = 'application/json';
  }

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (import.meta.env.DEV) {
      console.error('API request failed', {
        method: error.config?.method,
        url: `${error.config?.baseURL || ''}${error.config?.url || ''}`,
        status: error.response?.status,
        data: error.response?.data,
      });
    }
    return Promise.reject(error);
  }
);

export default api;
