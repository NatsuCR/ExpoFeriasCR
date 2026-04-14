// evento-main.js (punto de entrada para evento.html)
import { cargarEvento } from './cargarEvento.js';
import { cargarActividades } from './cargarActividades.js';
import { cargarPrecios } from './cargarPrecios.js';
import { cargarExpositores } from './cargarExpositores.js';
import { cargarCarruselFondo } from './carruselFondo.js';

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

window.formatDescription = function (text) {
    if (!text || text.length <= 150) return `<p class="descripcion">${text || ''}</p>`;
    const shortText = text.substring(0, 150) + '...';
    return `
      <div class="desc-container" style="margin-bottom:10px;">
         <p class="descripcion desc-short" style="margin:0;">${shortText}</p>
         <p class="descripcion desc-full" style="display:none; margin:0; white-space:pre-wrap;">${text}</p>
         <button onclick="window.toggleDesc(this, true)" class="btn-ver-mas" style="background:none; border:none; color:#0033A0; cursor:pointer; padding:0; text-decoration:underline; font-weight:bold; font-size:13px; margin-top:4px;">Ver más</button>
         <button onclick="window.toggleDesc(this, false)" class="btn-ver-menos" style="background:none; border:none; color:#0033A0; cursor:pointer; padding:0; text-decoration:underline; font-weight:bold; font-size:13px; margin-top:4px; display:none;">Ver menos</button>
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
            infoCompleta.innerHTML = window.formatDescription(datos.descripcion);
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
                if (Array.isArray(act.imagenes) && act.imagenes.length) images = act.imagenes.filter(u => u);
                else if (typeof act.imagen === 'string' && act.imagen.startsWith('[')) {
                    try { images = JSON.parse(act.imagen).filter(u => u); } catch (e) { images = [act.imagen]; }
                } else if (act.imagen) images = [act.imagen];

                // crear contenedor de imagenes (mini-carrusel)
                const imagesHtml = images.length ? `
                    <div class="actividad-carousel" data-idx="0">
                        <button class="actividad-prev">&#10094;</button>
                        <div class="actividad-viewport">
                            <div class="actividad-track">
                                ${images.map(src => `<div class="actividad-slide"><img src="${src}" alt="${act.titulo}" class="card-img-principal"></div>`).join('')}
                            </div>
                        </div>
                        <button class="actividad-next">&#10095;</button>
                    </div>` : '<div class="placeholder-img"></div>';

                const card = document.createElement('div');
                card.className = 'actividad-card';
                card.innerHTML = `
                    <style>
                        .actividad-carousel { position: relative; overflow: hidden; border-radius: 4px; }
                        .actividad-viewport { display: flex; align-items: center; justify-content: center; background: #fafafa; }
                        .actividad-slide { width: 100%; display: none; text-align: center; }
                        .actividad-slide img { width: 100%; height: 200px; object-fit: cover; cursor: pointer; }
                        .actividad-prev, .actividad-next { position: absolute; top: 50%; transform: translateY(-50%); background: rgba(0,0,0,0.5); color: white; border: none; padding: 10px; cursor: pointer; z-index: 2; border-radius: 50%; opacity: 0.7; }
                        .actividad-prev:hover, .actividad-next:hover { opacity: 1; }
                        .actividad-prev { left: 5px; }
                        .actividad-next { right: 5px; }
                    </style>
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
            actividadesGrid.querySelectorAll('.actividad-carousel').forEach(car => {
                const track = car.querySelector('.actividad-track');
                const slides = car.querySelectorAll('.actividad-slide');
                let idx = 0;
                const prev = car.querySelector('.actividad-prev');
                const next = car.querySelector('.actividad-next');
                function update() {
                    slides.forEach((s, i) => s.style.display = i === idx ? 'block' : 'none');
                }
                if (prev) prev.addEventListener('click', () => { idx = (idx - 1 + slides.length) % slides.length; update(); });
                if (next) next.addEventListener('click', () => { idx = (idx + 1) % slides.length; update(); });
                update();
            });
        }
    }

    // ──── EXPOSITORES ────
    if (datos.expositores && datos.expositores.length > 0) {
        const expositoresGrid = document.getElementById('expositoresGrid');
        if (expositoresGrid) {
            expositoresGrid.innerHTML = '';
            datos.expositores.forEach(exp => {
                let images = [];
                if (Array.isArray(exp.imagenes) && exp.imagenes.length) images = exp.imagenes.filter(u => u);
                else if (typeof exp.logo === 'string' && exp.logo.startsWith('[')) {
                    try { images = JSON.parse(exp.logo).filter(u => u); } catch (e) { images = [exp.logo]; }
                } else if (exp.logo) images = [exp.logo];

                // crear contenedor de imagenes (mini-carrusel)
                const imagesHtml = images.length ? `
                    <div class="actividad-carousel" data-idx="0">
                        <button class="actividad-prev">&#10094;</button>
                        <div class="actividad-viewport">
                            <div class="actividad-track">
                                ${images.map(src => `<div class="actividad-slide"><img src="${src}" alt="${exp.nombre}" class="expositor-img-principal" style="width:100%;height:150px;object-fit:cover;border-radius:4px;"></div>`).join('')}
                            </div>
                        </div>
                        <button class="actividad-next">&#10095;</button>
                    </div>` : '<div class="placeholder-img" style="height:150px;background:#f0f0f0;"></div>';

                let videoHtml = '';
                if (exp.video) {
                    let embedUrl = exp.video;
                    if (exp.video.includes('youtube.com/watch?v=')) embedUrl = exp.video.replace('watch?v=', 'embed/');
                    if (exp.video.includes('youtu.be/')) embedUrl = exp.video.replace('youtu.be/', 'youtube.com/embed/');
                    videoHtml = `<div style="margin-top:10px;"><iframe width="100%" height="150" src="${embedUrl}" frameborder="0" allowfullscreen></iframe></div>`;
                }

                const card = document.createElement('div');
                card.className = 'expositor-card';
                card.style.position = 'relative';
                card.style.background = '#fff';
                card.style.borderRadius = '8px';
                card.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
                card.style.overflow = 'hidden';
                card.innerHTML = `
                    ${imagesHtml}
                    ${videoHtml}
                    <div class="card-content" style="padding:15px;text-align:center;">
                        <h3 style="margin:10px 0 5px;font-size:18px;">${exp.nombre}</h3>
                        <p class="rubro" style="color:#666;font-size:14px;margin-bottom:5px;"><strong>Rubro:</strong> ${exp.rubro}</p>
                        <p class="ubicacion" style="color:#666;font-size:14px;margin-bottom:10px;"><strong>Stand:</strong> ${exp.ubicacion}</p>
                        ${exp.descripcion ? window.formatDescription(exp.descripcion) : ''}
                    </div>
                `;
                expositoresGrid.appendChild(card);
            });

            // inicializar mini-carruseles por expositor
            expositoresGrid.querySelectorAll('.actividad-carousel').forEach(car => {
                const track = car.querySelector('.actividad-track');
                const slides = car.querySelectorAll('.actividad-slide');
                let idx = 0;
                const prev = car.querySelector('.actividad-prev');
                const next = car.querySelector('.actividad-next');
                function update() {
                    slides.forEach((s, i) => s.style.display = i === idx ? 'block' : 'none');
                }
                if (prev) prev.addEventListener('click', () => { idx = (idx - 1 + slides.length) % slides.length; update(); });
                if (next) next.addEventListener('click', () => { idx = (idx + 1) % slides.length; update(); });
                update();
            });
        }
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

// Lightbox Functionality
const initLightbox = () => {
    let overlay = document.getElementById('lightbox-overlay');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'lightbox-overlay';
        overlay.style.display = 'none';
        overlay.innerHTML = `
            <div style="position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.8); z-index:9999; display:flex; justify-content:center; align-items:center;">
                <span style="position:absolute; top:20px; right:30px; color:white; font-size:40px; cursor:pointer;" onclick="document.getElementById('lightbox-overlay').style.display='none'">&times;</span>
                <img id="lightbox-img" src="" style="max-width:90%; max-height:90%; object-fit:contain; border:4px solid white; border-radius:8px; box-shadow: 0 4px 20px rgba(0,0,0,0.5);">
            </div>
        `;
        document.body.appendChild(overlay);
    }
    document.querySelectorAll('.card-img-principal, .expositor-img-principal').forEach(img => {
        img.style.cursor = 'pointer';
        // Evitamos multiples escuchadores si esta funcion se llama varias veces (como en preview mode)
        img.removeEventListener('click', openLightbox);
        img.addEventListener('click', openLightbox);
    });
};

function openLightbox(e) {
    document.getElementById('lightbox-img').src = e.target.src;
    document.getElementById('lightbox-overlay').style.display = 'block';
}

window.initLightbox = initLightbox;
window.cargarEventoDesdePreview = cargarEventoDesdePreview;
window.initCarouselControls = initCarouselControls;
window.initHeroCarousel = initHeroCarousel;

document.addEventListener('DOMContentLoaded', () => {
    // Si no estamos en preview, damos un tiempito y ejecutamos el lightbox para amarrar las imagenes
    const u = new URLSearchParams(window.location.search);
    if (!u.get('preview')) {
        setTimeout(initLightbox, 1500);
    }
});