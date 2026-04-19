/**
 * admin-eventos-pendientes.js - Gestión de eventos pendientes de aprobación
 */

class AdminEventosPendientes {
  constructor() {
    this.eventos = [];
    this.eventosFiltrados = [];
    this.eventoActualModal = null;
    this.eventosAprobar = null;
    this.paginaActual = 1;
    this.eventosPerPagina = 10;
    this.init();
  }


  init() {
    this.verificarAutenticacion();
    this.cargarEventos();
    this.setupEventListeners();
    this.actualizarContador();
  }

  verificarAutenticacion() {
    const usuario = JSON.parse(localStorage.getItem('user') || 'null');
    if (!usuario || usuario.rol !== 'admin') {
      mostrarMensaje('Acceso denegado. Se requieren permisos de administrador', 'error');
      setTimeout(() => {
        window.location.href = '/admin/login.html';
      }, 2000);
    }
  }

  setupEventListeners() {
    // Filtros
    document.getElementById('filtro-estado').addEventListener('change', () => this.aplicarFiltros());
    document.getElementById('filtro-buscar').addEventListener('input', () => this.aplicarFiltros());
    document.getElementById('btn-limpiar-filtros').addEventListener('click', () => this.limpiarFiltros());

    // Paginación
    document.getElementById('btn-pagina-anterior').addEventListener('click', () => this.irPaginaAnterior());
    document.getElementById('btn-pagina-siguiente').addEventListener('click', () => this.irPaginaSiguiente());
  }

  async cargarEventos() {
    try {
      document.getElementById('mensaje-cargando').style.display = 'flex';
      document.getElementById('tabla-eventos').style.display = 'none';
      document.getElementById('mensaje-vacio').style.display = 'none';

      const token = localStorage.getItem('token');
      const response = await fetch('/api/admin/eventos-pendientes', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok) {
        throw new Error('Error al cargar eventos pendientes');
      }

      const data = await response.json();
      this.eventos = data.eventos || [];
      this.eventosFiltrados = [...this.eventos];
      this.paginaActual = 1;

      this.renderizarTabla();
      this.actualizarContador();
    } catch (error) {
      console.error('Error:', error);
      document.getElementById('mensaje-cargando').style.display = 'none';
      mostrarMensaje('Error al cargar eventos: ' + error.message, 'error');
    }
  }

  aplicarFiltros() {
    const estado = document.getElementById('filtro-estado').value;
    const buscar = document.getElementById('filtro-buscar').value.toLowerCase();

    this.eventosFiltrados = this.eventos.filter(evento => {
      const coincideEstado = !estado || evento.estado === estado;
      const coincideBusqueda = !buscar ||
        evento.nombre.toLowerCase().includes(buscar) ||
        (evento.usuario_nombre || '').toLowerCase().includes(buscar);

      return coincideEstado && coincideBusqueda;
    });

    this.paginaActual = 1;
    this.renderizarTabla();
  }

  limpiarFiltros() {
    document.getElementById('filtro-estado').value = '';
    document.getElementById('filtro-buscar').value = '';
    this.eventosFiltrados = [...this.eventos];
    this.paginaActual = 1;
    this.renderizarTabla();
  }

