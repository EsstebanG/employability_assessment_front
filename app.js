console.log('app.js loaded');

// ---------------- CONFIG ----------------
const API_URL = 'http://localhost:3000';
const API_KEY = 'employability-dev-4f9c8a2b7d1e6c90';

// ---------------- UTILS ----------------
function setMessage(msg) {
  const el = document.getElementById('message');
  if (el) el.innerText = msg;
}

// ---------------- AUTH ----------------
function login() {
  fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email: document.getElementById('login-email').value,
      password: document.getElementById('login-password').value,
    }),
  })
    .then(res => res.json())
    .then(response => {
      localStorage.setItem('token', response.data.accessToken);
      window.location.href = 'dashboard.html';
    })
    .catch(() => alert('Login error'));
}


function register() {
  fetch(`${API_URL}/auth/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: document.getElementById('reg-name').value,
      email: document.getElementById('reg-email').value,
      password: document.getElementById('reg-password').value,
    }),
  })
    .then(res => res.json())
    .then(() => setMessage('Registered successfully'))
    .catch(() => setMessage('Register error'));
}

// ---------------- VACANCIES ----------------
function loadVacancies() {
  const token = localStorage.getItem('token');

  if (!token) {
    alert('No token found. Please login again.');
    return;
  }

  fetch(`${API_URL}/vacancies`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'x-api-key': API_KEY,
    },
  })
    .then(res => {
      if (!res.ok) {
        throw new Error('Unauthorized');
      }
      return res.json();
    })
    .then(result => {
      const list = document.getElementById('vacancies');
      list.innerHTML = '';

      result.data.forEach(v => {
        const li = document.createElement('li');
        li.innerHTML = `
          <strong>${v.title}</strong> - ${v.company}
          <button onclick="apply('${v.id}')">Apply</button>
        `;
        list.appendChild(li);
      });
    })
    .catch(err => {
      console.error(err);
      alert('Session expired or unauthorized');
    });
}

// ---------------- APPLY ----------------
function apply(vacancyId) {
  const token = localStorage.getItem('token');

  fetch(`${API_URL}/applications`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      'x-api-key': API_KEY,
    },
    body: JSON.stringify({ vacancyId }),
  })
    .then(res => res.json())
    .then(() => alert('Applied successfully'))
    .catch(() => alert('Application error'));
}
