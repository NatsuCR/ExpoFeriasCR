// admin-preview.js
// Vista previa en vivo del evento para el panel de administración.
// Espeja EXACTAMENTE lo que hace cargarEvento.js en la página real.

let previewAbierto = true;
let previewSlug    = null;
let previewTimer   = null;

function getSlug()   { return document.getElementById('slug')?.value.trim() || null; }
function getIframe() { return document.getElementById('previewIframe'); }

// ─── Recolectar datos del formulario admin ────────────────────────────────────
function construirDatosPreview() {
    const get = id => (document.getElementById(id)?.value || '').trim();

    const datos = {
        // Básicos
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
        color_primario:         get('color_primario')         || '#C8102E',
        color_secundario:       get('color_secundario')       || '#0033A0',
        color_fondo:            get('color_fondo')            || '#fdfdfd',
        color_texto:            get('color_texto')            || '#1a1a1a',
        color_hero_overlay:     get('color_hero_overlay')     || 'rgba(62,42,31,0.7)',
        color_titulo_seccion:   get('color_titulo_seccion')   || '#1a1a1a',
        color_titulo_hero:      get('color_titulo_hero')      || '#ffffff',
        color_descripcion_hero: get('color_descripcion_hero') || '#ffffff',
        color_fondo_fechas:     get('color_fondo_fechas')     || '#0033a0',
        color_texto_fechas:     get('color_texto_fechas')     || '#c8102e',
        color_menu_fondo:       get('color_menu_fondo')       || '#ffffff',
        color_menu_texto:       get('color_menu_texto')       || '#ffffff',
        color_menu_fondo_hover: get('color_menu_fondo_hover') || '',
        color_menu_texto_hover: get('color_menu_texto_hover') || '',
        color_titulo_h3:        get('color_titulo_h3')        || '#1a1a1a',
        color_fondo_contacto:   get('color_fondo_contacto')   || '#fdfdfd',
        color_texto_contacto:   get('color_texto_contacto')   || '#1a1a1a',
        color_enlace_contacto:  get('color_enlace_contacto')  || '#c8102e',
        color_fondo_footer:     get('color_fondo_footer')     || '#c8102e',
        color_texto_footer:     get('color_texto_footer')     || '#ffffff'
    };

    // Precios: leer del data-precio de los botones editar
    datos.precios = Array.from(document.querySelectorAll('#tbodyPrecios tr'))
        .map(row => {
            const btn = row.querySelector('.btn-editar-precio');
            if (btn && btn.dataset.precio) {
                try { return JSON.parse(btn.dataset.precio); } catch (_) {}
            }
            return null;
        }).filter(Boolean);

    // Actividades
    datos.actividades = Array.from(document.querySelectorAll('#tbodyActividades tr'))
        .map(row => {
            const btn = row.querySelector('.btn-editar-actividad');
            if (btn && btn.dataset.actividad) {
                try {
                    const a = JSON.parse(btn.dataset.actividad);
                    let imagen = [];
                    if (a.imagen) {
                        try {
                            const p = JSON.parse(a.imagen);
                            imagen = Array.isArray(p) ? p.filter(Boolean) : [a.imagen];
                        } catch (_) { imagen = a.imagen.trim() ? [a.imagen.trim()] : []; }
                    }
                    return { ...a, imagen };
                } catch (_) {}
            }
            return null;
        }).filter(Boolean);

    // Expositores
    datos.expositores = Array.from(document.querySelectorAll('#tbodyExpositores tr'))
        .map(row => {
            const btn = row.querySelector('.btn-editar-expositor');
            if (btn && btn.dataset.expositor) {
                try {
                    const e = JSON.parse(btn.dataset.expositor);
                    let imagenes = [];
                    if (e.imagen_logo) {
                        try {
                            const p = JSON.parse(e.imagen_logo);
                            imagenes = Array.isArray(p) ? p.filter(Boolean) : [e.imagen_logo];
                        } catch (_) { imagenes = [e.imagen_logo]; }
                    }
                    return {
                        nombre:      e.nombre,
                        rubro:       e.rubro || '',
                        ubicacion:   e.ubicacion || '',
                        descripcion: e.descripcion || '',
                        imagenes:    imagenes,
                        video:       e.video_url || ''
                    };
                } catch (_) {}
            }
            return null;
        }).filter(Boolean);

    // Galería
    datos.galeria = Array.from(document.querySelectorAll('#tbodyGaleria tr'))
        .map(row => {
            const btn = row.querySelector('.btn-editar-galeria');
            if (btn) return { imagen_url: btn.dataset.url || '', orden: parseInt(btn.dataset.orden) || 0 };
            return null;
        }).filter(g => g && g.imagen_url);

    return datos;
}

