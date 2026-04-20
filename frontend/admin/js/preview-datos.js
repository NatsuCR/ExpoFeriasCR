// admin-preview.js
// Vista previa en vivo del evento para el panel de administración.
// Espeja EXACTAMENTE lo que hace cargarEvento.js en la página real.

let previewAbierto = true;
let previewSlug = null;
let previewTimer = null;

function getSlug() { return document.getElementById('slug')?.value.trim() || null; }
function getIframe() { return document.getElementById('previewIframe'); }

// ─── Recolectar datos del formulario admin ────────────────────────────────────
function construirDatosPreview() {
    const get = id => (document.getElementById(id)?.value || '').trim();

    const datos = {
        // Básicos
        nombre: get('nombre'),
        descripcion: get('descripcion'),
        fecha_inicio: get('fecha_inicio'),
        fecha_fin: get('fecha_fin'),
        ubicacion: get('ubicacion'),
        provincia: get('provincia'),
        imagen_portada: get('imagen_portada'),
        horario_imagen: get('horario_imagen'),
        mapa_embed: get('mapa_embed'),
        mapa_waze_embed: get('mapa_waze_embed'),
        tiene_expositores: parseInt(get('tiene_expositores')) || 0,
        tipo_venta: get('tipo_venta'),
        url_venta_online: get('url_venta_online'),

        // ── Los 20 colores exactos de la BD (sin buscador) ──────────────────
        color_primario: get('color_primario') || '#C8102E',
        color_secundario: get('color_secundario') || '#0033A0',
        color_fondo: get('color_fondo') || '#f4e4c1',
        color_texto: get('color_texto') || '#2c1a0e',
        color_hero_overlay: get('color_hero_overlay') || 'rgba(62,42,31,0.7)',
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
        color_texto_footer: get('color_texto_footer') || '#ffffff'
    };

    // Precios: leer del data-precio de los botones editar
    datos.precios = Array.from(document.querySelectorAll('#tbodyPrecios tr'))
        .map(row => {
            const btn = row.querySelector('.btn-editar-precio');
            if (btn && btn.dataset.precio) {
                try { return JSON.parse(btn.dataset.precio); } catch (_) { }
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
                    let imagenes = [];
                    if (a.imagen) {
                        try {
                            const p = JSON.parse(a.imagen);
                            imagenes = Array.isArray(p) ? p.filter(Boolean) : [a.imagen];
                        } catch (_) { imagenes = a.imagen.trim() ? [a.imagen.trim()] : []; }
                    }
                    return { ...a, imagenes };
                } catch (_) { }
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
                        nombre: e.nombre,
                        rubro: e.rubro || '',
                        ubicacion: e.ubicacion || '',
                        descripcion: e.descripcion || '',
                        imagenes: imagenes,
                        video: e.video_url || ''
                    };
                } catch (_) { }
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
    const key = 'preview_admin_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    localStorage.setItem(key, JSON.stringify(datos));
    getIframe().src = `/evento.html?preview=1&dataKey=${encodeURIComponent(key)}`;
    previewSlug = getSlug();
}

