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

function initCarouselControls() {
    // Actividades
    const actPrev = document.getElementById('actividadesPrev');
    const actNext = document.getElementById('actividadesNext');
    const actGrid = document.getElementById('actividadesGrid');
    
    if (actPrev && actNext && actGrid) {
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
    const expPrev = document.getElementById('expositoresPrev');
    const expNext = document.getElementById('expositoresNext');
    const expGrid = document.getElementById('expositoresGrid');
    
    if (expPrev && expNext && expGrid) {
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
        const prevBtn = document.getElementById('heroPrevBtn');
        const nextBtn = document.getElementById('heroNextBtn');
        if (!slidesWrap) return;

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
                // Inicializar controles de carrusel para preview
                    setTimeout(() => { initCarouselControls(); initHeroCarousel(); }, 120);
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
    if (datos.descripcion) document.getElementById('eventoDescripcion').innerText = datos.descripcion;
    if (datos.descripcion) document.getElementById('eventoInfoCompleta').innerText = datos.descripcion;
    
    // Fechas
    if (datos.fecha_inicio || datos.fecha_fin) {
        const fmt = s => s ? new Date(s + 'T12:00:00').toLocaleDateString('es-CR', { day:'2-digit', month:'short', year:'numeric' }) : '?';
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
                const fmt = s => s ? new Date(s + 'T12:00:00').toLocaleDateString('es-CR', { day:'2-digit', month:'short' }) : '?';
                // imágenes: puede ser act.imagen (string) o act.imagenes (array)
                let images = [];
                if (Array.isArray(act.imagenes) && act.imagenes.length) images = act.imagenes.filter(u=>u);
                else if (act.imagen) images = [act.imagen];

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
                    ${imagesHtml}
                    <div class="card-content">
                        <h3>${act.titulo}</h3>
                        <p class="tipo"><strong>Tipo:</strong> ${act.tipo}</p>
                        <p class="fecha"><strong>Fecha:</strong> ${fmt(act.fecha)} ${act.hora ? act.hora : ''}</p>
                        <p class="lugar"><strong>Lugar:</strong> ${act.lugar}</p>
                        <p class="descripcion">${act.descripcion}</p>
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
                    slides.forEach((s,i)=> s.style.display = i===idx ? 'block' : 'none');
                }
                if (prev) prev.addEventListener('click', ()=>{ idx = (idx-1+slides.length)%slides.length; update(); });
                if (next) next.addEventListener('click', ()=>{ idx = (idx+1)%slides.length; update(); });
                update();
            });
        }
    }
    
    // ──── EXPOSITORES ────
    if (datos.expositores && datos.expositores.length > 0) {
        const expositoresGrid = document.getElementById('expositoresGrid');
        if (expositoresGrid) {
            let html = '';
            datos.expositores.forEach(exp => {
                const logo = exp.logo ? `<img src="${exp.logo}" alt="${exp.nombre}" class="card-img-principal">` : '<div class="placeholder-img"></div>';
                html += `
                    <div class="expositor-card">
                        ${logo}
                        <div class="card-content">
                            <h3>${exp.nombre}</h3>
                            <p class="rubro"><strong>Rubro:</strong> ${exp.rubro}</p>
                            <p class="ubicacion"><strong>Ubicación:</strong> ${exp.ubicacion}</p>
                            <p class="descripcion">${exp.descripcion}</p>
                        </div>
                    </div>`;
            });
            expositoresGrid.innerHTML = html;
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
            const sorted = datos.galeria.slice().sort((a,b)=> (a.orden||0)-(b.orden||0));
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