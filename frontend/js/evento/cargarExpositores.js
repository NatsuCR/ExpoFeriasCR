// cargarExpositores.js
import { initResponsiveCarousel } from './carrusel.js';
import { initLightbox, abrirLightbox } from './lightbox.js';

const ORDEN_CATEGORIAS = [
    'Toldos',
    'Comidas y Bebidas',
    'Bar',
    'Chinamos',
    'Moda',
    'Administración',
    'Tecnología',
    'Construcción',
    'Transporte',
    'Ganadería y Agricultura',
    'Juegos'
];

let allExpositores = [];
let carruselControls = [];

function parseImagenes(valor) {
    if (!valor) return [];
    try {
        const parsed = JSON.parse(valor);
        if (Array.isArray(parsed)) return parsed.filter(Boolean);
    } catch (_) { }
    return valor.trim() ? [valor.trim()] : [];
}

function buildMiniCarrusel(imagenes, altText) {
    if (imagenes.length === 0) return '<div class="placeholder-img" style="height:150px; background:#f0f0f0; border-radius:8px;"></div>';
    if (imagenes.length === 1) {
        return `<img src="${imagenes[0]}" alt="${altText}" class="card-img-principal" style="height:150px; object-fit:cover; width:100%; border-radius:8px;">`;
    }
    const slides = imagenes.map((url, i) =>
        `<div class="mini-slide${i === 0 ? ' activa' : ''}">
            <img src="${url}" alt="${altText} ${i + 1}" style="height:150px; object-fit:cover; width:100%; border-radius:8px;">
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

function initCardListeners(container) {
    // Mini-carruseles
    container.querySelectorAll('.mini-carrusel').forEach(carrusel => {
        const slides = carrusel.querySelectorAll('.mini-slide');
        const dots = carrusel.querySelectorAll('.mini-dot');
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

        // Lightbox desde mini-carrusel
        carrusel.addEventListener('click', (e) => {
            if (e.target.closest('.mini-btn') || e.target.closest('.mini-dots')) return;
            const img = carrusel.querySelector('.mini-slide.activa img');
            if (img) abrirLightbox(img.src, img.alt);
        });
    });

    // Lightbox imágenes simples
    container.querySelectorAll('.card-img-principal').forEach(img => {
        img.addEventListener('click', () => abrirLightbox(img.src, img.alt));
    });

    // Toggle descripción (usando el helper global de evento-main.js)
    container.querySelectorAll('.btn-ver-mas, .btn-toggle-desc').forEach(btn => {
        btn.addEventListener('click', () => {
            const card = btn.closest('.expositor-card');
            const full = card.querySelector('.desc-full');
            const short = card.querySelector('.desc-short');

            if (full.style.display === 'none') {
                full.style.display = 'block';
                short.style.display = 'none';
                btn.textContent = 'Ver menos';
            } else {
                full.style.display = 'none';
                short.style.display = '-webkit-box';
                btn.textContent = 'Ver más';
            }
        });
    });
}

export function renderExpositores(lista) {
    const container = document.getElementById('expositoresDinamicContainer');
    if (!container) return;

    if (lista.length === 0) {
        container.innerHTML = '<div class="no-results" style="text-align:center; padding:40px; color:#666;">No se encontraron expositores que coincidan con tu búsqueda.</div>';
        return;
    }

    // Agrupar por categoría
    const grupos = {};
    lista.forEach(exp => {
        const cat = exp.tipo_expositor || exp.rubro || 'Administración';
        if (!grupos[cat]) grupos[cat] = [];
        grupos[cat].push(exp);
    });

    let html = '';

    // 1. Renderizar categorías en el orden de prioridad definido
    ORDEN_CATEGORIAS.forEach((cat) => {
        if (!grupos[cat]) return;
        html += generarHTMLCategoria(cat, grupos[cat]);
        delete grupos[cat]; // Eliminar para no duplicar en el paso siguiente
    });

    // 2. Renderizar cualquier otra categoría que no estaba en la lista (para "si agrego más")
    Object.keys(grupos).forEach(cat => {
        html += generarHTMLCategoria(cat, grupos[cat]);
    });

    container.innerHTML = html;

    // Re-obtener todas las categorías renderizadas para inicializar carruseles
    const todasLasCategorias = [...ORDEN_CATEGORIAS, ...Object.keys(grupos)];

    todasLasCategorias.forEach(cat => {
        const catId = cat.toLowerCase().replace(/\s+/g, '-');
        const wrapper = document.getElementById(`wrapper-${catId}`);
        if (wrapper) {
            initResponsiveCarousel(`wrapper-${catId}`, `track-${catId}`, `prev-${catId}`, `next-${catId}`, 300);
        }
    });

    initCardListeners(container);
    initLightbox();
}

/**
 * Función auxiliar para generar el bloque HTML de una categoría
 */
function generarHTMLCategoria(cat, expositores) {
    const catId = cat.toLowerCase().replace(/\s+/g, '-');
    return `
        <div class="categoria-grupo" id="grupo-${catId}">
            <h3 class="categoria-titulo">${cat} <span style="font-size: 1rem; font-family: sans-serif; opacity: 0.6;">(${expositores.length})</span></h3>
            <div class="expositores-carrusel-wrapper" id="wrapper-${catId}">
                <button class="expositores-btn prev" id="prev-${catId}">&#10094;</button>
                <div class="expositores-carrusel-viewport">
                    <div class="expositores-carrusel-track" id="track-${catId}">
                        ${expositores.map(e => {
        const imagenes = parseImagenes(e.imagen_logo || e.imagenLogo);
        const imagenesLimpias = imagenes.map(u => u.replace(/\\/g, '/'));
        const descripcion = e.descripcion || '';
        const shortDesc = descripcion.length > 100 ? descripcion.substring(0, 100) + '...' : descripcion;

        return `
                                <div class="expositor-card">
                                    ${buildMiniCarrusel(imagenesLimpias, e.nombre)}
                                    <h3>${e.nombre}</h3>
                                    <div class="descripcion-contenedor">
                                        <p class="desc-texto desc-short recortada">${shortDesc}</p>
                                        <p class="desc-texto desc-full" style="display:none; white-space:pre-wrap;">${descripcion}</p>
                                        ${descripcion.length > 100 ? '<button class="btn-toggle-desc">Ver más</button>' : ''}
                                    </div>
                                    <p class="info-ubicacion"><strong>Ubicación:</strong> ${e.ubicacion || 'Por definir'}</p>
                                    <a href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(e.nombre + ' ' + (e.ubicacion || '') + ' Costa Rica')}" 
                                       target="_blank" class="enlace-localidades">
                                       <i class="fas fa-map-marker-alt"></i> Localidades en plano
                                    </a>
                                </div>`;
    }).join('')}
                    </div>
                </div>
                <button class="expositores-btn next" id="next-${catId}">&#10095;</button>
            </div>
        </div>`;
}

export async function cargarExpositores(slug) {
    const mainContainer = document.getElementById('expositores');
    if (!mainContainer) return;

    try {
        const res = await fetch(`/api/expositores/${slug}`);
        allExpositores = await res.json();

        // Mostrar buscador si hay datos
        const searchContainer = document.getElementById('expositorSearchContainer');
        if (allExpositores.length > 0 && searchContainer) {
            searchContainer.style.display = 'flex';

            // Aplicar color personalizado si existe
            const [eventoRows] = await fetch(`/api/eventos/${slug}`).then(r => r.json()).then(data => [data]);
            // Nota: El endpoint /api/eventos/:slug devuelve el objeto directamente usualmente
            const colorBuscador = allExpositores.length > 0 ? (window.colorBuscadorExpositores || '#ffffff') : '#ffffff';
            // Para obtener el color necesitamos el evento, pero cargarEvento ya lo hace.
            // Usaremos una variable global o la buscaremos en el DOM
            const searchBar = document.querySelector('.expositor-search-bar');
            if (searchBar && window.colorBuscadorExpositores) {
                searchBar.style.backgroundColor = window.colorBuscadorExpositores;
            }
        }

        renderExpositores(allExpositores);

        // Listener para el buscador
        const inputSearch = document.getElementById('expositorSearch');
        if (inputSearch) {
            inputSearch.addEventListener('input', (e) => {
                const term = e.target.value.toLowerCase();
                const filtrados = allExpositores.filter(exp =>
                    exp.nombre.toLowerCase().includes(term) ||
                    (exp.ubicacion || '').toLowerCase().includes(term)
                );
                renderExpositores(filtrados);
            });
        }

    } catch (err) {
        console.error('Error al cargar expositores:', err);
    }
}