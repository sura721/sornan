import axios from 'axios';

// Read the backend URL from the environment variables.
const backendUrl = import.meta.env.VITE_API_BASE_URL;

if (!backendUrl) {
  console.error("FATAL ERROR: VITE_API_BASE_URL is not defined in the .env file.");
}

const api = axios.create({
  baseURL: backendUrl,
  headers: {
    'Content-Type': 'application/json',
  },
});

// --- FIX START: Add an Axios interceptor ---
// This interceptor will run automatically BEFORE every single request is sent.
api.interceptors.request.use(
  (config) => {
    // 1. Get the authentication token from local storage.
    //    (We will save the token here after a successful login).
    const token = localStorage.getItem('authToken');

    // 2. If a token exists, add it to the Authorization header.
    //    The 'Bearer <token>' format is the standard for JWTs.
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }

    // 3. Return the modified request configuration.
    return config;
  },
  (error) => {
    // Handle any errors that occur during the request setup.
    return Promise.reject(error);
  }
);
// --- FIX END ---

export default api;