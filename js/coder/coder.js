import { requireAuth } from '../guard.js';
import { logout } from '../auth.js';
import { api } from '../http.js';
import { toast } from '../ui.js';

const me = requireAuth(['CODER', 'ADMIN', 'GESTOR']);
if (!me) {}

document.getElementById('btnLogout').addEventListener('click', logout);
document.getElementById('btnReload').addEventListener('click', init);

async function init() {
  try {
    document.getElementById('meBadge').textContent = `${me.email} • ${me.role}`;
    await loadMe();
    await loadVacancies();
  } catch (e) {
    toast(e.message, 'err');
  }
}

async function loadMe() {
  const res = await api('/users/me');
  const u = res.data;
  const tbody = document.getElementById('meTable');
  tbody.innerHTML = `
    <tr><th>ID</th><td>${u.id}</td></tr>
    <tr><th>Name</th><td>${u.name}</td></tr>
    <tr><th>Email</th><td>${u.email}</td></tr>
    <tr><th>Role</th><td>${u.role}</td></tr>
  `;
}

async function loadVacancies() {
  const res = await api('/vacancies?activeOnly=true');
  const list = document.getElementById('vacanciesList');
  list.innerHTML = '';

  res.data.forEach(v => {
    const card = document.createElement('div');
    card.className = 'card';
    card.style.marginBottom = '12px';
    card.innerHTML = `
      <div style="display:flex;justify-content:space-between;gap:10px;align-items:start">
        <div>
          <h2 style="margin:0 0 6px 0">${v.title}</h2>
          <div class="muted">${v.company} • ${v.salaryRange}</div>
          <div style="margin-top:10px" class="actions">
            <span class="badge">${v.location}</span>
            <span class="badge">${v.modality}</span>
            <span class="badge">max: ${v.maxApplicants}</span>
            <span class="badge">${v.isActive ? 'ACTIVE' : 'INACTIVE'}</span>
          </div>
        </div>
        <button class="btn primary" ${!v.isActive ? 'disabled' : ''} data-id="${v.id}">Apply</button>
      </div>
      <div class="muted" style="margin-top:10px">${v.technologies}</div>
      <div style="margin-top:10px">${v.description}</div>
    `;

    const btn = card.querySelector('button');
    btn.addEventListener('click', async () => {
      try {
        await api('/applications', {
          method: 'POST',
          body: JSON.stringify({ vacancyId: v.id }),
        });
        toast('Postulación creada ✅', 'ok');
      } catch (e) {
        toast(e.message, 'err');
      }
    });

    list.appendChild(card);
  });
}

init();
