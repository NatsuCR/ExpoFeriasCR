/**
 * previewManager.js
 * Vista previa en iframe para crear-evento (vista usuario).
 * Espeja EXACTAMENTE lo que hace cargarEvento.js en la página real.
 */

let previewAbierto = false;
let previewTimer = null;

export function getIframe() { return document.getElementById('previewIframe'); }
export function getSlug() { return (document.getElementById('slug')?.value || '').trim(); }

export function actualizarUrlBar() {
    const slug = getSlug();
    const urlBar = document.getElementById('previewUrlBar');
    if (!urlBar) return;
    urlBar.textContent = slug
        ? `/evento.html?slug=${encodeURIComponent(slug)}`
        : '/evento.html?slug=...';
}

// ─── Recolectar todos los datos del formulario ───────────────────────────────
export function guardarDatosPreview() {
    const get = id => (document.getElementById(id)?.value || '').trim();

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

        // Colores
        color_primario: get('color_primario') || '#8b5a2b',
        color_secundario: get('color_secundario') || '#d4a373',
        color_fondo: get('color_fondo') || '#f4e4c1',
        color_texto: get('color_texto') || '#2c1a0e',
        color_hero_overlay: get('color_hero_overlay') || '0.7',
        color_titulo_seccion: get('color_titulo_seccion') || '#2c1a0e',
        color_titulo_hero: get('color_titulo_hero') || '#ffffff',
        color_descripcion_hero: get('color_descripcion_hero') || '#ffffff',
        color_fondo_fechas: get('color_fondo_fechas') || '#d4a373',
        color_texto_fechas: get('color_texto_fechas') || '#8b5a2b',
        color_menu_fondo: get('color_menu_fondo') || '#ffffff',
        color_menu_texto: get('color_menu_texto') || '#ffffff',
        color_menu_fondo_hover: get('color_menu_fondo_hover') || '',
        color_menu_texto_hover: get('color_menu_texto_hover') || '',
        color_titulo_h3: get('color_titulo_h3') || '#2c1a0e',
        color_fondo_contacto: get('color_fondo_contacto') || '#f4e4c1',
        color_texto_contacto: get('color_texto_contacto') || '#2c1a0e',
        color_enlace_contacto: get('color_enlace_contacto') || '#8b5a2b',
        color_fondo_footer: get('color_fondo_footer') || '#8b5a2b',
        color_texto_footer: get('color_texto_footer') || '#ffffff',
        color_buscador_expositores: get('color_buscador_expositores') || '#ffffff',
        color_borde_buscador_expositores: get('color_borde_buscador_expositores') || '#eeeeee',
        color_fondo_share: get('color_fondo_share') || '0.5',
        color_texto_share: get('color_texto_share') || '#2c1a0e'
    };

    // ─── Precios ─────────────────────────────────────────────────────────────
    datos.precios = Array.from(document.querySelectorAll('#precios-rows tr')).map(row => ({
        fecha: row.querySelector('.precio-fecha')?.value || '',
        precio_normal: parseFloat(row.querySelector('.precio-monto')?.value) || 0,
        promocion: row.querySelector('.precio-promocion')?.value || '',
        descripcion_promocion: row.querySelector('.precio-descripcion')?.value || ''
    })).filter(p => p.fecha);

    // ─── Actividades ─────────────────────────────────────────────────────────
    datos.actividades = Array.from(document.querySelectorAll('#actividades-rows tr')).map(row => ({
        titulo: row.querySelector('.act-titulo')?.value || '',
        tipo: row.querySelector('.act-tipo')?.value || '',
        fecha: row.querySelector('.act-fecha')?.value || '',
        hora: row.querySelector('.act-hora')?.value || null,
        lugar: row.querySelector('.act-lugar')?.value || '',
        descripcion: row.querySelector('.act-descripcion')?.value || '',
        imagenes: (() => {
            try { return JSON.parse(row.querySelector('.act-imagenes')?.value || '[]'); }
            catch { return []; }
        })(),
        es_gratis: row.querySelector('.act-gratis')?.dataset.value === 'true' ? 1 : 0,
        requiere_entrada_online: row.querySelector('.act-requiere-online')?.dataset.value === 'true',
        enlace_venta: row.querySelector('.act-enlace')?.value || ''
    })).filter(a => a.titulo);

    // ─── EXPO SITORES (FIX COMPLETO AQUÍ) ────────────────────────────────────
    datos.expositores = Array.from(document.querySelectorAll('#expositores-rows tr')).map(row => {
        const logoInp = row.querySelector('.exp-imagenes') || row.querySelector('.exp-logo');
        let imagenes = [];

        if (logoInp) {
            try {
                const val = logoInp.value.trim();
                if (val.startsWith('[')) {
                    imagenes = JSON.parse(val).filter(u => u);
                } else if (val) {
                    imagenes = [val];
                }
            } catch {
                imagenes = [];
            }
        }

        const imagenLogo = imagenes.length > 0 ? imagenes[0] : '';

        return {
            nombre: row.querySelector('.exp-nombre')?.value || '',
            rubro: row.querySelector('.exp-tipo')?.value || '',
            ubicacion: row.querySelector('.exp-ubicacion')?.value || '',
            descripcion: row.querySelector('.exp-descripcion')?.value || '',

            // 🔥 Compatibilidad total
            imagenes: imagenes,
            imagen_logo: imagenLogo,
            logo: imagenes, // <--- CAMBIO CLAVE: Pasar todo el array para el carrusel

            video: row.querySelector('.exp-video')?.value || '',
            video_url: row.querySelector('.exp-video')?.value || ''
        };
    }).filter(e => e.nombre);

    // ─── Galería ─────────────────────────────────────────────────────────────
    datos.galeria = Array.from(document.querySelectorAll('#galeria-rows tr')).map(row => ({
        imagen_url: row.querySelector('.gal-url')?.value || '',
        orden: parseInt(row.querySelector('.gal-orden')?.value) || 0
    })).filter(g => g.imagen_url);

    const previewKey = 'preview_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    localStorage.setItem(previewKey, JSON.stringify(datos));
    window.previewDataKey = previewKey;
    return previewKey;
}

