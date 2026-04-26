/**
 * admin-preview.js - Orquestador de vista previa
 */

import { construirDatosPreview } from './preview-collector.js';
import * as renderer from './preview-renderer.js';

let previewAbierto = true;
let previewSlug = null;
let previewTimer = null;

const getSlug = () => document.getElementById('slug')?.value.trim();
const getIframe = () => document.getElementById('previewIframe');

function recargarPreview() {
    const datos = construirDatosPreview();
    const key = 'preview_admin_' + Date.now();
    localStorage.setItem(key, JSON.stringify(datos));
    const iframe = getIframe();
    if (iframe) iframe.src = `/evento.html?preview=1&dataKey=${key}`;
    previewSlug = getSlug();
}

function programarRecarga() {
    clearTimeout(previewTimer);
    previewTimer = setTimeout(() => {
        if (getSlug() !== previewSlug) {
            recargarPreview();
        } else {
            const iframe = getIframe();
            if (iframe?.contentDocument) renderer.aplicarCambiosEnVivo(iframe.contentDocument);
        }
    }, 400);
}

export function initPreview() {
    const iframe = getIframe();
    if (iframe) {
        iframe.addEventListener('load', () => {
            const doc = iframe.contentDocument;
            renderer.aplicarCambiosEnVivo(doc);
            renderer.renderizarSecciones(doc, construirDatosPreview());
        });
    }

    document.querySelectorAll('#formBasicos input, #formBasicos textarea')
        .forEach(el => el.addEventListener('input', programarRecarga));

    document.getElementById('btnTogglePreview')?.addEventListener('click', togglePreview);
}

function togglePreview() {
    previewAbierto = !previewAbierto;
    const panel = document.getElementById('previewPanel');
    if (panel) panel.style.display = previewAbierto ? 'flex' : 'none';
    if (previewAbierto) recargarPreview();
}

document.addEventListener('DOMContentLoaded', initPreview);


