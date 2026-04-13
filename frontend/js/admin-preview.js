// admin-preview.js — Vista previa en vivo del evento

let previewAbierto = true;
let previewSlug    = null;
let previewTimer   = null;

function getSlug() {
    return document.getElementById('slug')?.value.trim() || null;
}

function getIframe() {
    return document.getElementById('previewIframe');
}

// Recarga el iframe apuntando al slug actual
function recargarPreview() {
    const slug = getSlug();
    if (!slug) return;
    const iframe = getIframe();

    // Construir datos de preview desde el formulario admin
    const get = id => document.getElementById(id)?.value || '';
    const datos = {
        nombre: get('nombre'),
        descripcion: get('descripcion'),
        fecha_inicio: get('fecha_inicio'),
        fecha_fin: get('fecha_fin'),
        ubicacion: get('ubicacion'),
        provincia: get('provincia'),
        imagen_portada: get('imagen_portada'),
        horario_imagen: get('horario_imagen'),
        mapa_embed: get('mapa_embed'),
        tipo_venta: get('tipo_venta'),
        url_venta_online: get('url_venta_online'),
        color_primario: get('color_primario') || '#8b5a2b',
        color_secundario: get('color_secundario') || '#d4a373',
        color_fondo: get('color_fondo') || '#f4e4c1',
        color_titulo_hero: get('color_titulo_hero') || '#ffffff',
        color_descripcion_hero: get('color_descripcion_hero') || '#ffffff',
        color_titulo_seccion: get('color_titulo_seccion') || '#2c1a0e',
        color_fondo_fechas: get('color_fondo_fechas') || '#d4a373',
        color_texto_fechas: get('color_texto_fechas') || '#8b5a2b',
        color_menu_fondo: get('color_menu_fondo') || '#ffffff',
        color_menu_texto: get('color_menu_texto') || '#ffffff',
        color_fondo_footer: get('color_fondo_footer') || '#8b5a2b',
        color_texto_footer: get('color_texto_footer') || '#ffffff'
    };

    // Precios desde la tabla admin (tbodyPrecios)
    datos.precios = Array.from(document.querySelectorAll('#tbodyPrecios tr')).map(row => ({
        fecha: row.querySelector('.precio-fecha')?.value || row.querySelector('td')?.dataset.fecha || '',
        precio_normal: row.querySelector('.precio-normal')?.textContent || row.querySelector('.precio-monto')?.value || row.dataset.precio || 0,
        promocion: row.querySelector('.precio-promocion')?.textContent || '',
        descripcion_promocion: row.querySelector('.precio-descripcion')?.textContent || ''
    })).filter(p => p.fecha);

    // Actividades
    datos.actividades = Array.from(document.querySelectorAll('#tbodyActividades tr')).map(row => ({
        titulo: row.querySelector('.actividad-titulo')?.textContent || row.querySelector('td')?.dataset.titulo || '',
        tipo: row.querySelector('.actividad-tipo')?.textContent || '',
        fecha: row.querySelector('.actividad-fecha')?.textContent || row.dataset.fecha || '',
        hora: row.querySelector('.actividad-hora')?.textContent || '',
        lugar: row.querySelector('.actividad-lugar')?.textContent || '',
        descripcion: row.querySelector('.actividad-descripcion')?.textContent || '',
        imagen: row.querySelector('.actividad-imagen')?.getAttribute('data-src') || row.querySelector('img')?.src || ''
    })).filter(a => a.titulo);

    // Expositores
    datos.expositores = Array.from(document.querySelectorAll('#tbodyExpositores tr')).map(row => ({
        nombre: row.querySelector('.expositor-nombre')?.textContent || row.querySelector('td')?.dataset.nombre || '',
        rubro: row.querySelector('.expositor-rubro')?.textContent || '',
        ubicacion: row.querySelector('.expositor-ubicacion')?.textContent || '',
        descripcion: row.querySelector('.expositor-descripcion')?.textContent || '',
        logo: row.querySelector('.expositor-logo')?.getAttribute('data-src') || row.querySelector('img')?.src || ''
    })).filter(e => e.nombre);

    // Galería
    datos.galeria = Array.from(document.querySelectorAll('#tbodyGaleria tr')).map(row => ({
        imagen_url: row.querySelector('.galeria-url')?.value || row.querySelector('img')?.src || '',
        orden: parseInt(row.querySelector('.galeria-orden')?.value) || 0
    })).filter(g => g.imagen_url);

    // Guardar en localStorage y abrir iframe en modo preview
    const key = 'preview_admin_' + Date.now() + '_' + Math.random().toString(36).substr(2,9);
    localStorage.setItem(key, JSON.stringify(datos));
    const nueva = `/evento.html?preview=1&dataKey=${encodeURIComponent(key)}`;
    try {
        const actual = new URL(iframe.contentWindow.location.href);
        if (actual.pathname + actual.search === nueva) return;
    } catch (_) {}
    iframe.src = nueva;
    previewSlug = slug;
}

