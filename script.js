// ===== Chaves do localStorage =====
const LS = { usuarios: 'ml_usuarios', logado: 'ml_logado', idosos: 'ml_idosos', medicamentos: 'ml_medicamentos', registros: 'ml_registros' };

function getData(chave) {
  const raw = localStorage.getItem(chave);
  return raw ? JSON.parse(raw) : null;
}
function setData(chave, valor) {
  localStorage.setItem(chave, JSON.stringify(valor));
}

// ===== Dados de exemplo (seed) =====
function seed() {
  if (!getData(LS.usuarios)) {
    setData(LS.usuarios, [
      { id: 1, nome: 'Administrador', email: 'admin@medlembrete.com', senha: '123456', perfil: 'admin' }
    ]);
  }
  if (!getData(LS.idosos)) {
    setData(LS.idosos, [
      { id: 1, nome: 'Dona Ana', dataNascimento: '1945-03-12', condicoes: 'Hipertensão', quarto: '101' },
      { id: 2, nome: 'Seu João', dataNascimento: '1940-07-25', condicoes: 'Diabetes tipo 2', quarto: '102' },
      { id: 3, nome: 'Dona Maria', dataNascimento: '1950-11-02', condicoes: 'Dor crônica', quarto: '103' }
    ]);
  }
  if (!getData(LS.medicamentos)) {
    setData(LS.medicamentos, [
      { id: 1, idosoId: 1, nome: 'Losartana', dosagem: '50mg', horarios: ['08:00', '20:00'], observacoes: 'Tomar após o café' },
      { id: 2, idosoId: 2, nome: 'Metformina', dosagem: '850mg', horarios: ['08:00', '12:00'], observacoes: 'Durante as refeições' },
      { id: 3, idosoId: 3, nome: 'Paracetamol', dosagem: '500mg', horarios: ['14:00'], observacoes: 'Em caso de dor' }
    ]);
  }
  if (!getData(LS.registros)) setData(LS.registros, []);
}

// ===== Utilitários de data/hora =====
function hoje() {
  const d = new Date();
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
}
function agoraHHMM() {
  const d = new Date();
  return String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0');
}
function formatarData(dataISO) {
  if (!dataISO) return '-';
  const [a, m, d] = dataISO.split('-');
  return d + '/' + m + '/' + a;
}

// ===== Login / logout / proteção =====
function verificaLogin() {
  if (!getData(LS.logado)) window.location.href = 'index.html';
}
function logout() {
  localStorage.removeItem(LS.logado);
  window.location.href = 'index.html';
}
function carregarUsuario() {
  const u = getData(LS.logado);
  const el = document.getElementById('nomeUsuario');
  if (el && u) el.textContent = '👤 ' + u.nome;
}

// ===== CRUD de idosos =====
function salvarIdoso(e) {
  e.preventDefault();
  const id = document.getElementById('idosoId').value;
  const dados = {
    nome: document.getElementById('idosoNome').value,
    dataNascimento: document.getElementById('idosoNascimento').value,
    condicoes: document.getElementById('idosoCondicoes').value,
    quarto: document.getElementById('idosoQuarto').value
  };
  let idosos = getData(LS.idosos) || [];
  if (id) {
    idosos = idosos.map(i => i.id == id ? { ...i, ...dados } : i);
  } else {
    const novoId = idosos.length ? Math.max(...idosos.map(i => i.id)) + 1 : 1;
    idosos.push({ id: novoId, ...dados });
  }
  setData(LS.idosos, idosos);
  e.target.reset();
  cancelarEdicaoIdoso();
  renderizarIdosos();
  preencherSelects();
}

