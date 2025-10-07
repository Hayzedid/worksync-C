// Use correct backend URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api';

function isFormData(value: unknown): value is FormData {
  return typeof FormData !== 'undefined' && value instanceof FormData;
}

function sanitizeForJson(value: unknown): unknown {
  if (value === undefined) return null;
  if (value === null) return null;
  if (Array.isArray(value)) return value.map(v => sanitizeForJson(v));
  if (typeof value === 'object' && value !== null) {
    const o: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      o[k] = sanitizeForJson(v);
    }
    return o;
  }
  return value;
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
  const token = typeof window !== 'undefined' 
    ? sessionStorage.getItem('access_token') || localStorage.getItem('access_token') 
    : null;

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
  
  // Retry loop for network errors and 5xx responses (exponential backoff)
  const maxAttempts = 3;
  let lastError: unknown = null;
  let res: Response | null = null;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      res = await fetch(url, finalOptions);
      // If server returned 5xx, treat as retryable
      if (res.status >= 500 && res.status < 600) {
        lastError = new Error(`Server error ${res.status}`);
        // If not last attempt, wait and retry
        if (attempt < maxAttempts) {
          const backoff = 200 * Math.pow(2, attempt - 1);
          // slight jitter
          const jitter = Math.floor(Math.random() * 100);
          await new Promise(r => setTimeout(r, backoff + jitter));
          continue;
        }
      }
      // Successful fetch or non-retryable status reached
      lastError = null;
      break;
    } catch (error) {
      lastError = error;
      // network-level errors are retryable
      if (attempt < maxAttempts) {
        const backoff = 200 * Math.pow(2, attempt - 1);
        const jitter = Math.floor(Math.random() * 100);
        await new Promise(r => setTimeout(r, backoff + jitter));
        continue;
      }
      // final attempt failed
      res = null;
    }
  }

  if (!res) {
    // Handle network errors (backend not available)
    const isDevelopment = process.env.NODE_ENV === 'development';
    if (isDevelopment) {
      console.warn(`🔧 Backend not available at ${API_BASE_URL}. Using development mode.`);
      throw new Error(`Backend server not running at ${API_BASE_URL}. Please start the backend server on port 4100.`);
    } else {
      throw new Error('Unable to connect to the server. Please check your internet connection and try again.');
    }
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
        body: isFormData(body as unknown)
          ? (body as FormData)
          : body
          ? JSON.stringify(sanitizeForJson(body as unknown))
          : undefined,
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
        body: isFormData(body as unknown)
          ? (body as FormData)
          : body
          ? JSON.stringify(sanitizeForJson(body as unknown))
          : undefined,
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
        body: isFormData(body as unknown)
          ? (body as FormData)
          : body
          ? JSON.stringify(sanitizeForJson(body as unknown))
          : undefined,
      },
      opts?.params,
    ),
  delete: (path: string, opts?: { params?: Record<string, unknown>; headers?: Record<string, string> }) =>
    request(path, { method: 'DELETE', headers: opts?.headers }, opts?.params),
};

/**
 * Convenience wrapper for creating projects through the API.
 * Some parts of the codebase expect a `createProjectService` helper to exist.
 */
export async function createProjectService(
  body?: unknown,
  opts?: { params?: Record<string, unknown>; headers?: Record<string, string> }
) {
  return api.post('/projects', body, opts);
}