// frontend/js/evento/cargarEvento.js
import { abrirLightbox } from './lightbox.js';

// ──── POPUP DE ANUNCIO (3 seg) ANTES DE IR A COMPRAR ENTRADAS ────
window.mostrarPopupCompra = function (targetUrl) {
    // Si el usuario es administrador, saltar el popup y abrir directamente
    const user = typeof window.getUsuarioStorage === 'function' ? window.getUsuarioStorage() : JSON.parse(localStorage.getItem('usuario') || 'null');
    if (user && user.rol === 'admin') {
        window.open(targetUrl, '_blank');
        return;
    }

    const existing = document.getElementById('ad-popup-overlay');
    if (existing) existing.remove();

    const overlay = document.createElement('div');
    overlay.id = 'ad-popup-overlay';

    overlay.innerHTML = `
        <div id="ad-popup-card" style="position: relative;">
            <button id="ad-popup-close" style="display:none; position:absolute; top:10px; right:15px; background:transparent; border:none; font-size:24px; cursor:pointer; font-weight:bold; color:#555;">&times;</button>
            <div id="ad-popup-header">
                <img 
                    src="/assets/images/LogoOficialExpoFeriasCR/LogoExpoFeriasCR1.png" 
                    alt="ExpoFeriasCR" 
                    id="ad-popup-logo"
                >
                <p id="ad-popup-msg">
                    Apoya a <strong>ExpoFeriasCR</strong> viendo este anuncio
                </p>
                <div id="ad-popup-timer">
                    <span id="ad-popup-count">3</span>
                </div>
            </div>
            <div id="ad-popup-ad">
                <div id="adsterra-container"></div>
            </div>
            <a 
                href="${targetUrl}" 
                target="_blank"
                id="ad-popup-skip" 
                class="ad-popup-btn" 
                style="display:none;"
            >
                Ir a comprar entradas &rarr;
            </a>
        </div>
    `;

    document.body.appendChild(overlay);

    window.atOptions = {
        key: 'd24a04b077cc5a19d8ab72ae7e33176e',
        format: 'iframe',
        height: 90,
        width: 728,
        params: {}
    };
    const adScript = document.createElement('script');
    adScript.src = 'https://www.highperformanceformat.com/d24a04b077cc5a19d8ab72ae7e33176e/invoke.js';
    adScript.async = true;
    const adContainer = document.getElementById('adsterra-container');
    if (adContainer) adContainer.appendChild(adScript);

    const socialScript2 = document.createElement('script');
    socialScript2.src = 'https://pl29512242.effectivecpmnetwork.com/2f/ea/c5/2feac537f8e60dd7004660d723aa9672.js';
    document.body.appendChild(socialScript2);

    setTimeout(() => overlay.classList.add('active'), 10);

    let timeLeft = 3;
    const countEl = document.getElementById('ad-popup-count');
    const skipBtn = document.getElementById('ad-popup-skip');
    const closeBtn = document.getElementById('ad-popup-close');

    const timer = setInterval(() => {
        timeLeft--;
        if (countEl) countEl.textContent = timeLeft;
        if (timeLeft <= 0) {
            clearInterval(timer);
            if (countEl) countEl.closest('#ad-popup-timer').style.display = 'none';
            if (skipBtn) skipBtn.style.display = 'inline-block';
        }
    }, 1000);

    if (skipBtn) {
        skipBtn.addEventListener('click', (e) => {
            if (closeBtn) closeBtn.style.display = 'block';
        });
    }

    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            overlay.classList.remove('active');
            setTimeout(() => overlay.remove(), 300);
        });
    }
};

