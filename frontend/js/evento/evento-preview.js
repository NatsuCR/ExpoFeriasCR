/**
 * evento-preview.js - Lógica para previsualizar eventos desde localStorage
 */

export function cargarEventoDesdePreview(datos) {
    if (datos.nombre) document.getElementById('eventoNombre').innerText = datos.nombre;
    if (datos.descripcion) {
        const descHtml = typeof window.formatDescription === 'function' ? window.formatDescription(datos.descripcion) : datos.descripcion;
        const colorDesc = datos.color_descripcion_hero || '#ffffff';

        // 1. En el HERO (arriba de las fechas)
        const heroDesc = document.getElementById('eventoDescripcion');
        if (heroDesc) {
            heroDesc.innerHTML = descHtml;
            // Forzamos estilos con el color dinámico del selector
            heroDesc.setAttribute('style', `display: block !important; visibility: visible !important; opacity: 1 !important; margin: 15px 0 !important; color: ${colorDesc} !important; font-size: 1.2rem !important; min-height: 20px !important;`);

            // Aseguramos que los párrafos internos también usen ese color
            const p = heroDesc.querySelector('p');
            if (p) p.setAttribute('style', `color: ${colorDesc} !important; display: block !important;`);
        }

        // 2. En la SECCIÓN DE INFORMACIÓN (desc-full)
        const infoCompleta = document.getElementById('eventoInfoCompleta');
        if (infoCompleta) {
            infoCompleta.innerHTML = typeof window.formatDescription === 'function' ? window.formatDescription(datos.descripcion, true) : datos.descripcion;
            infoCompleta.style.display = 'block';
        }
    } else {
        // Limpiar si no hay descripción
        const heroDesc = document.getElementById('eventoDescripcion');
        if (heroDesc) heroDesc.innerHTML = '';
    }

    // Fechas
    if (datos.fecha_inicio || datos.fecha_fin) {
        const fi = window.formatDateCR(datos.fecha_inicio);
        const ff = window.formatDateCR(datos.fecha_fin);
        const fechaTexto = datos.fecha_inicio === datos.fecha_fin ? fi : `${fi} al ${ff}`;
        document.getElementById('eventoFechas').innerHTML = fechaTexto;
        document.getElementById('infoFechas').innerHTML = `${fi} - ${ff}`;
    }

    // Ubicación
    if (datos.ubicacion || datos.provincia) {
        const ubicEl = document.getElementById('infoUbicacion');
        const ubicTexto = document.getElementById('ubicacionTexto');
        const exactElem = document.getElementById('ubicacionExactaTexto');

        const jerarquiaAdmin = [
            datos.distrito,
            datos.canton,
            datos.provincia,
            'Costa Rica'
        ].filter(Boolean).join(', ');

        const ubicacionFull = [datos.ubicacion, jerarquiaAdmin].filter(Boolean).join(', ');

        if (ubicEl) {
            ubicEl.innerHTML = ubicacionFull;
        }

        if (ubicTexto) ubicTexto.innerText = jerarquiaAdmin;

        if (exactElem) {
            exactElem.innerHTML = datos.ubicacion ? `📍 ${datos.ubicacion}` : '';
            exactElem.style.display = datos.ubicacion ? 'block' : 'none';
        }
    }

    // Hero Carousel (Portada + Galería)
    const track = document.getElementById('heroSlides'); // En evento.html el contenedor es heroSlides
    if (track) {
        let slidesHtml = '';
        const todasLasImágenes = [];

        // La imagen_portada NO va en el hero del evento (es solo para el Index)
        // Solo usamos la Galería
        if (datos.galeria && datos.galeria.length > 0) {
            datos.galeria.forEach(g => {
                if (g.imagen_url && !todasLasImágenes.includes(g.imagen_url)) {
                    todasLasImágenes.push(g.imagen_url);
                }
            });
        }

        if (todasLasImágenes.length > 0) {
            todasLasImágenes.forEach((img, idx) => {
                slidesHtml += `
                    <div class="hero-carrusel-slide ${idx === 0 ? 'activa' : ''}">
                        <img src="${img}" alt="${datos.nombre}" style="width:100%; height:100%; object-fit:cover;">
                    </div>
                `;
            });
            track.innerHTML = slidesHtml;
            // Reiniciar el carrusel si hay más de una imagen
            if (todasLasImágenes.length > 1 && typeof window.initHeroCarousel === 'function') {
                window.initHeroCarousel();
            }
        } else {
            track.innerHTML = '<div class="hero-carrusel-slide activa"><img src="/assets/images/LogoOficialExpoFeriasCR/LogoExpoFeriasCR1.png" style="width:100%; height:100%; object-fit:contain; background:#eee;"></div>';
        }
    }

    // Aplicar Opacidad (Color Hero Overlay)
    const overlay = document.querySelector('.hero-overlay');
    if (overlay && datos.color_hero_overlay) {
        overlay.style.backgroundColor = datos.color_hero_overlay;
    }

    // Horario
    if (datos.horario_imagen) {
        const horContainer = document.getElementById('horarioContainer');
        if (horContainer) {
            const altText = "Horario del evento";
            horContainer.innerHTML = `<img src="${datos.horario_imagen}" class="horario-img" alt="${altText}" style="cursor:pointer;">`;
            const img = horContainer.querySelector('img');
            if (img) {
                img.onclick = () => {
                    if (typeof window.abrirLightbox === 'function') {
                        window.abrirLightbox(datos.horario_imagen, altText);
                    }
                };
            }
        }
    }

    aplicarColoresPreview(datos);

    // ──── ENTRADAS (PREVIEW) ────
    const entradasTexto = document.getElementById('entradasTexto');
    if (entradasTexto) {
        const entradasCard = entradasTexto.closest('.info-card');
        const tipoVenta = datos.tipo_venta || 'taquilla';
        const urlVentaOnline = datos.url_venta_online || '';

        if (tipoVenta === 'gratis') {
            entradasTexto.innerHTML = '🎟️ <strong>Entrada Gratuita</strong>';
            if (entradasCard) {
                entradasCard.style.display = 'block';
                entradasCard.classList.remove('clickable-card');
                entradasCard.removeAttribute('onclick');
                entradasCard.style.cursor = 'default';
            }
        } else {
            let html = '';
            switch (tipoVenta) {
                case 'online': html = `Entradas en línea: <a href="${urlVentaOnline}" target="_blank">Comprar aquí</a>`; break;
                case 'ambos': html = `Entradas en taquilla y en línea: <a href="${urlVentaOnline}" target="_blank">Comprar en línea</a>`; break;
                default: html = 'Entradas solo en taquilla';
            }
            entradasTexto.innerHTML = html;
            if (entradasCard) {
                entradasCard.style.display = 'block';
                entradasCard.classList.add('clickable-card');
                // Restauramos el onclick dinámicamente si es necesario
                entradasCard.onclick = () => {
                    const sec = document.getElementById('precios');
                    if (sec) sec.scrollIntoView({ behavior: 'smooth' });
                };
                entradasCard.style.cursor = 'pointer';
            }
        }
    }

    // ──── TABLAS (PRECIOS, ACTIVIDADES, EXPOSITORES) ────
    renderPreciosPreview(datos.precios);
    renderActividadesPreview(datos.actividades);
    if (datos.expositores) {
        import('./cargarExpositores.js').then(m => m.renderExpositores(datos.expositores));
    }

    // Galería
    renderGaleriaPreview(datos.galeria);

    // Mapas
    renderMapas(datos);

    // Visibilidad de Secciones (Precios y Expositores)
    toggleSeccionesOpcionales(datos);
}

