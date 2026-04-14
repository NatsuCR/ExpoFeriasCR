/**
 * mi-cuenta.js - Gestión de cuenta y eventos del usuario
 */

class MiCuenta {
  constructor() {
    // Verificar autenticación
    this.usuario = JSON.parse(localStorage.getItem('usuario') || 'null');
    if (!this.usuario) {
      alert('Debes iniciar sesión');
      window.location.href = '/index.html';
      return;
    }

    this.token = localStorage.getItem('token');
    this.eventosContenedor = document.getElementById('eventos-contenedor');

    this.init();
  }

  init() {
    this.cargarPerfil();
    this.cargarEventos();
    this.setupEventListeners();
  }

  setupEventListeners() {
    // Volver
    document.getElementById('btn-volver-cuenta').addEventListener('click', () => {
      window.location.href = '/index.html';
    });

    // Crear evento
    document.getElementById('btn-crear-evento').addEventListener('click', () => {
      window.location.href = '/crear-evento.html';
    });

    // Cambiar contraseña
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

    // Logout
    document.getElementById('btn-logout').addEventListener('click', () => {
      localStorage.removeItem('token');
      localStorage.removeItem('usuario');
      window.location.href = '/index.html';
    });

    // Cerrar modal eventos
    document.getElementById('btn-cerrar-modal-evento').addEventListener('click', () => {
      document.getElementById('modal-evento-detalles').style.display = 'none';
    });

    // Listeners Panel Checkbox Múltiple
    document.getElementById('seleccionar-todos-eventos')?.addEventListener('change', (e) => {
        document.querySelectorAll('.cb-evento-bulk').forEach(cb => { cb.checked = e.target.checked; });
        this.verificarSeleccionados();
    });

    document.getElementById('btn-eliminar-seleccionados')?.addEventListener('click', async () => {
        const cbs = document.querySelectorAll('.cb-evento-bulk:checked');
        const count = cbs.length;
        if(count === 0) return;
        
        if(!confirm(`¿Estás seguro de que deseas eliminar ${count} evento(s)? Esta acción es permanente.`)) return;

        const btnOrig = document.getElementById('btn-eliminar-seleccionados').innerHTML;
        document.getElementById('btn-eliminar-seleccionados').innerHTML = 'Borrando...';
        
        let borrados = 0;
        for (const cb of cbs) {
            const id = cb.dataset.id;
            try {
                const token = localStorage.getItem('token');
                await fetch(`/api/eventos/${id}`, {
                    method: 'DELETE',
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                borrados++;
            } catch(e) { console.error('Error al borrar', id); }
        }
        
        document.getElementById('btn-eliminar-seleccionados').innerHTML = btnOrig;
        this.cargarEventos();
    });

    // Cerrar modales al hacer clic fuera
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
  }

  async cargarEventos() {
    try {
      const response = await fetch('/api/eventos/mis-eventos', {
        headers: { 'Authorization': `Bearer ${this.token}` }
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

    const statusClass = evento.estado === 'pendiente' ? 'pendiente' : evento.estado === 'aprobado' ? 'aprobado' : 'rechazado';
    const statusIcons = {
      pendiente: '⏳',
      aprobado: '✓',
      rechazado: '✕'
    };

    const estadoTexto = {
      pendiente: 'En revisión',
      aprobado: 'Aprobado',
      rechazado: 'Rechazado'
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
          ${evento.fecha_inicio}
        </div>
      </div>
      <div class="evento-card-body">
        <div class="evento-status ${statusClass}">
          <span>${statusIcons[evento.estado]}</span>
          <span>${estadoTexto[evento.estado]}</span>
        </div>
        ${contenidoRazon}
      </div>
    `;

    card.addEventListener('click', (e) => {
      // Ignorar click en el checkbox
      if(e.target.type === 'checkbox') {
          this.verificarSeleccionados();
          return;
      }
      this.mostrarDetallesEvento(evento);
    });

    return card;
  }

  verificarSeleccionados() {
    const checkboxes = document.querySelectorAll('.cb-evento-bulk:checked');
    const btnEliminarPanel = document.getElementById('btn-eliminar-seleccionados');
    if(checkboxes.length > 0) {
        btnEliminarPanel.style.opacity = '1';
        btnEliminarPanel.style.pointerEvents = 'auto';
    } else {
        btnEliminarPanel.style.opacity = '0.5';
        btnEliminarPanel.style.pointerEvents = 'none';
        document.getElementById('seleccionar-todos-eventos').checked = false;
    }
  }

  async mostrarDetallesEvento(evento) {
    const modal = document.getElementById('modal-evento-detalles');
    const titulo = document.getElementById('modal-evento-titulo');
    const contenido = document.getElementById('modal-evento-contenido');
    const btnEditar = document.getElementById('btn-editar-evento');
    const btnEliminar = document.getElementById('btn-eliminar-evento');

    titulo.textContent = evento.nombre;

    // Mostrar/ocultar botones según estado
    // Permitir editar si está en pendiente, aprobado, finalizado o rechazado (envía edición a revisión si corresponde)
    btnEditar.style.display = (evento.estado === 'pendiente' || evento.estado === 'aprobado' || evento.estado === 'finalizado' || evento.estado === 'rechazado') ? 'block' : 'none';
    // Solo permitir eliminar si está pendiente
    btnEliminar.style.display = evento.estado === 'pendiente' ? 'block' : 'none';

    // Contenido detallado
    let estadoColor = evento.estado === 'aprobado' ? '#27ae60' : evento.estado === 'pendiente' ? '#f39c12' : '#e74c3c';
    let estadoTexto = evento.estado === 'aprobado' ? 'Aprobado ✓' : evento.estado === 'pendiente' ? 'En revisión ⏳' : 'Rechazado ✕';

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
          ${evento.fecha_inicio} al ${evento.fecha_fin}
        </div>

        <div style="margin-bottom: 15px;">
          <strong>Ubicación:</strong><br>
          ${this.escapeHtml(evento.ubicacion)}
        </div>

        <div style="margin-bottom: 15px;">
          <strong>Descipción:</strong><br>
          ${this.escapeHtml(evento.descripcion)}
        </div>

        ${razonHtml}
        ${botoneAccion}
      </div>
    `;

    // Event listeners para botones de acción
    btnEditar.onclick = () => {
      alert('Redirigiendo a edición...');
      // TODO: Implementar edición de evento
      window.location.href = `/crear-evento.html?id=${evento.id}`;
    };

    btnEliminar.onclick = () => {
      if (confirm('¿Estás seguro de que quieres eliminar este evento?')) {
        this.eliminarEvento(evento.id);
      }
    };

    modal.style.display = 'flex';
  }

  async eliminarEvento(eventoId) {
    try {
      const response = await fetch(`/api/eventos/${eventoId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${this.token}` }
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

    // TODO: Implementar cambio de contraseña desde Mi Cuenta
    this.mostrarMensajePassword('Usa "Olvidé contraseña" en el login para cambiarla', 'info', mensajeDiv);
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
