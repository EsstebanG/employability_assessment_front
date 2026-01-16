import { api } from './http.js';
import { toast, decodeJwt } from './ui.js';

function redirectByRole(role) {
  if (role === 'ADMIN') window.location.href = '/pages/admin/admin.html';
  else if (role === 'GESTOR') window.location.href = '../pages/gestor/gestor.html';
  else window.location.href = '/pages/coder/coder.html';
}

export async function login(email, password) {
  const res = await api('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });

  const token = res?.data?.accessToken;
  if (!token) throw new Error('No accessToken returned');

  localStorage.setItem('token', token);

  const payload = decodeJwt(token);
  const role = payload?.role || 'CODER';
  toast(`Login OK (${role})`, 'ok');
  redirectByRole(role);
}

export async function register(name, email, password) {
  const res = await api('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ name, email, password }),
  });

  // register también devuelve token
  const token = res?.data?.accessToken;
  if (token) localStorage.setItem('token', token);

  toast('Registro OK. Redirigiendo…', 'ok');
  const payload = token ? decodeJwt(token) : null;
  redirectByRole(payload?.role || 'CODER');
}

export function logout() {
  localStorage.removeItem('token');
  window.location.href = '../../index.html';
}
