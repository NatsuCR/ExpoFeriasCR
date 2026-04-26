// lightbox.js — módulo compartido mejorado para galerías
let overlay = null;
let imgEl   = null;
let currentImages = [];
let currentIndex  = 0;
let btnPrev = null;
let btnNext = null;

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

    // Flechas de navegación
    btnPrev = document.createElement('button');
    btnPrev.className = 'lightbox-btn lightbox-prev';
    btnPrev.innerHTML = '❮';
    btnPrev.onclick = (e) => { e.stopPropagation(); navegar(-1); };

    btnNext = document.createElement('button');
    btnNext.className = 'lightbox-btn lightbox-next';
    btnNext.innerHTML = '❯';
    btnNext.onclick = (e) => { e.stopPropagation(); navegar(1); };

    overlay.appendChild(cerrar);
    overlay.appendChild(btnPrev);
    overlay.appendChild(imgEl);
    overlay.appendChild(btnNext);
    document.body.appendChild(overlay);

    // Cerrar al hacer clic en el fondo o en el botón ×
    cerrar.addEventListener('click', cerrarLightbox);
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) cerrarLightbox();
    });

    // Navegación con teclado
    document.addEventListener('keydown', (e) => {
        if (!overlay || !overlay.classList.contains('abierto')) return;
        if (e.key === 'Escape') cerrarLightbox();
        if (e.key === 'ArrowLeft') navegar(-1);
        if (e.key === 'ArrowRight') navegar(1);
    });
}

function navegar(sentido) {
    if (currentImages.length <= 1) return;
    currentIndex = (currentIndex + sentido + currentImages.length) % currentImages.length;
    actualizarVista();
}

function actualizarVista() {
    if (!imgEl) return;
    const item = currentImages[currentIndex];
    // item puede ser un string (URL) o un objeto {src, alt}
    const src = typeof item === 'string' ? item : item.src;
    const alt = typeof item === 'string' ? '' : (item.alt || '');
    
    imgEl.src = src;
    imgEl.alt = alt;

    // Mostrar/Ocultar flechas
    if (currentImages.length > 1) {
        btnPrev.style.display = 'flex';
        btnNext.style.display = 'flex';
    } else {
        btnPrev.style.display = 'none';
        btnNext.style.display = 'none';
    }
}

export function abrirLightbox(srcOrList, indexOrAlt = 0) {
    if (!overlay) crearLightbox();

    if (Array.isArray(srcOrList)) {
        currentImages = srcOrList;
        currentIndex  = typeof indexOrAlt === 'number' ? indexOrAlt : 0;
    } else {
        currentImages = [{ src: srcOrList, alt: indexOrAlt }];
        currentIndex  = 0;
    }

    actualizarVista();
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
    window.abrirLightbox = abrirLightbox;
}


