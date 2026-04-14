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
      alert('Acceso denegado. Se requieren permisos de administrador');
      window.location.href = '/admin/login.html';
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
      alert('Error al cargar eventos: ' + error.message);
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
      rechazado: '✕'
    };

    const textos = {
      pendiente: 'Pendiente',
      aprobado: 'Aprobado',
      rechazado: 'Rechazado'
    };

    return `<span class="estado-badge ${estado}">${iconos[estado]} ${textos[estado]}</span>`;
  }

  async verEvento(eventoId) {
    try {
      const evento = this.eventos.find(e => e.id === eventoId);
      if (!evento) {
        alert('Evento no encontrado');
        return;
      }

      // Fetch full event info to show everything including carousels and images
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/admin/eventos-pendientes/${eventoId}`, {
         headers: { 'Authorization': `Bearer ${token}` }
      });
      if(res.ok) {
          const fullData = await res.json();
          // Combinar datos basicos con las colecciones y extras
          Object.assign(evento, fullData);
      }

      // Guardar datos del evento en localStorage con una clave única
      const datosPreview = {
        nombre: evento.nombre,
        descripcion: evento.descripcion,
        fecha_inicio: evento.fecha_inicio,
        fecha_fin: evento.fecha_fin,
        ubicacion: evento.ubicacion,
        provincia: evento.provincia,
        imagen_portada: evento.imagen_portada,
        mapa_embed: evento.mapa_embed,
        color_primario: evento.color_primario || '#8b5a2b',
        color_secundario: evento.color_secundario || '#d4a373',
        color_fondo: evento.color_fondo || '#f4e4c1',
        color_texto: evento.color_texto || '#2c1a0e',
        color_titulo_hero: evento.color_titulo_hero || '#ffffff',
        color_descripcion_hero: evento.color_descripcion_hero || '#ffffff',
        color_fondo_fechas: evento.color_fondo_fechas || '#d4a373',
        color_texto_fechas: evento.color_texto_fechas || '#8b5a2b',
        color_hero_overlay: evento.color_hero_overlay || '',
        color_titulo_seccion: evento.color_titulo_seccion || '',
        color_menu_texto: evento.color_menu_texto || '',
        color_menu_fondo: evento.color_menu_fondo || '',
        color_fondo_footer: evento.color_fondo_footer || '',
        color_texto_footer: evento.color_texto_footer || '',
        color_fondo_contacto: evento.color_fondo_contacto || '',
        color_texto_contacto: evento.color_texto_contacto || '',
        precios: evento.precios || [],
        actividades: evento.actividades || [],
        expositores: evento.expositores || [],
        galeria: evento.galeria || []
      };
      
      const dataKey = 'preview_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      localStorage.setItem(dataKey, JSON.stringify(datosPreview));

      const formatDate = (dateStr) => {
        if (!dateStr) return '';
        const d = new Date(dateStr + 'T12:00:00');
        return d.toLocaleDateString();
      };

      const buildCard = (isLive) => {
        const liveBadge = isLive ? `<div class="live-badge" style="position:absolute; top:10px; right:10px; background:#e74c3c; color:white; padding:4px 8px; border-radius:4px; font-weight:bold; font-size:12px; z-index:10;">🔴 EN VIVO</div>` : '';
        return `
          <div style="position:relative; width:280px; border:1px solid #ddd; border-radius:8px; overflow:hidden; background:white; text-align:left;">
            ${liveBadge}
            <img src="${evento.imagen_portada || '/assets/images/default-feria.jpg'}" alt="${this.escapeHtml(evento.nombre)}" style="width:100%; height:180px; object-fit:cover; border-bottom:1px solid #eee;">
            <div style="padding:15px;">
              <h3 style="margin:0 0 10px; font-size:18px; color:#333;">${this.escapeHtml(evento.nombre)}</h3>
              <p style="margin:5px 0; color:#666; font-size:14px;">${formatDate(evento.fecha_inicio)} - ${formatDate(evento.fecha_fin)}</p>
              <p style="margin:5px 0 15px; color:#666; font-size:14px;">${this.escapeHtml(evento.ubicacion)}</p>
              <button type="button" class="btn-primary" style="width:100%; padding:8px; border:none; background:#0033A0; color:white; border-radius:4px; font-size:14px; cursor:pointer;">Ver más</button>
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
              <h4>Simulación Portada (Index)</h4>
              <div style="display:flex; gap:10px; flex-wrap:wrap; margin-top:10px;">
                <div style="flex:1;">
                   <h5 style="margin-bottom:5px;">Normal / Hoy</h5>
                   ${buildCard(false)}
                </div>
                <div style="flex:1;">
                   <h5 style="margin-bottom:5px;">En Vivo</h5>
                   ${buildCard(true)}
                </div>
                <div style="flex:1;">
                   <h5 style="margin-bottom:5px;">Próximos Eventos</h5>
                   ${buildCard(false)}
                </div>
              </div>
            </div>
          </div>
          <iframe src="/evento.html?preview=1&dataKey=${dataKey}" class="evento-preview-iframe" allowfullscreen style="flex:2; min-width:360px;"></iframe>
        </div>
      `;

      document.getElementById('evento-preview-contenido').innerHTML = html;

      // Mostrar/ocultar botones según estado
      document.getElementById('btn-modal-aprobar').style.display = evento.estado === 'pendiente' ? 'block' : 'none';
      document.getElementById('btn-modal-rechazar').style.display = evento.estado === 'pendiente' ? 'block' : 'none';

      document.getElementById('modal-evento-preview').style.display = 'flex';
    } catch (error) {
      console.error('Error:', error);
      alert('Error al cargar evento: ' + error.message);
    }
  }

  async aprobarEvento(eventoId) {
    if (!confirm('¿Estás seguro de que deseas aprobar este evento?')) return;

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

      alert('✓ Evento aprobado exitosamente. Email enviado al usuario.');
      cerrarModalPreview();
      this.cargarEventos();
    } catch (error) {
      console.error('Error:', error);
      alert('Error: ' + error.message);
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
      alert('Por favor ingresa una razón para rechazar el evento');
      return;
    }

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

      alert('✓ Evento rechazado. Email enviado al usuario con la razón.');
      cerrarModalRechazo();
      this.cargarEventos();
    } catch (error) {
      console.error('Error:', error);
      alert('Error: ' + error.message);
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
