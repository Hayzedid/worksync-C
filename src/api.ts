// Use correct backend URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4100/api';

function isFormData(value: unknown): value is FormData {
  return typeof FormData !== 'undefined' && value instanceof FormData;
}

function buildUrl(path: string, params?: Record<string, unknown>) {
  if (!params || Object.keys(params).length === 0) return `${API_BASE_URL}${path}`;
  const usp = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v === undefined || v === null) continue;
    usp.append(k, String(v));
  }
  const qs = usp.toString();
  return qs ? `${API_BASE_URL}${path}?${qs}` : `${API_BASE_URL}${path}`;
}

async function request(path: string, options: RequestInit = {}, params?: Record<string, unknown>) {
  // Guard runtime boundary where body may be FormData or a serializable object
  const isMultipart = isFormData(options.body as unknown);

  // Get token for Bearer auth
  const token = typeof window !== 'undefined' ? sessionStorage.getItem('access_token') : null;

  // Merge options first to avoid overwriting our headers later
  const finalOptions: RequestInit = {
    // Remove credentials since we're using Bearer tokens
    ...options,
  };

  // Base headers with Bearer token + any caller-provided headers
  const baseHeaders = isMultipart
  ? { 
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      ...(finalOptions.headers || {}) 
    }
  : { 
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      ...(finalOptions.headers || {}) 
    };

  // Set headers LAST so they are not overwritten by earlier spreads
  finalOptions.headers = { ...baseHeaders } as HeadersInit;

  const url = buildUrl(path, params);
  
  let res: Response;
  try {
    res = await fetch(url, finalOptions);
  } catch (error) {
    // Handle network errors (backend not available)
    if (error instanceof TypeError && error.message.includes('fetch')) {
      const isDevelopment = process.env.NODE_ENV === 'development';
      if (isDevelopment) {
        console.warn(`🔧 Backend not available at ${API_BASE_URL}. Using development mode.`);
        // In development, provide helpful error messages instead of silent failures
        throw new Error(`Backend server not running at ${API_BASE_URL}. Please start the backend server on port 4100.`);
      } else {
        throw new Error('Unable to connect to the server. Please check your internet connection and try again.');
      }
    }
    throw error;
  }

  // Handle 401 errors by redirecting to login
  if (res.status === 401 && typeof window !== 'undefined') {
    sessionStorage.removeItem('access_token');
    window.location.href = '/login';
    throw new Error('Authentication required');
  }

  if (!res.ok) {
    // Try to extract a readable error message (JSON first, then text)
    let message = 'Request failed';
    try {
      const contentType = res.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        // Try to parse JSON; content shape is unknown
        const data = await res.json();
        const dataObj = data as Record<string, unknown>;
        const candidate = dataObj['message'] ?? dataObj['error'];
        message = candidate ? String(candidate) : JSON.stringify(dataObj);
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
    // Caller expects parsed JSON
    return res.json();
  }
  return res.text();
}

export const api = {
  get: (path: string, opts?: { params?: Record<string, unknown>; headers?: Record<string, string> }) =>
    request(
      path,
      { method: 'GET', headers: opts?.headers },
      opts?.params,
    ),
  post: (
    path: string,
    body?: unknown,
    opts?: { params?: Record<string, unknown>; headers?: Record<string, string> },
  ) =>
    request(
      path,
      {
        method: 'POST',
        headers: opts?.headers,
        body: isFormData(body as unknown) ? (body as FormData) : body ? JSON.stringify(body as unknown) : undefined,
      },
      opts?.params,
    ),
  put: (
    path: string,
    body?: unknown,
    opts?: { params?: Record<string, unknown>; headers?: Record<string, string> },
  ) =>
    request(
      path,
      {
        method: 'PUT',
        headers: opts?.headers,
        body: isFormData(body as unknown) ? (body as FormData) : body ? JSON.stringify(body as unknown) : undefined,
      },
      opts?.params,
    ),
  patch: (
    path: string,
    body?: unknown,
    opts?: { params?: Record<string, unknown>; headers?: Record<string, string> },
  ) =>
    request(
      path,
      {
        method: 'PATCH',
        headers: opts?.headers,
        body: isFormData(body as unknown) ? (body as FormData) : body ? JSON.stringify(body as unknown) : undefined,
      },
      opts?.params,
    ),
  delete: (path: string, opts?: { params?: Record<string, unknown>; headers?: Record<string, string> }) =>
    request(path, { method: 'DELETE', headers: opts?.headers }, opts?.params),
};