import axios from 'axios';

export async function login(email: string, password: string) {
  try {
    // Direct login to backend origin to receive/set HttpOnly cookie if backend uses cookie auth
    const origin = process.env.NEXT_PUBLIC_BACKEND_ORIGIN || 'http://localhost:4100';
    const url = `${origin.replace(/\/$/, '')}/api/auth/login`;
    const response = await axios.post(url, { email, password }, {
      withCredentials: true,
      headers: { 'Content-Type': 'application/json' },
    });
    // No token storage on client; rely on HttpOnly cookie
    return response.data?.user ?? null;
  } catch (err: unknown) {
    // Narrow error shapes conservatively. Prefer Error instance checks.
    if (err instanceof Error) throw err;
    throw new Error('Login failed');
  }
}

export function logout() {
  // Optionally, call backend logout endpoint to clear cookie
  // No sensitive data to clear on client
}