function toggleSeccionesOpcionales(datos) {
    // Precios
    const seccionPrecios = document.getElementById('precios');
    const linkPrecios = document.querySelector('.nav-links a[href="#precios"]');
    const esGratis = datos.tipo_venta === 'gratis';
    if (seccionPrecios) seccionPrecios.style.display = esGratis ? 'none' : 'block';
    if (linkPrecios && linkPrecios.closest('li')) {
        linkPrecios.closest('li').style.display = esGratis ? 'none' : 'block';
    }

    // Expositores
    const seccionExpositores = document.getElementById('expositores');
    const linkExpositores = document.querySelector('.nav-links a[href="#expositores"]');
    const tieneExpositores = parseInt(datos.tiene_expositores) === 1;
    if (seccionExpositores) seccionExpositores.style.display = tieneExpositores ? 'block' : 'none';
    if (linkExpositores && linkExpositores.closest('li')) {
        linkExpositores.closest('li').style.display = tieneExpositores ? 'block' : 'none';
    }
}

function renderMapas(datos) {
    const container = document.getElementById('mapaIframe');
    if (!container) return;

    const g = (datos.mapa_embed || '').trim();
    const w = (datos.mapa_waze_embed || '').trim();

    if (!g && !w) {
        container.innerHTML = '<p style="text-align:center; color:#666;">No se ha configurado un mapa todavía.</p>';
        return;
    }

    if (g && w) {
        // AMBOS: Sistema de Tabs
        container.innerHTML = `
            <div class="map-tabs-container">
                <div class="map-tabs-header">
                    <button class="map-tab-btn active" data-target="google">
                        <i class="fab fa-google"></i> Google Maps
                    </button>
                    <button class="map-tab-btn" data-target="waze">
                        <i class="fab fa-waze"></i> Waze
                    </button>
                </div>
                <div class="map-tabs-content">
                    <div class="map-tab-pane active" id="pane-google">${renderSingleMapContent(g, 'google')}</div>
                    <div class="map-tab-pane" id="pane-waze">${renderSingleMapContent(w, 'waze')}</div>
                </div>
            </div>
        `;
        // Listener para tabs
        container.querySelectorAll('.map-tab-btn').forEach(btn => {
            btn.onclick = () => {
                container.querySelectorAll('.map-tab-btn, .map-tab-pane').forEach(el => el.classList.remove('active'));
                btn.classList.add('active');
                const target = btn.dataset.target;
                container.querySelector(`#pane-${target}`).classList.add('active');
            };
        });
    } else {
        // SOLO UNO
        const content = g || w;
        const type = g ? 'google' : 'waze';
        container.innerHTML = `<div class="map-tabs-container" style="aspect-ratio: 16/9; min-height: 350px;">${renderSingleMapContent(content, type)}</div>`;
    }
}

