// admin-dashboard.js
const token = localStorage.getItem('token');
if (!token) window.location.href = 'login.html';

let eventosGlobal = [];

// Elementos del DOM
const btnLogout                 = document.getElementById('btnLogout');
const btnCrearEvento            = document.getElementById('btnCrearEvento');
const btnEliminarSeleccionados  = document.getElementById('btnEliminarSeleccionados');
const btnEliminarPorFecha       = document.getElementById('btnEliminarPorFecha');
const listaEventosDiv           = document.getElementById('listaEventos');

// ── Helpers ──────────────────────────────────────────────────────────────────

async function fetchAPI(url, options = {}) {
    const res = await fetch(url, {
        ...options,
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
    });
    if (res.status === 401) {
        localStorage.clear();
        window.location.href = 'login.html';
    }
    return res.json();
}

function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>]/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[m]));
}

function formatFecha(isoStr) {
    return window.formatDateCR(isoStr);
}

function estadoEvento(e) {
    // Primero verificar estado de aprobación
    if (e.estado === 'pendiente')           return { label: 'Pendiente', cls: 'estado-pendiente' };
    if (e.estado === 'edicion_pendiente')   return { label: 'Edición pendiente', cls: 'estado-edicion-pendiente' };
    if (e.estado === 'rechazado')           return { label: 'Rechazado', cls: 'estado-rechazado' };
    if (e.estado !== 'aprobado')            return { label: 'Sin aprobar', cls: 'estado-no-aprobado' };
    
    // Si está aprobado, mostrar estado por fechas
    const hoy   = new Date();
    const ini   = new Date(e.fecha_inicio);
    const fin   = new Date(e.fecha_fin);
    if (hoy >= ini && hoy <= fin) return { label: 'En curso ✓', cls: 'estado-activo' };
    if (hoy < ini)                return { label: 'Próximo ✓',  cls: 'estado-proximo' };
    return                               { label: 'Finalizado ✓', cls: 'estado-pasado' };
}

// ── Secciones de resumen ──────────────────────────────────────────────────────

function renderRecientes(eventos) {
    const contenedor = document.getElementById('listaRecientes');
    const badge      = document.getElementById('badgeRecientes');

    // Los más recientes = los últimos creados → ordenar por id desc y tomar 5
    const recientes = [...eventos]
        .sort((a, b) => b.id - a.id)
        .slice(0, 5);

    badge.textContent = recientes.length;

    if (recientes.length === 0) {
        contenedor.innerHTML = '<p class="section-empty">Sin eventos registrados.</p>';
        return;
    }

    contenedor.innerHTML = recientes.map(e => {
        const estado = estadoEvento(e);
        return `
        <div class="mini-evento">
            <div class="reciente-dot"></div>
            <div class="mini-evento-info">
                <strong title="${escapeHtml(e.nombre)}">${escapeHtml(e.nombre)}
                    <span class="estado-tag ${estado.cls}">${estado.label}</span>
                </strong>
                <span>${formatFecha(e.fecha_inicio)} → ${formatFecha(e.fecha_fin)}</span>
            </div>
            <button class="mini-edit-btn" onclick="editarEvento(${e.id})">Editar</button>
        </div>`;
    }).join('');
}

function renderCronologico(eventos) {
    const contenedor = document.getElementById('listaCronologico');
    const badge      = document.getElementById('badgeCronologico');

    // Ordenar por fecha_inicio asc; si empatan, por fecha_fin asc
    const ordenados = [...eventos].sort((a, b) => {
        const diffIni = new Date(a.fecha_inicio) - new Date(b.fecha_inicio);
        if (diffIni !== 0) return diffIni;
        return new Date(a.fecha_fin) - new Date(b.fecha_fin);
    });

    badge.textContent = ordenados.length;

    if (ordenados.length === 0) {
        contenedor.innerHTML = '<p class="section-empty">Sin eventos registrados.</p>';
        return;
    }

    contenedor.innerHTML = ordenados.map((e, i) => {
        const estado = estadoEvento(e);
        return `
        <div class="mini-evento">
            <div class="orden-badge">${i + 1}</div>
            <div class="mini-evento-info">
                <strong title="${escapeHtml(e.nombre)}">${escapeHtml(e.nombre)}
                    <span class="estado-tag ${estado.cls}">${estado.label}</span>
                </strong>
                <span>${formatFecha(e.fecha_inicio)} → ${formatFecha(e.fecha_fin)}</span>
            </div>
            <button class="mini-edit-btn" onclick="editarEvento(${e.id})">Editar</button>
        </div>`;
    }).join('');
}

