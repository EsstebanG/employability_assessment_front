import { requireAuth } from '../guard.js';
import { logout } from '../auth.js';
import { api } from '../http.js';
import { toast } from '../ui.js';

const me = requireAuth(['GESTOR', 'ADMIN']);
if (!me) {}

document.getElementById('btnLogout').addEventListener('click', logout);
document.getElementById('btnReload').addEventListener('click', init);
document.getElementById('btnCreate').addEventListener('click', createVacancy);
document.getElementById('btnLoadApps').addEventListener('click', loadApplications);

async function init() {
  try {
    document.getElementById('meBadge').textContent = `${me.email} • ${me.role}`;
    await loadVacanciesTable();
    await loadApplications();
  } catch (e) {
    toast(e.message, 'err');
  }
}

function getCreatePayload() {
  return {
    title: document.getElementById('v_title').value.trim(),
    description: document.getElementById('v_desc').value.trim(),
    technologies: document.getElementById('v_tech').value.trim(),
    seniority: document.getElementById('v_seniority').value.trim(),
    softSkills: document.getElementById('v_soft').value.trim(),
    location: document.getElementById('v_location').value,
    modality: document.getElementById('v_modality').value,
    salaryRange: document.getElementById('v_salary').value.trim(),
    company: document.getElementById('v_company').value.trim(),
    maxApplicants: Number(document.getElementById('v_max').value),
  };
}

async function createVacancy() {
  try {
    await api('/vacancies', { method: 'POST', body: JSON.stringify(getCreatePayload()) });
    toast('Vacante creada ✅', 'ok');
    await loadVacanciesTable();
  } catch (e) {
    toast(e.message, 'err');
  }
}

async function loadVacanciesTable() {
  const res = await api('/vacancies?activeOnly=false');
  const wrap = document.getElementById('vacanciesTableWrap');

  wrap.innerHTML = `
    <table class="table">
      <thead>
        <tr>
          <th>Title</th><th>Company</th><th>Location</th><th>Modality</th>
          <th>Max</th><th>Active</th><th>Actions</th>
        </tr>
      </thead>
      <tbody>
        ${res.data.map(v => `
          <tr>
            <td>${v.title}</td>
            <td>${v.company}</td>
            <td>${v.location}</td>
            <td>${v.modality}</td>
            <td>${v.maxApplicants}</td>
            <td>${v.isActive ? 'YES' : 'NO'}</td>
            <td>
              <div class="actions">
                <button class="btn" data-edit="${v.id}">Edit</button>
                <button class="btn ${v.isActive ? 'danger' : 'primary'}" data-toggle="${v.id}" data-active="${v.isActive}">
                  ${v.isActive ? 'Deactivate' : 'Activate'}
                </button>
              </div>
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
        await api(`/vacancies/${id}/active`, {
          method: 'PATCH',
          body: JSON.stringify({ isActive: !isActive }),
        });
        toast('Estado actualizado ✅', 'ok');
        await loadVacanciesTable();
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
        await api(`/vacancies/${id}`, {
          method: 'PATCH',
          body: JSON.stringify({ maxApplicants: Number(max) }),
        });
        toast('Vacante actualizada ✅', 'ok');
        await loadVacanciesTable();
      } catch (e) {
        toast(e.message, 'err');
      }
    });
  });
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
