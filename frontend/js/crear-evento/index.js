/**
 * index.js
 * Punto de entrada para crear-evento.html
 * Importa todos los módulos y configura globales
 */

import { CrearEvento } from './crearEventoMain.js';
import { subirImagen, bindUpload } from './uploadManager.js';
import {
  abrirModalPrecio, cerrarModalPrecio, agregarPrecioDelModal,
  abrirModalActividad, cerrarModalActividad, agregarActividadDelModal, addActividadImageRow,
  abrirModalExpositor, cerrarModalExpositor, agregarExpositorDelModal, addExpositorImageRow,
  abrirModalImagen, cerrarModalImagen, agregarImagenDelModal
} from './modalsManager.js';
import {
  togglePreview, programarActualizacion, guardarDatosPreview, getIframe, getSlug, actualizarUrlBar,
  abrirPreview, cerrarPreview, aplicarCambiosEnVivo
} from './previewManager.js';

// Hacer funciones globales accesibles desde inline HTML (onclick, etc)
window.subirImagen = subirImagen;
window.bindUpload = bindUpload;

window.abrirModalPrecio = abrirModalPrecio;
window.cerrarModalPrecio = cerrarModalPrecio;
window.agregarPrecioDelModal = agregarPrecioDelModal;

window.abrirModalActividad = abrirModalActividad;
window.cerrarModalActividad = cerrarModalActividad;
window.agregarActividadDelModal = agregarActividadDelModal;
window.addActividadImageRow = addActividadImageRow;

window.abrirModalExpositor = abrirModalExpositor;
window.cerrarModalExpositor = cerrarModalExpositor;
window.agregarExpositorDelModal = agregarExpositorDelModal;
window.addExpositorImageRow = addExpositorImageRow;

window.abrirModalImagen = abrirModalImagen;
window.cerrarModalImagen = cerrarModalImagen;
window.agregarImagenDelModal = agregarImagenDelModal;

window.togglePreview = togglePreview;
window.programarActualizacion = programarActualizacion;
window.guardarDatosPreview = guardarDatosPreview;
window.getIframe = getIframe;
window.getSlug = getSlug;
window.actualizarUrlBar = actualizarUrlBar;
window.abrirPreview = abrirPreview;
window.cerrarPreview = cerrarPreview;
window.aplicarCambiosEnVivo = aplicarCambiosEnVivo;

// Inicializar
let app;
document.addEventListener('DOMContentLoaded', () => {
  app = new CrearEvento();
});

// Listeners de colores
function initColorListeners() {
  const colorCampos = ['color_primario', 'color_secundario', 'color_fondo', 'color_titulo_hero', 'color_fondo_footer'];

  colorCampos.forEach(id => {
    const input = document.getElementById(id);
    const valueDisplay = document.getElementById(id + '_value');

    if (input && valueDisplay) {
      input.addEventListener('input', () => {
        valueDisplay.textContent = input.value;
        programarActualizacion();
      });
    }
  });
}

// Esperar a DOMContentLoaded antes de inicializar listeners de colores
document.addEventListener('DOMContentLoaded', initColorListeners);
