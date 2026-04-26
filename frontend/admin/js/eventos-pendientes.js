/**
 * admin-eventos-pendientes.js - Gestión de eventos pendientes
 */

import { verEvento as previewVerEvento } from './eventos-pendientes-preview.js';
import { aprobarEvento as actionAprobarEvento, confirmarRechazo as actionConfirmarRechazo } from './eventos-pendientes-actions.js';

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
    
    // Exponer funciones globales que el HTML llama directamente
    window.cerrarModalPreview = () => this.cerrarModalPreview();
    window.cerrarModalRechazo = () => this.cerrarModalRechazo();
  }

  verificarAutenticacion() {
    const usuario = JSON.parse(localStorage.getItem('usuario') || 'null');
    if (!usuario || usuario.rol !== 'admin') {
      window.location.href = '/admin/login.html';
    }
  }

  setupEventListeners() {
    document.getElementById('filtro-estado')?.addEventListener('change', () => this.aplicarFiltros());
    document.getElementById('filtro-buscar')?.addEventListener('input', () => this.aplicarFiltros());
    document.getElementById('btn-pagina-anterior')?.addEventListener('click', () => this.irPaginaAnterior());
    document.getElementById('btn-pagina-siguiente')?.addEventListener('click', () => this.irPaginaSiguiente());
  }

  async cargarEventos() {
    const msgCargando = document.getElementById('mensaje-cargando');
    const tabla = document.getElementById('tabla-eventos');
    const msgVacio = document.getElementById('mensaje-vacio');
    
    if (msgCargando) msgCargando.style.display = 'block';
    if (tabla) tabla.style.display = 'none';
    if (msgVacio) msgVacio.style.display = 'none';

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/admin/eventos-pendientes', { headers: { 'Authorization': `Bearer ${token}` } });
      const data = await response.json();
      this.eventos = data.eventos || [];
      this.eventosFiltrados = [...this.eventos];
      this.renderizarTabla();
    } catch (error) {
      console.error('Error:', error);
      if (msgCargando) msgCargando.style.display = 'none';
    }
  }

  aplicarFiltros() {
    const estado = document.getElementById('filtro-estado').value;
    const buscar = document.getElementById('filtro-buscar').value.toLowerCase();
    this.eventosFiltrados = this.eventos.filter(e => (!estado || e.estado === estado) && (!buscar || e.nombre.toLowerCase().includes(buscar)));
    this.paginaActual = 1;
    this.renderizarTabla();
  }

  renderizarTabla() {
    const tbody = document.getElementById('eventos-tbody');
    const msgCargando = document.getElementById('mensaje-cargando');
    const tabla = document.getElementById('tabla-eventos');
    const msgVacio = document.getElementById('mensaje-vacio');
    const paginacion = document.getElementById('paginacion-container');

    if (msgCargando) msgCargando.style.display = 'none';

    if (!tbody) return;
    tbody.innerHTML = '';

    if (this.eventosFiltrados.length === 0) {
      if (tabla) tabla.style.display = 'none';
      if (msgVacio) msgVacio.style.display = 'block';
      if (paginacion) paginacion.style.display = 'none';
      return;
    }

    if (tabla) tabla.style.display = 'table';
    if (msgVacio) msgVacio.style.display = 'none';

    const inicio = (this.paginaActual - 1) * this.eventosPerPagina;
    const eventosPagina = this.eventosFiltrados.slice(inicio, inicio + this.eventosPerPagina);

    eventosPagina.forEach(e => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td><strong>${this.escapeHtml(e.usuario_nombre || 'Usuario')}</strong></td>
        <td>${this.escapeHtml(e.nombre)}</td>
        <td>${new Date(e.created_at).toLocaleDateString()}</td>
        <td>${this.getEstadoBadge(e.estado)}</td>
        <td>
          <div class="acciones-cell">
            <button class="btn-accion btn-ver" onclick="admin.verEvento(${e.id})" title="Ver detalles"><i class="fas fa-eye"></i> Ver</button>
            <button class="btn-accion btn-aprobar" onclick="admin.aprobarEvento(${e.id})" title="Aprobar"><i class="fas fa-check"></i> Aprobar</button>
            <button class="btn-accion btn-rechazar" onclick="admin.abrirRechazar(${e.id})" title="Rechazar"><i class="fas fa-times"></i> Rechazar</button>
          </div>
        </td>
      `;
      tbody.appendChild(row);
    });

    // Actualizar Paginación
    const totalPaginas = Math.ceil(this.eventosFiltrados.length / this.eventosPerPagina);
    if (paginacion) {
        paginacion.style.display = totalPaginas > 1 ? 'flex' : 'none';
        const infoPagina = document.getElementById('info-pagina');
        if (infoPagina) infoPagina.textContent = `Página ${this.paginaActual} de ${totalPaginas}`;
    }
  }

  getEstadoBadge(estado) {
    const configs = {
      pendiente: { texto: 'Pendiente', emoji: '⌛' },
      aprobado: { texto: 'Aprobado', emoji: '✅' },
      rechazado: { texto: 'Rechazado', emoji: '❌' },
      edicion_pendiente: { texto: 'Actualización', emoji: '🔄' }
    };
    const config = configs[estado] || { texto: estado, emoji: '❓' };
    return `<span class="estado-badge ${estado}"><span>${config.emoji}</span> <span>${config.texto}</span></span>`;
  }

  // Delegaciones
  verEvento(id) { previewVerEvento(id, this); }
  aprobarEvento(id) { actionAprobarEvento(id, this); }
  aprobarEventoModal() { 
    if (this.eventoActualModal) this.aprobarEvento(this.eventoActualModal.id);
  }
  abrirRechazar(id) { 
    this.eventosAprobar = id || this.eventoActualModal?.id;
    document.getElementById('modal-rechazar').style.display = 'flex'; 
  }
  confirmarRechazo() { actionConfirmarRechazo(this); }

  irPaginaAnterior() { if (this.paginaActual > 1) { this.paginaActual--; this.renderizarTabla(); } }
  irPaginaSiguiente() { if (this.paginaActual < Math.ceil(this.eventosFiltrados.length / this.eventosPerPagina)) { this.paginaActual++; this.renderizarTabla(); } }

  cerrarModalPreview() { document.getElementById('modal-evento-preview').style.display = 'none'; }
  cerrarModalRechazo() { document.getElementById('modal-rechazar').style.display = 'none'; }
  escapeHtml(t) { const d = document.createElement('div'); d.textContent = t; return d.innerHTML; }
}

window.admin = new AdminEventosPendientes();



