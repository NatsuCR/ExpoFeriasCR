/**
 * previewManager.js
 * Vista previa en iframe para crear-evento (vista usuario).
 * Espeja EXACTAMENTE lo que hace cargarEvento.js en la página real.
 */

let previewAbierto = false;
let previewTimer   = null;

export function getIframe()  { return document.getElementById('previewIframe'); }
export function getSlug()    { return (document.getElementById('slug')?.value || '').trim(); }

export function actualizarUrlBar() {
    const slug   = getSlug();
    const urlBar = document.getElementById('previewUrlBar');
    if (!urlBar) return;
    urlBar.textContent = slug
        ? `/evento.html?slug=${encodeURIComponent(slug)}`
        : '/evento.html?slug=...';
}

// ─── Recolectar todos los datos del formulario de usuario ─────────────────────
export function guardarDatosPreview() {
    const get = id => (document.getElementById(id)?.value || '').trim();

    const datos = {
        nombre:           get('nombre'),
        descripcion:      get('descripcion'),
        fecha_inicio:     get('fecha_inicio'),
        fecha_fin:        get('fecha_fin'),
        ubicacion:        get('ubicacion'),
        provincia:        get('provincia'),
        imagen_portada:   get('imagen_portada'),
        horario_imagen:   get('horario_imagen'),
        mapa_embed:       get('mapa_embed'),
        tipo_venta:       get('tipo_venta'),
        url_venta_online: get('url_venta_online'),

        // ── Los 20 colores exactos de la BD ──────────────────────────────────
        color_primario:         get('color_primario')         || '#8b5a2b',
        color_secundario:       get('color_secundario')       || '#d4a373',
        color_fondo:            get('color_fondo')            || '#f4e4c1',
        color_texto:            get('color_texto')            || '#2c1a0e',
        color_hero_overlay:     get('color_hero_overlay')     || 'rgba(62,42,31,0.7)',
        color_titulo_hero:      get('color_titulo_hero')      || '#ffffff',
        color_descripcion_hero: get('color_descripcion_hero') || '#ffffff',
        color_fondo_fechas:     get('color_fondo_fechas')     || '#d4a373',
        color_texto_fechas:     get('color_texto_fechas')     || '#8b5a2b',
        color_titulo_seccion:   get('color_titulo_seccion')   || '#2c1a0e',
        color_menu_fondo:       get('color_menu_fondo')       || '#ffffff',
        color_menu_texto:       get('color_menu_texto')       || '#ffffff',
        color_menu_fondo_hover: get('color_menu_fondo_hover') || '',
        color_menu_texto_hover: get('color_menu_texto_hover') || '',
        color_titulo_h3:        get('color_titulo_h3')        || '#2c1a0e',
        color_fondo_contacto:   get('color_fondo_contacto')   || '#f4e4c1',
        color_texto_contacto:   get('color_texto_contacto')   || '#2c1a0e',
        color_enlace_contacto:  get('color_enlace_contacto')  || '#8b5a2b',
        color_fondo_footer:     get('color_fondo_footer')     || '#8b5a2b',
        color_texto_footer:     get('color_texto_footer')     || '#ffffff'
    };

    // Precios
    datos.precios = Array.from(document.querySelectorAll('#precios-rows tr')).map(row => ({
        fecha:                 row.querySelector('.precio-fecha')?.value || '',
        precio_normal:         parseFloat(row.querySelector('.precio-monto')?.value) || 0,
        promocion:             row.querySelector('.precio-promocion')?.value || '',
        descripcion_promocion: row.querySelector('.precio-descripcion')?.value || ''
    })).filter(p => p.fecha);

    // Actividades
    datos.actividades = Array.from(document.querySelectorAll('#actividades-rows tr')).map(row => ({
        titulo:                  row.querySelector('.act-titulo')?.value || '',
        tipo:                    row.querySelector('.act-tipo')?.value || '',
        fecha:                   row.querySelector('.act-fecha')?.value || '',
        hora:                    row.querySelector('.act-hora')?.value || null,
        lugar:                   row.querySelector('.act-lugar')?.value || '',
        descripcion:             row.querySelector('.act-descripcion')?.value || '',
        imagenes: (() => { try { return JSON.parse(row.querySelector('.act-imagenes')?.value || '[]'); } catch(e){ return []; } })(),
        es_gratis:               row.querySelector('.act-gratis')?.dataset.value === 'true' ? 1 : 0,
        requiere_entrada_online: row.querySelector('.act-requiere-online')?.dataset.value === 'true',
        enlace_venta:            row.querySelector('.act-enlace')?.value || ''
    })).filter(a => a.titulo);

    // Expositores
    datos.expositores = Array.from(document.querySelectorAll('#expositores-rows tr')).map(row => ({
        nombre:      row.querySelector('.exp-nombre')?.value || '',
        rubro:       row.querySelector('.exp-rubro')?.value || '',
        ubicacion:   row.querySelector('.exp-ubicacion')?.value || '',
        descripcion: row.querySelector('.exp-descripcion')?.value || '',
        logo:        row.querySelector('.exp-logo')?.value || '',
        video:       row.querySelector('.exp-video')?.value || ''
    })).filter(e => e.nombre);

    // Galería
    datos.galeria = Array.from(document.querySelectorAll('#galeria-rows tr')).map(row => ({
        imagen_url: row.querySelector('.gal-url')?.value || '',
        orden:      parseInt(row.querySelector('.gal-orden')?.value) || 0
    })).filter(g => g.imagen_url);

    const previewKey = 'preview_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    localStorage.setItem(previewKey, JSON.stringify(datos));
    window.previewDataKey = previewKey;
    return previewKey;
}

