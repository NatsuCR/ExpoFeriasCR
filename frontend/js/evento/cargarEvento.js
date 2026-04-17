// frontend/js/evento/cargarEvento.js

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

        // Normalizar nombres de propiedades (DB vs CamelCase)
        const nombre = evento.nombre || '';
        const descripcion = evento.descripcion || '';
        const fechaInicio = evento.fecha_inicio || evento.fechaInicio;
        const fechaFin = evento.fecha_fin || evento.fechaFin;
        const ubicacion = evento.ubicacion || '';
        const horarioImgUrl = evento.horario_imagen || evento.horarioImagen;
        const mapaEmbed = evento.mapa_embed || evento.mapaEmbed;

        document.title = nombre;
        document.getElementById('eventoNombre').innerText = nombre;
        document.getElementById('eventoDescripcion').innerText = descripcion;

        const fmt = (dStr) => {
            if (!dStr || dStr === 'Invalid Date') return '—';
            try {
                const clean = (typeof dStr === 'string' && dStr.includes('T')) ? dStr.split('T')[0] : dStr;
                const d = new Date(clean + 'T12:00:00');
                if (isNaN(d.getTime())) return '—';
                return d.toLocaleDateString('es-CR', { day: '2-digit', month: 'long', year: 'numeric' });
            } catch (e) { return '—'; }
        };

        const fechaRango = `${fmt(fechaInicio)} al ${fmt(fechaFin)}`;
        document.getElementById('eventoFechas').innerHTML = fechaRango;
        document.getElementById('eventoInfoCompleta').innerHTML = typeof window.formatDescription === 'function' ? window.formatDescription(descripcion, true) : descripcion;
        document.getElementById('infoFechas').innerHTML = `${fmt(fechaInicio)} - ${fmt(fechaFin)}`;
        document.getElementById('infoUbicacion').innerHTML = ubicacion;
        document.getElementById('ubicacionTexto').innerHTML = ubicacion;

        // Horario
        const horarioDiv = document.getElementById('horarioContainer');
        if (horarioDiv) {
            let src = horarioImgUrl;
            // Manejar si viene como JSON de un array
            if (typeof src === 'string' && src.startsWith('[')) {
                try {
                    const parsed = JSON.parse(src);
                    if (Array.isArray(parsed) && parsed.length > 0) src = parsed[0];
                } catch (e) { }
            }

            if (src && src !== 'null' && src !== 'undefined') {
                const altText = `Horario oficial y cronograma de ${nombre}`;
                horarioDiv.innerHTML = `<img src="${src}" alt="${altText}" class="horario-img" style="max-width:100%; border-radius:8px; box-shadow:0 4px 10px rgba(0,0,0,0.1);" loading="lazy">`;
            } else {
                horarioDiv.innerHTML = '<p style="color:#999; font-style:italic;">Horario no disponible en este momento</p>';
            }
        }

        // Mapa
        const mapaDiv = document.getElementById('mapaIframe');
        if (mapaDiv) {
            if (mapaEmbed) {
                mapaDiv.innerHTML = mapaEmbed;
            } else {
                mapaDiv.innerHTML = '<p style="color:#999;">Mapa no disponible</p>';
            }
        }

        // Entradas
        const entradasParrafo = document.getElementById('entradasTexto');
        const tipoVenta = evento.tipo_venta || evento.tipoVenta;
        const urlVentaOnline = evento.url_venta_online || evento.urlVentaOnline;

        if (entradasParrafo) {
            let videoHtml = '';
            if (evento.video_url || evento.video) {
                const videoSrc = (evento.video_url || evento.video).trim();
                const isLocalVideo = videoSrc.match(/\.(mp4|webm|ogg|mov)(\?.*)?$/i) || videoSrc.startsWith('/assets/uploads/');

                if (isLocalVideo) {
                    videoHtml = `
                        <div class="video-container">
                            <video src="${videoSrc}" controls style="width:100%; border-radius:12px; aspect-ratio:16/9; background:#000;"></video>
                        </div>
                    `;
                } else {
                    // YouTube / Vimeo
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
            switch (tipoVenta) {
                case 'online':
                    textoEntradas = `Entradas en línea: <a href="${urlVentaOnline}" target="_blank">Comprar aquí</a>`;
                    break;
                case 'ambos':
                    textoEntradas = `Entradas en taquilla y en línea: <a href="${urlVentaOnline}" target="_blank">Comprar en línea</a>`;
                    break;
                default:
                    textoEntradas = 'Entradas solo en taquilla del campo ferial';
            }
            entradasParrafo.innerHTML = videoHtml + textoEntradas;
        }

        // Colores generales
        const cp = evento.color_primario || evento.colorPrimario;
        const cs = evento.color_secundario || evento.colorSecundario;
        const cf = evento.color_fondo || evento.colorFondo;
        const ct = evento.color_texto || evento.colorTexto;

        if (cp) document.documentElement.style.setProperty('--evento-primario', cp);
        if (cs) document.documentElement.style.setProperty('--evento-secundario', cs);
        if (cf) document.documentElement.style.setProperty('--evento-fondo', cf);
        if (ct) document.body.style.color = ct;

        // Color Fondo y Texto Share - Ahora color sólido
        const cfs = evento.color_fondo_share || evento.colorFondoShare || '#ffffff';
        const ctshare = evento.color_texto_share || evento.colorTextoShare || '#2c1a0e';
        document.documentElement.style.setProperty('--color-fondo-share', cfs);
        document.documentElement.style.setProperty('--color-texto-share', ctshare);

        // Opacidad Imagen Hero
        const cho = parseFloat(evento.color_hero_overlay || evento.colorHeroOverlay || '0.7');
        if (!isNaN(cho)) {
            document.documentElement.style.setProperty('--hero-img-opacity', cho);
            const overlay = document.querySelector('.hero-overlay');
            if (overlay) overlay.style.display = 'none';
        }

        // Hero: título, descripción, fechas
        const cth = evento.color_titulo_hero || evento.colorTituloHero;
        const cdh = evento.color_descripcion_hero || evento.colorDescripcionHero;
        const cff = evento.color_fondo_fechas || evento.colorFondoFechas;
        const ctf = evento.color_texto_fechas || evento.colorTextoFechas;

        const tituloHero = document.getElementById('eventoNombre');
        const descripcionHero = document.getElementById('eventoDescripcion');
        const fechasHero = document.querySelector('.hero-dates');

        if (tituloHero && cth) tituloHero.style.color = cth;
        if (descripcionHero && cdh) descripcionHero.style.color = cdh;
        if (fechasHero) {
            if (cff) fechasHero.style.backgroundColor = cff;
            if (ctf) fechasHero.style.color = ctf;
        }

        // Títulos Sección (h2)
        const ctseccion = evento.color_titulo_seccion || evento.colorTituloSeccion;
        if (ctseccion) {
            document.querySelectorAll('h2').forEach(h2 => h2.style.color = ctseccion);
        }

        // Menú gestionado vía variables CSS

        if (cmf) document.documentElement.style.setProperty('--color-menu-fondo', cmf);
        if (cmt) document.documentElement.style.setProperty('--color-menu-texto', cmt);
        if (cmfh) document.documentElement.style.setProperty('--color-menu-fondo-hover', cmfh);
        if (cmth) document.documentElement.style.setProperty('--color-menu-texto-hover', cmth);

        // Títulos H3
        const cth3 = evento.color_titulo_h3 || evento.colorTituloH3;
        if (cth3) {
            document.querySelectorAll('.info-card h3, .actividad-card h3, .expositor-card h3').forEach(h3 => {
                h3.style.color = cth3;
            });
        }

        // Color buscador y borde
        const cbf = evento.color_buscador_expositores || evento.colorBuscadorExpositores;
        const cbb = evento.color_borde_buscador_expositores || evento.colorBordeBuscadorExpositores;

        const searchContainer = document.getElementById('expositorSearchContainer');
        const searchInput = document.getElementById('expositorSearch');
        if (searchContainer && cbf) searchContainer.style.backgroundColor = cbf;
        if (searchInput && cbb) searchInput.style.borderColor = cbb;

        // Contacto
        const cfc = evento.color_fondo_contacto || evento.colorFondoContacto;
        const ctc = evento.color_texto_contacto || evento.colorTextoContacto;
        const cec = evento.color_enlace_contacto || evento.colorEnlaceContacto;

        const contactoSection = document.querySelector('.contacto');
        if (contactoSection) {
            const r = document.documentElement;
            // Limpiar estilos inline previos para dejar que las variables actúen
            contactoSection.style.backgroundColor = '';
            contactoSection.style.color = '';
            
            if (cfc) r.style.setProperty('--contacto-fondo', cfc);
            if (ctc) r.style.setProperty('--contacto-texto', ctc);
            if (cec) r.style.setProperty('--contacto-enlace', cec);
        }

        // Footer
        const cffoot = evento.color_fondo_footer || evento.colorFondoFooter;
        const ctfoot = evento.color_texto_footer || evento.colorTextoFooter;
        const footer = document.querySelector('footer');
        if (footer) {
            const r = document.documentElement;
            // Limpiar estilos inline previos para permitir personalización
            footer.style.backgroundColor = '';
            footer.style.color = '';
            
            if (cffoot) r.style.setProperty('--footer-fondo', cffoot);
            if (ctfoot) r.style.setProperty('--footer-texto', ctfoot);
        }

    } catch (err) {
        console.error('Error al cargar evento:', err);
        document.body.innerHTML = `<div style="padding:40px; text-align:center;"><h1>⚠️ ${err.message}</h1><a href="/">Volver</a></div>`;
    }
}