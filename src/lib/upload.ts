export async function uploadFileToServer(path: string, file: File) {
  const fd = new FormData();
  fd.append('file', file);

  // Get token for Bearer auth (same as api.ts)
  const token = typeof window !== 'undefined' 
    ? sessionStorage.getItem('access_token') || localStorage.getItem('access_token') 
    : null;

  const headers: Record<string, string> = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // Use the same API base URL as api.ts - port 5000 for main server
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api';
  const fullUrl = `${API_BASE_URL}${path}`;

  const resp = await fetch(fullUrl, {
    method: 'POST',
    body: fd,
    headers,
  });

  if (!resp.ok) {
    const errBody = await resp.json().catch(() => ({}));
    throw new Error(errBody.message || `Upload failed with status ${resp.status}`);
  }

  return resp.json();
}