// ─── Aplicar colores en vivo (sin recargar iframe) ───────────────────────────
// Espeja EXACTAMENTE el orden y lógica de cargarEvento.js
function aplicarCambiosEnVivo() {
    const iframe = getIframe();
    let doc;
    try { doc = iframe.contentDocument; } catch (_) { return; }
    if (!doc || !doc.body) return;

    const get = id => (document.getElementById(id)?.value || '').trim();

    // ── Textos básicos ───────────────────────────────────────────────────────
    const h1 = doc.getElementById('eventoNombre');
    if (h1) h1.innerText = get('nombre') || 'Sin nombre';

    const desc = doc.getElementById('eventoDescripcion');
    if (desc) desc.innerText = get('descripcion');

    const infoCompleta = doc.getElementById('eventoInfoCompleta');
    if (infoCompleta) infoCompleta.innerText = get('descripcion');

    // Fechas hero
    const fmt = s => s ? new Date(s + 'T12:00:00').toLocaleDateString('es-CR', { day: '2-digit', month: 'short', year: 'numeric' }) : '?';
    const fi = get('fecha_inicio'), ff = get('fecha_fin');

    const eventoFechas = doc.getElementById('eventoFechas');
    if (eventoFechas) eventoFechas.innerText = fi || ff ? (fi === ff ? fmt(fi) : `${fmt(fi)} al ${fmt(ff)}`) : '';

    const infoFechas = doc.getElementById('infoFechas');
    if (infoFechas) infoFechas.innerText = fi && ff ? `${fmt(fi)} - ${fmt(ff)}` : '';

    const infoUbicacion = doc.getElementById('infoUbicacion');
    if (infoUbicacion) infoUbicacion.innerText = get('ubicacion');

    const ubicacionTexto = doc.getElementById('ubicacionTexto');
    if (ubicacionTexto) ubicacionTexto.innerText = get('ubicacion');

    // Horario imagen
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

    // ── CSS variables principales (igual que cargarEvento.js) ────────────────
    const r = doc.documentElement;
    const colorPrimario = get('color_primario') || '#C8102E';
    const colorSecundario = get('color_secundario') || '#0033A0';
    const colorFondo = get('color_fondo') || '#f4e4c1';

    r.style.setProperty('--evento-primario', colorPrimario);
    r.style.setProperty('--evento-secundario', colorSecundario);
    r.style.setProperty('--evento-fondo', colorFondo);

    // ── color_texto → body.style.color ──────────────────────────────────────
    const colorTexto = get('color_texto');
    if (colorTexto) doc.body.style.color = colorTexto;

    // ── color_hero_overlay → .hero-overlay ──────────────────────────────────
    if (get('color_hero_overlay')) {
        const overlay = doc.querySelector('.hero-overlay');
        if (overlay) overlay.style.backgroundColor = get('color_hero_overlay');
    }

    // ── Hero: título, descripción, fechas ────────────────────────────────────
    if (h1 && get('color_titulo_hero')) h1.style.color = get('color_titulo_hero');
    if (desc && get('color_descripcion_hero')) desc.style.color = get('color_descripcion_hero');

    const heroDates = doc.querySelector('.hero-dates');
    if (heroDates) {
        if (get('color_fondo_fechas')) heroDates.style.backgroundColor = get('color_fondo_fechas');
        if (get('color_texto_fechas')) heroDates.style.color = get('color_texto_fechas');
    }

    // ── color_titulo_seccion → todos los h2 ─────────────────────────────────
    if (get('color_titulo_seccion')) {
        doc.querySelectorAll('h2').forEach(h => h.style.color = get('color_titulo_seccion'));
    }

    // ── Menú: CSS variables para .nav-links a ────────────────────────────────
    if (get('color_menu_fondo')) r.style.setProperty('--color-menu-fondo', get('color_menu_fondo'));
    if (get('color_menu_texto')) r.style.setProperty('--color-menu-texto', get('color_menu_texto'));
    if (get('color_menu_fondo_hover')) r.style.setProperty('--color-menu-fondo-hover', get('color_menu_fondo_hover'));
    if (get('color_menu_texto_hover')) r.style.setProperty('--color-menu-texto-hover', get('color_menu_texto_hover'));

    // ── Contacto ─────────────────────────────────────────────────────────────
    const contacto = doc.querySelector('.contacto');
    if (contacto) {
        if (get('color_fondo_contacto')) contacto.style.backgroundColor = get('color_fondo_contacto');
        if (get('color_texto_contacto')) contacto.style.color = get('color_texto_contacto');
        if (get('color_enlace_contacto')) {
            doc.querySelectorAll('.contacto a').forEach(a => a.style.color = get('color_enlace_contacto'));
        }
    }

    // ── Footer ───────────────────────────────────────────────────────────────
    const footer = doc.querySelector('footer');
    if (footer) {
        if (get('color_fondo_footer')) footer.style.backgroundColor = get('color_fondo_footer');
        if (get('color_texto_footer')) {
            footer.style.color = get('color_texto_footer');
            footer.querySelectorAll('p').forEach(p => p.style.color = get('color_texto_footer'));
        }
    }

    // ── color_titulo_h3 → h3 en tarjetas info, actividades, expositores ──────
    if (get('color_titulo_h3')) {
        doc.querySelectorAll('.info-card h3, .actividad-card h3, .expositor-card h3')
            .forEach(h => h.style.color = get('color_titulo_h3'));
    }

    // ── Imagen portada en hero si no hay galería ─────────────────────────────
    const portadaUrl = get('imagen_portada');
    if (portadaUrl) {
        const slides = doc.getElementById('heroSlides');
        if (slides) {
            if (slides.children.length === 0) {
                slides.innerHTML = `<div class="hero-slide active" style="background-image:url('${portadaUrl}');background-size:cover;background-position:center;width:100%;height:100%;position:absolute;display:block;"></div>`;
            } else if (slides.children[0]) {
                slides.children[0].style.backgroundImage = `url('${portadaUrl}')`;
            }
        }
    }

    // ── URL bar ──────────────────────────────────────────────────────────────
    const slug = getSlug();
    const urlBar = document.getElementById('previewUrlBar');
    if (urlBar && slug) urlBar.textContent = `/evento.html?slug=${slug}`;
}

