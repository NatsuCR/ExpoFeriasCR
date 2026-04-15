/**
 * Modal de Autenticación - Lógica de Login, Registro y Password Reset
 */

class ModalAuth {
  constructor() {
    this.modal = document.getElementById('modal-auth');
    this.tabBtns = document.querySelectorAll('.modal-auth-tab-btn');
    this.tabContents = document.querySelectorAll('.modal-auth-tab-content');
    this.btnCerrar = document.getElementById('btn-cerrar-modal-auth');

    // Formularios
    this.formLogin = document.getElementById('form-login');
    this.formRegistro = document.getElementById('form-registro');
    this.formSolicitarReset = document.getElementById('form-solicitar-reset');
    this.formCambiarPassword = document.getElementById('form-cambiar-password');

    // Botones especiales
    this.btnOlvideContrasena = document.getElementById('btn-olvide-contrasena');
    this.btnVolverReset = document.getElementById('btn-volver-reset');

    // Elementos de control
    this.resetPaso1 = document.getElementById('reset-paso-1');
    this.resetPaso2 = document.getElementById('reset-paso-2');

    this.init();
  }

  init() {
    // Event listeners de tabs
    this.tabBtns.forEach(btn => {
      btn.addEventListener('click', () => this.cambiarTab(btn.dataset.tab));
    });

    // Cerrar modal
    this.btnCerrar.addEventListener('click', () => this.cerrar());
    this.modal.addEventListener('click', (e) => {
      if (e.target === this.modal) this.cerrar();
    });

    // Formularios
    this.formLogin.addEventListener('submit', (e) => this.handleLogin(e));
    this.formRegistro.addEventListener('submit', (e) => this.handleRegistro(e));
    this.formSolicitarReset.addEventListener('submit', (e) => this.handleSolicitarReset(e));
    this.formCambiarPassword.addEventListener('submit', (e) => this.handleCambiarPassword(e));

    // Botones especiales
    this.btnOlvideContrasena.addEventListener('click', (e) => {
      e.preventDefault();
      this.cambiarTab('reset');
    });

    this.btnVolverReset.addEventListener('click', () => {
      this.resetPaso1.style.display = 'block';
      this.resetPaso2.style.display = 'none';
      this.limpiarFormulario(this.formSolicitarReset);
    });
  }

  cambiarTab(tabName) {
    // Actualizar botones
    this.tabBtns.forEach(btn => {
      btn.classList.toggle('active', btn.dataset.tab === tabName);
    });

    // Actualizar contenido
    this.tabContents.forEach(content => {
      content.classList.toggle('active', content.id === `tab-${tabName}`);
    });

    // Limpiar mensajes
    document.querySelectorAll('.modal-auth-mensaje').forEach(msg => {
      msg.style.display = 'none';
      msg.textContent = '';
    });

    // Si volvemos a reset, mostrar paso 1
    if (tabName === 'reset') {
      this.resetPaso1.style.display = 'block';
      this.resetPaso2.style.display = 'none';
    }
  }

