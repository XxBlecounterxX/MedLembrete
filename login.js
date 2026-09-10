// ===== Lógica de login =====
function openLoginModal() {
  document.getElementById('loginModal').style.display = 'flex';
}

function closeLoginModal() {
  document.getElementById('loginModal').style.display = 'none';
  document.getElementById('loginErro').style.display = 'none';
}

function handleLogin(e) {
  e.preventDefault();
  const email = document.getElementById('loginEmail').value.trim();
  const senha = document.getElementById('loginSenha').value;
  const usuarios = getData('ml_usuarios') || [];
  const usuario = usuarios.find(u => u.email === email && u.senha === senha);
  if (usuario) {
    setData('ml_logado', usuario);
    window.location.href = 'dashboard.html';
  } else {
    document.getElementById('loginErro').style.display = 'block';
  }
}