// ─── Carga completa de precios, actividades, expositores, galería en iframe ──
function renderizarSeccionesEnIframe(doc) {
    if (!doc || !doc.body) return;
    const datos = construirDatosPreview();

    // Precios
    const tablaPrecios = doc.getElementById('tablaPrecios');
    if (tablaPrecios) {
        if (datos.precios.length > 0) {
            const fmt = s => s ? new Date(s + 'T12:00:00').toLocaleDateString('es-CR', { weekday: 'long', day: 'numeric', month: 'long' }) : '?';
            let html = `<table class="tabla-precios-estilo"><thead><tr><th>Fecha</th><th>Precio normal</th><th>Promoción</th><th>Detalle</th></tr></thead><tbody>`;
            datos.precios.forEach(p => {
                const precioFmt = new Intl.NumberFormat('es-CR', { style: 'currency', currency: 'CRC', minimumFractionDigits: 0 }).format(parseFloat(p.precio_normal) || 0);
                html += `<tr><td>${fmt(p.fecha ? p.fecha.slice(0, 10) : '')}</td><td>${precioFmt}</td><td>${p.promocion || '—'}</td><td>${p.descripcion_promocion || '—'}</td></tr>`;
            });
            html += `</tbody></table>`;
            tablaPrecios.innerHTML = html;
        } else {
            tablaPrecios.innerHTML = '<p style="color:#999;">No hay precios registrados</p>';
        }
    }

    // Actividades
    const actGrid = doc.getElementById('actividadesGrid');
    if (actGrid) {
        if (datos.actividades.length > 0) {
            const fmt = s => s ? new Date(s + 'T12:00:00').toLocaleDateString('es-CR', { day: '2-digit', month: 'short' }) : '?';
            let html = '';
            datos.actividades.forEach(act => {
                const imgs = act.imagenes || [];
                const showButtons = imgs.length > 1 ? 'flex' : 'none';
                const imgHtml = imgs.length > 0
                    ? `
                    <div class="mini-carrusel">
                        <button class="mini-btn mini-prev" style="display:${showButtons};">❮</button>
                        <div class="mini-carrusel-track">
                            ${imgs.map((src, i) => `<div class="mini-slide ${i === 0 ? 'activa' : ''}" style="width:100%;"><img src="${src}" style="width:100%; height:200px; object-fit:cover;"></div>`).join('')}
                        </div>
                        <button class="mini-btn mini-next" style="display:${showButtons};">❯</button>
                    </div>`
                    : '<div class="placeholder-img" style="height:200px; background:#f0f0f0;"></div>';

                const descHtml = doc.defaultView.formatDescription ? doc.defaultView.formatDescription(act.descripcion) : `<p class="descripcion">${act.descripcion || ''}</p>`;

                html += `<div class="actividad-card">
                    ${imgHtml}
                    <div class="card-content">
                        <h3>${act.titulo}</h3>
                        <p class="tipo"><strong>Tipo:</strong> ${act.tipo || '—'}</p>
                        <p class="fecha"><strong>Fecha:</strong> ${fmt(act.fecha ? act.fecha.slice(0, 10) : '')} ${act.hora ? act.hora.slice(0, 5) : ''}</p>
                        <p class="lugar"><strong>Lugar:</strong> ${act.lugar || '—'}</p>
                        ${descHtml}
                        <p class="gratuito">${act.es_gratis ? '<strong>✓ Gratis</strong>' : '<strong>Requiere entrada</strong>'}</p>
                        ${act.enlace_venta ? `<a href="${act.enlace_venta}" target="_blank" class="btn-comprar">Comprar entrada</a>` : ''}
                    </div>
                </div>`;
            });
            actGrid.innerHTML = html;
        } else {
            actGrid.innerHTML = '<p style="color:#999;">No hay actividades registradas</p>';
        }
    }

    const expGrid = doc.getElementById('expositoresGrid');
    const expSection = doc.getElementById('expositores');
    const expLink = doc.querySelector('.nav-links a[href="#expositores"]');

    if (datos.tiene_expositores == 0) {
        if (expSection) expSection.style.display = 'none';
        if (expLink) expLink.closest('li').style.display = 'none';
        return;
    } else {
        if (expSection) expSection.style.display = 'block';
        if (expLink) expLink.closest('li').style.display = 'block';
    }

    if (expGrid) {
        if (datos.expositores.length > 0) {
            let html = '';
            datos.expositores.forEach(exp => {
                const imgs = exp.logo ? [exp.logo] : []; // Admin preview might have single logo or array
                const showButtons = imgs.length > 1 ? 'flex' : 'none';
                const logoHtml = imgs.length > 0
                    ? `
                    <div class="mini-carrusel">
                        <button class="mini-btn mini-prev" style="display:${showButtons};">❮</button>
                        <div class="mini-carrusel-track">
                            ${imgs.map((src, i) => `<div class="mini-slide ${i === 0 ? 'activa' : ''}" style="width:100%;"><img src="${src}" style="width:100%; height:150px; object-fit:cover;"></div>`).join('')}
                        </div>
                        <button class="mini-btn mini-next" style="display:${showButtons};">❯</button>
                    </div>`
                    : '<div class="placeholder-img" style="height:150px; background:#f0f0f0;"></div>';

                const descHtml = doc.defaultView.formatDescription ? doc.defaultView.formatDescription(exp.descripcion) : `<p class="descripcion">${exp.descripcion || ''}</p>`;

                html += `<div class="expositor-card">
                    ${logoHtml}
                    <div class="card-content">
                        <h3>${exp.nombre}</h3>
                        <p class="rubro"><strong>Categoría:</strong> ${exp.rubro || exp.tipo}</p>
                        <p class="ubicacion"><strong>Ubicación:</strong> ${exp.ubicacion}</p>
                        ${descHtml}
                        <p><a href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(exp.nombre + ' Costa Rica')}" target="_blank" class="enlace-localidades" style="color: var(--evento-secundario, #0033A0); font-weight: bold; text-decoration: none; display: inline-flex; align-items: center; gap: 5px; margin-top: 5px;"><i class="fas fa-map-marker-alt"></i> Localidades</a></p>
                    </div>
                </div>`;
            });
            expGrid.innerHTML = html;
        } else {
            expGrid.innerHTML = '<p style="color:#999;">No hay expositores registrados</p>';
        }
    }

    // Galería hero
    if (datos.galeria.length > 0) {
        const slides = doc.getElementById('heroSlides');
        if (slides) {
            slides.innerHTML = '';
            const sorted = datos.galeria.slice().sort((a, b) => (a.orden || 0) - (b.orden || 0));
            sorted.forEach((g, idx) => {
                const div = doc.createElement('div');
                div.className = 'hero-slide';
                Object.assign(div.style, {
                    backgroundImage: `url('${g.imagen_url}')`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    width: '100%',
                    height: '100%',
                    position: 'absolute',
                    display: idx === 0 ? 'block' : 'none'
                });
                slides.appendChild(div);
            });
        }
    }
}

