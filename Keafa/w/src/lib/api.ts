import axios from 'axios';

const backendUrl = import.meta.env.VITE_API_BASE_URL;

// Ensure we always target the backend API prefix (/api). Some deploy envs provide
// the domain root (https://example.com) — our server mounts routes under /api.
const rawUrl = backendUrl || 'http://localhost:5000/api';
// This logic is slightly improved to ensure /api is only appended if not already there
const API_URL = (rawUrl.replace(/\/+$/, '') + '/api').replace(/\/api\/api$/, '/api');

console.log(`API is configured to use base URL: ${API_URL}`);

const api = axios.create({
  baseURL: API_URL,
  // IMPORTANT: Since we are using Bearer Tokens (localStorage), this must be false.
  // We explicitly removed the use of httpOnly cookies.
  withCredentials: false,
});

// --- AXIOS INTERCEPTOR ---
// This code runs BEFORE every request is sent.
api.interceptors.request.use(
  (config) => {
    // 1. Get the token from local storage
    const token = localStorage.getItem('authToken');

    // 2. If the token exists, attach it to the Authorization header
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;