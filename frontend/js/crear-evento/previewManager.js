/**
 * previewManager.js
 * Vista previa en iframe para crear-evento (vista usuario).
 * Espeja EXACTAMENTE lo que hace cargarEvento.js en la página real.
 */

let previewAbierto = false;
let previewTimer = null;

// Proactive cleanup: Borrar previews antiguos al cargar el script
try {
    Object.keys(localStorage).forEach(key => {
        if (key.startsWith('preview_')) {
            // Opcional: solo borrar si tienen más de 1 hora de antigüedad o borrar todos
            localStorage.removeItem(key);
        }
    });
} catch (e) { console.error('Error en limpieza inicial:', e); }

export function getIframes() {
    return [
        document.getElementById('previewIframe'),
        document.getElementById('finalPreviewIframe')
    ].filter(i => i !== null);
}
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
        canton: get('canton'),
        distrito: get('distrito'),
        imagen_portada: get('imagen_portada'),
        horario_imagen: get('horario_imagen'),
        mapa_embed: get('mapa_embed'),
        mapa_waze_embed: get('mapa_waze_embed'),
        tipo_venta: get('tipo_venta'),
        url_venta_online: get('url_venta_online'),

        // Colores
        color_primario: get('color_primario') || '#C8102E',
        color_secundario: get('color_secundario') || '#0033A0',
        color_fondo: get('color_fondo') || '#fdfdfd',
        color_texto: get('color_texto') || '#1a1a1a',
        color_iconos: get('color_iconos') || '#C8102E',
        color_descripcion_texto: get('color_descripcion_texto') || '#1a1a1a',
        color_hero_overlay: get('color_hero_overlay') || 'rgba(0, 0, 0, 0.7)',
        color_titulo_seccion: get('color_titulo_seccion') || '#1a1a1a',
        color_titulo_hero: get('color_titulo_hero') || '#ffffff',
        color_descripcion_hero: get('color_descripcion_hero') || '#ffffff',
        color_fondo_fechas: get('color_fondo_fechas') || '#0033a0',
        color_texto_fechas: get('color_texto_fechas') || '#c8102e',
        color_menu_fondo: get('color_menu_fondo') || '#C8102E',
        color_menu_texto: get('color_menu_texto') || '#ffffff',
        color_menu_fondo_hover: get('color_menu_fondo_hover') || '#a50d26',
        color_menu_texto_hover: get('color_menu_texto_hover') || '#ffffff',

        tiene_expositores: (get('tiene_expositores') !== '') ? parseInt(get('tiene_expositores')) : 0,
        color_titulo_h3: get('color_titulo_h3') || '#1a1a1a',
        color_fondo_contacto: get('color_fondo_contacto') || '#fdfdfd',
        color_texto_contacto: get('color_texto_contacto') || '#1a1a1a',
        color_enlace_contacto: get('color_enlace_contacto') || '#c8102e',
        color_fondo_footer: get('color_fondo_footer') || '#c8102e',
        color_texto_footer: get('color_texto_footer') || '#ffffff',
        color_buscador_expositores: get('color_buscador_expositores') || '#ffffff',
        color_borde_buscador_expositores: get('color_borde_buscador_expositores') || '#eeeeee',
        color_fondo_share: get('color_fondo_share') || '#ffffff',
        color_texto_share: get('color_texto_share') || '#1a1a1a'
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
        imagen: (() => {
            let imgs = [];
            try {
                const val = row.querySelector('.act-imagenes')?.value;
                if (val) {
                    if (val.startsWith('[')) imgs = JSON.parse(val);
                    else imgs = [val];
                }
            } catch { imgs = []; }
            return (Array.isArray(imgs) ? imgs : [imgs])
                .flat(Infinity)
                .filter(u => u && typeof u === 'string' && u !== 'null');
        })(),
        es_gratis: row.querySelector('.act-gratis')?.dataset.value === 'true' ? 1 : 0,
        requiere_entrada_online: row.querySelector('.act-requiere-online')?.dataset.value === 'true',
        solo_online: row.querySelector('.act-solo-online')?.dataset.value === 'true',
        en_vivo: row.querySelector('.act-en-vivo')?.dataset.value === 'true',
        enlace_venta: row.querySelector('.act-enlace')?.value || '',
        video_url: row.querySelector('.act-video')?.value || '',
        video: row.querySelector('.act-video')?.value || ''
    })).filter(a => a.titulo);

    // ─── EXPO SITORES (FIX COMPLETO AQUÍ) ────────────────────────────────────
    datos.expositores = Array.from(document.querySelectorAll('#expositores-rows tr')).map(row => {
        const logoInp = row.querySelector('.exp-imagenes') || row.querySelector('.exp-logo');
        let imagenes = [];

        if (logoInp) {
            try {
                const val = logoInp.value.trim();
                if (val.startsWith('[')) {
                    imagenes = JSON.parse(val);
                } else if (val) {
                    imagenes = [val];
                }
            } catch {
                imagenes = [];
            }
        }

        // Aplanar y limpiar profundamente
        imagenes = (Array.isArray(imagenes) ? imagenes : [imagenes])
            .flat(Infinity)
            .filter(u => u && typeof u === 'string' && u !== 'null');

        const imagenLogo = imagenes.length > 0 ? imagenes[0] : '';

        return {
            nombre: row.querySelector('.exp-nombre')?.value || '',
            rubro: row.querySelector('.exp-rubro')?.value || row.querySelector('.exp-tipo')?.value || '',
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

    let previewKey = window.previewDataKey;
    if (!previewKey) {
        previewKey = 'preview_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        window.previewDataKey = previewKey;
    }

    const datosStr = JSON.stringify(datos);

    try {
        localStorage.setItem(previewKey, datosStr);
    } catch (e) {
        if (e.name === 'QuotaExceededError' || e.name === 'NS_ERROR_DOM_QUOTA_REACHED') {
            console.warn('QuotaExceededError: Limpiando localStorage...');
            // 1. Borrar TODOS los previews antiguos
            Object.keys(localStorage).forEach(key => {
                if (key.startsWith('preview_')) {
                    localStorage.removeItem(key);
                }
            });
            // 2. Re-intentar guardar el actual
            try {
                localStorage.setItem(previewKey, datosStr);
            } catch (e2) {
                console.error('No se pudo guardar ni tras limpieza:', e2);
            }
        } else {
            console.error('Error guardando en localStorage:', e);
        }
    }
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

// ─── Toggles de Dispositivo ────────────────────────────────────────────────
export function setPreviewMode(mode) {
    const panel = document.getElementById('previewPanel');
    const layout = document.getElementById('formLayout');
    const btns = document.querySelectorAll('.preview-btn-device');
    const iframe = document.getElementById('previewIframe');

    if (mode === 'pc') {
        panel.classList.add('pc-mode');
        panel.classList.remove('mobile-mode');
        layout.classList.add('pc-mode');
        layout.classList.remove('mobile-mode');

        // Truco de escalado para forzar vista PC
        if (iframe) {
            const containerWidth = panel.offsetWidth || (window.innerWidth * 0.55);
            const targetWidth = 1200; // Ancho virtual de PC
            const scale = (containerWidth - 15) / targetWidth;

            // Usamos zoom si está disponible (Chrome/Edge/Safari) porque es mucho más estable para la altura
            if ('zoom' in iframe.style) {
                iframe.style.transform = 'none';
                iframe.style.zoom = scale;
                iframe.style.width = `${targetWidth}px`;
                iframe.style.height = `calc(100% / ${scale})`;
            } else {
                // Fallback para otros navegadores
                iframe.style.width = `${targetWidth}px`;
                iframe.style.height = `${150 / scale}vh`; // 150vh para asegurar que sobrepasa el fondo
                iframe.style.transform = `scale(${scale})`;
                iframe.style.transformOrigin = 'top left';
            }

            iframe.style.border = 'none';

            // Asegurar fondo blanco y altura mínima dentro del iframe
            try {
                const injectStyle = () => {
                    const doc = iframe.contentDocument || iframe.contentWindow.document;
                    if (doc && doc.body) {
                        doc.body.style.minHeight = '100vh';
                        doc.documentElement.style.height = '100%';
                    }
                };
                iframe.onload = injectStyle;
                injectStyle();
            } catch (e) { /* Cross-origin security might block this if not on same domain */ }
        }
    } else {
        panel.classList.remove('pc-mode');
        panel.classList.add('mobile-mode');
        layout.classList.remove('pc-mode');
        layout.classList.add('mobile-mode');

        // Reset de escalado para móvil
        if (iframe) {
            iframe.style.width = '100%';
            iframe.style.height = '100%';
            iframe.style.transform = 'none';
            if ('zoom' in iframe.style) iframe.style.zoom = 'normal'; // O '1' o unset
        }
    }

    btns.forEach(b => {
        b.classList.toggle('active', b.dataset.device === mode);
    });
}

// ─── Abrir preview ─────────────────────────────────────────────────────────
export function abrirPreview() {
    const panel = document.getElementById('previewPanel');
    const layout = document.getElementById('formLayout');

    panel.classList.add('visible');
    layout.classList.add('with-preview');
    layout.classList.add('crear-evento-split');
    previewAbierto = true;

    // Determinar modo inicial: PC si la pantalla es ancha (> 1024px)
    const initialMode = window.innerWidth > 1024 ? 'pc' : 'mobile';
    setPreviewMode(initialMode);

    // Configurar listeners de los botones (solo una vez)
    const btns = document.querySelectorAll('.preview-btn-device');
    btns.forEach(btn => {
        btn.onclick = (e) => {
            e.stopPropagation();
            setPreviewMode(btn.dataset.device);
        };
    });

    document.getElementById('btnTogglePreview').innerHTML =
        '<i class="fas fa-eye-slash"></i> Ocultar preview';

    const dataKey = guardarDatosPreview();
    const iframes = getIframes();

    iframes.forEach(iframe => {
        iframe.src = `/evento.html?preview=1&dataKey=${dataKey}`;
        iframe.addEventListener('load', () => {
            setTimeout(aplicarCambiosEnVivo, 300);
        }, { once: true });
    });
}

// ─── Cerrar preview ────────────────────────────────────────────────────────
export function cerrarPreview() {
    const panel = document.getElementById('previewPanel');
    const layout = document.getElementById('formLayout');

    panel.classList.remove('visible');
    panel.classList.remove('pc-mode');
    panel.classList.remove('mobile-mode');

    layout.classList.remove('with-preview');
    layout.classList.remove('crear-evento-split');
    layout.classList.remove('pc-mode');
    layout.classList.remove('mobile-mode');

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
    const iframes = getIframes();
    const dataStr = localStorage.getItem(window.previewDataKey);
    if (!dataStr) return;

    iframes.forEach(iframe => {
        let win;
        try { win = iframe.contentWindow; }
        catch { return; }

        if (!win || !win.cargarEventoDesdePreview) return;

        try {
            const datos = JSON.parse(dataStr);
            win.cargarEventoDesdePreview(datos);

            if (typeof win.initCarouselControls === 'function') win.initCarouselControls();
            if (typeof win.initHeroCarousel === 'function') win.initHeroCarousel();
            if (typeof win.initLightbox === 'function') win.initLightbox();

        } catch (e) {
            console.error('Error aplicando preview:', e);
        }
    });

    actualizarUrlBar();
}


