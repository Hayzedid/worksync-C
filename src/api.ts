// Use environment variable for API base URL, fallback to '/api' for same-origin
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || '/api';

function isFormData(value: unknown): value is FormData {
  return typeof FormData !== 'undefined' && value instanceof FormData;
}

function buildUrl(path: string, params?: Record<string, any>) {
  if (!params || Object.keys(params).length === 0) return `${API_BASE_URL}${path}`;
  const usp = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v === undefined || v === null) continue;
    usp.append(k, String(v));
  }
  const qs = usp.toString();
  return qs ? `${API_BASE_URL}${path}?${qs}` : `${API_BASE_URL}${path}`;
}

async function request(path: string, options: RequestInit = {}, params?: Record<string, any>) {
  const isMultipart = isFormData(options.body as any);

  // Merge options first to avoid overwriting our headers later
  const finalOptions: RequestInit = {
    // Use backend HttpOnly cookie via CORS
    credentials: 'include',
    ...options,
  };

  // Base headers (respect multipart boundaries) + any caller-provided headers
  const baseHeaders = isMultipart
    ? { ...(finalOptions.headers || {}) }
    : { 'Content-Type': 'application/json', ...(finalOptions.headers || {}) };

  // Set headers LAST so they are not overwritten by earlier spreads
  finalOptions.headers = { ...baseHeaders } as HeadersInit;

  const url = buildUrl(path, params);
  const res = await fetch(url, finalOptions);

  if (!res.ok) {
    // Try to extract a readable error message (JSON first, then text)
    let message = 'Request failed';
    try {
      const contentType = res.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        const data = await res.json();
        message = (data && (data.message || data.error || JSON.stringify(data))) || message;
      } else {
        const text = await res.text();
        message = text || message;
      }
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
  get: (path: string, opts?: { params?: Record<string, any>; headers?: Record<string, string> }) =>
    request(
      path,
      { method: 'GET', headers: opts?.headers },
      opts?.params,
    ),
  post: (
    path: string,
    body?: any,
    opts?: { params?: Record<string, any>; headers?: Record<string, string> },
  ) =>
    request(
      path,
      {
        method: 'POST',
        headers: opts?.headers,
        body: isFormData(body) ? body : body ? JSON.stringify(body) : undefined,
      },
      opts?.params,
    ),
  put: (
    path: string,
    body?: any,
    opts?: { params?: Record<string, any>; headers?: Record<string, string> },
  ) =>
    request(
      path,
      {
        method: 'PUT',
        headers: opts?.headers,
        body: isFormData(body) ? body : body ? JSON.stringify(body) : undefined,
      },
      opts?.params,
    ),
  delete: (path: string, opts?: { params?: Record<string, any>; headers?: Record<string, string> }) =>
    request(path, { method: 'DELETE', headers: opts?.headers }, opts?.params),
};