// ─── Debounce actualización ─────────────────────────────────────────────────
export function programarActualizacion() {
    clearTimeout(previewTimer);
    previewTimer = setTimeout(() => {
        guardarDatosPreview();
        setTimeout(aplicarCambiosEnVivo, 100);
    }, 400);
}

// ─── Abrir preview ─────────────────────────────────────────────────────────
export function abrirPreview() {
    const panel = document.getElementById('previewPanel');
    const layout = document.getElementById('formLayout');

    panel.classList.add('visible');
    layout.classList.add('with-preview');
    previewAbierto = true;

    document.getElementById('btnTogglePreview').innerHTML =
        '<i class="fas fa-eye-slash"></i> Ocultar preview';

    const dataKey = guardarDatosPreview();
    const iframe = getIframe();

    iframe.src = `/evento.html?preview=1&dataKey=${dataKey}`;

    iframe.addEventListener('load', () => {
        setTimeout(aplicarCambiosEnVivo, 300);
    }, { once: true });
}

// ─── Cerrar preview ────────────────────────────────────────────────────────
export function cerrarPreview() {
    document.getElementById('previewPanel').classList.remove('visible');
    document.getElementById('formLayout').classList.remove('with-preview');
    previewAbierto = false;

    document.getElementById('btnTogglePreview').innerHTML =
        '<i class="fas fa-eye"></i> Vista previa';
}

// ─── Toggle ────────────────────────────────────────────────────────────────
export function togglePreview() {
    if (previewAbierto) cerrarPreview();
    else abrirPreview();
}

// ─── Aplicar cambios en iframe ─────────────────────────────────────────────
export function aplicarCambiosEnVivo() {
    const iframe = getIframe();
    let win;

    try { win = iframe.contentWindow; }
    catch { return; }

    if (!win || !win.cargarEventoDesdePreview) return;

    const dataStr = localStorage.getItem(window.previewDataKey);
    if (!dataStr) return;

    try {
        const datos = JSON.parse(dataStr);
        win.cargarEventoDesdePreview(datos);

        if (typeof win.initCarouselControls === 'function') win.initCarouselControls();
        if (typeof win.initHeroCarousel === 'function') win.initHeroCarousel();
        if (typeof win.initLightbox === 'function') win.initLightbox();

    } catch (e) {
        console.error('Error aplicando preview:', e);
    }

    actualizarUrlBar();
}