// ─── Programar actualización en vivo (debounce) ───────────────────────────────
export function programarActualizacion() {
    clearTimeout(previewTimer);
    previewTimer = setTimeout(() => {
        guardarDatosPreview();
        setTimeout(aplicarCambiosEnVivo, 100);
    }, 400);
}

// ─── Abrir / cerrar / toggle panel ───────────────────────────────────────────
export function abrirPreview() {
    const panel  = document.getElementById('previewPanel');
    const layout = document.getElementById('formLayout');
    panel.classList.add('visible');
    layout.classList.add('with-preview');
    previewAbierto = true;
    document.getElementById('btnTogglePreview').innerHTML = '<i class="fas fa-eye-slash"></i> Ocultar preview';

    const dataKey = guardarDatosPreview();
    const iframe  = getIframe();
    iframe.src    = `/evento.html?preview=1&dataKey=${dataKey}`;

    iframe.addEventListener('load', () => {
        setTimeout(aplicarCambiosEnVivo, 300);
    }, { once: true });
}

export function cerrarPreview() {
    document.getElementById('previewPanel').classList.remove('visible');
    document.getElementById('formLayout').classList.remove('with-preview');
    previewAbierto = false;
    document.getElementById('btnTogglePreview').innerHTML = '<i class="fas fa-eye"></i> Vista previa';
}

export function togglePreview() {
    if (previewAbierto) { cerrarPreview(); } else { abrirPreview(); }
}

