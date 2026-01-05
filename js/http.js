import { API_URL, API_KEY } from './config.js';

function getToken() {
  return localStorage.getItem('token');
}

export async function api(path, options = {}) {
  const headers = new Headers(options.headers || {});
  headers.set('x-api-key', API_KEY);

  const token = getToken();
  if (token) headers.set('Authorization', `Bearer ${token}`);

  if (options.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const res = await fetch(`${API_URL}${path}`, { ...options, headers });
  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    // tu backend usa wrapper {success,data,message} pero errores pueden venir en {message,statusCode}
    const msg =
      data?.message?.join?.(', ') ||
      data?.message ||
      `HTTP ${res.status}`;
    throw new Error(msg);
  }
  return data; // normalmente { success, data, message }
}
