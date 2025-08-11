const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:5000/api';

function isFormData(value: unknown): value is FormData {
  return typeof FormData !== 'undefined' && value instanceof FormData;
}

async function request(path: string, options: RequestInit = {}) {
  const isMultipart = isFormData(options.body as any);

  const res = await fetch(`${API_BASE_URL}${path}`, {
    credentials: 'include',
    // Only set JSON header when not sending FormData so the browser can set the proper boundary
    headers: isMultipart
      ? { ...(options.headers || {}) }
      : { 'Content-Type': 'application/json', ...(options.headers || {}) },
    ...options,
  });

  if (!res.ok) {
    // Try to extract a readable error message
    let message = 'Request failed';
    try {
      const text = await res.text();
      message = text || message;
    } catch {}
    throw new Error(message);
  }

  if (res.status === 204) return null;

  const contentType = res.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    return res.json();
  }
  return res.text();
}

export const api = {
  get: (path: string) => request(path, { method: 'GET' }),
  post: (path: string, body?: any) =>
    request(path, {
      method: 'POST',
      body: isFormData(body) ? body : body ? JSON.stringify(body) : undefined,
    }),
  put: (path: string, body?: any) =>
    request(path, {
      method: 'PUT',
      body: isFormData(body) ? body : body ? JSON.stringify(body) : undefined,
    }),
  delete: (path: string) => request(path, { method: 'DELETE' }),
};