function renderSingleMapContent(content, type) {
    const isIframe = content.startsWith('<iframe');
    const label = type === 'google' ? 'Google Maps' : 'Waze';
    const icon = type === 'google' ? 'fa-google' : 'fa-waze';
    const themeClass = type === 'google' ? 'nav-google' : 'nav-waze';
    const btnClass = type === 'google' ? 'btn-google' : 'btn-waze';

    if (isIframe) {
        // Limpiar el iframe para que no tenga bordes ni anchos fijos
        let cleanIframe = content;
        if (cleanIframe.includes('width=')) cleanIframe = cleanIframe.replace(/width="[^"]*"/, 'width="100%"');
        if (cleanIframe.includes('height=')) cleanIframe = cleanIframe.replace(/height="[^"]*"/, 'height="100%"');
        if (cleanIframe.includes('style=')) cleanIframe = cleanIframe.replace(/style="[^"]*"/, 'style="border:0; width:100%; height:100%;"');
        return cleanIframe;
    } else {
        // Es un link
        return `
            <div class="nav-action-card ${themeClass}" style="background: #2c3e50; height: 100%;">
                <i class="fab ${icon} nav-card-icon"></i>
                <h3 style="color:white;">${label}</h3>
                <p style="color:rgba(255,255,255,0.8);">Abrir ubicación en la aplicación oficial.</p>
                <a href="${content}" target="_blank" class="btn-nav-action ${btnClass}">
                    Abrir ${label}
                </a>
            </div>
        `;
    }
}

function renderGaleriaPreview(galeria) {
    if (!galeria) return;
    const grid = document.getElementById('galeriaGrid');
    if (!grid) return;

    grid.innerHTML = '';
    galeria.sort((a, b) => a.orden - b.orden).forEach(item => {
        const div = document.createElement('div');
        div.className = 'galeria-item';
        div.innerHTML = `<img src="${item.imagen_url}" alt="Galería" class="gallery-img">`;
        div.onclick = () => {
            if (typeof window.abrirLightbox === 'function') {
                const allImgs = galeria.map(g => ({ src: g.imagen_url, alt: 'Galería' }));
                const idx = galeria.indexOf(item);
                window.abrirLightbox(allImgs, idx);
            }
        };
        grid.appendChild(div);
    });
}

