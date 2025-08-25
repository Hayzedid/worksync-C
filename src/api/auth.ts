import axios from 'axios';
import { api } from './client';

export async function login(email: string, password: string) {
  try {
    // Direct login to backend origin to receive/set HttpOnly cookie if backend uses cookie auth
    const origin = process.env.NEXT_PUBLIC_BACKEND_ORIGIN || 'http://localhost:4100';
    const url = `${origin.replace(/\/$/, '')}/api/auth/login`;
    const { data } = await axios.post(url, { email, password }, {
      withCredentials: true,
      headers: { 'Content-Type': 'application/json' },
    });
    // No token storage on client; rely on HttpOnly cookie
    return data?.user ?? null;
  } catch (err: any) {
    let msg = 'Login failed';
    if (err?.isAxiosError && !err.response) {
      msg = 'Network error: Unable to reach the backend server. Please check if the server is running and accessible.';
    } else if (err?.response?.data?.message || err?.response?.data?.error) {
      msg = err.response.data.message || err.response.data.error;
    } else if (err?.message) {
      msg = err.message;
    }
    throw new Error(msg);
  }
}

export function logout() {
  // Optionally, call backend logout endpoint to clear cookie
  // No sensitive data to clear on client
}
