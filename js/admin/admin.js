import { requireAuth } from '../guard.js';
import { logout } from '../auth.js';
import { api } from '../http.js';
import { toast } from '../ui.js';

const me = requireAuth(['ADMIN']);
if (!me) {}

document.getElementById('btnLogout').addEventListener('click', logout);
document.getElementById('btnReload').addEventListener('click', init);
document.getElementById('btnLoadUsers').addEventListener('click', loadUsers);
document.getElementById('btnLoadApps').addEventListener('click', loadApplications);

async function init() {
  document.getElementById('meBadge').textContent = `${me.email} • ${me.role}`;
  await loadVacancies();
  await loadUsers();
  await loadApplications();
}

async function loadVacancies() {
  const res = await api('/vacancies?activeOnly=false');
  const wrap = document.getElementById('vacanciesTableWrap');

  wrap.innerHTML = `
    <table class="table">
      <thead>
        <tr><th>Title</th><th>Company</th><th>Max</th><th>Active</th><th>Actions</th></tr>
      </thead>
      <tbody>
        ${res.data.map(v => `
          <tr>
            <td>${v.title}</td>
            <td>${v.company}</td>
            <td>${v.maxApplicants}</td>
            <td>${v.isActive ? 'YES' : 'NO'}</td>
            <td class="actions">
              <button class="btn" data-edit="${v.id}">Edit max</button>
              <button class="btn ${v.isActive ? 'danger' : 'primary'}" data-toggle="${v.id}" data-active="${v.isActive}">
                ${v.isActive ? 'Deactivate' : 'Activate'}
              </button>
            </td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;

  wrap.querySelectorAll('[data-toggle]').forEach(btn => {
    btn.addEventListener('click', async () => {
      const id = btn.getAttribute('data-toggle');
      const isActive = btn.getAttribute('data-active') === 'true';
      try {
        await api(`/vacancies/${id}/active`, { method: 'PATCH', body: JSON.stringify({ isActive: !isActive }) });
        toast('Estado actualizado ✅', 'ok');
        await loadVacancies();
      } catch (e) {
        toast(e.message, 'err');
      }
    });
  });

  wrap.querySelectorAll('[data-edit]').forEach(btn => {
    btn.addEventListener('click', async () => {
      const id = btn.getAttribute('data-edit');
      const max = prompt('Nuevo maxApplicants (número):');
      if (!max) return;
      try {
        await api(`/vacancies/${id}`, { method: 'PATCH', body: JSON.stringify({ maxApplicants: Number(max) }) });
        toast('Vacante actualizada ✅', 'ok');
        await loadVacancies();
      } catch (e) {
        toast(e.message, 'err');
      }
    });
  });
}

async function loadUsers() {
  try {
    const res = await api('/users');
    const wrap = document.getElementById('usersTableWrap');

    wrap.innerHTML = `
      <table class="table">
        <thead>
          <tr><th>Name</th><th>Email</th><th>Role</th><th>Change Role</th></tr>
        </thead>
        <tbody>
          ${res.data.map(u => `
            <tr>
              <td>${u.name}</td>
              <td>${u.email}</td>
              <td>${u.role}</td>
              <td class="actions">
                <button class="btn" data-role="${u.id}" data-new="CODER">CODER</button>
                <button class="btn" data-role="${u.id}" data-new="GESTOR">GESTOR</button>
                <button class="btn" data-role="${u.id}" data-new="ADMIN">ADMIN</button>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;

    wrap.querySelectorAll('[data-role]').forEach(btn => {
      btn.addEventListener('click', async () => {
        const id = btn.getAttribute('data-role');
        const role = btn.getAttribute('data-new');
        try {
          await api(`/users/${id}/role`, { method: 'PATCH', body: JSON.stringify({ role }) });
          toast('Rol actualizado ✅', 'ok');
          await loadUsers();
        } catch (e) {
          toast(e.message, 'err');
        }
      });
    });
  } catch (e) {
    toast(e.message, 'err');
  }
}

async function loadApplications() {
  try {
    const vacancyId = document.getElementById('a_vacancyId').value.trim();
    const res = await api(`/applications${vacancyId ? `?vacancyId=${encodeURIComponent(vacancyId)}` : ''}`);
    const wrap = document.getElementById('appsTableWrap');

    wrap.innerHTML = `
      <table class="table">
        <thead>
          <tr><th>Applied At</th><th>User</th><th>Email</th><th>Vacancy</th><th>Company</th></tr>
        </thead>
        <tbody>
          ${res.data.map(a => `
            <tr>
              <td>${new Date(a.appliedAt).toLocaleString()}</td>
              <td>${a.user?.name ?? '-'}</td>
              <td>${a.user?.email ?? '-'}</td>
              <td>${a.vacancy?.title ?? '-'}</td>
              <td>${a.vacancy?.company ?? '-'}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
  } catch (e) {
    toast(e.message, 'err');
  }
}

init();