function aplicarColoresPreview(datos) {
    // --- 1. DEFINICIÓN DE VARIABLES CSS ---
    const r = document.documentElement;
    const set = (prop, val, def) => r.style.setProperty(prop, val || def);

    set('--evento-primario', datos.color_primario, '#C8102E');
    set('--evento-secundario', datos.color_secundario, '#0033A0');
    set('--evento-fondo', datos.color_fondo, '#fdfdfd');
    set('--evento-texto', datos.color_texto, '#1a1a1a');
    set('--color-iconos', datos.color_iconos, '#C8102E');
    set('--color-descripcion-texto', datos.color_descripcion_texto, '#1a1a1a');
    set('--evento-overlay', datos.color_hero_overlay, 'rgba(0, 0, 0, 0.7)');

    set('--color-titulo-seccion', datos.color_titulo_seccion, '#1a1a1a');
    set('--color-titulo-hero', datos.color_titulo_hero, '#ffffff');
    set('--color-descripcion-hero', datos.color_descripcion_hero, '#ffffff');
    set('--color-fondo-fechas', datos.color_fondo_fechas, '#0033a0');
    set('--color-texto-fechas', datos.color_texto_fechas, '#c8102e');
    set('--color-fondo-share', datos.color_fondo_share, '#ffffff');
    set('--color-texto-share', datos.color_texto_share, '#1a1a1a');

    set('--color-menu-fondo', datos.color_menu_fondo, '#ffffff');
    set('--color-menu-texto', datos.color_menu_texto, '#ffffff');
    set('--color-menu-fondo-hover', datos.color_menu_fondo_hover, '');
    set('--color-menu-texto-hover', datos.color_menu_texto_hover, '');
    set('--color-titulo-h3', datos.color_titulo_h3, '#1a1a1a');

    set('--color-fondo-contacto', datos.color_fondo_contacto, '#fdfdfd');
    set('--color-texto-contacto', datos.color_texto_contacto, '#1a1a1a');
    set('--color-enlace-contacto', datos.color_enlace_contacto, '#c8102e');
    set('--color-fondo-footer', datos.color_fondo_footer, '#c8102e');
    set('--color-texto-footer', datos.color_texto_footer, '#ffffff');
    set('--color-buscador-expositores', datos.color_buscador_expositores, '#ffffff');
    set('--color-borde-buscador-expositores', datos.color_borde_buscador_expositores, '#eeeeee');

    const fondo = datos.color_fondo || '#fdfdfd';
    if (fondo) {
        // Aplicamos a nivel de variable CSS
        set('--evento-fondo', fondo, '#fdfdfd');

        // Aplicamos directamente a los elementos con !important para vencer cualquier CSS
        document.body.style.setProperty('background-color', fondo, 'important');
        document.documentElement.style.setProperty('background-color', fondo, 'important');

        // También quitamos gradientes que puedan estar estorbando en base.css
        document.body.style.setProperty('background-image', 'none', 'important');

        // Aplicamos a todas las secciones EXCEPTO a contacto (que tiene su propio selector)
        document.querySelectorAll('section:not(#contacto)').forEach(s => {
            s.style.setProperty('background-color', fondo, 'important');
        });

        // Aseguramos que el contenedor principal también sea transparente o use el fondo
        document.querySelectorAll('.container').forEach(c => {
            c.style.setProperty('background-color', 'transparent', 'important');
        });
    }

    // Aplicar color específico de contacto si existe
    if (datos.color_fondo_contacto) {
        const secContacto = document.getElementById('contacto');
        if (secContacto) {
            secContacto.style.setProperty('background-color', datos.color_fondo_contacto, 'important');
        }
    }

    // --- GESTIÓN DINÁMICA DE BOTONES DEL MENÚ (Base + Hover) ---
    let estiloMenu = document.getElementById('estilo-menu-dinamico');
    if (!estiloMenu) {
        estiloMenu = document.createElement('style');
        estiloMenu.id = 'estilo-menu-dinamico';
        document.head.appendChild(estiloMenu);
    }

    // Limpiar estilos inline previos para que el bloque de estilo dinámico mande
    document.querySelectorAll('.nav-links a').forEach(a => {
        a.style.backgroundColor = '';
        a.style.color = '';
    });

    const menuFondoBase = datos.color_menu_fondo || 'rgba(255,255,255,0.1)';
    const menuTextoBase = datos.color_menu_texto || '#ffffff';
    const menuFondoHover = datos.color_menu_fondo_hover || '#0033A0';
    const menuTextoHover = datos.color_menu_texto_hover || '#ffffff';

    estiloMenu.innerHTML = `
        .nav-links a {
            background-color: ${menuFondoBase} !important;
            color: ${menuTextoBase} !important;
            transition: all 0.3s ease !important;
        }
        .nav-links a:hover {
            background-color: ${menuFondoHover} !important;
            color: ${menuTextoHover} !important;
            transform: translateY(-2px) !important;
            box-shadow: 0 4px 12px rgba(0,0,0,0.2) !important;
        }
    `;

    // Aplicar color de la barra de navegación (Navbar)
    const colorPrimario = datos.color_primario || '#C8102E';
    const navBar = document.querySelector('.navbar');
    if (navBar) {
        navBar.style.setProperty('background-color', colorPrimario, 'important');
    }

    // Aplicar color de footer (Color Fondo Footer)
    if (datos.color_fondo_footer) {
        const foot = document.querySelector('footer');
        if (foot) foot.style.setProperty('background-color', datos.color_fondo_footer, 'important');
    }

    // Aplicar color de buscador de expositores
    if (datos.color_buscador_expositores) {
        const busc = document.getElementById('expositorSearchContainer');
        if (busc) busc.style.setProperty('background-color', datos.color_buscador_expositores, 'important');
    }

    if (datos.color_texto) document.body.style.color = datos.color_texto;

    const h1 = document.getElementById('eventoNombre');
    const desc = document.getElementById('eventoDescripcion');
    if (h1 && datos.color_titulo_hero) h1.style.color = datos.color_titulo_hero;
    if (desc && datos.color_descripcion_hero) desc.style.color = datos.color_descripcion_hero;
}

