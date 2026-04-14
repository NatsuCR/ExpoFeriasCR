// cargarExpositores.js
import { initResponsiveCarousel } from './carrusel.js';
import { initLightbox, abrirLightbox } from './lightbox.js';

function parseImagenes(valor) {
    if (!valor) return [];
    try {
        const parsed = JSON.parse(valor);
        if (Array.isArray(parsed)) return parsed.filter(Boolean);
    } catch (_) {}
    return valor.trim() ? [valor.trim()] : [];
}

function buildMiniCarrusel(imagenes, altText) {
    if (imagenes.length === 0) return '';
    if (imagenes.length === 1) {
        return `<img src="${imagenes[0]}" alt="${altText}" class="card-img-principal">`;
    }
    const slides = imagenes.map((url, i) =>
        `<div class="mini-slide${i === 0 ? ' activa' : ''}">
            <img src="${url}" alt="${altText} ${i + 1}">
        </div>`
    ).join('');
    return `
        <div class="mini-carrusel">
            <div class="mini-carrusel-track">${slides}</div>
            <button class="mini-btn mini-prev" aria-label="Anterior">&#8249;</button>
            <button class="mini-btn mini-next" aria-label="Siguiente">&#8250;</button>
            <div class="mini-dots">
                ${imagenes.map((_, i) => `<span class="mini-dot${i === 0 ? ' activo' : ''}"></span>`).join('')}
            </div>
        </div>`;
}

function initMiniCarruseles() {
    document.querySelectorAll('.mini-carrusel').forEach(carrusel => {
        const slides = carrusel.querySelectorAll('.mini-slide');
        const dots   = carrusel.querySelectorAll('.mini-dot');
        let idx = 0;

        function ir(n) {
            slides[idx].classList.remove('activa');
            dots[idx].classList.remove('activo');
            idx = (n + slides.length) % slides.length;
            slides[idx].classList.add('activa');
            dots[idx].classList.add('activo');
        }

        carrusel.querySelector('.mini-prev').addEventListener('click', (e) => {
            e.stopPropagation();
            ir(idx - 1);
        });
        carrusel.querySelector('.mini-next').addEventListener('click', (e) => {
            e.stopPropagation();
            ir(idx + 1);
        });
        dots.forEach((dot, i) => dot.addEventListener('click', (e) => {
            e.stopPropagation();
            ir(i);
        }));
    });
}

export async function cargarExpositores(slug) {
    const container = document.getElementById('expositoresGrid');
    if (!container) return;

    try {
        const res = await fetch(`/api/expositores/${slug}`);
        const expositores = await res.json();

        if (expositores.length === 0) {
            container.innerHTML = '<p>No hay expositores registrados.</p>';
            return;
        }

        let html = '';
        expositores.forEach(e => {
            const imagenes        = parseImagenes(e.imagenLogo);
            const imagenesLimpias = imagenes.map(u => u.replace(/\\/g, '/'));
            const descripcion     = e.descripcion || '';
            const videoHtml       = e.videoUrl
                ? `<video controls src="${e.videoUrl}" style="width:100%; max-height:200px; margin-top:1rem;"></video>`
                : '';

            html += `
        <div class="expositor-card">
            ${buildMiniCarrusel(imagenesLimpias, e.nombre)}
            <h3>${e.nombre}</h3>
            <p><strong>Rubro:</strong> ${e.rubro}</p>
            ${typeof window.formatDescription === 'function' ? window.formatDescription(descripcion) : `<p class="descripcion-texto">${descripcion}</p>`}
            <p><strong>Ubicación:</strong> ${e.ubicacion || 'Por definir'}</p>
            <p><a href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(e.nombre + ' Costa Rica')}" target="_blank" class="enlace-localidades" style="color: var(--evento-secundario, #0033A0); font-weight: bold; text-decoration: none; display: inline-flex; align-items: center; gap: 5px; margin-top: 5px;"><i class="fas fa-map-marker-alt"></i> Localidades</a></p>
            ${videoHtml}
        </div>`;
        });

        container.innerHTML = html;
        initLightbox();
        initMiniCarruseles();

        // Clic en imágenes → lightbox
        container.querySelectorAll('.card-img-principal').forEach(img => {
            img.addEventListener('click', (e) => {
                e.stopPropagation();
                abrirLightbox(img.src, img.alt);
            });
        });
        container.querySelectorAll('.mini-carrusel').forEach(carrusel => {
            carrusel.addEventListener('click', (e) => {
                if (e.target.closest('.mini-btn') || e.target.closest('.mini-dots')) return;
                const slideActiva = carrusel.querySelector('.mini-slide.activa img');
                if (slideActiva) {
                    e.stopPropagation();
                    abrirLightbox(slideActiva.src, slideActiva.alt);
                }
            });
        });

        const carruselControl = initResponsiveCarousel('expositoresWrapper', 'expositoresGrid', 'expositoresPrev', 'expositoresNext', 280, 10000);

        container.querySelectorAll('.btn-ver-mas, .btn-ver-menos').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const card = btn.closest('.expositor-card');
                setTimeout(() => {
                    if (card && card.querySelector('.desc-full').style.display === 'block') {
                        carruselControl.detener();
                    } else {
                        carruselControl.reanudar();
                    }
                }, 0);
            });
        });
    } catch (err) {
        console.error(err);
        container.innerHTML = '<p>Error al cargar expositores.</p>';
    }
}