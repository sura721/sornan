 
import axios from 'axios';

 const backendUrl = import.meta.env.VITE_API_BASE_URL;

 const API_URL = backendUrl || 'http://localhost:5000/api';

console.log(`API is configured to use base URL: ${API_URL}`);

 const api = axios.create({
  baseURL: API_URL,
  
 
  withCredentials: true,
});
 
export default api;