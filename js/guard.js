import { decodeJwt, toast } from './ui.js';

export function requireAuth(allowedRoles = []) {
  const token = localStorage.getItem('token');
  if (!token) {
    window.location.href = './index.html';
    return null;
  }

  const payload = decodeJwt(token);
  const role = payload?.role;

  if (!role) {
    localStorage.removeItem('token');
    window.location.href = './index.html';
    return null;
  }

  if (allowedRoles.length && !allowedRoles.includes(role)) {
    toast('No tienes permisos para esta vista. Redirigiendo…', 'err');
    // redirección “correcta”
    if (role === 'ADMIN') window.location.href = './admin.html';
    else if (role === 'GESTOR') window.location.href = './gestor.html';
    else window.location.href = './coder.html';
    return null;
  }

  return { role, sub: payload?.sub, email: payload?.email };
}
