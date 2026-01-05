function login() {
  fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: document.getElementById('login-email').value,
      password: document.getElementById('login-password').value,
    }),
  })
    .then(res => res.json())
    .then(res => {
      localStorage.setItem('token', res.data.accessToken);
      window.location.href = 'dashboard.html';
    })
    .catch(() => alert('Login error'));
}

function register() {
  fetch(`${API_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: document.getElementById('reg-name').value,
      email: document.getElementById('reg-email').value,
      password: document.getElementById('reg-password').value,
    }),
  })
    .then(res => res.json())
    .then(() => alert('Registered successfully'))
    .catch(() => alert('Register error'));
}
