// evento-main.js (punto de entrada para evento.html)
import { cargarEvento } from './cargarEvento.js';
import { cargarActividades } from './cargarActividades.js';
import { cargarPrecios } from './cargarPrecios.js';
import { cargarExpositores, renderExpositores } from './cargarExpositores.js';
import { cargarCarruselFondo } from './carruselFondo.js';
import { abrirLightbox } from './lightbox.js';

const urlParams = new URLSearchParams(window.location.search);
const slug = urlParams.get('slug');
const isPreview = urlParams.get('preview') === '1';
const dataKey = urlParams.get('dataKey');

// Variables para controlar carruseles en preview
let activitiesCarouselIndex = 0;
let expositorsCarouselIndex = 0;
let galleryCarouselIndex = 0;

// Helper global para "Ver más" / "Ver menos"
window.toggleDesc = function (btn, isShow) {
    const container = btn.parentElement;
    if (isShow) {
        container.querySelector('.desc-short').style.display = 'none';
        container.querySelector('.desc-full').style.display = 'block';
        btn.style.display = 'none';
        container.querySelector('.btn-ver-menos').style.display = 'inline-block';
    } else {
        container.querySelector('.desc-full').style.display = 'none';
        container.querySelector('.desc-short').style.display = 'block';
        btn.style.display = 'none';
        container.querySelector('.btn-ver-mas').style.display = 'inline-block';
    }
};

window.formatDescription = function(text, forceFull = false) {
    if (!text) return '';
    
    // Si se fuerza completa, no truncamos
    if (forceFull || text.length <= 100) {
        return `
            <div class="desc-container">
                <p class="descripcion-texto descripcion desc-full" style="display: block; max-height: none; white-space: pre-wrap;">${text}</p>
            </div>
        `;
    }

    // Lógica con truncamiento y botones "Ver más"
    const shortText = text.substring(0, 100) + '...';
    return `
        <div class="desc-container">
            <p class="descripcion-texto descripcion desc-short">${shortText}</p>
            <p class="descripcion-texto descripcion desc-full" style="display: none; white-space: pre-wrap;">${text}</p>
            <button onclick="window.toggleDesc(this, true)" class="btn-ver-mas">Ver más</button>
            <button onclick="window.toggleDesc(this, false)" class="btn-ver-mas btn-ver-menos" style="display: none;">Ver menos</button>
        </div>
    `;
};
function initCarouselControls() {
    // Actividades
    let actPrev = document.getElementById('actividadesPrev');
    let actNext = document.getElementById('actividadesNext');
    const actGrid = document.getElementById('actividadesGrid');

    if (actPrev && actNext && actGrid) {
        actPrev.replaceWith(actPrev.cloneNode(true));
        actPrev = document.getElementById('actividadesPrev');
        actNext.replaceWith(actNext.cloneNode(true));
        actNext = document.getElementById('actividadesNext');

        const updateActivities = () => {
            const cards = actGrid.querySelectorAll('.actividad-card');
            cards.forEach((card, i) => {
                card.style.display = (i === activitiesCarouselIndex) ? 'block' : 'none';
            });
        };

        actPrev.addEventListener('click', () => {
            const cards = actGrid.querySelectorAll('.actividad-card');
            activitiesCarouselIndex = (activitiesCarouselIndex - 1 + cards.length) % cards.length;
            updateActivities();
        });

        actNext.addEventListener('click', () => {
            const cards = actGrid.querySelectorAll('.actividad-card');
            activitiesCarouselIndex = (activitiesCarouselIndex + 1) % cards.length;
            updateActivities();
        });

        updateActivities();
    }

    // Expositores
    let expPrev = document.getElementById('expositoresPrev');
    let expNext = document.getElementById('expositoresNext');
    const expGrid = document.getElementById('expositoresGrid');

    if (expPrev && expNext && expGrid) {
        expPrev.replaceWith(expPrev.cloneNode(true));
        expPrev = document.getElementById('expositoresPrev');
        expNext.replaceWith(expNext.cloneNode(true));
        expNext = document.getElementById('expositoresNext');

        const updateExpositores = () => {
            const cards = expGrid.querySelectorAll('.expositor-card');
            cards.forEach((card, i) => {
                card.style.display = (i === expositorsCarouselIndex) ? 'block' : 'none';
            });
        };

        expPrev.addEventListener('click', () => {
            const cards = expGrid.querySelectorAll('.expositor-card');
            expositorsCarouselIndex = (expositorsCarouselIndex - 1 + cards.length) % cards.length;
            updateExpositores();
        });

        expNext.addEventListener('click', () => {
            const cards = expGrid.querySelectorAll('.expositor-card');
            expositorsCarouselIndex = (expositorsCarouselIndex + 1) % cards.length;
            updateExpositores();
        });

        updateExpositores();
    }
}
function initHeroCarousel() {
    const slidesWrap = document.getElementById('heroSlides');
    let prevBtn = document.getElementById('heroPrevBtn');
    let nextBtn = document.getElementById('heroNextBtn');
    if (!slidesWrap) return;

    if (prevBtn && nextBtn) {
        prevBtn.replaceWith(prevBtn.cloneNode(true));
        prevBtn = document.getElementById('heroPrevBtn');
        nextBtn.replaceWith(nextBtn.cloneNode(true));
        nextBtn = document.getElementById('heroNextBtn');
    }

    function updateSlides() {
        const slides = slidesWrap.querySelectorAll('.hero-slide');
        slides.forEach((s, i) => s.style.display = (i === galleryCarouselIndex) ? 'block' : 'none');
    }

    if (prevBtn) prevBtn.addEventListener('click', () => {
        const slides = slidesWrap.querySelectorAll('.hero-slide');
        if (slides.length === 0) return;
        galleryCarouselIndex = (galleryCarouselIndex - 1 + slides.length) % slides.length;
        updateSlides();
    });

    if (nextBtn) nextBtn.addEventListener('click', () => {
        const slides = slidesWrap.querySelectorAll('.hero-slide');
        if (slides.length === 0) return;
        galleryCarouselIndex = (galleryCarouselIndex + 1) % slides.length;
        updateSlides();
    });

    updateSlides();
}

