const KEY = 'attendance_auth';

// Use VITE_API_URL in production (e.g., https://your-backend.onrender.com), fallback to relative URL for local dev
const API_BASE_URL = (import.meta.env.VITE_API_URL || '').replace(/\/+$/, '');

export const getAuth = () => {
  try { return JSON.parse(localStorage.getItem(KEY)); } catch { return null; }
};
export const setAuth = (a) => localStorage.setItem(KEY, JSON.stringify(a));
export const clearAuth = () => localStorage.removeItem(KEY);

async function request(method, path, body) {
  const auth = getAuth();
  const res = await fetch(`${API_BASE_URL}/api${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(auth ? { Authorization: `Bearer ${auth.token}` } : {}),
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (res.status === 401 && auth) {
    clearAuth();
    window.location.href = '/login';
    throw new Error('Your session has expired. Please sign in again.');
  }
  if (res.status === 204) return null;

  const data = await res.json().catch(() => null);
  if (!res.ok) throw new Error(data?.message || `Request failed (${res.status})`);
  return data;
}

export const api = {
  get: (p) => request('GET', p),
  post: (p, b) => request('POST', p, b),
  put: (p, b) => request('PUT', p, b),
  del: (p) => request('DELETE', p),
};