// Intenta aplicar cambios en vivo dentro del iframe sin recargar
function aplicarCambiosEnVivo() {
    const iframe = getIframe();
    let doc;
    try { doc = iframe.contentDocument; } catch (_) { return; }
    if (!doc || !doc.body) return;

    const get = (id) => document.getElementById(id)?.value || '';

    // Nombre
    const h1 = doc.getElementById('eventoNombre');
    if (h1) h1.innerText = get('nombre') || 'Sin nombre';

    // Descripción
    const desc = doc.getElementById('eventoDescripcion');
    if (desc) desc.innerText = get('descripcion');

    // Fechas
    const fechas = doc.getElementById('eventoFechas');
    if (fechas) {
        const fi = get('fecha_inicio');
        const ff = get('fecha_fin');
        if (fi && ff) {
            fechas.innerText = `${new Date(fi).toLocaleDateString()} al ${new Date(ff).toLocaleDateString()}`;
        }
    }

    // Info card fechas y ubicación
    const infoFechas = doc.getElementById('infoFechas');
    if (infoFechas) {
        const fi = get('fecha_inicio');
        const ff = get('fecha_fin');
        if (fi && ff) infoFechas.innerText = `${new Date(fi).toLocaleDateString()} - ${new Date(ff).toLocaleDateString()}`;
    }
    const infoUbicacion = doc.getElementById('infoUbicacion');
    if (infoUbicacion) infoUbicacion.innerText = get('ubicacion');
    const ubicacionTexto = doc.getElementById('ubicacionTexto');
    if (ubicacionTexto) ubicacionTexto.innerText = get('ubicacion');

    // Descripción completa
    const infoCompleta = doc.getElementById('eventoInfoCompleta');
    if (infoCompleta) infoCompleta.innerText = get('descripcion');

    // Colores vía CSS variables en el iframe
    const r = doc.documentElement;
    r.style.setProperty('--evento-primario',    get('color_primario'));
    r.style.setProperty('--evento-secundario',  get('color_secundario'));
    r.style.setProperty('--evento-fondo',       get('color_fondo'));

    // Color título hero
    if (h1) h1.style.color = get('color_titulo_hero');
    if (desc) desc.style.color = get('color_descripcion_hero');

    // Fechas del hero
    const heroDates = doc.querySelector('.hero-dates');
    if (heroDates) {
        heroDates.style.backgroundColor = get('color_fondo_fechas');
        heroDates.style.color           = get('color_texto_fechas');
    }

    // Overlay hero
    const overlay = doc.querySelector('.hero-overlay');
    if (overlay) overlay.style.backgroundColor = get('color_hero_overlay');

    // Portada (imagen de fondo del hero)
    const portadaUrl = get('imagen_portada');
    if (portadaUrl) {
        const slides = doc.getElementById('heroSlides');
        if (slides && slides.children.length === 0) {
            slides.innerHTML = `<div class="hero-slide active" style="background-image:url('${portadaUrl}');background-size:cover;background-position:center;width:100%;height:100%;position:absolute;"></div>`;
        } else if (slides && slides.children[0]) {
            slides.children[0].style.backgroundImage = `url('${portadaUrl}')`;
        }
    }

    // Títulos h2 (secciones)
    doc.querySelectorAll('h2').forEach(h => h.style.color = get('color_titulo_seccion'));

    // Nav links colores
    doc.querySelectorAll('.nav-links a').forEach(a => {
        a.style.backgroundColor = get('color_menu_fondo') ? `${get('color_menu_fondo')}26` : '';
        a.style.color           = get('color_menu_texto');
    });

    // Footer
    const footer = doc.querySelector('footer');
    if (footer) {
        footer.style.backgroundColor = get('color_fondo_footer');
        footer.style.color           = get('color_texto_footer');
    }

    // Contacto
    const contacto = doc.querySelector('.contacto');
    if (contacto) {
        contacto.style.backgroundColor = get('color_fondo_contacto');
        contacto.style.color           = get('color_texto_contacto');
    }
}

// Cuando el iframe termina de cargar, aplica cambios en vivo
function onIframeLoad() {
    const slug = getSlug();
    const urlBar = document.getElementById('previewUrlBar');
    if (urlBar && slug) urlBar.textContent = `/evento.html?slug=${slug}`;
    setTimeout(aplicarCambiosEnVivo, 100);
}

// Programa una recarga si el slug cambió
function programarRecarga() {
    clearTimeout(previewTimer);
    previewTimer = setTimeout(() => {
        const slug = getSlug();
        if (slug && slug !== previewSlug && eventoId) {
            recargarPreview();
        } else {
            aplicarCambiosEnVivo();
        }
    }, 600);
}

// Botón para abrir/cerrar el panel
function togglePreview() {
    const panel  = document.getElementById('previewPanel');
    const btn    = document.getElementById('btnTogglePreview');
    const layout = document.getElementById('formLayout');
    previewAbierto = !previewAbierto;
    if (previewAbierto) {
        panel.style.display  = 'flex';
        layout.classList.add('with-preview');
        btn.innerHTML = '👁 Ocultar vista previa';
        if (eventoId) recargarPreview();
    } else {
        panel.style.display  = 'none';
        layout.classList.remove('with-preview');
        btn.innerHTML = '👁 Vista previa';
    }
}

export function initPreview() {
    const iframe = getIframe();
    iframe.addEventListener('load', onIframeLoad);

    // Escuchar cambios en todos los inputs/selects/textareas del formulario
    document.querySelectorAll(
        '#formBasicos input, #formBasicos textarea, #formBasicos select'
    ).forEach(el => {
        el.addEventListener('input',  programarRecarga);
        el.addEventListener('change', programarRecarga);
    });

    document.getElementById('btnTogglePreview')
        ?.addEventListener('click', togglePreview);

    // Si ya tenemos eventoId, abrir preview automáticamente
    if (eventoId) {
        previewAbierto = false; // forzar que togglePreview lo abra
        togglePreview();
    }
}

// Exponer para que admin-init lo llame después de guardar
export function refrescarPreview() {
    recargarPreview();
}