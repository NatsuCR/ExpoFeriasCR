/**
 * admin-inactivity.js - Manejo de inactividad en panel admin
 */

let inactivityTimeout;
const INACTIVITY_TIME = 30 * 60 * 1000; // 30 minutos

function resetInactivityTimer() {
  clearTimeout(inactivityTimeout);
  inactivityTimeout = setTimeout(() => {
    alert('Sesión expirada por inactividad');
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    window.location.href = '/index.html';
  }, INACTIVITY_TIME);
}

// Detectar actividad del usuario
document.addEventListener('mousemove', resetInactivityTimer);
document.addEventListener('keypress', resetInactivityTimer);
document.addEventListener('click', resetInactivityTimer);

// Iniciar timer
resetInactivityTimer();