  async handleLogin(e) {
    e.preventDefault();
    const btn = this.formLogin.querySelector('button[type="submit"]');
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    const msgDiv = document.getElementById('mensaje-login');

    try {
      this.mostrarCargando(btn);

      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al iniciar sesión');
      }

      // Guardar token y usuario en localStorage
      localStorage.setItem('token', data.token);
      localStorage.setItem('usuario', JSON.stringify(data.user));

      this.mostrarMensaje(msgDiv, `✓ Bienvenido ${data.user.nombre}!`, 'success');

      // Actualizar navbar y cerrar modal
      setTimeout(() => {
        window.actualizarNavbarAuth && window.actualizarNavbarAuth();
        this.cerrar();
        location.reload(); // Opcional: recargar para actualizar UI completamente
      }, 1000);
    } catch (error) {
      this.mostrarMensaje(msgDiv, error.message, 'error');
    } finally {
      this.ocultarCargando(btn);
    }
  }

  async handleRegistro(e) {
    e.preventDefault();
    const btn = this.formRegistro.querySelector('button[type="submit"]');
    const nombre = document.getElementById('registro-nombre').value;
    const email = document.getElementById('registro-email').value;
    const password = document.getElementById('registro-password').value;
    const passwordConfirm = document.getElementById('registro-password-confirm').value;
    const msgDiv = document.getElementById('mensaje-registro');

    try {
      // Validaciones
      if (password !== passwordConfirm) {
        throw new Error('Las contraseñas no coinciden');
      }

      if (password.length < 6) {
        throw new Error('La contraseña debe tener al menos 6 caracteres');
      }

      this.mostrarCargando(btn);

      const response = await fetch('/api/auth/registro', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre, email, password, passwordConfirm })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al crear la cuenta');
      }

      // Guardar token y usuario
      localStorage.setItem('token', data.token);
      localStorage.setItem('usuario', JSON.stringify(data.user));

      this.mostrarMensaje(msgDiv, `✓ ${data.message}`, 'success');

      // Cerrar modal y actualizar UI
      setTimeout(() => {
        window.actualizarNavbarAuth && window.actualizarNavbarAuth();
        this.cerrar();
        location.reload();
      }, 1500);
    } catch (error) {
      this.mostrarMensaje(msgDiv, error.message, 'error');
    } finally {
      this.ocultarCargando(btn);
    }
  }

  async handleSolicitarReset(e) {
    e.preventDefault();
    const btn = this.formSolicitarReset.querySelector('button[type="submit"]');
    const email = document.getElementById('reset-email').value;
    const msgDiv = document.getElementById('mensaje-solicitar-reset');

    try {
      this.mostrarCargando(btn);

      const response = await fetch('/api/auth/solicitar-reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al solicitar reset');
      }

      this.mostrarMensaje(msgDiv, `✓ ${data.message}`, 'info');

      // Mostrar paso 2 después de 1 segundo
      setTimeout(() => {
        this.resetPaso1.style.display = 'none';
        this.resetPaso2.style.display = 'block';
      }, 1000);
    } catch (error) {
      this.mostrarMensaje(msgDiv, error.message, 'error');
    } finally {
      this.ocultarCargando(btn);
    }
  }

  async handleCambiarPassword(e) {
    e.preventDefault();
    const btn = this.formCambiarPassword.querySelector('button[type="submit"]');
    const email = document.getElementById('reset-email').value;
    const codigo = document.getElementById('reset-codigo').value;
    const passwordNueva = document.getElementById('reset-password-nueva').value;
    const passwordConfirm = document.getElementById('reset-password-confirm').value;
    const msgDiv = document.getElementById('mensaje-cambiar-password');

    try {
      // Validaciones
      if (codigo.length !== 6 || !/^\d+$/.test(codigo)) {
        throw new Error('El código debe ser de 6 dígitos');
      }

      if (passwordNueva !== passwordConfirm) {
        throw new Error('Las contraseñas no coinciden');
      }

      if (passwordNueva.length < 6) {
        throw new Error('La contraseña debe tener al menos 6 caracteres');
      }

      this.mostrarCargando(btn);

      const response = await fetch('/api/auth/cambiar-password-con-codigo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, codigo, passwordNueva, passwordConfirm })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al cambiar contraseña');
      }

      this.mostrarMensaje(msgDiv, `✓ ${data.message}`, 'success');

      // Volver a login después de 2 segundos
      setTimeout(() => {
        this.cambiarTab('login');
        this.limpiarFormulario(this.formSolicitarReset);
        this.limpiarFormulario(this.formCambiarPassword);
      }, 2000);
    } catch (error) {
      this.mostrarMensaje(msgDiv, error.message, 'error');
    } finally {
      this.ocultarCargando(btn);
    }
  }

  mostrarMensaje(div, mensaje, tipo) {
    div.textContent = mensaje;
    div.className = `modal-auth-mensaje ${tipo}`;
    div.style.display = 'block';
  }

  mostrarCargando(btn) {
    btn.disabled = true;
    btn.classList.add('loading');
    btn.textContent = 'Procesando...';
  }

  ocultarCargando(btn) {
    btn.disabled = false;
    btn.classList.remove('loading');
    // Restaurar texto original
    if (btn.closest('#form-login')) btn.textContent = 'Iniciar Sesión';
    else if (btn.closest('#form-registro')) btn.textContent = 'Crear Cuenta';
    else if (btn.closest('#form-solicitar-reset')) btn.textContent = 'Enviar Código';
    else if (btn.closest('#form-cambiar-password')) btn.textContent = 'Cambiar Contraseña';
  }

  limpiarFormulario(form) {
    form.reset();
  }

  abrir() {
    this.modal.style.display = 'flex';
    // Enfocar primer input
    setTimeout(() => {
      const firstInput = this.modal.querySelector('input:not([type="hidden"])');
      if (firstInput) firstInput.focus();
    }, 100);
  }

  cerrar() {
    this.modal.style.display = 'none';
    // Limpiar formularios
    this.formLogin.reset();
    this.formRegistro.reset();
    this.formSolicitarReset.reset();
    this.formCambiarPassword.reset();
    // Resetear tab a login
    this.cambiarTab('login');
  }
}

// Inicializar cuando el modal sea inyectado al DOM
let modalAuthInstance;

function inicializarModalAuth() {
  // Esperar a que el modal exista en el DOM
  const modal = document.getElementById('modal-auth');
  if (modal && !modalAuthInstance) {
    try {
      modalAuthInstance = new ModalAuth();

      // Función global para abrir modal
      window.abrirModalAuth = () => modalAuthInstance.abrir();
      window.cerrarModalAuth = () => modalAuthInstance.cerrar();
    } catch (error) {
      console.error('Error inicializando ModalAuth:', error);
    }
  }
}

// Intentar inicializar cuando DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
  inicializarModalAuth();
});

// También intentar cuando se inyecta el HTML (con pequeño delay)
const observer = new MutationObserver(() => {
  if (!modalAuthInstance && document.getElementById('modal-auth')) {
    inicializarModalAuth();
  }
});

observer.observe(document.body, { childList: true, subtree: true });

// Prevenció del envío de contraseña sin encriptación (solo HTTPS en producción)
// El ejemplo actual funciona localmente pero en producción siempre usar HTTPS
