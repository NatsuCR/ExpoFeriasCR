/**
 * Inicialización de Autenticación para index.html
 * Maneja:
 * - Carga del modal HTML
 * - Verificación de sesión
 * - Actualización del navbar según autenticación
 */

// Interceptor global para renovación de tokens
(function() {
    const originalFetch = window.fetch;
    window.fetch = async function(...args) {
        const response = await originalFetch(...args);
        const newToken = response.headers.get('X-New-Token');
        if (newToken) {
            localStorage.setItem('token', newToken);
        }
        return response;
    };
})();

async function cargarModalAuth() {
  try {
    const response = await fetch('/modal-auth.html');
    if (!response.ok) throw new Error('No se pudo cargar el modal');
    const html = await response.text();
    document.getElementById('modal-auth-container').innerHTML = html;
  } catch (error) {
    console.error('Error cargando modal auth:', error);
  }
}

async function verificarReinicioServidor() {
  try {
    const res = await fetch('/api/health');
    if (!res.ok) return;
    const data = await res.json();
    
    const lastBoot = localStorage.getItem('serverBootTime');
    if (lastBoot && lastBoot !== data.bootTime) {
      // El servidor se reinició, limpiar sesión
      localStorage.removeItem('token');
      localStorage.removeItem('usuario');
      localStorage.setItem('serverBootTime', data.bootTime);
      window.location.reload();
    } else if (!lastBoot) {
      localStorage.setItem('serverBootTime', data.bootTime);
    }
  } catch (error) {
    console.warn('No se pudo verificar el estado del servidor', error);
  }
}

function setupBotonesNavbar() {
  const usuario = JSON.parse(localStorage.getItem('usuario') || 'null');
  const btnCrearEvento = document.getElementById('btn-crear-evento-navbar');
  const btnLogin = document.getElementById('btn-login-navbar');

  if (btnCrearEvento) {
    if (usuario) {
      // Usuario autenticado: redirigir a crear-evento
      btnCrearEvento.addEventListener('click', () => {
        window.location.href = '/crear-evento.html';
      });
    } else {
      // No autenticado: abrir modal de login (como Iniciar Sesión)
      btnCrearEvento.addEventListener('click', () => {
        window.abrirModalAuth && window.abrirModalAuth();
      });
    }
  }

  if (btnLogin) {
    btnLogin.addEventListener('click', () => {
      window.abrirModalAuth && window.abrirModalAuth();
    });
  }
}

function actualizarNavbarAuth() {
  const usuario = JSON.parse(localStorage.getItem('usuario') || 'null');

  if (usuario) {
    // Usuario autenticado: mostrar dropdown con Mi Cuenta y Crear Evento
    const navAuth = document.getElementById('nav-auth');
    const nuevoHtml = `
      <div class="nav-user-menu">
        <button id="btn-user-dropdown" class="btn-user-dropdown">
          <i class="fas fa-user-circle"></i>
          <span>${usuario.nombre}</span>
          <i class="fas fa-chevron-down"></i>
        </button>
        <div id="user-dropdown-menu" class="user-dropdown-menu" style="display: none;">
          <a href="/mi-cuenta.html" class="dropdown-item">
            <i class="fas fa-user"></i> Mi Cuenta
          </a>
          <a href="/crear-evento.html" class="dropdown-item">
            <i class="fas fa-plus"></i> Crear Evento
          </a>
          <hr class="dropdown-divider">
          <button id="btn-logout" class="dropdown-item btn-logout">
            <i class="fas fa-sign-out-alt"></i> Cerrar Sesión
          </button>
        </div>
      </div>
    `;

    // Reemplazar contenido pero mantener estructura
    navAuth.innerHTML = nuevoHtml;

    // Event listeners
    const btnDropdown = document.getElementById('btn-user-dropdown');
    const menu = document.getElementById('user-dropdown-menu');
    const btnLogout = document.getElementById('btn-logout');

    btnDropdown.addEventListener('click', () => {
      menu.style.display = menu.style.display === 'none' ? 'block' : 'none';
    });

    // Cerrar dropdown al hacer clic fuera
    document.addEventListener('click', (e) => {
      if (!e.target.closest('.nav-user-menu')) {
        menu.style.display = 'none';
      }
    });

    // Logout
    btnLogout.addEventListener('click', (e) => {
      e.preventDefault();
      localStorage.removeItem('token');
      localStorage.removeItem('usuario');
      location.reload();
    });
  }
}

async function sincronizarPerfilNavbar() {
  const token = localStorage.getItem('token');
  if (!token) return;

  try {
    const response = await fetch('/api/auth/me', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (response.ok) {
      const data = await response.json();
      localStorage.setItem('usuario', JSON.stringify(data.user));
    }
  } catch (error) {
    console.warn('Error sincronizando navbar:', error);
  }
}

// Inicializar cuando DOM esté listo
document.addEventListener('DOMContentLoaded', async () => {
  // Verificar si hubo reinicio para desloguear (cerrar sesión)
  await verificarReinicioServidor();

  // Sincronizar perfil antes de renderizar navbar
  await sincronizarPerfilNavbar();

  // Cargar modal
  await cargarModalAuth();

  // Actualizar navbar si usuario está autenticado
  actualizarNavbarAuth();

  // Setup botones de navegación
  setupBotonesNavbar();
});

// Exportar para que sea accesible globalmente
window.actualizarNavbarAuth = actualizarNavbarAuth;
window.setupBotonesNavbar = setupBotonesNavbar;

