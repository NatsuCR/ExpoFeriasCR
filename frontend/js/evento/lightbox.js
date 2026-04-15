// lightbox.js — módulo compartido para expandir imágenes

let overlay = null;
let imgEl   = null;

function crearLightbox() {
    if (document.getElementById('lightboxOverlay')) return;

    overlay = document.createElement('div');
    overlay.id        = 'lightboxOverlay';
    overlay.className = 'lightbox-overlay';

    const cerrar = document.createElement('button');
    cerrar.className   = 'lightbox-cerrar';
    cerrar.innerHTML   = '&times;';
    cerrar.setAttribute('aria-label', 'Cerrar');

    imgEl = document.createElement('img');
    imgEl.className = 'lightbox-img';

    overlay.appendChild(cerrar);
    overlay.appendChild(imgEl);
    document.body.appendChild(overlay);

    // Cerrar al hacer clic en el fondo o en el botón ×
    cerrar.addEventListener('click', cerrarLightbox);
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) cerrarLightbox();
    });

    // Cerrar con Escape
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') cerrarLightbox();
    });
}

export function abrirLightbox(src, alt = '') {
    if (!overlay) crearLightbox();
    imgEl.src = src;
    imgEl.alt = alt;
    overlay.classList.add('abierto');
    document.body.style.overflow = 'hidden';
}

export function cerrarLightbox() {
    if (!overlay) return;
    overlay.classList.remove('abierto');
    document.body.style.overflow = '';
}

export function initLightbox() {
    crearLightbox();
}