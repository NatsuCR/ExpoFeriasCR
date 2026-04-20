// evento-main.js (punto de entrada para evento.html)
import { cargarEvento } from './cargarEvento.js';
import { cargarActividades } from './cargarActividades.js';
import { cargarPrecios } from './cargarPrecios.js';
import { cargarExpositores, renderExpositores } from './cargarExpositores.js';
import { cargarCarruselFondo } from './carruselFondo.js';
import { abrirLightbox, initLightbox } from './lightbox.js';

const urlParams = new URLSearchParams(window.location.search);
const slug = urlParams.get('slug');
const isPreview = urlParams.get('preview') === '1';
const dataKey = urlParams.get('dataKey');

// Variables para controlar carruseles en preview
let activitiesCarouselIndex = 0;
let expositorsCarouselIndex = 0;
let galleryCarouselIndex = 0;
let heroInterval = null;

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
        const slides = slidesWrap.querySelectorAll('.hero-carrusel-slide');
        slides.forEach((s, i) => s.style.display = (i === galleryCarouselIndex) ? 'block' : 'none');
    }

    function startAutoPlay() {
        if (heroInterval) clearInterval(heroInterval);
        heroInterval = setInterval(next, 10000);
    }

    function next() {
        const slides = slidesWrap.querySelectorAll('.hero-carrusel-slide');
        if (slides.length <= 1) return;
        galleryCarouselIndex = (galleryCarouselIndex + 1) % slides.length;
        updateSlides();
        startAutoPlay(); // Reiniciar el timer tras avanzar
    }

    if (prevBtn) prevBtn.addEventListener('click', () => {
        const slides = slidesWrap.querySelectorAll('.hero-carrusel-slide');
        if (slides.length <= 1) return;
        galleryCarouselIndex = (galleryCarouselIndex - 1 + slides.length) % slides.length;
        updateSlides();
        startAutoPlay(); // Reiniciar el timer tras click manual
    });

    if (nextBtn) nextBtn.addEventListener('click', () => {
        next();
    });

    updateSlides();
    startAutoPlay();
}

