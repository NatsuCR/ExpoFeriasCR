// frontend/js/evento/cargarEvento.js
import { abrirLightbox } from './lightbox.js';

// Las funciones window.toggleDesc y window.formatDescription se definen ahora centralmente en evento-main.js

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
        document.getElementById('infoUbicacion').innerHTML = ubicacion;
        document.getElementById('ubicacionTexto').innerHTML = ubicacion;

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

            let textoEntradas = '';
            switch (tipo_venta) {
                case 'online':
                    textoEntradas = `Entradas en línea: <a href="${url_venta_online}" target="_blank">Comprar aquí</a>`;
                    break;
                case 'ambos':
                    textoEntradas = `Entradas en taquilla y en línea: <a href="${url_venta_online}" target="_blank">Comprar en línea</a>`;
                    break;
                case 'gratis':
                    textoEntradas = '🎟️ <strong>Entrada Gratuita</strong>';
                    break;
                default:
                    textoEntradas = 'Entradas solo en taquilla del campo ferial';
            }
            entradasParrafo.innerHTML = videoHtml + textoEntradas;

            // Ocultar card de entradas si es gratuito
            const entradasCard = entradasParrafo.closest('.info-card');
            if (entradasCard) {
                entradasCard.style.display = (tipo_venta === 'gratis') ? 'none' : 'flex';
            }
        }

        // Lógica de visibilidad Nav
        const sectionPrecios = document.getElementById('precios');
        const linkPrecios = document.querySelector('.nav-links a[href="#precios"]');
        const linkUbicacion = document.querySelector('.nav-links a[href="#ubicacion"]');

        if (tipo_venta === 'gratis') {
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
        
        r.style.setProperty('--color-descripcion-texto', cdt || '#2c1a0e');
        r.style.setProperty('--color-descripcion-hero', cdh || '#ffffff');

        // Share
        const cfs = evento.color_fondo_share || 'rgba(255, 255, 255, 0.5)';
        const ctshare = evento.color_texto_share || '#2c1a0e';
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
        if (evento.color_buscador_expositores) document.getElementById('expositorSearchContainer').style.backgroundColor = evento.color_buscador_expositores;
        if (evento.color_borde_buscador_expositores) document.getElementById('expositorSearch').style.borderColor = evento.color_borde_buscador_expositores;

        if (evento.color_fondo_contacto) r.style.setProperty('--contacto-fondo', evento.color_fondo_contacto);
        if (evento.color_texto_contacto) r.style.setProperty('--contacto-texto', evento.color_texto_contacto);
        if (evento.color_enlace_contacto) r.style.setProperty('--contacto-enlace', evento.color_enlace_contacto);

        if (evento.color_fondo_footer) r.style.setProperty('--footer-fondo', evento.color_fondo_footer);
        if (evento.color_texto_footer) r.style.setProperty('--footer-texto', evento.color_texto_footer);

        if (evento.color_card_fondo) r.style.setProperty('--color-card-fondo', evento.color_card_fondo);
        if (evento.color_card_borde) r.style.setProperty('--color-card-borde', evento.color_card_borde);
        if (evento.color_rubro_fondo) r.style.setProperty('--color-rubro-fondo', evento.color_rubro_fondo);
        if (evento.color_rubro_texto) r.style.setProperty('--color-rubro-texto', evento.color_rubro_texto);
        if (evento.color_buscador_fondo) r.style.setProperty('--color-buscador-fondo', evento.color_buscador_fondo);
        if (evento.color_buscador_borde) r.style.setProperty('--color-buscador-borde', evento.color_buscador_borde);
        if (evento.color_btn_ver_mas) r.style.setProperty('--color-btn-ver-mas', evento.color_btn_ver_mas);

        return evento;

    } catch (err) {
        console.error('Error al cargar evento:', err);
        document.body.innerHTML = `<div style="padding:40px; text-align:center;"><h1>⚠️ ${err.message}</h1><a href="/">Volver</a></div>`;
    }
}