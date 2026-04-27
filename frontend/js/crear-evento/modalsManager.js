/**
 * modalsManager.js - Orquestador de todos los modales del formulario
 */
import * as precios from './modals-precios.js';
import * as actividades from './modals-actividades.js';
import * as expositores from './modals-expositores.js';
import * as galeria from './modals-galeria.js';

let onModalConfirmadoCallback = null;

export function registrarOnModalConfirmado(callback) {
  onModalConfirmadoCallback = callback;
}

function notificarConfirmacion() {
  if (onModalConfirmadoCallback) onModalConfirmadoCallback();
}

// Precios
export const abrirModalPrecio = precios.abrirModalPrecio;
export const cerrarModalPrecio = precios.cerrarModalPrecio;
export const agregarPrecioDelModal = () => precios.agregarPrecioDelModal(notificarConfirmacion);
export const crearFilaPrecio = precios.crearFilaPrecio;
export const duplicarUltimoPrecio = () => precios.duplicarUltimoPrecio(notificarConfirmacion);
export const duplicarMismaFecha = () => precios.duplicarMismaFecha(notificarConfirmacion);

// Actividades
export const abrirModalActividad = actividades.abrirModalActividad;
export const cerrarModalActividad = actividades.cerrarModalActividad;
export const agregarActividadDelModal = () => actividades.agregarActividadDelModal(notificarConfirmacion);
export const addActividadImageRow = actividades.addActividadImageRow;
export const crearFilaActividad = actividades.crearFilaActividad;

// Expositores
export const abrirModalExpositor = expositores.abrirModalExpositor;
export const cerrarModalExpositor = expositores.cerrarModalExpositor;
export const agregarExpositorDelModal = () => expositores.agregarExpositorDelModal(notificarConfirmacion);
export const editarExpositor = expositores.editarExpositor;
export const addExpositorImageRow = expositores.addExpositorImageRow;
export const crearFilaExpositor = expositores.crearFilaExpositor;

// Galería
export const abrirModalImagen = galeria.abrirModalImagen;
export const cerrarModalImagen = galeria.cerrarModalImagen;
export const agregarImagenDelModal = () => galeria.agregarImagenDelModal(notificarConfirmacion);
export const addPendingImage = galeria.addPendingImage;
export const addGalleryRow = galeria.addGalleryRow;

export function setupAllModals() {
  actividades.setupActividadUploads();
  expositores.setupExpositorUploads();
}



