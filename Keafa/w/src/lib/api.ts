 
import axios from 'axios';

const backendUrl = import.meta.env.VITE_API_BASE_URL;

// Ensure we always target the backend API prefix (/api). Some deploy envs provide
// the domain root (https://example.com) — our server mounts routes under /api.
const rawUrl = backendUrl || 'http://localhost:5000/api';
const API_URL = rawUrl.replace(/\/+$/, '') + (rawUrl.endsWith('/api') ? '' : '/api');

console.log(`API is configured to use base URL: ${API_URL}`);

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});
 
export default api;