  renderizarTabla() {
    document.getElementById('mensaje-cargando').style.display = 'none';

    if (this.eventosFiltrados.length === 0) {
      document.getElementById('tabla-eventos').style.display = 'none';
      document.getElementById('mensaje-vacio').style.display = 'block';
      document.getElementById('paginacion-container').style.display = 'none';
      return;
    }

    // Calcular índices de paginación
    const inicio = (this.paginaActual - 1) * this.eventosPerPagina;
    const fin = inicio + this.eventosPerPagina;
    const eventosPagina = this.eventosFiltrados.slice(inicio, fin);

    // Renderizar filas
    const tbody = document.getElementById('eventos-tbody');
    tbody.innerHTML = '';

    eventosPagina.forEach(evento => {
      const row = document.createElement('tr');
      const usuarioNombre = evento.usuario_nombre || 'Sin usuario';
      const estadoBadge = this.getEstadoBadge(evento.estado);
      const fechaCreacion = new Date(evento.created_at).toLocaleDateString('es-CR');

      row.innerHTML = `
        <td><strong>${this.escapeHtml(usuarioNombre)}</strong><br><small style="color: #999;">${this.escapeHtml(evento.usuario_email || '')}</small></td>
        <td>${this.escapeHtml(evento.nombre)}</td>
        <td>${fechaCreacion}</td>
        <td>${estadoBadge}</td>
        <td>
          <div class="acciones-cell">
            <button class="btn-accion btn-ver" onclick="admin.verEvento(${evento.id})">
              <i class="fas fa-eye"></i> Ver
            </button>
            <button class="btn-accion btn-aprobar" onclick="admin.aprobarEvento(${evento.id})">
              <i class="fas fa-check"></i> Aprobar
            </button>
            <button class="btn-accion btn-rechazar" onclick="admin.abrirRechazar(${evento.id})">
              <i class="fas fa-times"></i> Rechazar
            </button>
          </div>
        </td>
      `;
      tbody.appendChild(row);
    });

    // Mostrar paginación si es necesario
    const totalPaginas = Math.ceil(this.eventosFiltrados.length / this.eventosPerPagina);
    if (totalPaginas > 1) {
      document.getElementById('paginacion-container').style.display = 'flex';
      document.getElementById('info-pagina').textContent = `Página ${this.paginaActual} de ${totalPaginas}`;
      document.getElementById('btn-pagina-anterior').disabled = this.paginaActual === 1;
      document.getElementById('btn-pagina-siguiente').disabled = this.paginaActual === totalPaginas;
    } else {
      document.getElementById('paginacion-container').style.display = 'none';
    }

    document.getElementById('tabla-eventos').style.display = 'table';
    document.getElementById('mensaje-vacio').style.display = 'none';
  }

  getEstadoBadge(estado) {
    const iconos = {
      pendiente: '⏳',
      aprobado: '✓',
      rechazado: '✕',
      edicion_pendiente: '🔄',
      finalizado: '✓'
    };

    const textos = {
      pendiente: 'Pendiente',
      aprobado: 'Aprobado',
      rechazado: 'Rechazado',
      edicion_pendiente: 'Actualización',
      finalizado: 'Finalizado'
    };

    const icono = iconos[estado] || '❓';
    const texto = textos[estado] || estado;
    return `<span class="estado-badge ${estado}">${icono} ${texto}</span>`;
  }

