// admin-actividades.js

// ── Helpers de multi-imagen ────────────────────────────────────────────────

function parseImagenes(valor) {
    if (!valor) return [];
    try {
        const parsed = JSON.parse(valor);
        if (Array.isArray(parsed)) return parsed.filter(Boolean);
    } catch (_) {}
    // si es una URL simple (legado), la envuelvo en array
    return valor.trim() ? [valor.trim()] : [];
}

function serializarImagenes(listaId) {
    const items = document.querySelectorAll(`#${listaId} .imagen-item input`);
    const urls = Array.from(items).map(i => i.value.trim()).filter(Boolean);
    return urls.length ? JSON.stringify(urls) : null;
}

function agregarFilaImagen(listaId, url = '') {
    const lista = document.getElementById(listaId);
    const item = document.createElement('div');
    item.className = 'imagen-item';
    item.innerHTML = `
        <input type="text" placeholder="URL de imagen..." value="${url}">
        <button type="button" class="btn-quitar-imagen" title="Quitar">✕</button>
    `;
    item.querySelector('.btn-quitar-imagen').addEventListener('click', () => item.remove());
    lista.appendChild(item);
}

function poblarImagenesLista(listaId, valor) {
    const lista = document.getElementById(listaId);
    lista.innerHTML = '';
    const urls = parseImagenes(valor);
    if (urls.length === 0) {
        agregarFilaImagen(listaId); // al menos una fila vacía
    } else {
        urls.forEach(url => agregarFilaImagen(listaId, url));
    }
}

// ── Modal ─────────────────────────────────────────────────────────────────

function abrirModalActividad(actividad = null) {
    document.getElementById('modalActividadTitulo').innerText = actividad ? 'Editar Actividad' : 'Agregar Actividad';
    document.getElementById('actividadId').value = actividad ? actividad.id : '';
    document.getElementById('actividadTitulo').value = actividad ? actividad.titulo : '';
    document.getElementById('actividadTipo').value = actividad ? actividad.tipo || '' : '';
    document.getElementById('actividadFecha').value = actividad ? actividad.fecha.slice(0,10) : '';
    document.getElementById('actividadHora').value = actividad ? (actividad.hora ? actividad.hora.slice(0,5) : '') : '';
    document.getElementById('actividadLugar').value = actividad ? actividad.lugar || '' : '';
    document.getElementById('actividadDescripcion').value = actividad ? actividad.descripcion || '' : '';
    document.getElementById('actividadRequiereOnline').checked = actividad ? actividad.requiere_entrada_online : false;
    document.getElementById('actividadEsGratis').checked = actividad ? actividad.es_gratis : false;
    document.getElementById('actividadEnlaceVenta').value = actividad ? actividad.enlace_venta || '' : '';
    document.getElementById('actividadEnlaceGroup').style.display =
        document.getElementById('actividadRequiereOnline').checked ? 'block' : 'none';

    poblarImagenesLista('actividadImagenesLista', actividad ? actividad.imagen : null);
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
        imagen: serializarImagenes('actividadImagenesLista'),
        requiere_entrada_online: document.getElementById('actividadRequiereOnline').checked,
        enlace_venta: document.getElementById('actividadRequiereOnline').checked
            ? document.getElementById('actividadEnlaceVenta').value : null,
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

// ── Lista ─────────────────────────────────────────────────────────────────

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
        const imgs = parseImagenes(a.imagen);
        const imgBadge = imgs.length > 1 ? `${imgs.length} imgs` : (imgs.length === 1 ? '✓' : '—');
        html += `<tr>
            <td>${a.titulo}</td>
            <td>${a.tipo || '—'}</td>
            <td>${new Date(a.fecha).toLocaleDateString()}</td>
            <td>${a.hora ? a.hora.slice(0,5) : '—'}</td>
            <td>${a.lugar || '—'}</td>
            <td>${imgBadge}</td>
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

// ── Eventos del modal ─────────────────────────────────────────────────────

document.getElementById('actividadRequiereOnline').addEventListener('change', function(e) {
    document.getElementById('actividadEnlaceGroup').style.display = e.target.checked ? 'block' : 'none';
});

document.getElementById('btnAgregarImagenActividad').addEventListener('click', () => {
    agregarFilaImagen('actividadImagenesLista');
});


