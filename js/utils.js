const API_URL = 'http://localhost:3000';
const API_KEY = 'employability-dev-4f9c8a2b7d1e6c90';

function getToken() {
  return localStorage.getItem('token');
}

function logout() {
  localStorage.removeItem('token');
  window.location.href = 'index.html';
}
