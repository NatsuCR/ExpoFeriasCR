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
    const nueva = `/evento.html?slug=${encodeURIComponent(slug)}`;
    // solo recargar si la URL cambió
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