document.addEventListener('DOMContentLoaded', () => {
    if (isPreview && dataKey) {
        // En modo preview, cargar datos de localStorage usando la clave
        const previewDataStr = localStorage.getItem(dataKey);
        if (previewDataStr) {
            try {
                const previewData = JSON.parse(previewDataStr);
                cargarEventoDesdePreview(previewData);
                // Inicializar controles de carrusel y lightbox para preview
                setTimeout(() => { initCarouselControls(); initHeroCarousel(); initLightbox(); }, 120);
            } catch (e) {
                console.error('Error parsing preview data:', e);
            }
        }
    } else {
        // Modo normal: cargar desde API
        if (!slug) {
            window.location.href = '/';
            return;
        }
        cargarEvento(slug);
        cargarActividades(slug);
        cargarPrecios(slug);
        cargarExpositores(slug);
        cargarCarruselFondo(slug);
    }
});

// Función para cargar datos de preview desde localStorage
function cargarEventoDesdePreview(datos) {
    if (datos.nombre) document.getElementById('eventoNombre').innerText = datos.nombre;
    if (datos.descripcion) {
        document.getElementById('eventoDescripcion').innerText = datos.descripcion.length > 80 ? datos.descripcion.substring(0, 80) + '...' : datos.descripcion;
        const infoCompleta = document.getElementById('eventoInfoCompleta');
        if (infoCompleta) {
            infoCompleta.innerHTML = window.formatDescription(datos.descripcion, true);
        }
    }

    // Fechas
    if (datos.fecha_inicio || datos.fecha_fin) {
        const fmt = s => s ? new Date(s + 'T12:00:00').toLocaleDateString('es-CR', { day: '2-digit', month: 'short', year: 'numeric' }) : '?';
        const fechaTexto = datos.fecha_inicio === datos.fecha_fin
            ? fmt(datos.fecha_inicio)
            : `${fmt(datos.fecha_inicio)} al ${fmt(datos.fecha_fin)}`;
        document.getElementById('eventoFechas').innerHTML = fechaTexto;
        document.getElementById('infoFechas').innerHTML = `${fmt(datos.fecha_inicio)} - ${fmt(datos.fecha_fin)}`;
    }

    // Ubicación
    if (datos.ubicacion) {
        const ubicEl = document.getElementById('infoUbicacion');
        if (ubicEl) ubicEl.innerText = datos.ubicacion;
        const ubicTexto = document.getElementById('ubicacionTexto');
        if (ubicTexto) ubicTexto.innerText = datos.ubicacion;
    }

    // Imagen portada
    if (datos.imagen_portada) {
        const slides = document.getElementById('heroSlides');
        if (slides) {
            slides.innerHTML = `<div class="hero-slide active" style="background-image:url('${datos.imagen_portada}');background-size:cover;background-position:center;width:100%;height:100%;position:absolute;"></div>`;
        }
    }

    // Aplicar colores
    const r = document.documentElement;
    r.style.setProperty('--evento-primario', datos.color_primario || '#8b5a2b');
    r.style.setProperty('--evento-secundario', datos.color_secundario || '#d4a373');
    r.style.setProperty('--evento-fondo', datos.color_fondo || '#f4e4c1');

    if (datos.color_texto) document.body.style.color = datos.color_texto;

    if (datos.color_hero_overlay) {
        const overlay = document.querySelector('.hero-overlay');
        if (overlay) overlay.style.backgroundColor = datos.color_hero_overlay;
    }

    const h1 = document.getElementById('eventoNombre');
    const desc = document.getElementById('eventoDescripcion');
    if (h1 && datos.color_titulo_hero) h1.style.color = datos.color_titulo_hero;
    if (desc && datos.color_descripcion_hero) desc.style.color = datos.color_descripcion_hero;

    const heroDates = document.querySelector('.hero-dates');
    if (heroDates) {
        if (datos.color_fondo_fechas) heroDates.style.backgroundColor = datos.color_fondo_fechas;
        if (datos.color_texto_fechas) heroDates.style.color = datos.color_texto_fechas;
    }

    if (datos.color_titulo_seccion) {
        document.querySelectorAll('h2').forEach(h => h.style.color = datos.color_titulo_seccion);
    }

    if (datos.color_menu_fondo) r.style.setProperty('--color-menu-fondo', datos.color_menu_fondo);
    if (datos.color_menu_texto) r.style.setProperty('--color-menu-texto', datos.color_menu_texto);
    if (datos.color_menu_fondo_hover) r.style.setProperty('--color-menu-fondo-hover', datos.color_menu_fondo_hover);
    if (datos.color_menu_texto_hover) r.style.setProperty('--color-menu-texto-hover', datos.color_menu_texto_hover);

    // Títulos H3 (tarjetas info, actividades, expositores)
    if (datos.color_titulo_h3) {
        document.querySelectorAll('.info-card h3, .actividad-card h3, .expositor-card h3').forEach(h3 => {
            h3.style.color = datos.color_titulo_h3;
        });
    }
    
    // Color buscador y borde
    if (datos.color_buscador_expositores || datos.color_borde_buscador_expositores) {
        const searchBar = document.querySelector('.expositor-search-bar');
        const searchInput = document.querySelector('.search-input-wrapper input');
        if (searchBar && datos.color_buscador_expositores) searchBar.style.backgroundColor = datos.color_buscador_expositores;
        if (searchInput && datos.color_borde_buscador_expositores) searchInput.style.borderColor = datos.color_borde_buscador_expositores;
    }

    const contacto = document.querySelector('.contacto');
    if (contacto) {
        if (datos.color_fondo_contacto) contacto.style.backgroundColor = datos.color_fondo_contacto;
        if (datos.color_texto_contacto) contacto.style.color = datos.color_texto_contacto;
        if (datos.color_enlace_contacto) {
            contacto.querySelectorAll('a').forEach(a => a.style.color = datos.color_enlace_contacto);
        }
    }

    const footer = document.querySelector('footer');
    if (footer) {
        if (datos.color_fondo_footer) footer.style.backgroundColor = datos.color_fondo_footer;
        if (datos.color_texto_footer) {
            footer.style.color = datos.color_texto_footer;
            footer.querySelectorAll('p').forEach(p => p.style.color = datos.color_texto_footer);
        }
    }

    // ──── PRECIOS ────
    if (datos.precios && datos.precios.length > 0) {
        const tablaPrecios = document.getElementById('tablaPrecios');
        if (tablaPrecios) {
            let html = `<table class="tabla-precios-estilo"><thead><tr><th>Fecha</th><th>Precio normal</th><th>Promoción</th><th>Detalle</th></tr></thead><tbody>`;
            datos.precios.forEach(p => {
                const fecha = new Date(p.fecha).toLocaleDateString('es-CR', { weekday: 'long', day: 'numeric', month: 'long' });
                const precioNum = parseFloat(p.precio_normal);
                const precioFormateado = isNaN(precioNum) ? '₡0' : new Intl.NumberFormat('es-CR', { style: 'currency', currency: 'CRC', minimumFractionDigits: 0 }).format(precioNum);
                const promocion = p.promocion || '—';
                const detalle = p.descripcion_promocion || '—';
                html += `<tr><td>${fecha}</td><td>${precioFormateado}</td><td>${promocion}</td><td>${detalle}</td></tr>`;
            });
            html += `</tbody></table>`;
            tablaPrecios.innerHTML = html;
        }
    }

    // ──── ACTIVIDADES ────
    if (datos.actividades && datos.actividades.length > 0) {
        const actividadesGrid = document.getElementById('actividadesGrid');
        if (actividadesGrid) {
            actividadesGrid.innerHTML = '';
            datos.actividades.forEach((act, actIndex) => {
                const fmt = s => s ? new Date(s + 'T12:00:00').toLocaleDateString('es-CR', { day: '2-digit', month: 'short' }) : '?';
                // imágenes: puede ser act.imagen (string) o act.imagenes (array)
                let images = [];
                if (Array.isArray(act.imagenes) && act.imagenes.length) {
                    images = act.imagenes.filter(u => u);
                } else if (typeof act.imagen === 'string') {
                    const trimmed = act.imagen.trim();
                    if (trimmed.startsWith('[')) {
                        try { images = JSON.parse(trimmed).filter(u => u); } catch (e) { images = [trimmed]; }
                    } else if (trimmed.includes(',')) {
                        images = trimmed.split(',').map(s => s.trim()).filter(u => u && u !== 'null');
                    } else if (trimmed) {
                        images = [trimmed];
                    }
                }

                // crear contenedor de imagenes (mini-carrusel)
                const showButtons = images.length > 1 ? 'flex' : 'none';
                const imagesHtml = images.length ? `
                    <div class="mini-carrusel" data-idx="0">
                        <button class="mini-btn mini-prev" style="display: ${showButtons}">❮</button>
                        <div class="mini-carrusel-track">
                             ${images.map((src, i) => `<div class="mini-slide ${i === 0 ? 'activa' : ''}"><img src="${src}" alt="${act.titulo}" class="card-img-principal"></div>`).join('')}
                        </div>
                        <button class="mini-btn mini-next" style="display: ${showButtons}">❯</button>
                    </div>` : '<div class="placeholder-img" style="height:200px;background:#f0f0f0;border-radius:8px;"></div>';

                const card = document.createElement('div');
                card.className = 'actividad-card';
                card.innerHTML = `
                    ${imagesHtml}
                    <div class="card-content">
                        <h3>${act.titulo}</h3>
                        <p class="tipo"><strong>Tipo:</strong> ${act.tipo}</p>
                        <p class="fecha"><strong>Fecha:</strong> ${fmt(act.fecha)} ${act.hora ? act.hora : ''}</p>
                        <p class="lugar"><strong>Lugar:</strong> ${act.lugar}</p>
                        ${window.formatDescription(act.descripcion)}
                        <p class="gratuito">${act.es_gratis ? '<strong>✓ Gratis</strong>' : '<strong>Requiere entrada</strong>'}</p>
                        ${act.enlace_venta ? `<a href="${act.enlace_venta}" target="_blank" class="btn-comprar">Comprar entrada</a>` : ''}
                    </div>`;

                actividadesGrid.appendChild(card);
            });

            // inicializar mini-carruseles por actividad
            actividadesGrid.querySelectorAll('.mini-carrusel').forEach(car => {
                const slides = car.querySelectorAll('.mini-slide');
                let idx = 0;
                const prev = car.querySelector('.mini-prev');
                const next = car.querySelector('.mini-next');
                if (!prev || !next) return;
                function update() {
                    slides.forEach((s, l) => s.classList.toggle('activa', l === idx));
                }
                prev.onclick = (e) => { e.preventDefault(); idx = (idx - 1 + slides.length) % slides.length; update(); };
                next.onclick = (e) => { e.preventDefault(); idx = (idx + 1) % slides.length; update(); };
                update();
            });
        }
    }

    // ──── EXPOSITORES (PREVIEW) ────
    if (datos.expositores && datos.expositores.length > 0) {
        renderExpositores(datos.expositores);
        const searchContainer = document.getElementById('expositorSearchContainer');
        if (searchContainer) searchContainer.style.display = 'flex';
    }

    // ──── HORARIO GENERAL ────
    if (datos.horario_imagen) {
        const horarioDiv = document.getElementById('horarioContainer');
        if (horarioDiv) {
            horarioDiv.innerHTML = `<img src="${datos.horario_imagen}" alt="Horario del evento" style="max-width:100%; border-radius:8px;">`;
        }
    } else {
        const horarioDiv = document.getElementById('horarioContainer');
        if (horarioDiv) {
            horarioDiv.innerHTML = '<p style="color:#999;">Horario no disponible</p>';
        }
    }

    // ──── MAPA IFRAME ────
    if (datos.mapa_embed) {
        const mapaContainer = document.getElementById('mapaIframe');
        if (mapaContainer) {
            mapaContainer.innerHTML = datos.mapa_embed;
        }
    } else {
        const mapaContainer = document.getElementById('mapaIframe');
        if (mapaContainer) {
            mapaContainer.innerHTML = '<p style="color:#999;">Mapa no disponible</p>';
        }
    }

    // En preview, no cargar desde API
    document.title = datos.nombre || 'Preview - ExpoFeriasCR';
    // Si hay galería, crear slides y activar controles
    if (datos.galeria && datos.galeria.length > 0) {
        const slides = document.getElementById('heroSlides');
        if (slides) {
            slides.innerHTML = '';
            const sorted = datos.galeria.slice().sort((a, b) => (a.orden || 0) - (b.orden || 0));
            sorted.forEach((g, idx) => {
                const div = document.createElement('div');
                div.className = 'hero-slide';
                div.style.backgroundImage = `url('${g.imagen_url}')`;
                div.style.backgroundSize = 'cover';
                div.style.backgroundPosition = 'center';
                div.style.width = '100%';
                div.style.height = '100%';
                div.style.position = 'absolute';
                div.style.display = idx === 0 ? 'block' : 'none';
                slides.appendChild(div);
            });
            // activar índices del carrusel
            galleryCarouselIndex = 0;
            initHeroCarousel();
        }
    }
}


// Lightbox Functionality - Redirigido al modulo compartido
const initLightbox = () => {
    document.querySelectorAll('.card-img-principal, .expositor-img-principal, .mini-slide img').forEach(img => {
        img.style.cursor = 'pointer';
        img.onclick = () => abrirLightbox(img.src, img.alt);
    });
};

window.initLightbox = initLightbox;
window.cargarEventoDesdePreview = cargarEventoDesdePreview;
window.initCarouselControls = initCarouselControls;
window.initHeroCarousel = initHeroCarousel;

document.addEventListener('DOMContentLoaded', () => {
    const u = new URLSearchParams(window.location.search);
    if (!u.get('preview')) {
        setTimeout(initLightbox, 1500);
    }
});