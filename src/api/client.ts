import axios from 'axios';

// Use environment variable for API base URL, fallback to '/api' for same-origin
const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL || '/api';

export const api = axios.create({
  baseURL,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
});



// No token injection; rely on HttpOnly cookie for authentication
api.interceptors.request.use((config) => config);