function editarIdoso(id) {
  const i = (getData(LS.idosos) || []).find(x => x.id == id);
  if (!i) return;
  document.getElementById('idosoId').value = i.id;
  document.getElementById('idosoNome').value = i.nome;
  document.getElementById('idosoNascimento').value = i.dataNascimento;
  document.getElementById('idosoCondicoes').value = i.condicoes || '';
  document.getElementById('idosoQuarto').value = i.quarto || '';
  document.getElementById('formTitulo').textContent = 'Editar idoso';
  document.getElementById('btnCancelar').style.display = 'inline-block';
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function cancelarEdicaoIdoso() {
  document.getElementById('idosoId').value = '';
  document.getElementById('formTitulo').textContent = 'Cadastrar idoso';
  document.getElementById('btnCancelar').style.display = 'none';
}

function excluirIdoso(id) {
  if (!confirm('Excluir este idoso e seus medicamentos?')) return;
  setData(LS.idosos, (getData(LS.idosos) || []).filter(i => i.id != id));
  setData(LS.medicamentos, (getData(LS.medicamentos) || []).filter(m => m.idosoId != id));
  renderizarIdosos();
  preencherSelects();
}

function renderizarIdosos() {
  const box = document.getElementById('listaIdosos');
  if (!box) return;
  const idosos = getData(LS.idosos) || [];
  if (!idosos.length) { box.innerHTML = '<p class="status-pendente">Nenhum idoso cadastrado.</p>'; return; }
  box.innerHTML = '<table class="tabela"><thead><tr><th>Nome</th><th>Nascimento</th><th>Condições</th><th>Quarto</th><th>Ações</th></tr></thead><tbody>' +
    idosos.map(i =>
      `<tr>
        <td><strong>${i.nome}</strong></td>
        <td>${formatarData(i.dataNascimento)}</td>
        <td>${i.condicoes || '-'}</td>
        <td>${i.quarto || '-'}</td>
        <td>
          <button class="btn btn-cinza btn-pequeno" onclick="editarIdoso(${i.id})">Editar</button>
          <button class="btn btn-cinza btn-pequeno" style="background:#fee2e2;color:#b91c1c;" onclick="excluirIdoso(${i.id})">Excluir</button>
        </td>
      </tr>`).join('') +
    '</tbody></table>';
}

// ===== CRUD de medicamentos =====
function preencherSelects() {
  const idosos = getData(LS.idosos) || [];
  ['medIdoso', 'relIdoso'].forEach(idSel => {
    const sel = document.getElementById(idSel);
    if (!sel) return;
    sel.innerHTML = idosos.map(i => `<option value="${i.id}">${i.nome}</option>`).join('');
  });
}

function salvarMedicamento(e) {
  e.preventDefault();
  const id = document.getElementById('medId').value;
  const horarios = document.getElementById('medHorarios').value
    .split(',')
    .map(h => h.trim())
    .filter(h => h);
  const dados = {
    idosoId: Number(document.getElementById('medIdoso').value),
    nome: document.getElementById('medNome').value,
    dosagem: document.getElementById('medDosagem').value,
    horarios: horarios,
    observacoes: document.getElementById('medObs').value
  };
  let meds = getData(LS.medicamentos) || [];
  if (id) {
    meds = meds.map(m => m.id == id ? { ...m, ...dados } : m);
  } else {
    const novoId = meds.length ? Math.max(...meds.map(m => m.id)) + 1 : 1;
    meds.push({ id: novoId, ...dados });
  }
  setData(LS.medicamentos, meds);
  e.target.reset();
  cancelarEdicaoMed();
  renderizarMedicamentos();
}

function editarMedicamento(id) {
  const m = (getData(LS.medicamentos) || []).find(x => x.id == id);
  if (!m) return;
  document.getElementById('medId').value = m.id;
  document.getElementById('medIdoso').value = m.idosoId;
  document.getElementById('medNome').value = m.nome;
  document.getElementById('medDosagem').value = m.dosagem;
  document.getElementById('medHorarios').value = m.horarios.join(', ');
  document.getElementById('medObs').value = m.observacoes || '';
  document.getElementById('formTituloMed').textContent = 'Editar medicamento';
  document.getElementById('btnCancelarMed').style.display = 'inline-block';
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function cancelarEdicaoMed() {
  document.getElementById('medId').value = '';
  document.getElementById('formTituloMed').textContent = 'Cadastrar medicamento';
  document.getElementById('btnCancelarMed').style.display = 'none';
}

function excluirMedicamento(id) {
  if (!confirm('Excluir este medicamento?')) return;
  setData(LS.medicamentos, (getData(LS.medicamentos) || []).filter(m => m.id != id));
  renderizarMedicamentos();
}

function renderizarMedicamentos() {
  const box = document.getElementById('listaMedicamentos');
  if (!box) return;
  const meds = getData(LS.medicamentos) || [];
  const idosos = getData(LS.idosos) || [];
  if (!meds.length) { box.innerHTML = '<p class="status-pendente">Nenhum medicamento cadastrado.</p>'; return; }
  box.innerHTML = '<table class="tabela"><thead><tr><th>Idoso</th><th>Medicamento</th><th>Dosagem</th><th>Horários</th><th>Ações</th></tr></thead><tbody>' +
    meds.map(m => {
      const idoso = idosos.find(i => i.id == m.idosoId);
      return `<tr>
        <td>${idoso ? idoso.nome : '-'}</td>
        <td><strong>${m.nome}</strong></td>
        <td>${m.dosagem}</td>
        <td>${m.horarios.join(' · ')}</td>
        <td>
          <button class="btn btn-cinza btn-pequeno" onclick="editarMedicamento(${m.id})">Editar</button>
          <button class="btn btn-cinza btn-pequeno" style="background:#fee2e2;color:#b91c1c;" onclick="excluirMedicamento(${m.id})">Excluir</button>
        </td>
      </tr>`;
    }).join('') +
    '</tbody></table>';
}

// ===== Agenda do dia / registro de doses =====
function gerarAgendaDoDia() {
  const meds = getData(LS.medicamentos) || [];
  const idosos = getData(LS.idosos) || [];
  const registros = getData(LS.registros) || [];
  const data = hoje();
  const agenda = [];
  meds.forEach(m => {
    const idoso = idosos.find(i => i.id == m.idosoId);
    m.horarios.forEach(h => {
      const reg = registros.find(r => r.medicamentoId == m.id && r.data === data && r.hora === h);
      agenda.push({ medicamento: m, idoso, hora: h, registro: reg || null });
    });
  });
  agenda.sort((a, b) => a.hora.localeCompare(b.hora));
  return agenda;
}

function registrarDose(medId, hora, status) {
  const registros = getData(LS.registros) || [];
  const logado = getData(LS.logado);
  registros.push({
    id: Date.now(),
    medicamentoId: medId,
    data: hoje(),
    hora: hora,
    status: status,
    responsavel: logado ? logado.nome : 'Profissional',
    marcadoEm: agoraHHMM()
  });
  setData(LS.registros, registros);
  renderizarDashboard();
}

function renderizarDashboard() {
  const agora = agoraHHMM();
  const agenda = gerarAgendaDoDia();
  const idosos = getData(LS.idosos) || [];
  const meds = getData(LS.medicamentos) || [];

  // KPIs
  document.getElementById('kpiIdosos').textContent = idosos.length;
  document.getElementById('kpiMedicamentos').textContent = meds.length;
  document.getElementById('kpiDosesHoje').textContent = agenda.length;
  const atrasadas = agenda.filter(a => !a.registro && a.hora < agora);
  document.getElementById('kpiAtrasadas').textContent = atrasadas.length;

  // Agenda
  const boxAgenda = document.getElementById('agendaLista');
  if (!boxAgenda) return;
  if (!agenda.length) {
    boxAgenda.innerHTML = '<p class="status-pendente">Nenhuma medicação agendada para hoje.</p>';
  } else {
    boxAgenda.innerHTML = agenda.map(item => {
      const r = item.registro;
      let html = '';
      if (r) {
        const classe = r.status === 'tomada' ? 'tomada' : 'pulada';
        const texto = r.status === 'tomada' ? `✅ Confirmada às ${r.marcadoEm} · ${r.responsavel}` : `❌ Marcada como pulada às ${r.marcadoEm}`;
        html = `<span class="status-ok">${texto}</span>`;
      } else {
        html = `<div class="dose-acoes">
          <button class="btn btn-pequeno" onclick="registrarDose(${item.medicamento.id}, '${item.hora}', 'tomada')">✅ Tomei</button>
          <button class="btn btn-cinza btn-pequeno" onclick="registrarDose(${item.medicamento.id}, '${item.hora}', 'pulada')">Pular</button>
        </div>`;
      }
      const pendente = !r && item.hora < agora ? ' <span class="badge badge-vermelho">atrasada</span>' : '';
      return `<div class="item-dose ${r ? (r.status === 'tomada' ? 'tomada' : 'pulada') : ''}">
        <span class="hora">🕐 ${item.hora}</span>
        <div class="dose-info">
          <strong>${item.idoso ? item.idoso.nome : '-'} — ${item.medicamento.nome} ${item.medicamento.dosagem}</strong>
          <span>${item.medicamento.observacoes || 'Sem observações'}${pendente}</span>
        </div>
        ${html}
      </div>`;
    }).join('');
  }

  // Alertas
  const boxAlertas = document.getElementById('alertasLista');
  if (!boxAlertas) return;
  const atraso = atrasadas;
  if (!atraso.length) {
    boxAlertas.innerHTML = '<div class="alerta-ok">✅ Nenhum medicamento em atraso no momento.</div>';
  } else {
    boxAlertas.innerHTML = atraso.map(a =>
      `<div class="alerta">🔔 ${a.hora} — ${a.idoso ? a.idoso.nome : '-'} · ${a.medicamento.nome}
        <span>Dose prevista para ${a.hora} ainda não registrada.</span>
      </div>`).join('');
  }
}

// ===== Relatórios =====
function gerarRelatorio() {
  const idosoId = Number(document.getElementById('relIdoso').value);
  const dataFiltro = document.getElementById('relData').value || hoje();
  const idosos = getData(LS.idosos) || [];
  const meds = getData(LS.medicamentos) || [];
  const registros = getData(LS.registros) || [];
  const idoso = idosos.find(i => i.id == idosoId);
  const area = document.getElementById('relatorioArea');

  if (!idoso) { area.innerHTML = '<div class="alerta">Selecione um idoso.</div>'; return; }

  const medsIdoso = meds.filter(m => m.idosoId == idosoId);
  const regsIdoso = registros.filter(r => medsIdoso.some(m => m.id == r.medicamentoId) && r.data === dataFiltro);

  // doses esperadas no dia = soma dos horários
  let esperadas = 0;
  medsIdoso.forEach(m => { esperadas += m.horarios.length; });

  const tomadas = regsIdoso.filter(r => r.status === 'tomada').length;
  const puladas = regsIdoso.filter(r => r.status === 'pulada').length;
  const adesao = esperadas ? Math.round((tomadas / esperadas) * 100) : 0;

  area.innerHTML = `
    <div class="rel-card">
      <h3>Relatório de adesão — ${idoso.nome} · ${formatarData(dataFiltro)}</h3>
      <div class="kpis" style="margin-bottom:10px;">
        <div class="kpi"><span class="kpi-num">${medsIdoso.length}</span><span class="kpi-rotulo">Medicamentos</span></div>
        <div class="kpi"><span class="kpi-num">${esperadas}</span><span class="kpi-rotulo">Doses esperadas</span></div>
        <div class="kpi"><span class="kpi-num">${tomadas}</span><span class="kpi-rotulo">Doses tomadas</span></div>
        <div class="kpi"><span class="adesao-grande">${adesao}%</span><span class="kpi-rotulo">Adesão</span></div>
      </div>
    </div>
    <div class="rel-card">
      <h3>Histórico do dia</h3>
      ${regsIdoso.length ? `<table class="tabela"><thead><tr><th>Hora</th><th>Medicamento</th><th>Situação</th><th>Responsável</th><th>Registrado às</th></tr></thead><tbody>` +
        regsIdoso.sort((a,b) => a.hora.localeCompare(b.hora)).map(r => {
          const med = medsIdoso.find(m => m.id == r.medicamentoId);
          const badge = r.status === 'tomada' ? '<span class="badge badge-verde">Tomada</span>' : '<span class="badge badge-vermelho">Pulada</span>';
          return `<tr><td>${r.hora}</td><td>${med ? med.nome + ' ' + med.dosagem : '-'}</td><td>${badge}</td><td>${r.responsavel}</td><td>${r.marcadoEm}</td></tr>`;
        }).join('') + '</tbody></table>'
        : '<p class="status-pendente">Nenhum registro para esta data.</p>'}
    </div>`;
}

// ===== Inicialização por página =====
document.addEventListener('DOMContentLoaded', function () {
  seed();
  const pagina = document.body.dataset.page;

  if (pagina === 'dashboard') { verificaLogin(); carregarUsuario(); renderizarDashboard(); }
  if (pagina === 'idosos') { verificaLogin(); carregarUsuario(); renderizarIdosos(); preencherSelects(); }
  if (pagina === 'medicamentos') { verificaLogin(); carregarUsuario(); preencherSelects(); renderizarMedicamentos(); }
  if (pagina === 'relatorios') {
    verificaLogin(); carregarUsuario(); preencherSelects();
    document.getElementById('relData').value = hoje();
  }

  const elData = document.getElementById('dataHoje');
  if (elData) elData.textContent = formatarData(hoje());
});