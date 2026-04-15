// frontend/js/evento/cargarEvento.js

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
    if (!text) return '';
    if (text.length <= 50) return `<p class="descripcion-texto descripcion">${text}</p>`;

    // Si es muy largo, cortamos y ponemos Ver más
    const shortText = text.substring(0, 50) + '...';
    return `
      <div class="desc-container" style="margin-bottom:10px; width:100%; max-width:100%; overflow-wrap: break-word;">
         <p class="descripcion-texto descripcion desc-short" style="margin:0;">${shortText}</p>
         <p class="descripcion-texto descripcion desc-full" style="display:none; margin:0; white-space:pre-wrap;">${text}</p>
         <button onclick="window.toggleDesc(this, true)" class="btn-ver-mas" style="background:none; border:none; color:var(--evento-primario, #C8102E); cursor:pointer; padding:0; text-decoration:underline; font-weight:bold; font-size:13px; margin-top:4px;">Ver más</button>
         <button onclick="window.toggleDesc(this, false)" class="btn-ver-menos" style="background:none; border:none; color:var(--evento-primario, #C8102E); cursor:pointer; padding:0; text-decoration:underline; font-weight:bold; font-size:13px; margin-top:4px; display:none;">Ver menos</button>
      </div>
    `;
};
export async function cargarEvento(slug) {
    try {
        const res = await fetch(`/api/eventos/${slug}`);
        const evento = await res.json();

        document.title = evento.nombre;
        document.getElementById('eventoNombre').innerText = evento.nombre;
        document.getElementById('eventoDescripcion').innerText = evento.descripcion;
        document.getElementById('eventoFechas').innerHTML = `${new Date(evento.fechaInicio).toLocaleDateString()} al ${new Date(evento.fechaFin).toLocaleDateString()}`;
        document.getElementById('eventoInfoCompleta').innerHTML = typeof window.formatDescription === 'function' ? window.formatDescription(evento.descripcion) : evento.descripcion;
        document.getElementById('infoFechas').innerHTML = `${new Date(evento.fechaInicio).toLocaleDateString()} - ${new Date(evento.fechaFin).toLocaleDateString()}`;
        document.getElementById('infoUbicacion').innerHTML = evento.ubicacion;
        document.getElementById('ubicacionTexto').innerHTML = evento.ubicacion;

        // Horario
        const horarioDiv = document.getElementById('horarioContainer');
        const horarioImgUrl = evento.horarioImagen || evento.horario_imagen;
        if (horarioImgUrl) {
            horarioDiv.innerHTML = `<img src="${horarioImgUrl}" class="horario-img" style="max-width:100%;">`;
        } else {
            horarioDiv.innerHTML = '<p>Horario no disponible</p>';
        }

        // Mapa
        const mapaDiv = document.getElementById('mapaIframe');
        if (evento.mapaEmbed) {
            mapaDiv.innerHTML = evento.mapaEmbed;
        } else {
            mapaDiv.innerHTML = '<p>Mapa no disponible</p>';
        }

        // Entradas
        const entradasParrafo = document.getElementById('entradasTexto');
        if (entradasParrafo) {
            let textoEntradas = '';
            switch (evento.tipoVenta) {
                case 'online':
                    textoEntradas = `Entradas en línea: <a href="${evento.urlVentaOnline}" target="_blank">Comprar aquí</a>`;
                    break;
                case 'ambos':
                    textoEntradas = `Entradas en taquilla y en línea: <a href="${evento.urlVentaOnline}" target="_blank">Comprar en línea</a>`;
                    break;
                default:
                    textoEntradas = 'Entradas solo en taquilla del campo ferial';
            }
            entradasParrafo.innerHTML = textoEntradas;
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

        // Overlay Hero
        const cho = evento.color_hero_overlay || evento.colorHeroOverlay;
        if (cho) {
            const overlay = document.querySelector('.hero-overlay');
            if (overlay) overlay.style.backgroundColor = cho;
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
        const cts = evento.color_titulo_seccion || evento.colorTituloSeccion;
        if (cts) {
            document.querySelectorAll('h2').forEach(h2 => h2.style.color = cts);
        }

        // Menú
        const cmf = evento.color_menu_fondo || evento.colorMenuFondo;
        const cmt = evento.color_menu_texto || evento.colorMenuTexto;
        const cmfh = evento.color_menu_fondo_hover || evento.colorMenuFondoHover;
        const cmth = evento.color_menu_texto_hover || evento.colorMenuTextoHover;

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

        // Contacto
        const cfc = evento.color_fondo_contacto || evento.colorFondoContacto;
        const ctc = evento.color_texto_contacto || evento.colorTextoContacto;
        const cec = evento.color_enlace_contacto || evento.colorEnlaceContacto;
        
        const contactoSection = document.querySelector('.contacto');
        if (contactoSection) {
            if (cfc) contactoSection.style.backgroundColor = cfc;
            if (ctc) contactoSection.style.color = ctc;
            if (cec) {
                contactoSection.querySelectorAll('a').forEach(enlace => enlace.style.color = cec);
            }
        }

        // Footer
        const cffoot = evento.color_fondo_footer || evento.colorFondoFooter;
        const ctfoot = evento.color_texto_footer || evento.colorTextoFooter;
        const footer = document.querySelector('footer');
        if (footer) {
            if (cffoot) footer.style.backgroundColor = cffoot;
            if (ctfoot) {
                footer.style.color = ctfoot;
                footer.querySelectorAll('p').forEach(p => p.style.color = ctfoot);
            }
        }
        
        // Color Buscador Expositores
        const cbe = evento.color_buscador_expositores || evento.colorBuscadorExpositores;
        if (cbe) {
            window.colorBuscadorExpositores = cbe;
            const searchBar = document.querySelector('.expositor-search-bar');
            if (searchBar) searchBar.style.backgroundColor = cbe;
        }

    } catch (err) {
        console.error(err);
        document.body.innerHTML = '<h1>Evento no encontrado</h1><a href="/">Volver</a>';
    }
}