// ─── Cuando el iframe termina de cargar ──────────────────────────────────────
function onIframeLoad() {
    const slug = getSlug();
    const urlBar = document.getElementById('previewUrlBar');
    if (urlBar && slug) urlBar.textContent = `/evento.html?slug=${slug}`;

    const iframe = getIframe();
    let doc;
    try { doc = iframe.contentDocument; } catch (_) { return; }

    setTimeout(() => {
        aplicarCambiosEnVivo();
        renderizarSeccionesEnIframe(doc);

        // Inicializar mini-carruseles inyectados dinámicamente
        doc.querySelectorAll('.actividad-carousel').forEach(car => {
            const slides = car.querySelectorAll('.actividad-slide');
            let idx = 0;
            const prev = car.querySelector('.actividad-prev');
            const next = car.querySelector('.actividad-next');
            if (!prev || !next) return;
            function update() { slides.forEach((s, i) => s.style.display = i === idx ? 'block' : 'none'); }
            prev.onclick = (e) => { e.preventDefault(); idx = (idx - 1 + slides.length) % slides.length; update(); };
            next.onclick = (e) => { e.preventDefault(); idx = (idx + 1) % slides.length; update(); };
        });
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
    const panel = document.getElementById('previewPanel');
    const btn = document.getElementById('btnTogglePreview');
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
            el.addEventListener('input', programarRecarga);
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

document.getElementById('btnTogglePreview')?.addEventListener('click', togglePreview);

if (eventoId) {
    previewAbierto = false;
    togglePreview();
}