// ── Lista completa ────────────────────────────────────────────────────────────

async function cargarEventos() {
    const eventos = await fetchAPI('/api/admin/eventos');
    eventosGlobal = eventos;

    // Render de secciones de resumen
    renderRecientes(eventos);
    renderCronologico(eventos);

    // Render de lista completa
    if (eventos.length === 0) {
        listaEventosDiv.innerHTML = '<p>No hay eventos registrados.</p>';
        return;
    }

    let html = '';
    eventos.forEach(e => {
        const estado = estadoEvento(e);
        html += `
        <div class="evento-item" data-id="${e.id}">
            <div class="evento-info">
                <input type="checkbox" class="evento-check" data-id="${e.id}">
                <div class="evento-details">
                    <strong>${escapeHtml(e.nombre)}</strong>
                    <span class="estado-tag ${estado.cls}">${estado.label}</span>
                    <small style="color:#999"> (${e.slug})</small><br>
                    ${formatFecha(e.fecha_inicio)} → ${formatFecha(e.fecha_fin)}<br>
                    ${escapeHtml(e.ubicacion)}
                </div>
            </div>
            <div class="evento-actions">
                <button class="btn btn-warning btn-editar" data-id="${e.id}">Editar</button>
                <button class="btn btn-danger btn-eliminar" data-id="${e.id}">Eliminar</button>
            </div>
        </div>`;
    });
    listaEventosDiv.innerHTML = html;

    document.querySelectorAll('.evento-check').forEach(cb =>
        cb.addEventListener('change', actualizarBotonEliminarSeleccionados)
    );
    document.querySelectorAll('.btn-editar').forEach(btn =>
        btn.addEventListener('click', () => editarEvento(btn.dataset.id))
    );
    document.querySelectorAll('.btn-eliminar').forEach(btn =>
        btn.addEventListener('click', () => eliminarEvento(btn.dataset.id))
    );
    actualizarBotonEliminarSeleccionados();
}

// ── Acciones ─────────────────────────────────────────────────────────────────

function actualizarBotonEliminarSeleccionados() {
    const checks = document.querySelectorAll('.evento-check:checked');
    btnEliminarSeleccionados.disabled = checks.length === 0;
}

async function eliminarEvento(id) {
    if (confirm('¿Eliminar este evento? Se borrarán también precios, actividades, expositores y galería.')) {
        await fetchAPI(`/api/admin/eventos/${id}`, { method: 'DELETE' });
        cargarEventos();
    }
}

async function eliminarSeleccionados() {
    const checks = document.querySelectorAll('.evento-check:checked');
    const ids = Array.from(checks).map(cb => cb.dataset.id);
    if (ids.length === 0) return;
    if (confirm(`¿Eliminar ${ids.length} evento(s) seleccionados? Esta acción es irreversible.`)) {
        for (const id of ids) await fetchAPI(`/api/admin/eventos/${id}`, { method: 'DELETE' });
        cargarEventos();
    }
}

async function eliminarPorFecha() {
    const fechaInicio = document.getElementById('fecha_inicio_eliminar').value;
    const fechaFin    = document.getElementById('fecha_fin_eliminar').value;
    if (!fechaInicio || !fechaFin) { alert('Seleccione ambas fechas.'); return; }

    const eventosAEliminar = eventosGlobal.filter(e => {
        const ini = new Date(e.fecha_inicio);
        const fin = new Date(e.fecha_fin);
        return ini >= new Date(fechaInicio) && fin <= new Date(fechaFin);
    });

    if (eventosAEliminar.length === 0) { alert('No hay eventos en ese rango de fechas.'); return; }
    if (!confirm(`Se eliminarán ${eventosAEliminar.length} evento(s). ¿Continuar?`)) return;

    for (const e of eventosAEliminar)
        await fetchAPI(`/api/admin/eventos/${e.id}`, { method: 'DELETE' });

    cargarEventos();
    document.getElementById('fecha_inicio_eliminar').value = '';
    document.getElementById('fecha_fin_eliminar').value    = '';
}

function editarEvento(id) {
    window.location.href = `evento-form.html?id=${id}`;
}

// ── Event listeners ───────────────────────────────────────────────────────────

btnLogout.addEventListener('click', () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = 'login.html';
});
btnCrearEvento.addEventListener('click', () => { window.location.href = 'evento-form.html'; });
btnEliminarSeleccionados.addEventListener('click', eliminarSeleccionados);
btnEliminarPorFecha.addEventListener('click', eliminarPorFecha);

cargarEventos();


