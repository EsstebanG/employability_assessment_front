function loadVacancies() {
  fetch(`${API_URL}/vacancies`, {
    headers: {
      Authorization: `Bearer ${getToken()}`,
      'x-api-key': API_KEY,
    },
  })
    .then(res => res.json())
    .then(res => {
      const container = document.getElementById('vacancies');
      container.innerHTML = '';

      res.data.forEach(v => {
        const div = document.createElement('div');
        div.className = 'card';
        div.innerHTML = `
          <h3>${v.title}</h3>
          <p>${v.description}</p>
          <span class="badge">${v.modality}</span>
          <span class="badge">${v.location}</span>
          <p><strong>${v.company}</strong></p>
          <button onclick="apply('${v.id}')">Apply</button>
        `;
        container.appendChild(div);
      });
    });
}

function apply(vacancyId) {
  fetch(`${API_URL}/applications`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getToken()}`,
      'x-api-key': API_KEY,
    },
    body: JSON.stringify({ vacancyId }),
  })
    .then(res => res.json())
    .then(() => alert('Applied successfully'))
    .catch(() => alert('Error applying'));
}
