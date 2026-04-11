// admin-inactivity.js
// Tiempo de inactividad en milisegundos (3 horas)
const INACTIVITY_TIME = 10800000; // 3 horas

let inactivityTimer = null;

// Función para cerrar sesión (borrar token y redirigir)
function cerrarSesionPorInactividad() {
    console.log('Inactividad detectada. Cerrando sesión...');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/admin/login.html';
}

// Reiniciar el temporizador de inactividad
function resetInactivityTimer() {
    if (inactivityTimer) clearTimeout(inactivityTimer);
    inactivityTimer = setTimeout(cerrarSesionPorInactividad, INACTIVITY_TIME);
}

// Detectar actividad del usuario (eventos comunes)
function iniciarMonitoreoInactividad() {
    const eventos = ['mousemove', 'mousedown', 'keypress', 'scroll', 'touchstart', 'click'];
    eventos.forEach(evento => {
        window.addEventListener(evento, resetInactivityTimer);
    });
    // También reiniciar al cargar la página
    resetInactivityTimer();
}

// Si existe la función fetchAPI global, la envolvemos para que también reinicie el temporizador
// (para peticiones asíncronas del admin)
function wrapFetchAPI() {
    if (typeof window.fetchAPI === 'function') {
        const originalFetchAPI = window.fetchAPI;
        window.fetchAPI = async function(...args) {
            resetInactivityTimer();
            return originalFetchAPI(...args);
        };
    }
}

// Iniciar el monitoreo cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    iniciarMonitoreoInactividad();
    wrapFetchAPI();
});