// ─── Recargar iframe completo ─────────────────────────────────────────────────
function recargarPreview() {
    if (!eventoId && !getSlug()) return;
    const datos = construirDatosPreview();
    const key   = 'preview_admin_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    localStorage.setItem(key, JSON.stringify(datos));
    getIframe().src = `/evento.html?preview=1&dataKey=${encodeURIComponent(key)}`;
    previewSlug = getSlug();
}

// ─── Aplicar colores en vivo (sin recargar iframe) ───────────────────────────
// Espeja EXACTAMENTE el orden y lógica de cargarEvento.js
function aplicarCambiosEnVivo() {
    const iframe = getIframe();
    if (!iframe || !iframe.contentDocument) return;
    const doc = iframe.contentDocument;

    const datos = construirDatosPreview();
    
    // Si el iframe tiene la función cargarEventoDesdePreview, usarla
    if (doc.defaultView && doc.defaultView.cargarEventoDesdePreview) {
        doc.defaultView.cargarEventoDesdePreview(datos);
        
        // Re-inicializar controles después de un breve delay
        setTimeout(() => {
            if (doc.defaultView.initCarouselControls) doc.defaultView.initCarouselControls();
            if (doc.defaultView.initHeroCarousel) doc.defaultView.initHeroCarousel();
            if (doc.defaultView.initLightbox) doc.defaultView.initLightbox();
        }, 150);
    } else {
        // Fallback: renderizado básico si el script del iframe no ha cargado totalmente
        const elNombre = doc.getElementById('eventoNombre');
        if (elNombre) {
            elNombre.textContent = datos.nombre;
            elNombre.style.color = datos.color_titulo_hero;
        }
        const elDesc = doc.getElementById('eventoDescripcion');
        if (elDesc) {
            elDesc.innerHTML = `<div class="desc-container"><p class="descripcion-texto descripcion desc-full" style="display: block !important; white-space: pre-wrap;">${datos.descripcion || ''}</p></div>`;
            elDesc.style.color = datos.color_descripcion_hero;
        }
    }

    // Actualizar URL bar
    const slug = getSlug();
    const urlBar = document.getElementById('previewUrlBar');
    if (urlBar && slug) urlBar.textContent = `/evento.html?slug=${slug}`;
}

// ─── Cuando el iframe termina de cargar ──────────────────────────────────────
function onIframeLoad() {
    const slug   = getSlug();
    const urlBar = document.getElementById('previewUrlBar');
    if (urlBar && slug) urlBar.textContent = `/evento.html?slug=${slug}`;

    setTimeout(() => {
        aplicarCambiosEnVivo();
    }, 200);
}

// ─── Timer para cambios en vivo ───────────────────────────────────────────────
function programarRecarga() {
    clearTimeout(previewTimer);
    previewTimer = setTimeout(() => {
        const slug = getSlug();
        if (slug && slug !== previewSlug && eventoId) {
            recargarPreview();
        } else {
            aplicarCambiosEnVivo();
        }
    }, 400);
}

// ─── Botón toggle panel ───────────────────────────────────────────────────────
function togglePreview() {
    const panel  = document.getElementById('previewPanel');
    const btn    = document.getElementById('btnTogglePreview');
    const layout = document.getElementById('formLayout');
    previewAbierto = !previewAbierto;
    if (previewAbierto) {
        panel.style.display = 'flex';
        layout.classList.add('with-preview');
        btn.innerHTML = '👁 Ocultar vista previa';
        if (eventoId) recargarPreview();
    } else {
        panel.style.display = 'none';
        layout.classList.remove('with-preview');
        btn.innerHTML = '👁 Vista previa';
    }
}

// ─── Init ─────────────────────────────────────────────────────────────────────
export function initPreview() {
    getIframe().addEventListener('load', onIframeLoad);

    document.querySelectorAll('#formBasicos input, #formBasicos textarea, #formBasicos select')
        .forEach(el => {
            el.addEventListener('input',  programarRecarga);
            el.addEventListener('change', programarRecarga);
        });

    document.getElementById('btnTogglePreview')?.addEventListener('click', togglePreview);

    if (eventoId) {
        previewAbierto = false;
        togglePreview();
    }
}

// Recarga completa desde exterior (botón guardar, etc.)
export function refrescarPreview() {
    recargarPreview();
}



