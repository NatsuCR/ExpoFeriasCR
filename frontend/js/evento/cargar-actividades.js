// cargarActividades.js
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

export async function cargarActividades(slug) {
    const container = document.getElementById('actividadesGrid');
    if (!container) return;

    try {
        const res = await fetch(`/api/actividades/${slug}`);
        const actividades = await res.json();

        if (actividades.length === 0) {
            container.innerHTML = '<p>No hay actividades registradas.</p>';
            return;
        }

        let html = '';
        actividades.forEach(a => {
            const imagenes = parseImagenes(a.imagen);
            const imagenesLimpias = imagenes.map(u => u.replace(/\\/g, '/'));

            const fecha       = new Date(a.fecha).toLocaleDateString();
            const hora        = a.hora ? a.hora.slice(0, 5) : '';
            const lugar       = a.lugar || 'Campo ferial';
            const descripcion = a.descripcion || '';

            const requiereOnline = a.requiereEntradaOnline === 1 || a.requiereEntradaOnline === true;
            const enlaceVenta    = a.enlaceVenta;
            const esGratis       = a.esGratis === 1 || a.esGratis === true;

            let linkHtml = '';
            if (requiereOnline && enlaceVenta) {
                linkHtml = `<p><i class="fas fa-ticket-alt"></i> <a href="${enlaceVenta}" target="_blank">Comprar entrada</a></p>`;
            } else if (requiereOnline && !enlaceVenta) {
                linkHtml = `<p><i class="fas fa-ticket-alt"></i> Entrada online (enlace no disponible)</p>`;
            }

            const gratisHtml = esGratis ? '<p><strong>Evento gratuito</strong></p>' : '';

            html += `
    <div class="actividad-card">
        ${buildMiniCarrusel(imagenesLimpias, a.titulo)}
        <h3>${a.titulo}</h3>
        <p><i class="fas fa-calendar-day"></i> ${fecha} ${hora}</p>
        <p><i class="fas fa-map-pin"></i> ${lugar}</p>
        ${typeof window.formatDescription === 'function' ? window.formatDescription(descripcion) : `<p class="descripcion-texto">${descripcion}</p>`}
        ${linkHtml}
        ${gratisHtml}
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

        const carruselControl = initResponsiveCarousel('actividadesWrapper', 'actividadesGrid', 'actividadesPrev', 'actividadesNext', 280, 10000);

        container.querySelectorAll('.btn-ver-mas, .btn-ver-menos').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const card = btn.closest('.actividad-card');
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
        container.innerHTML = '<p>Error al cargar actividades.</p>';
    }
}