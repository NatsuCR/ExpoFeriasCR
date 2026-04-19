/**
 * mi-cuenta.js - Gestión de cuenta y eventos del usuario
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
   * Fetch interno que maneja renovación de token sin tocar window.fetch
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

  async sincronizarPerfil() {
    try {
      const response = await this.apiFetch('/api/auth/me', {
        headers: { 'Authorization': `Bearer ${this.getToken()}` }
      });
      if (response.ok) {
        const data = await response.json();
        this.usuario = data.user;
        localStorage.setItem('usuario', JSON.stringify(data.user));
      }
    } catch (error) {
      console.warn('Error al sincronizar perfil:', error);
    }
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

  cargarPerfil() {
    document.getElementById('perfil-nombre').textContent = this.usuario.nombre;
    document.getElementById('perfil-email').textContent = this.usuario.email;

    if (this.usuario.rol === 'admin') {
      const perfilAcciones = document.querySelector('.perfil-acciones');
      if (perfilAcciones) {
        const btnAdmin = document.createElement('a');
        btnAdmin.href = '/admin/dashboard.html';
        btnAdmin.className = 'btn-primary';
        btnAdmin.style.marginBottom = '10px';
        btnAdmin.style.textDecoration = 'none';
        btnAdmin.style.display = 'flex';
        btnAdmin.style.alignItems = 'center';
        btnAdmin.style.gap = '8px';
        btnAdmin.style.justifyContent = 'center';
        btnAdmin.style.backgroundColor = '#C8102E';
        btnAdmin.innerHTML = '<i class="fas fa-user-shield"></i> Ir a Panel Admin';
        perfilAcciones.prepend(btnAdmin);
      }
    }
  }

  async cargarEventos() {
    try {
      const t = Date.now();
      const response = await this.apiFetch(`/api/eventos/mis-eventos?t=${t}`, {
        headers: { 'Authorization': `Bearer ${this.getToken()}` },
        cache: 'no-store'
      });

      if (!response.ok) {
        throw new Error('Error al cargar eventos');
      }

      const data = await response.json();
      const eventos = data.eventos || [];

      this.eventosContenedor.innerHTML = '';

      if (eventos.length === 0) {
        this.eventosContenedor.innerHTML = `
          <div class="eventos-vacio">
            <i class="fas fa-inbox"></i>
            <p>Aún no has creado eventos</p>
            <p style="font-size: 12px;">Haz clic en "Crear Nuevo Evento" para empezar</p>
          </div>
        `;
        return;
      }

      eventos.forEach(evento => {
        const card = this.crearEventoCard(evento);
        this.eventosContenedor.appendChild(card);
      });
    } catch (error) {
      console.error('Error:', error);
      this.eventosContenedor.innerHTML = `
        <div class="eventos-vacio">
          <p>Error al cargar eventos</p>
        </div>
      `;
    }
  }

  crearEventoCard(evento) {
    const card = document.createElement('div');
    card.className = 'evento-card';

    const formatFecha = (iso) => {
      if (!iso) return '—';
      return new Date(iso).toLocaleDateString('es-CR', { day: '2-digit', month: 'short', year: 'numeric', timeZone: 'UTC' });
    };

    const statusClass = {
      pendiente: 'pendiente',
      aprobado: 'aprobado',
      rechazado: 'rechazado',
      edicion_pendiente: 'pendiente',
      finalizado: 'aprobado'
    }[evento.estado] || 'pendiente';

    const statusIcons = {
      pendiente: '⏳',
      aprobado: '✓',
      rechazado: '✕',
      edicion_pendiente: '⏳',
      finalizado: '✓'
    };

    const estadoTexto = {
      pendiente: 'En revisión',
      aprobado: 'Aprobado',
      rechazado: 'Rechazado',
      edicion_pendiente: 'Cambios en revisión',
      finalizado: 'Finalizado'
    };

    let contenidoRazon = '';
    if (evento.estado === 'rechazado' && evento.razon_rechazo) {
      contenidoRazon = `
        <div class="evento-razon-rechazo">
          <div class="evento-razon-titulo">Razón del rechazo:</div>
          <p>${evento.razon_rechazo}</p>
        </div>
      `;
    }

    card.innerHTML = `
      <div class="evento-card-header" style="position:relative;">
        <input type="checkbox" class="cb-evento-bulk" data-id="${evento.id}" style="position:absolute; right:10px; top:10px; transform:scale(1.3); cursor:pointer;">
        <h3 class="evento-card-titulo" style="padding-right:25px;">${this.escapeHtml(evento.nombre)}</h3>
        <div class="evento-card-fecha">
          <i class="fas fa-calendar"></i>
          ${formatFecha(evento.fecha_inicio)}
        </div>
      </div>
      <div class="evento-card-body">
        <div class="evento-status ${statusClass}">
          <span>${statusIcons[evento.estado]}</span>
          <span>${estadoTexto[evento.estado]}</span>
        </div>
        ${contenidoRazon}
      </div>
      <div class="evento-card-acciones">
        <button type="button" class="btn-card-ver" data-id="${evento.id}" title="Ver detalles / Editar">
          <i class="fas fa-pen-to-square"></i>
          <span>Ver / Editar</span>
        </button>
      </div>
    `;

    card.querySelector('.btn-card-ver').addEventListener('click', (e) => {
      e.stopPropagation();
      this.mostrarDetallesEvento(evento);
    });

    card.addEventListener('click', (e) => {
      if (e.target.type === 'checkbox') {
        this.verificarSeleccionados();
        return;
      }
      this.mostrarDetallesEvento(evento);
    });

    return card;
  }

  verificarSeleccionados() {
    const totalCbs = document.querySelectorAll('.cb-evento-bulk');
    const checkedCbs = document.querySelectorAll('.cb-evento-bulk:checked');
    const btnEliminarPanel = document.getElementById('btn-eliminar-seleccionados');
    const selectAllCb = document.getElementById('seleccionar-todos-eventos');

    if (checkedCbs.length > 0) {
      btnEliminarPanel.style.opacity = '1';
      btnEliminarPanel.style.pointerEvents = 'auto';
    } else {
      btnEliminarPanel.style.opacity = '0.5';
      btnEliminarPanel.style.pointerEvents = 'none';
    }

    if (selectAllCb) {
      selectAllCb.checked = totalCbs.length > 0 && totalCbs.length === checkedCbs.length;
    }
  }

  async mostrarDetallesEvento(evento) {
    const modal = document.getElementById('modal-evento-detalles');
    const titulo = document.getElementById('modal-evento-titulo');
    const contenido = document.getElementById('modal-evento-contenido');
    const btnEditar = document.getElementById('btn-editar-evento');
    const btnEliminar = document.getElementById('btn-eliminar-evento');

    titulo.textContent = evento.nombre;

    btnEditar.style.display = ['pendiente', 'aprobado', 'finalizado', 'rechazado', 'edicion_pendiente'].includes(evento.estado) ? 'block' : 'none';
    // ✅ Permitir eliminar en cualquier estado
    btnEliminar.style.display = 'block';

    const formatFecha = (iso) => {
      if (!iso) return '—';
      return new Date(iso).toLocaleDateString('es-CR', { day: '2-digit', month: 'long', year: 'numeric', timeZone: 'UTC' });
    };

    const estadoColor = {
      aprobado: '#27ae60',
      pendiente: '#f39c12',
      rechazado: '#e74c3c',
      edicion_pendiente: '#e67e22',
      finalizado: '#2980b9'
    }[evento.estado] || '#95a5a6';

    const estadoTexto = {
      aprobado: 'Aprobado ✓',
      pendiente: 'En revisión ⏳',
      rechazado: 'Rechazado ✕',
      edicion_pendiente: 'Cambios en revisión ⏳',
      finalizado: 'Finalizado'
    }[evento.estado] || evento.estado;

    let razonHtml = '';
    if (evento.razon_rechazo) {
      razonHtml = `
        <div style="background-color: #f8d7da; border: 1px solid #f5c6cb; border-radius: 6px; padding: 12px; margin: 15px 0;">
          <strong>Razón del rechazo:</strong><br>
          ${evento.razon_rechazo}
        </div>
      `;
    }

    let botoneAccion = '';
    if (evento.estado === 'aprobado') {
      botoneAccion = `
        <div style="margin-top: 15px; background-color: #d4edda; padding: 12px; border-radius: 6px;">
          <strong>✓ Este evento está visible en la plataforma</strong>
          <p style="margin: 5px 0 0 0; font-size: 13px; color: #155724;">Puedes compartir este evento con la comunidad.</p>
        </div>
      `;
    }

    contenido.innerHTML = `
      <div style="margin-bottom: 20px;">
        <div style="display: inline-block; background-color: ${estadoColor}; color: white; padding: 8px 16px; border-radius: 20px; font-weight: 600; margin-bottom: 15px;">
          ${estadoTexto}
        </div>
        <div style="margin-bottom: 15px;">
          <strong>Nombre:</strong><br>
          ${this.escapeHtml(evento.nombre)}
        </div>
        <div style="margin-bottom: 15px;">
          <strong>Fecha:</strong><br>
          ${formatFecha(evento.fecha_inicio)} al ${formatFecha(evento.fecha_fin)}
        </div>
        <div style="margin-bottom: 15px;">
          <strong>Ubicación:</strong><br>
          ${this.escapeHtml(evento.ubicacion || '—')}
        </div>
        <div style="margin-bottom: 15px;">
          <strong>Descripción:</strong><br>
          ${this.escapeHtml(evento.descripcion || '—')}
        </div>
        ${razonHtml}
        ${botoneAccion}
      </div>
    `;

    btnEditar.onclick = () => {
      window.location.href = `/crear-evento.html?id=${evento.id}`;
    };

    btnEliminar.onclick = async () => {
      const confirmado = await window.confirmarAccion('¿Eliminar evento?', '¿Estás seguro de que quieres eliminar este evento permanentemente? Esta acción no se puede deshacer.');
      if (confirmado) {
        this.eliminarEvento(evento.id);
      }
    };

    modal.style.display = 'flex';
  }

  async eliminarEvento(eventoId) {
    try {
      const response = await this.apiFetch(`/api/eventos/${eventoId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${this.getToken()}` }
      });

      if (response.ok) {
        alert('Evento eliminado');
        document.getElementById('modal-evento-detalles').style.display = 'none';
        this.cargarEventos();
      } else {
        throw new Error('Error al eliminar');
      }
    } catch (error) {
      alert('Error: ' + error.message);
    }
  }

  abrirModalPassword() {
    document.getElementById('modal-cambiar-password').style.display = 'flex';
  }

  cerrarModalPassword() {
    document.getElementById('modal-cambiar-password').style.display = 'none';
    document.getElementById('form-cambiar-password').reset();
    document.getElementById('mensaje-password').style.display = 'none';
  }

  async handleCambiarPassword(e) {
    e.preventDefault();

    const nueva = document.getElementById('nueva-password').value;
    const confirmar = document.getElementById('confirmar-password').value;
    const mensajeDiv = document.getElementById('mensaje-password');

    if (nueva !== confirmar) {
      this.mostrarMensajePassword('Las contraseñas no coinciden', 'error', mensajeDiv);
      return;
    }

    if (nueva.length < 6) {
      this.mostrarMensajePassword('La contraseña debe tener al menos 6 caracteres', 'error', mensajeDiv);
      return;
    }

    this.mostrarMensajePassword('Usa "Olvidé contraseña" en el login para cambiarla', 'info', mensajeDiv);
  }

  async handleEliminarCuenta() {
    const confirmado = await window.confirmarAccion('¿CERRAR CUENTA?', 'ADVERTENCIA FINAL: Esta acción eliminará permanentemente tu cuenta y todos tus eventos registrados. Esta operación NO se puede deshacer. ¿Deseas continuar?');
    if (!confirmado) return;

    try {
      const response = await this.apiFetch('/api/auth/eliminar-cuenta', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${this.getToken()}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        alert('Tu cuenta ha sido eliminada. Lamentamos verte partir.');
        localStorage.removeItem('token');
        localStorage.removeItem('usuario');
        window.location.href = '/index.html';
      } else {
        const data = await response.json();
        throw new Error(data.error || 'Error al eliminar la cuenta');
      }
    } catch (error) {
      alert('Error: ' + error.message);
      console.error('Error al eliminar cuenta:', error);
    }
  }

  mostrarMensajePassword(mensaje, tipo, div) {
    div.textContent = mensaje;
    div.className = `modal-mensaje ${tipo}`;
    div.style.display = 'block';
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