  async verEvento(eventoId) {
    try {
      const evento = this.eventos.find(e => e.id === eventoId);
      if (!evento) {
        mostrarMensaje('Evento no encontrado', 'error');
        return;
      }
      this.eventoActualModal = evento;

      // Fetch full event info to show everything including carousels and images
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/admin/eventos-pendientes/${eventoId}`, {
         headers: { 'Authorization': `Bearer ${token}` }
      });
      if(res.ok) {
          const fullData = await res.json();
          // Combinar datos basicos con las colecciones y extras
          // IMPORTANTE: el API devuelve { evento: {...}, actividades: [], ... }
          if (fullData.evento) {
            Object.assign(evento, fullData.evento);
          }
          evento.actividades = fullData.actividades || [];
          evento.precios = fullData.precios || [];
          evento.expositores = fullData.expositores || [];
          evento.galeria = fullData.galeria || [];
      }

      // Guardar datos del evento en localStorage con una clave única
      const datosPreview = {
        nombre: evento.nombre,
        descripcion: evento.descripcion,
        fecha_inicio: evento.fecha_inicio,
        fecha_fin: evento.fecha_fin,
        ubicacion: evento.ubicacion,
        provincia: evento.provincia,
        imagen_portada: (evento.imagen_portada && !evento.imagen_portada.startsWith('http') && !evento.imagen_portada.startsWith('/')) ? '/' + evento.imagen_portada : evento.imagen_portada,
        mapa_embed: evento.mapa_embed,
        color_primario: evento.color_primario || '#C8102E',
        color_secundario: evento.color_secundario || '#0033A0',
        color_fondo: evento.color_fondo || '#FFFFFF',
        color_texto: evento.color_texto || '#2c1a0e',
        color_hero_overlay: evento.color_hero_overlay || 'rgba(0,0,0,0.4)',
        color_titulo_hero: evento.color_titulo_hero || '#ffffff',
        color_descripcion_hero: evento.color_descripcion_hero || '#ffffff',
        color_fondo_fechas: evento.color_fondo_fechas || '#0033A0',
        color_texto_fechas: evento.color_texto_fechas || '#ffffff',
        color_titulo_seccion: evento.color_titulo_seccion || '#C8102E',
        color_menu_fondo: evento.color_menu_fondo || '#ffffff',
        color_menu_texto: evento.color_menu_texto || '#333333',
        color_menu_fondo_hover: evento.color_menu_fondo_hover || '#C8102E',
        color_menu_texto_hover: evento.color_menu_texto_hover || '#ffffff',
        color_fondo_contacto: evento.color_fondo_contacto || '#f8f8f8',
        color_texto_contacto: evento.color_texto_contacto || '#333333',
        color_enlace_contacto: evento.color_enlace_contacto || '#C8102E',
        color_fondo_footer: evento.color_fondo_footer || '#C8102E',
        color_texto_footer: evento.color_texto_footer || '#ffffff',
        color_titulo_h3: evento.color_titulo_h3 || '#2c1a0e',
        color_descripcion_texto: evento.color_descripcion_texto || '#2c1a0e',
        precios: evento.precios || [],
        actividades: (evento.actividades || []).map(act => ({
          ...act,
          // Asegurar que imagen sea un array si viene como JSON string
          imagen: (typeof act.imagen === 'string' && act.imagen.startsWith('[')) ? JSON.parse(act.imagen) : act.imagen
        })),
        expositores: (evento.expositores || []).map(exp => ({
          ...exp,
          logo: exp.imagen_logo || exp.logo, // Sincronizar nombre de columna
          video: exp.video_url || exp.video   // Sincronizar nombre de columna
        })),
        galeria: evento.galeria || []
      };
      
      const dataKey = 'preview_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      localStorage.setItem(dataKey, JSON.stringify(datosPreview));

      const formatDate = (d) => window.formatDateCR(d);

      const buildCard = (isLive) => {
        const liveBadge = isLive ? `<div style="position:absolute; top:10px; right:10px; background:#e74c3c; color:white; padding:4px 8px; border-radius:4px; font-weight:bold; font-size:12px; z-index:10;">🔴 EN VIVO</div>` : '';
        // Usar colores por defecto del sitio para la simulación de portada (Red/Blue)
        const cp = '#C8102E'; // Rojo marca
        const cs = '#0033A0'; // Azul marca
        const imgUrl = (evento.imagen_portada && !evento.imagen_portada.startsWith('http') && !evento.imagen_portada.startsWith('/')) 
          ? '/' + evento.imagen_portada 
          : (evento.imagen_portada || '/assets/images/LogoOficialExpoFeriasCR/LogoExpoFeriasCR1.png');

        return `
          <div class="evento-card" style="--color-primary: ${cp}; --color-secondary: ${cs}; width:250px; margin:0 auto; box-shadow:0 4px 10px rgba(0,0,0,0.1); border-top:5px solid ${cp}; border-radius:8px; overflow:hidden; background:white;">
            <div style="position:relative;">
              ${liveBadge}
              <img src="${imgUrl}" alt="${this.escapeHtml(evento.nombre)}" style="width:100%; height:160px; object-fit:cover;">
            </div>
            <div style="padding:12px; text-align:left;">
              <h3 style="margin:0 0 8px; font-size:16px; color:${cs}; font-family:'Playfair Display', serif;">${this.escapeHtml(evento.nombre)}</h3>
              <p style="margin:4px 0; color:#666; font-size:13px;">${formatDate(evento.fecha_inicio)} - ${formatDate(evento.fecha_fin)}</p>
              <p style="margin:4px 0 12px; color:#666; font-size:13px;">${this.escapeHtml(evento.ubicacion)}</p>
              <button type="button" style="width:100%; padding:8px; border:none; background:${cs}; color:white; border-radius:4px; font-size:13px; font-weight:bold; cursor:pointer;">Ver más</button>
            </div>
          </div>
        `;
      };

      // Mostrar iframe con evento.html en modo preview
      const html = `
        <div style="display:flex; gap: 20px; flex-wrap: wrap;">
          <div class="evento-preview-info" style="flex:1; min-width:300px;">
            <div class="preview-usuario-info">
              <h4>Información del Usuario</h4>
              <p><strong>Nombre:</strong> ${this.escapeHtml(evento.usuario_nombre || 'N/A')}</p>
              <p><strong>Email:</strong> ${this.escapeHtml(evento.usuario_email || 'N/A')}</p>
              <p><strong>Fecha Creación:</strong> ${new Date(evento.created_at).toLocaleDateString('es-CR')}</p>
              <p><strong>Estado:</strong> ${this.getEstadoBadge(evento.estado)}</p>
              ${evento.razon_rechazo ? `<div style="background: #fadbd8; padding: 12px; border-radius: 6px; margin-top: 12px;"><strong style="color: #721c24;">Razón del Rechazo:</strong><p style="color: #721c24;">${this.escapeHtml(evento.razon_rechazo)}</p></div>` : ''}
            </div>

            <div style="margin-top:20px;">
              <h4 style="border-bottom: 2px solid #ddd; padding-bottom: 8px; margin-bottom: 15px;">Simulación Portada (Index)</h4>
              <div style="display:flex; flex-direction:column; gap:25px; margin-top:10px;">
                <div style="background: #fdfdfd; padding: 10px; border-radius: 8px; border-left: 5px solid #C8102E;">
                   <h5 style="margin: 0 0 10px 0; color: #333; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px;">Normal / Hoy</h5>
                   ${buildCard(false)}
                </div>
                <div style="background: #fdfdfd; padding: 10px; border-radius: 8px; border-left: 5px solid #e74c3c;">
                   <h5 style="margin: 0 0 10px 0; color: #333; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px;">En Vivo</h5>
                   ${buildCard(true)}
                </div>
                <div style="background: #fdfdfd; padding: 10px; border-radius: 8px; border-left: 5px solid #0033A0;">
                   <h5 style="margin: 0 0 10px 0; color: #333; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px;">Próximos Eventos</h5>
                   ${buildCard(false)}
                </div>
              </div>
            </div>
          </div>
          <iframe src="/evento.html?preview=1&dataKey=${dataKey}" class="evento-preview-iframe" allowfullscreen style="flex:2; min-width:360px;"></iframe>
        </div>
      `;

      document.getElementById('evento-preview-contenido').innerHTML = html;

      // Mostrar/ocultar botones según estado (pendiente o edicion_pendiente pueden aprobarse/rechazarse)
      const puedeAccion = ['pendiente', 'edicion_pendiente'].includes(evento.estado);
      document.getElementById('btn-modal-aprobar').style.display = puedeAccion ? 'block' : 'none';
      document.getElementById('btn-modal-rechazar').style.display = puedeAccion ? 'block' : 'none';

      document.getElementById('modal-evento-preview').style.display = 'flex';
    } catch (error) {
      console.error('Error:', error);
      mostrarMensaje('Error al cargar evento: ' + error.message, 'error');
    }
  }

  async aprobarEvento(eventoId) {
    const confirmado = await window.confirmarAccion(
      '¿Aprobar este evento?',
      'Se enviará un correo de notificación al organizador indicando que su evento ya está disponible en el sitio.',
      'Aprobar',
      'confirm-btn-success'
    );

    if (!confirmado) return;

    try {
      this.eventosAprobar = eventoId;
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/admin/eventos-pendientes/${eventoId}/aprobar`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Error al aprobar evento');
      }

      mostrarMensaje('✓ Evento aprobado exitosamente. Email enviado al usuario.', 'success');
      
      // Cerrar inmediatamente la vista previa para evitar que se quede estática
      cerrarModalPreview();
      this.cargarEventos();
      
      // Recargar la página después de un momento para actualizar contadores globales
      setTimeout(() => {
        location.reload();
      }, 1500);
    } catch (error) {
      console.error('Error:', error);
      mostrarMensaje('Error: ' + error.message, 'error');
    }
  }

  async aprobarEventoModal() {
    if (this.eventoActualModal) {
      await this.aprobarEvento(this.eventoActualModal.id);
    }
  }

  abrirRechazar(eventoId) {
    this.eventosAprobar = eventoId || (this.eventoActualModal ? this.eventoActualModal.id : null);
    document.getElementById('razon-rechazo').value = '';
    document.getElementById('modal-evento-preview').style.display = 'none';
    document.getElementById('modal-rechazar').style.display = 'flex';
  }

  async confirmarRechazo() {
    const razon = document.getElementById('razon-rechazo').value.trim();

    if (!razon) {
      mostrarMensaje('Por favor ingresa una razón para rechazar el evento', 'error');
      return;
    }

    const confirmado = await window.confirmarAccion(
      '¿Confirmar rechazo?',
      'Se enviará el motivo del rechazo al usuario y el evento dejará de estar pendiente.',
      'Rechazar',
      'confirm-btn-danger'
    );

    if (!confirmado) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/admin/eventos-pendientes/${this.eventosAprobar}/rechazar`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ razonRechazo: razon })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Error al rechazar evento');
      }

      mostrarMensaje('✓ Evento rechazado. Email enviado al usuario con la razón.', 'success');
      
      // Cerrar tanto el modal de rechazo como la vista previa si estaba abierta
      cerrarModalRechazo();
      cerrarModalPreview();
      this.cargarEventos();

      // Recargar la página después de un momento para actualizar contadores globales
      setTimeout(() => {
        location.reload();
      }, 1500);
    } catch (error) {
      console.error('Error:', error);
      mostrarMensaje('Error: ' + error.message, 'error');
    }
  }

  irPaginaAnterior() {
    if (this.paginaActual > 1) {
      this.paginaActual--;
      this.renderizarTabla();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  irPaginaSiguiente() {
    const totalPaginas = Math.ceil(this.eventosFiltrados.length / this.eventosPerPagina);
    if (this.paginaActual < totalPaginas) {
      this.paginaActual++;
      this.renderizarTabla();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  async actualizarContador() {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/admin/eventos-pendientes-stats', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        const badge = document.getElementById('badge-pendientes');
        if (data.pendiente > 0) {
          badge.textContent = data.pendiente;
          badge.style.display = 'inline-block';
        } else {
          badge.style.display = 'none';
        }
      }
    } catch (error) {
      console.error('Error al cargar contador:', error);
    }
  }

  escapeHtml(texto) {
    if (!texto) return '';
    const div = document.createElement('div');
    div.textContent = texto;
    return div.innerHTML;
  }
}

// Funciones globales para callbacks
function cerrarModalPreview() {
  document.getElementById('modal-evento-preview').style.display = 'none';
  document.getElementById('modal-rechazar').style.display = 'none';
}

function cerrarModalRechazo() {
  document.getElementById('modal-rechazar').style.display = 'none';
}

function abrirModalRechazo() {
  document.getElementById('modal-evento-preview').style.display = 'none';
  document.getElementById('modal-rechazar').style.display = 'flex';
  document.getElementById('razon-rechazo').value = '';
}

// Global instance
let admin;

document.addEventListener('DOMContentLoaded', () => {
  admin = new AdminEventosPendientes();
});
