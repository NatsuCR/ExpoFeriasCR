/**
 * mi-cuenta.js - Gestión de cuenta y eventos del usuario (Entry Point)
 */

class MiCuenta {
  constructor() {
    this.usuario = JSON.parse(localStorage.getItem('usuario') || 'null');
    if (!this.usuario) {
      alert('Debes iniciar sesión');
      window.location.href = '/index.html';
      return;
    }

    this.getToken = () => localStorage.getItem('token');
    this.eventosContenedor = document.getElementById('eventos-contenedor');

    this.init();
  }

  /**
   * Fetch interno que maneja renovación de token
   */
  async apiFetch(url, options = {}) {
    const response = await fetch(url, options);
    const newToken = response.headers.get('X-New-Token');
    if (newToken) {
      localStorage.setItem('token', newToken);
    }
    return response;
  }

  async init() {
    await this.sincronizarPerfil();
    this.cargarPerfil();
    this.cargarEventos();
    this.setupEventListeners();
  }

  setupEventListeners() {
    document.getElementById('btn-volver-cuenta').addEventListener('click', () => {
      window.location.href = '/index.html';
    });

    document.getElementById('btn-crear-evento').addEventListener('click', () => {
      window.location.href = '/crear-evento.html';
    });

    document.getElementById('btn-cambiar-password').addEventListener('click', () => {
      this.abrirModalPassword();
    });

    document.getElementById('btn-cerrar-modal-password').addEventListener('click', () => {
      this.cerrarModalPassword();
    });

    document.getElementById('btn-cancelar-password').addEventListener('click', () => {
      this.cerrarModalPassword();
    });

    document.getElementById('form-cambiar-password').addEventListener('submit', (e) => {
      this.handleCambiarPassword(e);
    });

    document.getElementById('btn-logout').addEventListener('click', () => {
      localStorage.removeItem('token');
      localStorage.removeItem('usuario');
      window.location.href = '/index.html';
    });

    document.getElementById('btn-eliminar-cuenta')?.addEventListener('click', () => {
      this.handleEliminarCuenta();
    });

    document.getElementById('btn-cerrar-modal-evento').addEventListener('click', () => {
      document.getElementById('modal-evento-detalles').style.display = 'none';
    });

    document.getElementById('seleccionar-todos-eventos')?.addEventListener('change', (e) => {
      document.querySelectorAll('.cb-evento-bulk').forEach(cb => { cb.checked = e.target.checked; });
      this.verificarSeleccionados();
    });

    document.getElementById('btn-eliminar-seleccionados')?.addEventListener('click', async () => {
      const cbs = document.querySelectorAll('.cb-evento-bulk:checked');
      const count = cbs.length;
      if (count === 0) return;

      const ids = Array.from(cbs).map(cb => cb.dataset.id);
      const confirmado = await window.confirmarAccion(
        '¿Eliminar seleccionados?',
        `¿Estás seguro de que deseas eliminar ${count} evento(s) seleccionados? Esta acción no se puede deshacer.`
      );
      if (!confirmado) return;

      const btn = document.getElementById('btn-eliminar-seleccionados');
      const btnOrig = btn.innerHTML;
      btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Borrando...';
      btn.disabled = true;
      btn.style.opacity = '0.7';
      btn.style.pointerEvents = 'none';

      for (const id of ids) {
        try {
          await this.apiFetch(`/api/eventos/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${this.getToken()}` }
          });
        } catch (e) { console.error('Error al borrar', id); }
      }

      btn.innerHTML = btnOrig;
      btn.disabled = false;
      btn.style.opacity = '0.5';
      btn.style.pointerEvents = 'none';

      await this.cargarEventos();
      this.verificarSeleccionados();
    });

    window.addEventListener('click', (e) => {
      const modalPassword = document.getElementById('modal-cambiar-password');
      const modalEvento = document.getElementById('modal-evento-detalles');

      if (e.target === modalPassword) {
        modalPassword.style.display = 'none';
      }
      if (e.target === modalEvento) {
        modalEvento.style.display = 'none';
      }
    });
  }

  escapeHtml(texto) {
    const div = document.createElement('div');
    div.textContent = texto;
    return div.innerHTML;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new MiCuenta();
});


