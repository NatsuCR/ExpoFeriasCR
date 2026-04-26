// cargarExpositores.js
import { initResponsiveCarousel } from './carrusel.js';
import { initLightbox, abrirLightbox } from './lightbox.js';

const ORDEN_CATEGORIAS = [
    'Toldos',
    'Comidas y Bebidas',
    'Bar',
    'Chinamos',
    'Moda',
    'Artesanía',
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
    if (Array.isArray(valor)) return valor.filter(Boolean);
    if (typeof valor !== 'string') return [];
    let trimmed = valor.trim();
    if (!trimmed) return [];
    if (trimmed.startsWith('[')) {
        try {
            const parsed = JSON.parse(trimmed);
            if (Array.isArray(parsed)) return parsed.filter(Boolean);
        } catch (_) {
            trimmed = trimmed.replace(/^\[/, '').replace(/\]$/, '');
        }
    }
    return trimmed.split(',')
        .map(s => s.trim().replace(/^["']/, '').replace(/["']$/, '').trim())
        .filter(s => s && s !== '[' && s !== ']');
}

function buildMiniCarrusel(imagenes, altText) {
    if (imagenes.length === 0) return '<div class="placeholder-img" style="height:220px; background:#f0f0f0; border-radius:8px;"></div>';
    if (imagenes.length === 1) {
        return `<img src="${imagenes[0]}" alt="${altText}" class="card-img-principal" style="object-fit:cover; width:100%; border-radius:8px;" loading="lazy">`;
    }
    const slides = imagenes.map((url, i) =>
        `<div class="mini-slide${i === 0 ? ' activa' : ''}">
            <img src="${url}" alt="${altText} ${i + 1}" style="object-fit:cover; width:100%; border-radius:8px;" loading="lazy">
        </div>`
    ).join('');
    return `
        <div class="mini-carrusel">
            <div class="mini-carrusel-track">${slides}</div>
            <button class="mini-btn mini-prev" style="display: ${imagenes.length > 1 ? 'flex' : 'none'}" aria-label="Anterior">❮</button>
            <button class="mini-btn mini-next" style="display: ${imagenes.length > 1 ? 'flex' : 'none'}" aria-label="Siguiente">❯</button>
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
            
            const imgNodes = Array.from(carrusel.querySelectorAll('.mini-slide img'));
            const slides = Array.from(carrusel.querySelectorAll('.mini-slide'));
            const activeSlide = carrusel.querySelector('.mini-slide.activa');
            const activeIdx = slides.indexOf(activeSlide);

            if (activeIdx !== -1) {
                e.stopPropagation();
                const galleryData = imgNodes.map(node => ({
                    src: node.src,
                    alt: node.alt
                }));
                abrirLightbox(galleryData, activeIdx);
            }
        });
    });

    // Lightbox imágenes simples
    container.querySelectorAll('.card-img-principal').forEach(img => {
        img.addEventListener('click', () => abrirLightbox(img.src, img.alt));
    });

    // Toggle descripción (ELIMINADO: ahora se maneja vía onclick centralizado en helpers.js)

    // Toggle video
    container.querySelectorAll('.btn-toggle-video').forEach(btn => {
        btn.addEventListener('click', () => {
            const wrapper = btn.closest('.expositor-video-wrapper');
            const container = wrapper.querySelector('.video-container');
            const isHidden = container.style.display === 'none';

            if (isHidden) {
                container.style.display = 'block';
                btn.innerHTML = 'Ocultar video';
                btn.classList.add('btn-ver-menos');
            } else {
                container.style.display = 'none';
                btn.innerHTML = '<i class="fas fa-play-circle"></i> Ver video';
                btn.classList.remove('btn-ver-menos');
                // Pausar video si es local
                const videoTag = container.querySelector('video');
                if (videoTag) videoTag.pause();
            }
        });
    });
}

export function renderExpositores(lista) {
    const container = document.getElementById('expositoresDinamicContainer');
    if (!container) return;

    const searchContainer = document.getElementById('expositorSearchContainer');
    if (lista.length === 0) {
        if (searchContainer) searchContainer.style.display = 'none';
        container.innerHTML = '<div class="no-results" style="text-align:center; padding:40px; color:#666;">No se encontraron expositores que coincidan con tu búsqueda.</div>';
        return;
    }

    // Mostrar buscador si hay datos
    if (searchContainer) {
        searchContainer.style.display = 'flex';
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

    // Inicializar carruseles para cada categoría renderizada
    const todasLasCategorias = [...ORDEN_CATEGORIAS, ...Object.keys(grupos)];
    todasLasCategorias.forEach(cat => {
        const catId = slugify(cat);
        const wrapper = document.getElementById(`wrapper-${catId}`);
        if (wrapper) {
            initResponsiveCarousel(`wrapper-${catId}`, `track-${catId}`, `prev-${catId}`, `next-${catId}`, 300);
        }
    });

    initCardListeners(container);
    initLightbox();
}

/**
 * Función para generar IDs seguros (sin acentos ni espacios)
 */
function slugify(text) {
    if (!text) return 'sin-categoria';
    return text.toString().toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/\s+/g, '-')
        .replace(/[^\w-]+/g, '')
        .replace(/--+/g, '-')
        .replace(/^-+/, '')
        .replace(/-+$/, '');
}

/**
 * Función auxiliar para generar el bloque HTML de una categoría
 */
function generarHTMLCategoria(cat, expositores) {
    const catId = slugify(cat);
    return `
        <div class="categoria-grupo" id="grupo-${catId}">
            <h3 class="categoria-titulo">${cat} <span style="font-size: 1rem; font-family: sans-serif; opacity: 0.6;">(${expositores.length})</span></h3>
            <div class="expositores-carrusel-wrapper" id="wrapper-${catId}">
                <button class="expositores-btn prev" id="prev-${catId}">❮</button>
                <div class="expositores-carrusel-viewport">
                    <div class="expositores-carrusel-track" id="track-${catId}">
                        ${expositores.map(e => {
        const imagenes = parseImagenes(e.logo || e.imagen_logo || e.imagenLogo);
        const imagenesLimpias = imagenes
            .filter(u => typeof u === 'string' && u.trim() !== '')
            .map(u => {
                let path = u.replace(/\\/g, '/');
                if (!path.startsWith('/') && !path.startsWith('http')) {
                    path = '/' + path;
                }
                return path;
            });
        const descripcion = e.descripcion || '';
        const shortDesc = descripcion.length > 100 ? descripcion.substring(0, 100) + '...' : descripcion;

        let videoHtml = '';
        const videoSrc = (e.video || e.video_url || e.videoUrl || '').trim();
        if (videoSrc) {
            let mediaContent = '';
            const isLocalVideo = videoSrc.match(/\.(mp4|webm|ogg|mov)(\?.*)?$/i) || videoSrc.startsWith('/assets/uploads/');
            if (isLocalVideo) {
                mediaContent = `<video src="${videoSrc}" controls style="width:100%; border-radius:12px; aspect-ratio:16/9; background:#000;"></video>`;
            } else {
                let embedUrl = videoSrc;
                if (videoSrc.includes('youtube.com/watch?v=')) {
                    embedUrl = videoSrc.replace('watch?v=', 'embed/');
                } else if (videoSrc.includes('youtu.be/')) {
                    embedUrl = videoSrc.replace('youtu.be/', 'youtube.com/embed/');
                }
                mediaContent = `<iframe src="${embedUrl}" frameborder="0" allowfullscreen style="width:100%; border-radius:12px; aspect-ratio:16/9;"></iframe>`;
            }

            videoHtml = `
                <div class="expositor-video-wrapper" style="margin-top:15px; text-align:center;">
                    <button type="button" class="btn-toggle-video btn-ver-mas">
                        <i class="fas fa-play-circle"></i> Ver video
                    </button>
                    <div class="video-container" style="display:none; margin-top:15px;">
                        ${mediaContent}
                    </div>
                </div>
            `;
        }

        return `
                                <div class="expositor-card">
                                    ${buildMiniCarrusel(imagenesLimpias, e.nombre)}
                                    <h3>${e.nombre}</h3>
                                    <p class="rubro-tag">${e.rubro || e.tipo_expositor || ''}</p>
                                    <div class="descripcion-contenedor">
                                        ${window.formatDescription(descripcion)}
                                    </div>
                                    ${videoHtml}
                                    <p class="info-ubicacion" style="text-align:center; margin-top:10px;"><strong>Ubicación:</strong> ${e.ubicacion || 'Por definir'}</p>
                                    <div style="text-align: center; width: 100%; margin-top: 10px;">
                                        <a href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(e.nombre)}" 
                                           target="_blank" class="enlace-localidades" style="display: inline-flex; justify-content: center;">
                                           <i class="fas fa-map-marker-alt"></i> Puntos de venta
                                        </a>
                                    </div>
                                </div>`;
    }).join('')}
                    </div>
                </div>
                <button class="expositores-btn next" id="next-${catId}">❯</button>
            </div>
        </div>`;
}

export async function cargarExpositores(slug) {
    const mainContainer = document.getElementById('expositores');
    if (!mainContainer) return;

    try {
        const res = await fetch(`/api/expositores/${slug}`);
        allExpositores = await res.json();

        // El buscador ahora se gestiona dentro de renderExpositores(lista)

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