// ─── Aplicar colores en vivo (sin recargar iframe) ───────────────────────────
// Espeja EXACTAMENTE el orden y lógica de cargarEvento.js
export function aplicarCambiosEnVivo() {
    const iframe = getIframe();
    let doc;
    try { doc = iframe.contentDocument; } catch (_) { return; }
    if (!doc || !doc.body) return;

    const get = id => (document.getElementById(id)?.value || '').trim();

    // ── Textos ───────────────────────────────────────────────────────────────
    const h1 = doc.getElementById('eventoNombre');
    if (h1) h1.innerText = get('nombre') || 'Sin nombre';

    const desc = doc.getElementById('eventoDescripcion');
    if (desc) desc.innerText = get('descripcion');

    const infoCompleta = doc.getElementById('eventoInfoCompleta');
    if (infoCompleta) infoCompleta.innerText = get('descripcion');

    // Fechas hero
    const fmt = s => s ? new Date(s + 'T12:00:00').toLocaleDateString('es-CR', { day:'2-digit', month:'short', year:'numeric' }) : '?';
    const fi = get('fecha_inicio'), ff = get('fecha_fin');

    const eventoFechas = doc.getElementById('eventoFechas');
    if (eventoFechas) eventoFechas.innerText = fi || ff ? (fi === ff ? fmt(fi) : `${fmt(fi)} al ${fmt(ff)}`) : '';

    const infoFechas = doc.getElementById('infoFechas');
    if (infoFechas) infoFechas.innerText = fi && ff ? `${fmt(fi)} - ${fmt(ff)}` : '';

    const infoUbicacion = doc.getElementById('infoUbicacion');
    if (infoUbicacion) infoUbicacion.innerText = get('ubicacion');

    const ubicacionTexto = doc.getElementById('ubicacionTexto');
    if (ubicacionTexto) ubicacionTexto.innerText = get('ubicacion');

    // Horario
    const horarioDiv = doc.getElementById('horarioContainer');
    if (horarioDiv) {
        const horarioImg = get('horario_imagen');
        horarioDiv.innerHTML = horarioImg
            ? `<img src="${horarioImg}" class="horario-img" style="max-width:100%;">`
            : '<p>Horario no disponible</p>';
    }

    // Mapa
    const mapaDiv = doc.getElementById('mapaIframe');
    if (mapaDiv) {
        const mapa = get('mapa_embed');
        mapaDiv.innerHTML = mapa ? mapa : '<p>Mapa no disponible</p>';
    }

    // ── CSS variables (igual que cargarEvento.js) ────────────────────────────
    const r = doc.documentElement;
    r.style.setProperty('--evento-primario',   get('color_primario')   || '#8b5a2b');
    r.style.setProperty('--evento-secundario', get('color_secundario') || '#d4a373');
    r.style.setProperty('--evento-fondo',      get('color_fondo')      || '#f4e4c1');

    // color_texto → body
    const colorTexto = get('color_texto');
    if (colorTexto) doc.body.style.color = colorTexto;

    // color_hero_overlay → .hero-overlay
    const overlay = doc.querySelector('.hero-overlay');
    if (overlay && get('color_hero_overlay')) overlay.style.backgroundColor = get('color_hero_overlay');

    // Hero: título, descripción, fechas
    if (h1 && get('color_titulo_hero'))        h1.style.color = get('color_titulo_hero');
    if (desc && get('color_descripcion_hero')) desc.style.color = get('color_descripcion_hero');

    const heroDates = doc.querySelector('.hero-dates');
    if (heroDates) {
        if (get('color_fondo_fechas')) heroDates.style.backgroundColor = get('color_fondo_fechas');
        if (get('color_texto_fechas')) heroDates.style.color = get('color_texto_fechas');
    }

    // color_titulo_seccion → todos los h2
    if (get('color_titulo_seccion')) {
        doc.querySelectorAll('h2').forEach(h => h.style.color = get('color_titulo_seccion'));
    }

    // Menú: CSS variables para .nav-links a
    // .navbar usa --evento-primario (ya seteado arriba)
    if (get('color_menu_fondo')) r.style.setProperty('--color-menu-fondo', get('color_menu_fondo'));
    if (get('color_menu_texto')) r.style.setProperty('--color-menu-texto', get('color_menu_texto'));
    if (get('color_menu_fondo_hover')) r.style.setProperty('--color-menu-fondo-hover', get('color_menu_fondo_hover'));
    if (get('color_menu_texto_hover')) r.style.setProperty('--color-menu-texto-hover', get('color_menu_texto_hover'));

    // Contacto
    const contacto = doc.querySelector('.contacto');
    if (contacto) {
        if (get('color_fondo_contacto')) contacto.style.backgroundColor = get('color_fondo_contacto');
        if (get('color_texto_contacto')) contacto.style.color = get('color_texto_contacto');
        if (get('color_enlace_contacto')) {
            doc.querySelectorAll('.contacto a').forEach(a => a.style.color = get('color_enlace_contacto'));
        }
    }

    // Footer
    const footer = doc.querySelector('footer');
    if (footer) {
        if (get('color_fondo_footer')) footer.style.backgroundColor = get('color_fondo_footer');
        if (get('color_texto_footer')) {
            footer.style.color = get('color_texto_footer');
            footer.querySelectorAll('p').forEach(p => p.style.color = get('color_texto_footer'));
        }
    }

    // color_titulo_h3 → h3 en tarjetas info, actividades, expositores
    if (get('color_titulo_h3')) {
        doc.querySelectorAll('.info-card h3, .actividad-card h3, .expositor-card h3')
           .forEach(h => h.style.color = get('color_titulo_h3'));
    }

    // ── Galería hero ─────────────────────────────────────────────────────────
    const galeriaData = Array.from(document.querySelectorAll('#galeria-rows tr')).map(row => ({
        imagen_url: row.querySelector('.gal-url')?.value || '',
        orden:      parseInt(row.querySelector('.gal-orden')?.value) || 0
    })).filter(g => g.imagen_url);

    if (galeriaData.length > 0) {
        const slides = doc.getElementById('heroSlides');
        if (slides) {
            slides.innerHTML = '';
            galeriaData.slice().sort((a,b) => (a.orden||0)-(b.orden||0)).forEach((g, idx) => {
                const div = document.createElement('div');
                div.className = 'hero-slide';
                Object.assign(div.style, {
                    backgroundImage:    `url('${g.imagen_url}')`,
                    backgroundSize:     'cover',
                    backgroundPosition: 'center',
                    width: '100%', height: '100%',
                    position: 'absolute',
                    display: idx === 0 ? 'block' : 'none'
                });
                slides.appendChild(div);
            });
        }
    } else {
        // Sin galería: usar imagen_portada como fondo del hero
        const portadaUrl = get('imagen_portada');
        if (portadaUrl) {
            const slides = doc.getElementById('heroSlides');
            if (slides) {
                if (slides.children.length === 0) {
                    slides.innerHTML = `<div class="hero-slide" style="background-image:url('${portadaUrl}');background-size:cover;background-position:center;width:100%;height:100%;position:absolute;display:block;"></div>`;
                } else if (slides.children[0]) {
                    slides.children[0].style.backgroundImage = `url('${portadaUrl}')`;
                }
            }
        }
    }

    // ── Precios ──────────────────────────────────────────────────────────────
    const preciosData = Array.from(document.querySelectorAll('#precios-rows tr')).map(row => ({
        fecha:                 row.querySelector('.precio-fecha')?.value || '',
        precio_normal:         parseFloat(row.querySelector('.precio-monto')?.value) || 0,
        promocion:             row.querySelector('.precio-promocion')?.value || '',
        descripcion_promocion: row.querySelector('.precio-descripcion')?.value || ''
    })).filter(p => p.fecha);

    const tablaPrecios = doc.getElementById('tablaPrecios');
    if (tablaPrecios) {
        if (preciosData.length > 0) {
            const fmtFecha = s => s ? new Date(s + 'T12:00:00').toLocaleDateString('es-CR', { weekday:'long', day:'numeric', month:'long' }) : '?';
            let html = `<table class="tabla-precios-estilo"><thead><tr><th>Fecha</th><th>Precio normal</th><th>Promoción</th><th>Detalle</th></tr></thead><tbody>`;
            preciosData.forEach(p => {
                const precioFmt = new Intl.NumberFormat('es-CR', { style:'currency', currency:'CRC', minimumFractionDigits:0 }).format(p.precio_normal);
                html += `<tr><td>${fmtFecha(p.fecha)}</td><td>${precioFmt}</td><td>${p.promocion || '—'}</td><td>${p.descripcion_promocion || '—'}</td></tr>`;
            });
            html += `</tbody></table>`;
            tablaPrecios.innerHTML = html;
        } else {
            tablaPrecios.innerHTML = '<p style="color:#999;">No hay precios registrados</p>';
        }
    }

    // ── Expositores ───────────────────────────────────────────────────────────
    const expositoresData = Array.from(document.querySelectorAll('#expositores-rows tr')).map(row => ({
        nombre:      row.querySelector('.exp-nombre')?.value || '',
        rubro:       row.querySelector('.exp-rubro')?.value || '',
        ubicacion:   row.querySelector('.exp-ubicacion')?.value || '',
        descripcion: row.querySelector('.exp-descripcion')?.value || '',
        logo:        row.querySelector('.exp-logo')?.value || '',
        video:       row.querySelector('.exp-video')?.value || ''
    })).filter(e => e.nombre);

    const expositoresGrid = doc.getElementById('expositoresGrid');
    if (expositoresGrid) {
        if (expositoresData.length > 0) {
            let html = '';
            expositoresData.forEach(exp => {
                const logoHtml = exp.logo
                    ? `<img src="${exp.logo}" alt="${exp.nombre}" class="card-img-principal">`
                    : '<div class="placeholder-img"></div>';
                html += `<div class="expositor-card">
                    ${logoHtml}
                    <div class="card-content">
                        <h3>${exp.nombre}</h3>
                        <p class="rubro"><strong>Rubro:</strong> ${exp.rubro}</p>
                        <p class="ubicacion"><strong>Ubicación:</strong> ${exp.ubicacion}</p>
                        <p class="descripcion">${exp.descripcion}</p>
                    </div>
                </div>`;
            });
            expositoresGrid.innerHTML = html;
        } else {
            expositoresGrid.innerHTML = '<p style="color:#999;">No hay expositores registrados</p>';
        }
    }

    // ── Actividades ───────────────────────────────────────────────────────────
    const actividadesData = Array.from(document.querySelectorAll('#actividades-rows tr')).map(row => ({
        titulo:      row.querySelector('.act-titulo')?.value || '',
        tipo:        row.querySelector('.act-tipo')?.value || '',
        fecha:       row.querySelector('.act-fecha')?.value || '',
        hora:        row.querySelector('.act-hora')?.value || null,
        lugar:       row.querySelector('.act-lugar')?.value || '',
        descripcion: row.querySelector('.act-descripcion')?.value || '',
        imagenes:    (() => { try { return JSON.parse(row.querySelector('.act-imagenes')?.value || '[]'); } catch(e){ return []; } })(),
        es_gratis:   row.querySelector('.act-gratis')?.dataset.value === 'true'
    })).filter(a => a.titulo);

    const actividadesGrid = doc.getElementById('actividadesGrid');
    if (actividadesGrid) {
        if (actividadesData.length > 0) {
            const fmtFecha = s => s ? new Date(s + 'T12:00:00').toLocaleDateString('es-CR', { day:'2-digit', month:'short' }) : '?';
            let html = '';
            actividadesData.forEach(act => {
                const imgs = (act.imagenes || []).filter(u => u);
                const imgHtml = imgs.length > 0
                    ? `<img src="${imgs[0]}" alt="${act.titulo}" class="card-img-principal">`
                    : '<div class="placeholder-img"></div>';
                html += `<div class="actividad-card">
                    ${imgHtml}
                    <div class="card-content">
                        <h3>${act.titulo}</h3>
                        <p class="tipo"><strong>Tipo:</strong> ${act.tipo || '—'}</p>
                        <p class="fecha"><strong>Fecha:</strong> ${fmtFecha(act.fecha)} ${act.hora ? act.hora.slice(0,5) : ''}</p>
                        <p class="lugar"><strong>Lugar:</strong> ${act.lugar || '—'}</p>
                        <p class="descripcion">${act.descripcion || ''}</p>
                        <p class="gratuito">${act.es_gratis ? '<strong>✓ Gratis</strong>' : '<strong>Requiere entrada</strong>'}</p>
                    </div>
                </div>`;
            });
            actividadesGrid.innerHTML = html;

            // Re-aplicar color_titulo_h3 a los h3 recién creados
            const colorH3 = get('color_titulo_h3');
            if (colorH3) {
                doc.querySelectorAll('.actividad-card h3').forEach(h => h.style.color = colorH3);
            }
        } else {
            actividadesGrid.innerHTML = '<p style="color:#999;">No hay actividades registradas</p>';
        }
    }

    actualizarUrlBar();
}