document.addEventListener('DOMContentLoaded', async () => {
    if (isPreview && dataKey) {
        // En modo preview, cargar datos de localStorage usando la clave
        const previewDataStr = localStorage.getItem(dataKey);
        if (previewDataStr) {
            try {
                const previewData = JSON.parse(previewDataStr);
                cargarEventoDesdePreview(previewData);
                // Inicializar controles de carrusel y lightbox para preview
                setTimeout(() => {
                    initCarouselControls();
                    initHeroCarousel();
                    initLightbox();
                }, 150);
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
        
        try {
            const evento = await cargarEvento(slug);
            if (!evento) return;

            // Cargar secciones según configuración
            cargarActividades(slug);

            const tipoVenta = evento.tipo_venta || 'taquilla';
            if (tipoVenta !== 'gratis') {
                cargarPrecios(slug);
            }

            const tieneExpositores = (evento.tiene_expositores !== undefined && evento.tiene_expositores !== null) ? parseInt(evento.tiene_expositores) : 1;
            if (tieneExpositores === 1) {
                cargarExpositores(slug);
            }

            cargarCarruselFondo(slug);
            initSocialShare();
        } catch (err) {
            console.error('Error en inicialización de evento:', err);
        }
    }
});

function initSocialShare() {
    const facebook = document.getElementById('shareFacebook');
    const twitter = document.getElementById('shareTwitter');
    const whatsapp = document.getElementById('shareWhatsapp');
    const telegram = document.getElementById('shareTelegram');
    const copy = document.getElementById('shareCopy');

    const url = window.location.href;
    const title = document.title;
    const text = `¡Mira este evento en ExpoFeriasCR: ${title}!`;

    if (facebook) facebook.href = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
    if (twitter) twitter.href = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
    if (whatsapp) whatsapp.href = `https://api.whatsapp.com/send?text=${encodeURIComponent(text + ' ' + url)}`;
    if (telegram) telegram.href = `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`;

    if (copy) {
        copy.onclick = () => {
            navigator.clipboard.writeText(url).then(() => {
                const icon = copy.querySelector('i');
                icon.className = 'fas fa-check';
                copy.classList.add('success');
                setTimeout(() => {
                    icon.className = 'fas fa-link';
                    copy.classList.remove('success');
                }, 2000);
            });
        };
    }
}


// Función para cargar datos de preview desde localStorage
function cargarEventoDesdePreview(datos) {
    if (datos.nombre) document.getElementById('eventoNombre').innerText = datos.nombre;
    if (datos.descripcion) {
        document.getElementById('eventoDescripcion').innerHTML = typeof window.formatDescription === 'function' ? window.formatDescription(datos.descripcion) : datos.descripcion;
        const infoCompleta = document.getElementById('eventoInfoCompleta');
        if (infoCompleta) {
            infoCompleta.innerHTML = window.formatDescription(datos.descripcion, true);
        }
    }

    // Fechas y Metadatos
    if (datos.fecha_inicio || datos.fecha_fin) {
        const fi = window.formatDateCR(datos.fecha_inicio);
        const ff = window.formatDateCR(datos.fecha_fin);
        const fechaTexto = datos.fecha_inicio === datos.fecha_fin ? fi : `${fi} al ${ff}`;
        document.getElementById('eventoFechas').innerHTML = fechaTexto;
        document.getElementById('infoFechas').innerHTML = `${fi} - ${ff}`;
    }

    // Actualizar metadatos para Preview (SEO)
    if (datos.slug) {
        const canonical = document.querySelector('link[rel="canonical"]');
        if (canonical) canonical.href = `${window.location.origin}/evento.html?slug=${datos.slug}`;
        const ogUrl = document.querySelector('meta[property="og:url"]');
        if (ogUrl) ogUrl.setAttribute('content', `${window.location.origin}/evento.html?slug=${datos.slug}`);
        const twitterUrl = document.querySelector('meta[property="twitter:url"]');
        if (twitterUrl) twitterUrl.setAttribute('content', `${window.location.origin}/evento.html?slug=${datos.slug}`);
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
            slides.innerHTML = `<div class="hero-carrusel-slide active" style="background-image:url('${datos.imagen_portada}');">
                <img src="${datos.imagen_portada}" alt="${datos.nombre}" style="display:none;" loading="lazy">
            </div>`;
        }
    }

    // Aplicar colores con acceso seguro
    const r = document.documentElement;
    r.style.setProperty('--evento-primario', datos?.color_primario || '#8b5a2b');
    r.style.setProperty('--evento-secundario', datos?.color_secundario || '#d4a373');
    r.style.setProperty('--evento-fondo', datos?.color_fondo || '#f4e4c1');

    if (datos?.color_texto) document.body.style.color = datos.color_texto;
    r.style.setProperty('--color-descripcion-texto', datos?.color_descripcion_texto || '#2c1a0e');
    r.style.setProperty('--color-descripcion-hero', datos?.color_descripcion_hero || '#ffffff');

    // Color Fondo y Texto Share (Preview) - Ahora color sólido, sin opacidad
    if (datos.color_fondo_share) r.style.setProperty('--color-fondo-share', datos.color_fondo_share);
    r.style.setProperty('--color-texto-share', datos.color_texto_share || '#2c1a0e');

    // Contacto y Footer (Preview)
    if (datos.color_fondo_contacto) r.style.setProperty('--contacto-fondo', datos.color_fondo_contacto);
    if (datos.color_texto_contacto) r.style.setProperty('--contacto-texto', datos.color_texto_contacto);
    if (datos.color_enlace_contacto) r.style.setProperty('--contacto-enlace', datos.color_enlace_contacto);
    if (datos.color_fondo_footer) r.style.setProperty('--footer-fondo', datos.color_fondo_footer);
    if (datos.color_texto_footer) r.style.setProperty('--footer-texto', datos.color_texto_footer);

    // Opacidad Imagen Hero (Preview)
    const overlayVal = datos.color_hero_overlay || 'rgba(0, 0, 0, 0.7)';
    const overlay = document.querySelector('.hero-overlay');

    if (overlay) {
        // Si es un número (ej: "0.3"), convertirlo a RGBA negro
        if (!isNaN(parseFloat(overlayVal)) && !overlayVal.includes('rgba')) {
            overlay.style.backgroundColor = `rgba(0,0,0,${overlayVal})`;
        } else {
            overlay.style.backgroundColor = overlayVal;
        }
        overlay.style.display = 'block'; // Asegurar que sea visible
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




    // ──── ENTRADAS (PREVIEW) ────
    const entradasParrafo = document.getElementById('entradasTexto');
    if (entradasParrafo) {
        const tipoVenta = datos.tipo_venta || 'taquilla';
        const urlVentaOnline = datos.url_venta_online || '';
        let textoEntradas = '';
        switch (tipoVenta) {
            case 'online':
                textoEntradas = `Entradas en línea: <a href="${urlVentaOnline}" target="_blank">Comprar aquí</a>`;
                break;
            case 'ambos':
                textoEntradas = `Entradas en taquilla y en línea: <a href="${urlVentaOnline}" target="_blank">Comprar en línea</a>`;
                break;
            case 'gratis':
                textoEntradas = '🎟️ <strong>Entrada Gratuita</strong>';
                break;
            default:
                textoEntradas = 'Entradas solo en taquilla del campo ferial';
        }
        entradasParrafo.innerHTML = textoEntradas;
        // Ocultar card de entradas si es gratuito
        const entradasCard = entradasParrafo.closest('.info-card');
        if (entradasCard) {
            // Usar 'block' en lugar de 'flex' para evitar que se rompa el diseño de la tarjeta
            entradasCard.style.display = (tipoVenta === 'gratis') ? 'none' : 'block';
        }
    }

    // (Visibility logic consolidated at the end of function)

    // Estilos de footer gestionados vía variables CSS en r.style.setProperty

    // ──── PRECIOS ────
    if (datos.precios && datos.precios.length > 0) {
        const tablaPrecios = document.getElementById('tablaPrecios');
        if (tablaPrecios) {
            let html = `<table class="tabla-precios-estilo"><thead><tr><th>Fecha</th><th>Precio normal</th><th>Promoción</th><th>Detalle</th></tr></thead><tbody>`;
            datos.precios.forEach(p => {
                const fecha = window.formatDateCR(p.fecha);
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
                const fechaFmt = window.formatDateCR(act.fecha, 'short');

                // --- Robust Image Parsing (Universal) ---
                let images = [];
                const rawImg = act.imagen || act.imagenes;

                if (Array.isArray(rawImg)) {
                    images = rawImg.filter(u => u && u !== 'null');
                } else if (typeof rawImg === 'string' && rawImg.trim()) {
                    const trimmed = rawImg.trim();
                    if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
                        try {
                            images = JSON.parse(trimmed).filter(u => u && u !== 'null');
                        } catch (e) {
                            images = [trimmed];
                        }
                    } else if (trimmed.includes(',')) {
                        images = trimmed.split(',').map(s => s.trim()).filter(u => u && u !== 'null');
                    } else {
                        images = [trimmed];
                    }
                }

                // Asegurar que las rutas sean consistentes, sean strings y empiecen con / si es necesario
                images = images
                    .filter(src => typeof src === 'string' && src.trim() !== '')
                    .map(src => {
                        let path = src.replace(/\\/g, '/');
                        if (!path.startsWith('/') && !path.startsWith('http')) {
                            path = '/' + path;
                        }
                        return path;
                    });

                // crear contenedor de imagenes (mini-carrusel)
                const showButtons = images.length > 1 ? 'flex' : 'none';
                const imagesHtml = images.length ? `
                    <div class="mini-carrusel" data-idx="0">
                        <button class="mini-btn mini-prev" style="display: ${showButtons}">❮</button>
                        <div class="mini-carrusel-track">
                             ${images.map((src, i) => `<div class="mini-slide ${i === 0 ? 'activa' : ''}"><img src="${src}" alt="${act.titulo}" class="card-img-principal" loading="lazy"></div>`).join('')}
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
                        <p class="fecha"><strong>Fecha:</strong> ${fechaFmt} ${act.hora ? act.hora.slice(0, 5) : ''}</p>
                        <p class="lugar"><strong>Lugar:</strong> ${act.lugar}</p>
                        ${window.formatDescription(act.descripcion)}
                        <p class="gratuito">${act.es_gratis ? '<strong>✓ Gratis</strong>' : '<strong>Requiere entrada</strong>'}</p>
                        ${act.enlace_venta ? `<a href="${act.enlace_venta}" target="_blank" class="btn-comprar">Comprar entrada</a>` : ''}
                    </div>`;

                actividadesGrid.appendChild(card);
            });

            // inicializar mini-carruseles por actividad y habilitar lightbox de galería
            actividadesGrid.querySelectorAll('.mini-carrusel').forEach(car => {
                const slides = car.querySelectorAll('.mini-slide');
                const imgNodes = Array.from(car.querySelectorAll('.mini-slide img'));
                let idx = 0;
                const prev = car.querySelector('.mini-prev');
                const next = car.querySelector('.mini-next');
                
                function update() {
                    slides.forEach((s, l) => s.classList.toggle('activa', l === idx));
                }

                if (prev && next) {
                    const newPrev = prev.cloneNode(true);
                    prev.parentNode.replaceChild(newPrev, prev);
                    newPrev.addEventListener('click', (e) => {
                        e.preventDefault(); e.stopPropagation();
                        idx = (idx - 1 + slides.length) % slides.length;
                        update();
                    });

                    const newNext = next.cloneNode(true);
                    next.parentNode.replaceChild(newNext, next);
                    newNext.addEventListener('click', (e) => {
                        e.preventDefault(); e.stopPropagation();
                        idx = (idx + 1) % slides.length;
                        update();
                    });
                }

                // Lightbox de Galería para Preview
                car.style.cursor = 'zoom-in';
                car.addEventListener('click', (e) => {
                    if (e.target.closest('.mini-btn')) return;
                    e.stopPropagation();
                    const galleryData = imgNodes.map(img => ({ src: img.src, alt: img.alt }));
                    abrirLightbox(galleryData, idx);
                });

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
    const sectionHorario = document.getElementById('seccion-horario');
    if (datos.horario_imagen && datos.horario_imagen.trim() !== '' && datos.horario_imagen !== 'null') {
        const horarioDiv = document.getElementById('horarioContainer');
        if (horarioDiv) {
            horarioDiv.innerHTML = `<img src="${datos.horario_imagen}" alt="Horario del evento" style="max-width:100%; border-radius:8px;" loading="lazy">`;
            if (sectionHorario) sectionHorario.style.display = 'block';
        }
    } else {
        if (sectionHorario) sectionHorario.style.display = 'none';
    }

    // ──── LÓGICA DE MAPAS ────
    const mapaContainer = document.getElementById('mapaIframe');
    if (mapaContainer) {
        // Estándar unificado: siempre snake_case
        const mGoogle = (datos.mapa_embed || '').trim();
        const mWaze = (datos.mapa_waze_embed || '').trim();
        console.log('[Maps Debug] Google:', mGoogle ? 'SI' : 'NO', '| Waze:', mWaze ? 'SI' : 'NO');

        const renderMapContent = (input, type) => {
            if (!input) return '';
            if (input.toLowerCase().startsWith('<iframe')) return input;
            const isWaze = type === 'waze';
            const app = isWaze ? 'Waze' : 'Google Maps';
            const icon = isWaze ? 'waze' : 'google';
            const navClass = isWaze ? 'nav-waze' : 'nav-google';
            const btnClass = isWaze ? 'btn-waze' : 'btn-google';
            
            return `
                <div class="nav-action-card ${navClass}">
                    <div class="nav-card-icon"><i class="fab fa-${icon}"></i></div>
                    <h3>${app}</h3>
                    <p>Link detectado. Toca para navegar.</p>
                    <button class="btn-nav-action ${btnClass}" onclick="window.open('${input}','_blank')">
                        <i class="fas fa-external-link-alt"></i> Abrir ${app}
                    </button>
                </div>`;
        };

        // Forzado de pestañas si ambos campos tienen contenido
        const hasGoogle = mGoogle.length > 5; // Longitud mínima para un iframe o link válido
        const hasWaze = mWaze.length > 5;

        if (hasGoogle && hasWaze) {
            mapaContainer.innerHTML = `
                <div class="map-tabs-container" style="display: block !important; visibility: visible !important;">
                    <div class="map-tabs-header">
                        <button class="map-tab-btn active" data-target="google"><i class="fab fa-google"></i> Google</button>
                        <button class="map-tab-btn" data-target="waze"><i class="fab fa-waze"></i> Waze</button>
                    </div>
                    <div class="map-tabs-content">
                        <div class="map-tab-pane active" id="pane-google">${renderMapContent(mGoogle, 'google')}</div>
                        <div class="map-tab-pane" id="pane-waze">${renderMapContent(mWaze, 'waze')}</div>
                    </div>
                </div>`;
            
            const b = mapaContainer.querySelectorAll('.map-tab-btn');
            const p = mapaContainer.querySelectorAll('.map-tab-pane');
            b.forEach(btn => btn.addEventListener('click', (e) => {
                e.preventDefault();
                const target = btn.dataset.target;
                b.forEach(x => x.classList.remove('active')); 
                p.forEach(x => x.classList.remove('active'));
                btn.classList.add('active');
                const targetPane = mapaContainer.querySelector(`#pane-${target}`);
                if (targetPane) targetPane.classList.add('active');
            }));
        } else if (hasGoogle) {
            mapaContainer.innerHTML = renderMapContent(mGoogle, 'google');
        } else if (hasWaze) {
            mapaContainer.innerHTML = renderMapContent(mWaze, 'waze');
        } else {
            mapaContainer.innerHTML = `
                <div class="help-box" style="margin-top:10px; background:#ebf5fb; border-left: 4px solid #3498db; padding: 15px; border-radius: 8px; display: flex; align-items: center; gap: 15px;">
                    <i class="fas fa-map-marked-alt" style="color:#3498db; font-size: 24px;"></i>
                    <div class="help-box-content">
                        <p style="font-size:13px; color: #34495e; margin: 0;"><strong>💡 Ubicación:</strong> El evento no tiene mapas configurados todavía.</p>
                    </div>
                </div>`;
        }
    }

    // ──── LÓGICA DE VISIBILIDAD (PREVIEW/FINAL) ────
    const vTipoVenta = datos.tipo_venta || 'taquilla';
    
    // Estándar unificado: siempre snake_case
    const vTieneExpositores = (datos.tiene_expositores !== undefined && datos.tiene_expositores !== null) 
                             ? parseInt(datos.tiene_expositores) 
                             : 1;
    
    console.log('[Visibility Debug] Tipo Venta:', vTipoVenta, '| Expositores:', vTieneExpositores);

    // Ocultar/Mostrar Precios y actualizar tarjeta de Entradas
    const sectionPrecios = document.getElementById('precios');
    const linkPrecios = document.querySelector('.nav-links a[href="#precios"]');
    const cardEntradas = document.getElementById('entradasTexto')?.closest('.info-card');
    const textoEntradas = document.getElementById('entradasTexto');

    if (cardEntradas) {
        cardEntradas.style.display = 'block';
        if (vTipoVenta === 'gratis') {
            cardEntradas.style.pointerEvents = 'none'; // No hay a donde scrollear
            if (textoEntradas) textoEntradas.innerHTML = '🎟️ <strong>Entrada Gratuita</strong>';
        } else {
            cardEntradas.style.pointerEvents = 'auto';
            if (textoEntradas) {
                if (vTipoVenta === 'online') textoEntradas.innerText = 'Entradas solo en línea';
                else if (vTipoVenta === 'ambos') textoEntradas.innerText = 'Entradas en taquilla y en línea';
                else textoEntradas.innerText = 'Entradas solo en taquilla';
            }
        }
    }

    if (vTipoVenta === 'gratis') {
        if (sectionPrecios) sectionPrecios.setAttribute('style', 'display: none !important');
        if (linkPrecios) {
            const li = linkPrecios.closest('li');
            if (li) {
                if (isPreview) li.remove(); 
                else li.setAttribute('style', 'display: none !important');
            }
        }
    } else {
        if (sectionPrecios) sectionPrecios.style.display = 'block';
        if (linkPrecios) {
            const li = linkPrecios.closest('li');
            if (li) li.style.display = 'block';
        }
    }

    // 🛡️ BLINDAJE TOTAL DE VISIBILIDAD (SHIELD)
    const sectionExpositores = document.getElementById('expositores');
    const linksExpositores = document.querySelectorAll('.nav-links a[href="#expositores"]');

    if (vTieneExpositores === 0) { // 0 = NO tiene expositores
        console.log('[Visibility Shield] Bloqueando sección de expositores (tiene_expositores=0)');
        if (sectionExpositores) sectionExpositores.remove();
        linksExpositores.forEach(link => {
            const li = link.closest('li');
            if (li) li.remove();
        });
    } else {
        if (sectionExpositores) sectionExpositores.style.setProperty('display', 'block', 'important');
        linksExpositores.forEach(link => {
            const li = link.closest('li');
            if (li) li.style.setProperty('display', 'block', 'important');
        });
    }

    // Blindaje de Ubicación (asegurar que no se oculte en eventos gratis)
    const linksUbicacion = document.querySelectorAll('.nav-links a[href="#ubicacion"]');
    linksUbicacion.forEach(link => {
        const li = link.closest('li');
        if (li) li.style.setProperty('display', 'block', 'important');
    });

    // En preview, no cargar desde API
    document.title = datos.nombre || 'Preview - ExpoFeriasCR';
    // Si hay galería, crear slides y activar controles
    if (datos.galeria && datos.galeria.length > 0) {
        const slides = document.getElementById('heroSlides');
        if (slides) {
            slides.innerHTML = '';
            const sorted = datos.galeria.slice(); // Ya no ordenamos por campo 'orden'
            sorted.forEach((g, idx) => {
                const div = document.createElement('div');
                div.className = 'hero-carrusel-slide';
                div.style.backgroundImage = `url('${g.imagen_url}')`;
                div.style.backgroundSize = 'cover';
                div.style.backgroundPosition = 'center';
                div.style.width = '100%';
                div.style.height = '100%';
                div.style.position = 'absolute';
                div.style.display = idx === 0 ? 'block' : 'none';
                slides.appendChild(div);
            });
            // activar índices del carrusel (el inicio real lo hace el timeout del main)
            galleryCarouselIndex = 0;
        }
    }
}


// Lightbox Functionality - Redirigido al modulo compartido
const runLightboxFallback = () => {
    // Solo para imágenes que no están dentro de carruseles manejados por módulos específicos
    document.querySelectorAll('.card-img-principal, .expositor-img-principal, .horario-img').forEach(img => {
        if (img.closest('.mini-carrusel')) return; // Evitar duplicar listeners en carruseles
        img.style.cursor = 'zoom-in';
        img.onclick = () => abrirLightbox(img.src, img.alt);
    });
};

window.initLightbox = initLightbox;
window.cargarEventoDesdePreview = cargarEventoDesdePreview;
window.initCarouselControls = initCarouselControls;
window.initHeroCarousel = initHeroCarousel;

document.addEventListener('DOMContentLoaded', () => {
    initLightbox(); // Crear el overlay del lightbox
    const u = new URLSearchParams(window.location.search);
    if (!u.get('preview')) {
        setTimeout(runLightboxFallback, 1500);
    }
});