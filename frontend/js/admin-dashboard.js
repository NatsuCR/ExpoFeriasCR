// admin-dashboard.js
const token = localStorage.getItem('token');
if (!token) window.location.href = 'login.html';

let eventosGlobal = [];

// Elementos del DOM
const btnLogout = document.getElementById('btnLogout');
const btnCrearEvento = document.getElementById('btnCrearEvento');
const btnEliminarSeleccionados = document.getElementById('btnEliminarSeleccionados');
const btnEliminarPorFecha = document.getElementById('btnEliminarPorFecha');
const listaEventosDiv = document.getElementById('listaEventos');

// Funciones auxiliares
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

async function cargarEventos() {
    const eventos = await fetchAPI('/api/admin/eventos');
    eventosGlobal = eventos;
    if (eventos.length === 0) {
        listaEventosDiv.innerHTML = '<p>No hay eventos registrados.</p>';
        return;
    }
    let html = '';
    eventos.forEach(e => {
        html += `
            <div class="evento-item" data-id="${e.id}">
                <div class="evento-info">
                    <input type="checkbox" class="evento-check" data-id="${e.id}">
                    <div class="evento-details">
                        <strong>${escapeHtml(e.nombre)}</strong> (${e.slug})<br>
                        ${new Date(e.fecha_inicio).toLocaleDateString()} al ${new Date(e.fecha_fin).toLocaleDateString()}<br>
                        ${e.ubicacion}
                    </div>
                </div>
                <div class="evento-actions">
                    <button class="btn btn-warning btn-editar" data-id="${e.id}">Editar</button>
                    <button class="btn btn-danger btn-eliminar" data-id="${e.id}">Eliminar</button>
                </div>
            </div>
        `;
    });
    listaEventosDiv.innerHTML = html;

    // Eventos de checkboxes
    document.querySelectorAll('.evento-check').forEach(cb => {
        cb.addEventListener('change', actualizarBotonEliminarSeleccionados);
    });
    // Botones editar/eliminar individuales
    document.querySelectorAll('.btn-editar').forEach(btn => {
        btn.addEventListener('click', () => editarEvento(btn.dataset.id));
    });
    document.querySelectorAll('.btn-eliminar').forEach(btn => {
        btn.addEventListener('click', () => eliminarEvento(btn.dataset.id));
    });
    actualizarBotonEliminarSeleccionados();
}

function actualizarBotonEliminarSeleccionados() {
    const checkboxes = document.querySelectorAll('.evento-check:checked');
    btnEliminarSeleccionados.disabled = checkboxes.length === 0;
}

async function eliminarEvento(id) {
    if (confirm('¿Eliminar este evento? Se borrarán también precios, actividades, expositores y galería.')) {
        await fetchAPI(`/api/admin/eventos/${id}`, { method: 'DELETE' });
        cargarEventos();
    }
}

async function eliminarSeleccionados() {
    const checkboxes = document.querySelectorAll('.evento-check:checked');
    const ids = Array.from(checkboxes).map(cb => cb.dataset.id);
    if (ids.length === 0) return;
    if (confirm(`¿Eliminar ${ids.length} evento(s) seleccionados? Esta acción es irreversible.`)) {
        for (const id of ids) {
            await fetchAPI(`/api/admin/eventos/${id}`, { method: 'DELETE' });
        }
        cargarEventos();
    }
}

async function eliminarPorFecha() {
    const fechaInicio = document.getElementById('fecha_inicio_eliminar').value;
    const fechaFin = document.getElementById('fecha_fin_eliminar').value;
    if (!fechaInicio || !fechaFin) {
        alert('Seleccione ambas fechas (inicio y fin).');
        return;
    }
    const eventosAEliminar = eventosGlobal.filter(e => {
        const inicio = new Date(e.fecha_inicio);
        const fin = new Date(e.fecha_fin);
        const rangoInicio = new Date(fechaInicio);
        const rangoFin = new Date(fechaFin);
        return inicio >= rangoInicio && fin <= rangoFin;
    });
    if (eventosAEliminar.length === 0) {
        alert('No hay eventos en el rango de fechas seleccionado.');
        return;
    }
    const confirmar = confirm(`Se eliminarán ${eventosAEliminar.length} evento(s) con fechas entre ${fechaInicio} y ${fechaFin}. ¿Continuar?`);
    if (!confirmar) return;
    for (const e of eventosAEliminar) {
        await fetchAPI(`/api/admin/eventos/${e.id}`, { method: 'DELETE' });
    }
    cargarEventos();
    document.getElementById('fecha_inicio_eliminar').value = '';
    document.getElementById('fecha_fin_eliminar').value = '';
}

function editarEvento(id) {
    window.location.href = `evento-form.html?id=${id}`;
}

function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>]/g, function(m) {
        if (m === '&') return '&amp;';
        if (m === '<') return '&lt;';
        if (m === '>') return '&gt;';
        return m;
    });
}

// Event listeners
btnLogout.addEventListener('click', () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = 'login.html';
});
btnCrearEvento.addEventListener('click', () => {
    window.location.href = 'evento-form.html';
});
btnEliminarSeleccionados.addEventListener('click', eliminarSeleccionados);
btnEliminarPorFecha.addEventListener('click', eliminarPorFecha);

// Cargar eventos al inicio
cargarEventos();