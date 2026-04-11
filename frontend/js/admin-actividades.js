// admin-actividades.js
let actividadEditandoId = null;

function abrirModalActividad(actividad = null) {
    document.getElementById('modalActividadTitulo').innerText = actividad ? 'Editar Actividad' : 'Agregar Actividad';
    document.getElementById('actividadId').value = actividad ? actividad.id : '';
    document.getElementById('actividadTitulo').value = actividad ? actividad.titulo : '';
    document.getElementById('actividadTipo').value = actividad ? actividad.tipo || '' : '';
    document.getElementById('actividadFecha').value = actividad ? actividad.fecha.slice(0,10) : '';
    document.getElementById('actividadHora').value = actividad ? (actividad.hora ? actividad.hora.slice(0,5) : '') : '';
    document.getElementById('actividadLugar').value = actividad ? actividad.lugar || '' : '';
    document.getElementById('actividadDescripcion').value = actividad ? actividad.descripcion || '' : '';
    document.getElementById('actividadImagen').value = actividad ? actividad.imagen || '' : '';
    document.getElementById('actividadRequiereOnline').checked = actividad ? actividad.requiere_entrada_online : false;
    document.getElementById('actividadEsGratis').checked = actividad ? actividad.es_gratis : false;
    document.getElementById('actividadEnlaceVenta').value = actividad ? actividad.enlace_venta || '' : '';
    document.getElementById('actividadEnlaceGroup').style.display = document.getElementById('actividadRequiereOnline').checked ? 'block' : 'none';
    document.getElementById('modalActividad').style.display = 'flex';
}

function cerrarModalActividad() { document.getElementById('modalActividad').style.display = 'none'; }

async function guardarActividadModal() {
    const id = document.getElementById('actividadId').value;
    const data = {
        evento_id: eventoId,
        titulo: document.getElementById('actividadTitulo').value,
        tipo: document.getElementById('actividadTipo').value || null,
        fecha: document.getElementById('actividadFecha').value,
        hora: document.getElementById('actividadHora').value || null,
        lugar: document.getElementById('actividadLugar').value || null,
        descripcion: document.getElementById('actividadDescripcion').value || null,
        imagen: document.getElementById('actividadImagen').value || null,
        requiere_entrada_online: document.getElementById('actividadRequiereOnline').checked,
        enlace_venta: document.getElementById('actividadRequiereOnline').checked ? document.getElementById('actividadEnlaceVenta').value : null,
        es_gratis: document.getElementById('actividadEsGratis').checked
    };
    if (!data.titulo || !data.fecha) {
        alert('Título y fecha son obligatorios');
        return;
    }
    if (id) {
        await fetchAPI(`/api/admin/actividades/${id}`, { method: 'PUT', body: JSON.stringify(data) });
    } else {
        await fetchAPI('/api/admin/actividades', { method: 'POST', body: JSON.stringify(data) });
    }
    cerrarModalActividad();
    cargarActividades();
}

async function cargarActividades() {
    if (!eventoId) return;
    const acts = await fetchAPI(`/api/admin/eventos/${eventoId}/actividades`);
    const tbody = document.getElementById('tbodyActividades');
    if (acts.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7">No hay actividades registradas.</td></tr>';
        return;
    }
    let html = '';
    acts.forEach(a => {
        html += `<tr>
            <td>${a.titulo}</td>
            <td>${a.tipo || '—'}</td>
            <td>${new Date(a.fecha).toLocaleDateString()}</td>
            <td>${a.hora ? a.hora.slice(0,5) : '—'}</td>
            <td>${a.lugar || '—'}</td>
            <td>${a.imagen ? '✓' : '—'}</td>
            <td>
                <button class="btn btn-warning btn-editar-actividad" data-actividad='${JSON.stringify(a)}'>Editar</button>
                <button class="btn btn-danger btn-eliminar-actividad" data-id="${a.id}">Eliminar</button>
            </td>
        </tr>`;
    });
    tbody.innerHTML = html;
    document.querySelectorAll('.btn-editar-actividad').forEach(btn => {
        btn.addEventListener('click', () => abrirModalActividad(JSON.parse(btn.dataset.actividad)));
    });
    document.querySelectorAll('.btn-eliminar-actividad').forEach(btn => {
        btn.addEventListener('click', async () => {
            if (confirm('¿Eliminar actividad?')) {
                await fetchAPI(`/api/admin/actividades/${btn.dataset.id}`, { method: 'DELETE' });
                cargarActividades();
            }
        });
    });
}

document.getElementById('actividadRequiereOnline').addEventListener('change', function(e) {
    document.getElementById('actividadEnlaceGroup').style.display = e.target.checked ? 'block' : 'none';
});