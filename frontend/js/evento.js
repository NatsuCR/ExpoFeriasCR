// frontend/js/evento.js
const urlParams = new URLSearchParams(window.location.search);
const slug = urlParams.get('slug');
if (!slug) window.location.href = '/';

let idiomaActual = 'es';

// Aplicar idioma a elementos con data-es y data-en
function aplicarIdioma() {
    document.querySelectorAll('[data-es]').forEach(el => {
        const texto = el.getAttribute(`data-${idiomaActual}`);
        if (texto) el.innerText = texto;
    });
    const btn = document.getElementById('btnIdioma');
    if (btn) btn.innerText = idiomaActual === 'es' ? '🇺🇸 English' : '🇪🇸 Español';
}

// Cargar datos del evento
async function cargarEvento() {
    try {
        const res = await fetch(`/api/eventos/${slug}`);
        if (!res.ok) throw new Error();
        const evento = await res.json();
        document.title = evento.nombre;
        document.getElementById('eventoNombre').innerText = evento.nombre;
        document.getElementById('eventoDescripcion').innerText = evento.descripcion;
        document.getElementById('eventoFechas').innerHTML = `${new Date(evento.fecha_inicio).toLocaleDateString()} al ${new Date(evento.fecha_fin).toLocaleDateString()}`;
        document.getElementById('eventoInfoCompleta').innerHTML = evento.descripcion;
        document.getElementById('infoFechas').innerHTML = `${new Date(evento.fecha_inicio).toLocaleDateString()} - ${new Date(evento.fecha_fin).toLocaleDateString()}`;
        document.getElementById('infoUbicacion').innerHTML = evento.ubicacion;
        document.getElementById('ubicacionTexto').innerHTML = evento.ubicacion;
        
        // Mapa (puedes usar lat/lon o embed estático)
        if (evento.latitud && evento.longitud) {
            document.getElementById('mapaIframe').innerHTML = `<iframe width="100%" height="350" style="border:0" loading="lazy" allowfullscreen src="https://www.google.com/maps/embed/v1/place?key=AIzaSy...&q=${evento.latitud},${evento.longitud}"></iframe>`;
        } else {
            document.getElementById('mapaIframe').innerHTML = '<p>Mapa no disponible</p>';
        }
    } catch (err) {
        document.body.innerHTML = '<h1>Evento no encontrado</h1>';
    }
}

// Cargar precios
async function cargarPrecios() {
    const container = document.getElementById('tablaPrecios');
    if (!container) return;
    try {
        const res = await fetch(`/api/precios/${slug}`);
        const precios = await res.json();
        if (precios.length === 0) {
            container.innerHTML = '<p>No hay precios disponibles.</p>';
            return;
        }
        let html = '<table class="tabla-precios-estilo"><thead><tr><th>Fecha</th><th>Precio normal</th><th>Promoción</th><th>Detalle</th></tr></thead><tbody>';
        precios.forEach(p => {
            const fecha = new Date(p.fecha).toLocaleDateString('es-CR', { weekday: 'long', day: 'numeric', month: 'long' });
            const precioFormateado = new Intl.NumberFormat('es-CR', { style: 'currency', currency: 'CRC', minimumFractionDigits: 0 }).format(p.precio_normal);
            html += `<tr><td>${fecha}</td><td>${precioFormateado}</td><td>${p.promocion || '—'}</td><td>${p.descripcion_promocion || '—'}</td></tr>`;
        });
        html += '</tbody></table>';
        container.innerHTML = html;
    } catch (err) {
        container.innerHTML = '<p>Error al cargar precios.</p>';
    }
}

// Cargar actividades
async function cargarActividades() {
    const container = document.getElementById('actividadesGrid');
    if (!container) return;
    try {
        const res = await fetch(`/api/actividades/${slug}`);
        const actividades = await res.json();
        if (actividades.length === 0) {
            container.innerHTML = '<p>No hay actividades registradas.</p>';
            return;
        }
        let html = '';
        actividades.forEach(a => {
            html += `
                <div class="actividad-card">
                    <h3>${a.titulo}</h3>
                    <p><i class="fas fa-calendar-day"></i> ${new Date(a.fecha).toLocaleDateString()} ${a.hora ? a.hora.slice(0,5) : ''}</p>
                    <p><i class="fas fa-map-pin"></i> ${a.lugar || 'Campo ferial'}</p>
                    <p>${a.descripcion || ''}</p>
                    ${a.requiere_entrada_online ? `<p><i class="fas fa-ticket-alt"></i> Entradas: <a href="${a.enlace_venta}" target="_blank">Comprar</a></p>` : ''}
                    ${a.es_gratis ? '<p><strong>Evento gratuito</strong></p>' : ''}
                </div>
            `;
        });
        container.innerHTML = html;
    } catch (err) {
        container.innerHTML = '<p>Error al cargar actividades.</p>';
    }
}

// Cargar expositores (con soporte para video)
async function cargarExpositores() {
    const container = document.getElementById('expositoresGrid');
    if (!container) return;
    try {
        const res = await fetch(`/api/expositores/${slug}`);
        const expositores = await res.json();
        if (expositores.length === 0) {
            container.innerHTML = '<p>No hay expositores registrados.</p>';
            return;
        }
        let html = '';
        expositores.forEach(expo => {
            let mediaHtml = '';
            if (expo.video_url) {
                mediaHtml = `
                    <video controls style="width:100%; max-height:200px; border-radius:8px; margin-bottom:1rem;">
                        <source src="${expo.video_url}" type="video/mp4">
                        Tu navegador no soporta video.
                    </video>
                `;
            } else if (expo.imagen_logo) {
                mediaHtml = `<img src="${expo.imagen_logo}" alt="${expo.nombre}" class="expositor-logo">`;
            } else {
                mediaHtml = '<div class="expositor-sin-logo"><i class="fas fa-store"></i></div>';
            }

            html += `
                <div class="expositor-card">
                    ${mediaHtml}
                    <h3>${expo.nombre}</h3>
                    <p><strong>Rubro:</strong> ${expo.rubro}</p>
                    <p>${expo.descripcion || ''}</p>
                    <p><strong>Ubicación:</strong> ${expo.ubicacion || 'Por definir'}</p>
                    ${expo.sitio_web ? `<a href="${expo.sitio_web}" target="_blank" class="btn-web">Visitar sitio</a>` : ''}
                </div>
            `;
        });
        container.innerHTML = html;
    } catch (err) {
        console.error(err);
        container.innerHTML = '<p style="color:red;">Error al cargar expositores.</p>';
    }
}

// Ejecutar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    cargarEvento();
    cargarPrecios();
    cargarActividades();
    cargarExpositores();
    aplicarIdioma();

    const btnIdioma = document.getElementById('btnIdioma');
    if (btnIdioma) {
        btnIdioma.addEventListener('click', () => {
            idiomaActual = idiomaActual === 'es' ? 'en' : 'es';
            aplicarIdioma();
        });
    }
});