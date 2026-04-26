/**
 * form-main.js
 * Modular version of form-main (shares logic with crearEventoMain)
 */

import { togglePreview, programarActualizacion, guardarDatosPreview, getIframe, actualizarUrlBar } from './previewManager.js';
import { abrirModalPrecio, abrirModalActividad, abrirModalExpositor, abrirModalImagen } from './modalsManager.js';

import * as api from './crear-evento-api.js';
import * as ui from './crear-evento-ui.js';
import * as sliders from './crear-evento-sliders.js';

export class CrearEvento {
  constructor() {
    this.verificarAutenticacion();
    const params = new URLSearchParams(window.location.search);
    this.eventoId = params.get('id') || null;
    this.tabBtns = document.querySelectorAll('.tab-btn');
    this.tabContents = document.querySelectorAll('.tab-content');
    this.eventoEstado = null;
    this.formDirty = false;
    this.init();
  }

  getUsuarioStorage() {
    let uAdmin = JSON.parse(localStorage.getItem('user') || 'null');
    let uNormal = JSON.parse(localStorage.getItem('usuario') || 'null');
    return window.location.pathname.includes('/admin/') ? (uAdmin || uNormal) : (uNormal || uAdmin);
  }

  verificarAutenticacion() {
    if (!this.getUsuarioStorage()) {
      alert('Debes iniciar sesión.');
      window.location.href = '/index.html';
    }
  }

  async init() {
    this.setupEventListeners();
    if (this.eventoId) {
      await api.cargarEventoParaEdicion(this.eventoId, this);
    }
    this.syncVisibility();
    this.actualizarBotonSubmit();
  }

  setupEventListeners() {
    this.tabBtns.forEach((btn, i) => btn.addEventListener('click', () => this.cambiarTab(i)));
    document.querySelectorAll('.tab-next-btn').forEach(b => b.addEventListener('click', () => this.irSiguienteTab()));
    document.querySelectorAll('.tab-prev-btn').forEach(b => b.addEventListener('click', () => this.irTabAnterior()));

    document.getElementById('btn-volver-crear')?.addEventListener('click', () => {
      const esAdmin = window.location.pathname.includes('/admin/');
      window.location.href = esAdmin ? '/admin/dashboard.html' : '/mi-cuenta.html';
    });

    document.getElementById('btnTogglePreview')?.addEventListener('click', togglePreview);
    document.getElementById('btn-preview-portada')?.addEventListener('click', () => this.simularPortada());
    document.getElementById('btn-agregar-precio')?.addEventListener('click', abrirModalPrecio);
    document.getElementById('btn-agregar-actividad')?.addEventListener('click', abrirModalActividad);
    document.getElementById('btn-agregar-expositor')?.addEventListener('click', abrirModalExpositor);
    document.getElementById('btn-agregar-imagen')?.addEventListener('click', abrirModalImagen);

    const btnSubmit = document.getElementById('btn-confirmar-cambios') || document.getElementById('btn-enviar-revision');
    btnSubmit?.addEventListener('click', () => api.handleSubmit(this));
    
    document.getElementById('slug')?.addEventListener('input', actualizarUrlBar);
  }

  cambiarTab(index) {
    this.tabBtns.forEach((b, i) => b.classList.toggle('active', i === index));
    this.tabContents.forEach((c, i) => c.classList.toggle('active', i === index));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  irSiguienteTab() {
    const cur = Array.from(this.tabContents).indexOf(document.querySelector('.tab-content.active'));
    if (cur < this.tabContents.length - 1) this.cambiarTab(cur + 1);
  }

  irTabAnterior() {
    const cur = Array.from(this.tabContents).indexOf(document.querySelector('.tab-content.active'));
    if (cur > 0) this.cambiarTab(cur - 1);
  }

  syncVisibility() { ui.syncVisibility(); }
  simularPortada() { ui.simularPortada(); }
  mostrarMensaje(t, tipo) { ui.mostrarMensaje(t, tipo); }
  mostrarModalExito(m) { ui.mostrarModalExito(m); }
  actualizarBotonSubmit() { ui.actualizarBotonSubmit(this.eventoId); }
  actualizarTodosLosSliders() { sliders.actualizarTodosLosSliders(); }
}