function renderPreciosPreview(precios) {
    if (!precios || precios.length === 0) return;
    const tablaPrecios = document.getElementById('tablaPrecios');
    if (tablaPrecios) {
        let html = `<table class="tabla-precios-estilo"><thead><tr><th>Fecha</th><th>Precio normal</th><th>Promoción</th><th>Detalle</th></tr></thead><tbody>`;
        precios.forEach(p => {
            const fecha = window.formatDateCR(p.fecha);
            const valorRaw = String(p.precio_normal || '0');
            const valorLimpio = valorRaw.replace(/[^\d]/g, '');
            const num = parseInt(valorLimpio, 10) || 0;
            const precioFormateado = new Intl.NumberFormat('es-CR', { style: 'currency', currency: 'CRC', minimumFractionDigits: 0 }).format(num);
            html += `<tr><td>${fecha}</td><td>${precioFormateado}</td><td>${p.promocion || '—'}</td><td>${p.descripcion_promocion || '—'}</td></tr>`;
        });
        html += `</tbody></table>`;
        tablaPrecios.innerHTML = html;
    }
}

function renderActividadesPreview(actividades) {
    if (!actividades) return;
    const grid = document.getElementById('actividadesGrid');
    if (!grid) return;
    grid.innerHTML = '';
    actividades.forEach(act => {
        const card = document.createElement('div');
        card.className = 'actividad-card';

        let imgHtml = '';
        const urls = parseImagenes(act.imagen);
        if (urls.length > 0) {
            imgHtml = buildMiniCarrusel(urls, act.titulo);
        }

        let ticketHtml = '';
        const isGratis = (act.es_gratis === 1 || act.esGratis === true || act.esGratis === 1);
        const isOnline = (act.requiere_entrada_online || act.reqOnline);

        if (isGratis) {
            ticketHtml = '<p style="color: #1a1a1a; font-weight: bold; margin-top: 10px;"><i class="fas fa-ticket-alt"></i> Actividad Gratuita</p>';
        } else {
            const isSoloOnline = (act.solo_online || act.soloOnline);
            let texto = 'Requiere entrada física';
            if (isSoloOnline) {
                texto = 'Requiere entrada (SOLO ONLINE)';
            } else if (isOnline) {
                texto = 'Requiere entrada online o física';
            }
            ticketHtml = `<p style="color: #2c3e50; font-weight: bold; margin-top: 10px;"><i class="fas fa-ticket-alt"></i> ${texto}</p>`;
        }
        const url = act.enlace_venta || act.enlace;
        if (isOnline && url) {
            ticketHtml += `
                <a href="${url}" target="_blank" class="btn-ver" style="display: inline-block; margin-top: 10px; background: #C8102E; color: white; padding: 6px 12px; border-radius: 4px; text-decoration: none;">
                    <i class="fas fa-shopping-cart"></i> Comprar entrada
                </a>`;
        }

        let videoHtml = '';
        const videoSrc = (act.video_url || act.video || '').trim();
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
                <div class="actividad-video-wrapper" style="margin-top:15px; text-align:center;">
                    <button type="button" class="btn-toggle-video btn-ver-mas">
                        <i class="fas fa-play-circle"></i> Ver video
                    </button>
                    <div class="video-container" style="display:none; margin-top:15px;">
                        ${mediaContent}
                    </div>
                </div>
            `;
        }

        card.innerHTML = `
            ${imgHtml}
            <div class="card-content">
                <h3>${act.titulo}</h3>
                <p><strong>Tipo:</strong> ${act.tipo}</p>
                <p><strong>Fecha:</strong> ${window.formatDateCR(act.fecha, 'short')} ${act.hora || ''}</p>
                <p><strong>Lugar:</strong> ${act.lugar}</p>
                ${window.formatDescription(act.descripcion)}
                ${videoHtml}
                <div class="ticket-info">
                    ${ticketHtml}
                </div>
            </div>`;
        grid.appendChild(card);
    });

    initCardListeners(grid);

    // Inicializar carrusel para actividades en preview
    import('./carrusel.js').then(m => {
        m.initResponsiveCarousel('actividadesWrapper', 'actividadesGrid', 'actividadesPrev', 'actividadesNext', 300);
    });
}

function buildMiniCarrusel(imagenes, altText) {
    if (!imagenes || imagenes.length === 0) return '<div class="placeholder-img" style="height:220px; background:#f0f0f0; border-radius:8px;"></div>';
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
            <button class="mini-btn mini-prev" aria-label="Anterior">❮</button>
            <button class="mini-btn mini-next" aria-label="Siguiente">❯</button>
            <div class="mini-dots">
                ${imagenes.map((_, i) => `<span class="mini-dot${i === 0 ? ' activo' : ''}"></span>`).join('')}
            </div>
        </div>`;
}

function initCardListeners(container) {
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

        carrusel.querySelector('.mini-prev').onclick = (e) => { e.stopPropagation(); ir(idx - 1); };
        carrusel.querySelector('.mini-next').onclick = (e) => { e.stopPropagation(); ir(idx + 1); };
        dots.forEach((dot, i) => dot.onclick = (e) => { e.stopPropagation(); ir(i); });

        // Lightbox desde mini-carrusel
        carrusel.addEventListener('click', (e) => {
            if (e.target.closest('.mini-btn') || e.target.closest('.mini-dots')) return;
            const imgNodes = Array.from(carrusel.querySelectorAll('.mini-slide img'));
            const slideList = Array.from(carrusel.querySelectorAll('.mini-slide'));
            const activeSlide = carrusel.querySelector('.mini-slide.activa');
            const activeIdx = slideList.indexOf(activeSlide);
            if (activeIdx !== -1) {
                e.stopPropagation();
                const galleryData = imgNodes.map(node => ({ src: node.src, alt: node.alt }));
                if (typeof window.abrirLightbox === 'function') {
                    window.abrirLightbox(galleryData, activeIdx);
                }
            }
        });
    });

    // Lightbox para imagen simple
    container.querySelectorAll('.card-img-principal').forEach(img => {
        img.style.cursor = 'pointer';
        img.addEventListener('click', (e) => {
            e.stopPropagation();
            if (typeof window.abrirLightbox === 'function') {
                window.abrirLightbox(img.src, img.alt);
            }
        });
    });

    // Toggle video
    container.querySelectorAll('.btn-toggle-video').forEach(btn => {
        btn.addEventListener('click', () => {
            const wrapper = btn.closest('.actividad-video-wrapper');
            const videoCont = wrapper.querySelector('.video-container');
            const isHidden = videoCont.style.display === 'none';

            if (isHidden) {
                videoCont.style.display = 'block';
                btn.innerHTML = 'Ocultar video';
                btn.classList.add('btn-ver-menos');
            } else {
                videoCont.style.display = 'none';
                btn.innerHTML = '<i class="fas fa-play-circle"></i> Ver video';
                btn.classList.remove('btn-ver-menos');
                const videoTag = videoCont.querySelector('video');
                if (videoTag) videoTag.pause();
            }
        });
    });
}

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



