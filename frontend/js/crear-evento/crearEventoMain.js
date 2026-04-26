/**
 * crearEventoMain.js
 * Clase principal para gestionar la creación de eventos (Orquestador)
 */

import { bindUpload, bindMultiUpload } from './uploadManager.js';
import {
  togglePreview, programarActualizacion, guardarDatosPreview, getIframe, actualizarUrlBar
} from './previewManager.js';
import {
  abrirModalPrecio, abrirModalActividad, abrirModalExpositor, abrirModalImagen, duplicarUltimoPrecio,
  setupAllModals, addGalleryRow, addPendingImage
} from './modalsManager.js';

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
    const user = JSON.parse(localStorage.getItem('usuario') || localStorage.getItem('user') || 'null');
    return user;
  }

  verificarAutenticacion() {
    if (!this.getUsuarioStorage()) {
      alert('Debes iniciar sesión.');
      window.location.href = '/index.html';
    }
  }

  async init() {
    this.setupEventListeners();
    this.setupLocationSelectors();
    this.setupUploads();
    setupAllModals();
    sliders.initOpacitySliders(this);
    if (this.eventoId) {
      await api.cargarEventoParaEdicion(this.eventoId, this);
    }
    this.setupDeviceToggles();
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
    document.getElementById('btn-agregar-precio')?.addEventListener('click', () => abrirModalPrecio());
    document.getElementById('btn-duplicar-precio')?.addEventListener('click', () => duplicarUltimoPrecio());
    document.getElementById('btn-agregar-actividad')?.addEventListener('click', abrirModalActividad);
    document.getElementById('btn-agregar-expositor')?.addEventListener('click', abrirModalExpositor);
    document.getElementById('btn-agregar-imagen')?.addEventListener('click', abrirModalImagen);
    document.getElementById('btnEliminarEvento')?.addEventListener('click', () => {
        if (this.eventoId) api.eliminarEvento(this.eventoId, this);
    });

    const btnSubmit = document.getElementById('btn-confirmar-cambios') || document.getElementById('btn-enviar-revision');
    btnSubmit?.addEventListener('click', () => api.handleSubmit(this));

    document.getElementById('btn-ir-cuenta')?.addEventListener('click', () => {
      const esAdmin = window.location.pathname.includes('/admin/');
      window.location.href = esAdmin ? '/admin/dashboard.html' : '/mi-cuenta.html';
    });
    
    document.getElementById('slug')?.addEventListener('input', actualizarUrlBar);
    this.initFormWatchers();
  }

  initFormWatchers() {
    const marcarDirty = () => { this.formDirty = true; };
    document.querySelectorAll('#form-crear-evento input, #form-crear-evento select, #form-crear-evento textarea').forEach(el => {
      el.addEventListener('input', () => {
        marcarDirty();
        this.syncVisibility();
        programarActualizacion();
      });
      el.addEventListener('change', () => { 
        marcarDirty(); 
        this.syncVisibility();
        programarActualizacion(); 
      });
    });
  }

  cambiarTab(index) {
    this.tabBtns.forEach((b, i) => b.classList.toggle('active', i === index));
    this.tabContents.forEach((c, i) => c.classList.toggle('active', i === index));
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    if (this.tabBtns[index]?.dataset.tab === 'vista-final') {
        const iframe = document.getElementById('finalPreviewIframe');
        if (iframe) {
            const dataKey = guardarDatosPreview();
            // Siempre forzamos la recarga o actualización
            if (!iframe.src.includes(`dataKey=${dataKey}`)) {
                iframe.src = `/evento.html?preview=1&dataKey=${dataKey}`;
            } else {
                // Si ya tiene el src, forzamos aplicación de cambios en vivo
                setTimeout(() => aplicarCambiosEnVivo(), 150);
            }
        }
    }
  }

  setupDeviceToggles() {
    const btns = document.querySelectorAll('.device-btn');
    const preview = document.getElementById('integratedPreview');
    if (!btns || !preview) return;

    btns.forEach(btn => {
      btn.onclick = () => {
        btns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const device = btn.dataset.device;
        if (device === 'mobile') {
          preview.classList.add('mobile');
          preview.classList.remove('pc');
        } else {
          preview.classList.remove('mobile');
          preview.classList.add('pc');
        }
      };
    });
  }

  irSiguienteTab() {
    const cur = Array.from(this.tabContents).indexOf(document.querySelector('.tab-content.active'));
    if (cur < this.tabContents.length - 1) this.cambiarTab(cur + 1);
  }

  irTabAnterior() {
    const cur = Array.from(this.tabContents).indexOf(document.querySelector('.tab-content.active'));
    if (cur > 0) this.cambiarTab(cur - 1);
  }

  setupUploads() {
    bindUpload('btn-subir-portada', 'archivo-portada', 'imagen_portada', 'feedback-portada', () => {
      programarActualizacion();
      if (window.mostrarAlertaPremium) {
        window.mostrarAlertaPremium('¡Imagen Lista!', 'La portada para la página principal se ha cargado correctamente.', 'Entendido', 'fas fa-check-circle');
      }
    });
    bindUpload('btn-subir-horario', 'archivo-horario', 'horario_imagen', 'feedback-horario', () => programarActualizacion());
    bindMultiUpload('btn-subir-galeria', 'archivo-imagen-galeria', 'feedback-galeria', (url) => addPendingImage(url));
  }

  // Delegaciones a otros módulos
  syncVisibility() { ui.syncVisibility(); }
  simularPortada() { ui.simularPortada(); }
  mostrarMensaje(t, tipo) { ui.mostrarMensaje(t, tipo); }
  mostrarModalExito(m) { ui.mostrarModalExito(m); }
  actualizarBotonSubmit() { ui.actualizarBotonSubmit(this.eventoId); }
  eliminarEvento(id) { api.eliminarEvento(id, this); }
  actualizarTodosLosSliders() { sliders.actualizarTodosLosSliders(); }

  setupLocationSelectors() {
    const provSelect = document.getElementById('provincia');
    const cantonSelect = document.getElementById('canton');
    const distritoSelect = document.getElementById('distrito');

    if (!provSelect || !cantonSelect || !distritoSelect) return;

    provSelect.addEventListener('change', () => {
      const prov = provSelect.value;
      cantonSelect.innerHTML = '<option value="">Selecciona el cantón</option>';
      distritoSelect.innerHTML = '<option value="">Selecciona el distrito</option>';
      
      if (prov && window.UBICACIONES_CR[prov]) {
        Object.keys(window.UBICACIONES_CR[prov]).forEach(canton => {
          const opt = document.createElement('option');
          opt.value = canton;
          opt.textContent = canton;
          cantonSelect.appendChild(opt);
        });
      }
      programarActualizacion();
    });

    cantonSelect.addEventListener('change', () => {
      const prov = provSelect.value;
      const canton = cantonSelect.value;
      distritoSelect.innerHTML = '<option value="">Selecciona el distrito</option>';
      
      if (prov && canton && window.UBICACIONES_CR[prov][canton]) {
        window.UBICACIONES_CR[prov][canton].forEach(distrito => {
          const opt = document.createElement('option');
          opt.value = distrito;
          opt.textContent = distrito;
          distritoSelect.appendChild(opt);
        });
      }
      programarActualizacion();
    });
    
    distritoSelect.addEventListener('change', () => {
      programarActualizacion();
    });
  }
}