export async function cargarEvento(slug) {
    try {
        const urlParams = new URLSearchParams(window.location.search);
        const isPreview = urlParams.get('preview') === '1';
        const dataKey = urlParams.get('dataKey');

        let evento;
        if (isPreview && dataKey) {
            console.log('[Preview Mode] Loading from localStorage:', dataKey);
            const data = localStorage.getItem(dataKey);
            if (!data) throw new Error('Datos de vista previa no encontrados');
            evento = JSON.parse(data);
        } else {
            const res = await fetch(`/api/eventos/${slug}`);
            if (!res.ok) throw new Error('Evento no encontrado');
            evento = await res.json();
        }

        // Normalizar nombres de propiedades (ESTÁNDAR: snake_case)
        const nombre = evento.nombre || '';
        const descripcion = evento.descripcion || '';
        const fecha_inicio = evento.fecha_inicio;
        const fecha_fin = evento.fecha_fin;
        const ubicacion = evento.ubicacion || '';
        const horario_imagen_url = evento.horario_imagen;
        const mapa_embed = (evento.mapa_embed || '').trim();
        const mapa_waze_embed = (evento.mapa_waze_embed || '').trim();

        // Manejo de tiene_expositores
        const tiene_expositores = (evento.tiene_expositores !== undefined && evento.tiene_expositores !== null)
            ? parseInt(evento.tiene_expositores)
            : 1;

        console.log('[cargarEvento] Config Normalizada (snake_case):', {
            tiene_expositores,
            has_google: mapa_embed.length > 5,
            has_waze: mapa_waze_embed.length > 5,
            tipo_venta: evento.tipo_venta
        });

        document.title = nombre;
        document.getElementById('eventoNombre').innerText = nombre;
        document.getElementById('eventoDescripcion').innerHTML = typeof window.formatDescription === 'function' ? window.formatDescription(descripcion) : descripcion;

        const fmt = (d) => window.formatDateCR(d);

        const fechaRango = `${fmt(fecha_inicio)} al ${fmt(fecha_fin)}`;
        document.getElementById('eventoFechas').innerHTML = fechaRango;
        document.getElementById('eventoInfoCompleta').innerHTML = typeof window.formatDescription === 'function' ? window.formatDescription(descripcion, true) : descripcion;
        document.getElementById('infoFechas').innerHTML = `${fmt(fecha_inicio)} - ${fmt(fecha_fin)}`;

        // Jerarquía Administrativa (Distrito, Cantón, Provincia)
        const esInternacional = evento.provincia === 'Internacional';
        const jerarquiaAdmin = [
            evento.distrito,
            evento.canton,
            evento.provincia,
            esInternacional ? '' : 'Costa Rica'
        ].filter(Boolean).join(', ');

        // Ubicación Completa (para otros usos si se requiere)
        const ubicacionFull = [ubicacion, jerarquiaAdmin].filter(Boolean).join(', ');

        document.getElementById('infoUbicacion').innerHTML = ubicacionFull;
        document.getElementById('ubicacionTexto').innerHTML = jerarquiaAdmin;

        const exactElem = document.getElementById('ubicacionExactaTexto');
        if (exactElem) {
            exactElem.innerHTML = `📍 ${ubicacion}`;
            exactElem.style.display = ubicacion ? 'block' : 'none';
        }

        // Horario
        const sectionHorario = document.getElementById('seccion-horario');
        const horarioDiv = document.getElementById('horarioContainer');
        if (horarioDiv) {
            let src = horario_imagen_url;
            if (typeof src === 'string' && src.startsWith('[')) {
                try {
                    const parsed = JSON.parse(src);
                    if (Array.isArray(parsed) && parsed.length > 0) src = parsed[0];
                } catch (e) { }
            }

            if (src && src !== 'null' && src !== 'undefined' && src.trim() !== '') {
                const altText = `Horario oficial y cronograma de ${nombre}`;
                horarioDiv.innerHTML = `<img src="${src}" alt="${altText}" class="horario-img" style="max-width:100%; border-radius:8px; box-shadow:0 4px 10px rgba(0,0,0,0.1); cursor:pointer;" loading="lazy">`;

                const img = horarioDiv.querySelector('img');
                if (img) {
                    img.addEventListener('click', () => abrirLightbox(src, altText));
                }
                if (sectionHorario) sectionHorario.style.display = 'block';
            } else {
                if (sectionHorario) sectionHorario.style.display = 'none';
            }
        }

        // Mapa (Smart Detection System)
        const mapaDiv = document.getElementById('mapaIframe');

        function renderMapContent(input, type) {
            if (!input) return '';
            if (input.toLowerCase().startsWith('<iframe')) return input;

            const isWaze = type === 'waze';
            const icon = isWaze ? 'fab fa-waze' : 'fab fa-google';
            const appName = isWaze ? 'Waze' : 'Google Maps';
            const btnClass = isWaze ? 'btn-waze' : 'btn-google';
            const navClass = isWaze ? 'nav-waze' : 'nav-google';

            return `
                <div class="nav-action-card ${navClass}">
                    <div class="nav-card-icon"><i class="${icon}"></i></div>
                    <h3>${appName}</h3>
                    <p>Enlace de navegación detectado. Toca el botón para abrir la ruta en tu dispositivo.</p>
                    <a href="${input}" target="_blank" class="btn-nav-action ${btnClass}">
                        <i class="fas fa-external-link-alt"></i> Ir a ${appName}
                    </a>
                </div>
            `;
        }

        if (mapaDiv) {
            const hasGoogle = mapa_embed && mapa_embed.length > 5 && mapa_embed !== 'null';
            const hasWaze = mapa_waze_embed && mapa_waze_embed.length > 5 && mapa_waze_embed !== 'null';

            if (hasGoogle && hasWaze) {
                mapaDiv.innerHTML = `
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
                            <div class="map-tab-pane active" id="pane-google">${renderMapContent(mapa_embed, 'google')}</div>
                            <div class="map-tab-pane" id="pane-waze">${renderMapContent(mapa_waze_embed, 'waze')}</div>
                        </div>
                    </div>
                `;
                const btns = mapaDiv.querySelectorAll('.map-tab-btn');
                const panes = mapaDiv.querySelectorAll('.map-tab-pane');
                btns.forEach(btn => {
                    btn.addEventListener('click', () => {
                        btns.forEach(b => b.classList.remove('active'));
                        panes.forEach(p => p.classList.remove('active'));
                        btn.classList.add('active');
                        const target = btn.getAttribute('data-target');
                        mapaDiv.querySelector(`#pane-${target}`).classList.add('active');
                    });
                });
            } else if (hasGoogle) {
                mapaDiv.innerHTML = renderMapContent(mapa_embed, 'google');
            } else if (hasWaze) {
                mapaDiv.innerHTML = renderMapContent(mapa_waze_embed, 'waze');
            } else {
                mapaDiv.innerHTML = `
                    <div class="mapa-fallback-card" onclick="window.open('https://www.google.com/maps/search/${encodeURIComponent(ubicacion)}', '_blank')">
                        <div class="fallback-icon-wrap"><i class="fas fa-map-marker-alt"></i></div>
                        <div class="fallback-content">
                            <h4>${ubicacion}</h4>
                            <p>Toca para abrir en el mapa</p>
                        </div>
                    </div>
                `;
            }
        }

        // Entradas
        const entradasParrafo = document.getElementById('entradasTexto');
        const tipo_venta = evento.tipo_venta || 'taquilla';
        const url_venta_online = evento.url_venta_online || '';

        if (entradasParrafo) {
            let videoHtml = '';
            if (evento.video_url) {
                const videoSrc = (evento.video_url).trim();
                const isLocalVideo = videoSrc.match(/\.(mp4|webm|ogg|mov)(\?.*)?$/i) || videoSrc.startsWith('/assets/uploads/');

                if (isLocalVideo) {
                    videoHtml = `
                        <div class="video-container">
                            <video src="${videoSrc}" controls style="width:100%; border-radius:12px; aspect-ratio:16/9; background:#000;"></video>
                        </div>
                    `;
                } else {
                    let embedUrl = videoSrc;
                    if (videoSrc.includes('youtube.com/watch?v=')) {
                        embedUrl = videoSrc.replace('watch?v=', 'embed/');
                    } else if (videoSrc.includes('youtu.be/')) {
                        embedUrl = videoSrc.replace('youtu.be/', 'youtube.com/embed/');
                    }
                    videoHtml = `
                        <div class="video-container">
                            <iframe src="${embedUrl}" frameborder="0" allowfullscreen></iframe>
                        </div>
                    `;
                }
            }

            let htmlContent = '';
            const ventaUrl = (url_venta_online || '').trim();
            let imgUrlParam = '';
            try {
                if (evento.imagen_portada && evento.imagen_portada.startsWith('[')) {
                    const parsed = JSON.parse(evento.imagen_portada);
                    if (parsed.length > 0) imgUrlParam = parsed[0];
                } else {
                    imgUrlParam = evento.imagen_portada || evento.horario_imagen || '';
                }
            } catch (e) {
                imgUrlParam = evento.imagen_portada || '';
            }
            const interstitialUrl = ventaUrl ? `/interstitial.html?url=${encodeURIComponent(ventaUrl)}&img=${encodeURIComponent(imgUrlParam)}` : '#';

            switch (tipo_venta) {
                case 'online':
                    htmlContent = `Entradas solo en línea`;
                    if (ventaUrl) htmlContent += `<br><a href="${interstitialUrl}" target="_blank" style="color:var(--evento-primario); font-weight:bold; text-decoration:underline;">Comprar aquí</a>`;
                    break;
                case 'ambos':
                    htmlContent = `Entradas en taquilla y en línea`;
                    if (ventaUrl) htmlContent += `<br><a href="${interstitialUrl}" target="_blank" style="color:var(--evento-primario); font-weight:bold; text-decoration:underline;">Comprar en línea</a>`;
                    break;
                case 'gratis':
                    htmlContent = '<strong>Entrada Gratuita</strong>';
                    break;
                case 'en vivo online':
                    htmlContent = '<strong>🔴 Evento en vivo online</strong>';
                    if (ventaUrl) htmlContent += `<br><a href="${interstitialUrl}" target="_blank" style="color:var(--evento-primario); font-weight:bold; text-decoration:underline;">Ver en vivo aquí</a>`;
                    break;
                default:
                    htmlContent = 'Entradas solo en taquilla del campo ferial';
            }
            entradasParrafo.innerHTML = videoHtml + htmlContent;

            // Asegurar que la tarjeta sea visible siempre y con layout correcto
            const entradasCard = entradasParrafo.closest('.info-card');
            if (entradasCard) {
                entradasCard.style.display = 'flex';
                entradasCard.style.flexDirection = 'column';
                entradasCard.style.alignItems = 'center';
                entradasCard.style.justifyContent = 'center';

                // Si es gratis, quitamos el puntero de scroll ya que no hay sección de precios
                if (tipo_venta === 'gratis') entradasCard.style.pointerEvents = 'none';
                else entradasCard.style.pointerEvents = 'auto';
            }
        }

        // Lógica de visibilidad Nav
        const sectionPrecios = document.getElementById('precios');
        const linkPrecios = document.querySelector('.nav-links a[href="#precios"]');
        const linkUbicacion = document.querySelector('.nav-links a[href="#ubicacion"]');

        if (tipo_venta === 'gratis' || tipo_venta === 'en vivo online') {
            if (sectionPrecios) sectionPrecios.style.display = 'none';
            if (linkPrecios) linkPrecios.closest('li').style.display = 'none';
        } else {
            if (sectionPrecios) sectionPrecios.style.display = 'block';
            if (linkPrecios) linkPrecios.closest('li').style.display = 'block';
            if (linkUbicacion) linkUbicacion.closest('li').style.display = 'block';
        }

        // Expositores
        const sectionExpositores = document.getElementById('expositores');
        const linkExpositores = document.querySelector('.nav-links a[href="#expositores"]');

        if (tiene_expositores == 1) { // 1 = NO tiene expositores
            if (sectionExpositores) sectionExpositores.style.display = 'none';
            if (linkExpositores) linkExpositores.closest('li').style.display = 'none';
        } else {
            if (sectionExpositores) sectionExpositores.style.display = 'block';
            if (linkExpositores) linkExpositores.closest('li').style.display = 'block';
        }

        // Estilos Dinámicos (SIEMPRE snake_case)
        const cp = evento.color_primario;
        const cs = evento.color_secundario;
        const cf = evento.color_fondo;
        const ct = evento.color_texto;
        const cdt = evento.color_descripcion_texto;
        const cdh = evento.color_descripcion_hero;
        const cth = evento.color_titulo_hero;
        const cff = evento.color_fondo_fechas;
        const ctf = evento.color_texto_fechas;

        const r = document.documentElement;

        if (cp) r.style.setProperty('--evento-primario', cp);
        if (cs) r.style.setProperty('--evento-secundario', cs);
        if (cf) r.style.setProperty('--evento-fondo', cf);
        if (ct) document.body.style.color = ct;
        if (evento.color_iconos) r.style.setProperty('--color-iconos', evento.color_iconos);

        r.style.setProperty('--color-descripcion-texto', cdt || '#1a1a1a');
        r.style.setProperty('--color-descripcion-hero', cdh || '#ffffff');

        // Share
        const cfs = evento.color_fondo_share || 'rgba(255, 255, 255, 0.5)';
        const ctshare = evento.color_texto_share || '#1a1a1a';
        r.style.setProperty('--color-fondo-share', cfs);
        r.style.setProperty('--color-texto-share', ctshare);

        // Oscuridad Hero
        const overlayVal = evento.color_hero_overlay || 'rgba(0,0,0,0.7)';
        const overlay = document.querySelector('.hero-overlay');
        if (overlay) {
            if (!isNaN(parseFloat(overlayVal)) && typeof overlayVal === 'string' && !overlayVal.includes('rgba')) {
                overlay.style.backgroundColor = `rgba(0,0,0,${overlayVal})`;
            } else if (typeof overlayVal === 'number') {
                overlay.style.backgroundColor = `rgba(0,0,0,${overlayVal})`;
            } else {
                overlay.style.backgroundColor = overlayVal;
            }
            overlay.style.display = 'block';
        }

        // Aplicar a elementos específicos
        const tituloHero = document.getElementById('eventoNombre');
        const descripcionHero = document.getElementById('eventoDescripcion');
        const fechasHero = document.querySelector('.hero-dates');
        if (tituloHero && cth) tituloHero.style.color = cth;
        if (descripcionHero && cdh) descripcionHero.style.color = cdh;
        if (fechasHero) {
            if (cff) fechasHero.style.backgroundColor = cff;
            if (ctf) fechasHero.style.color = ctf;
        }

        // Títulos Sección y Menú
        const ctseccion = evento.color_titulo_seccion;
        if (ctseccion) document.querySelectorAll('h2').forEach(h2 => h2.style.color = ctseccion);

        if (evento.color_menu_fondo) r.style.setProperty('--color-menu-fondo', evento.color_menu_fondo);
        if (evento.color_menu_texto) r.style.setProperty('--color-menu-texto', evento.color_menu_texto);
        if (evento.color_menu_fondo_hover) r.style.setProperty('--color-menu-fondo-hover', evento.color_menu_fondo_hover);
        if (evento.color_menu_texto_hover) r.style.setProperty('--color-menu-texto-hover', evento.color_menu_texto_hover);

        // H3, Buscador, Contacto, Footer, etc
        if (evento.color_titulo_h3) document.querySelectorAll('.info-card h3, .actividad-card h3, .expositor-card h3').forEach(h3 => h3.style.color = evento.color_titulo_h3);
        if (evento.color_buscador_expositores) r.style.setProperty('--color-buscador-expositores', evento.color_buscador_expositores);
        if (evento.color_borde_buscador_expositores) r.style.setProperty('--color-borde-buscador-expositores', evento.color_borde_buscador_expositores);

        if (evento.color_fondo_contacto) r.style.setProperty('--contacto-fondo', evento.color_fondo_contacto);
        if (evento.color_texto_contacto) r.style.setProperty('--contacto-texto', evento.color_texto_contacto);
        if (evento.color_enlace_contacto) r.style.setProperty('--contacto-enlace', evento.color_enlace_contacto);

        if (evento.color_fondo_footer) r.style.setProperty('--color-fondo-footer', evento.color_fondo_footer);
        if (evento.color_texto_footer) r.style.setProperty('--color-texto-footer', evento.color_texto_footer);

        return evento;

    } catch (err) {
        console.error('Error al cargar evento:', err);
        document.body.innerHTML = `<div style="padding:40px; text-align:center;"><h1>⚠️ ${err.message}</h1><a href="/">Volver</a></div>`;
    }
}


