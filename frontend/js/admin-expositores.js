// admin-expositores.js
let expositorEditandoId = null;

function abrirModalExpositor(expositor = null) {
    document.getElementById('modalExpositorTitulo').innerText = expositor ? 'Editar Expositor' : 'Agregar Expositor';
    document.getElementById('expositorId').value = expositor ? expositor.id : '';
    document.getElementById('expositorNombre').value = expositor ? expositor.nombre : '';
    document.getElementById('expositorRubro').value = expositor ? expositor.rubro || '' : '';
    document.getElementById('expositorDescripcion').value = expositor ? expositor.descripcion || '' : '';
    document.getElementById('expositorUbicacion').value = expositor ? expositor.ubicacion || '' : '';
    document.getElementById('expositorLogo').value = expositor ? expositor.imagen_logo || '' : '';
    document.getElementById('expositorVideo').value = expositor ? expositor.video_url || '' : '';
    document.getElementById('modalExpositor').style.display = 'flex';
}

function cerrarModalExpositor() {
    document.getElementById('modalExpositor').style.display = 'none';
}

async function guardarExpositorModal() {
    const id = document.getElementById('expositorId').value;
    const data = {
        evento_id: eventoId,
        nombre: document.getElementById('expositorNombre').value,
        rubro: document.getElementById('expositorRubro').value || null,
        descripcion: document.getElementById('expositorDescripcion').value || null,
        ubicacion: document.getElementById('expositorUbicacion').value || null,
        es_pagado: false,
        imagen_logo: document.getElementById('expositorLogo').value || null,
        sitio_web: null,
        video_url: document.getElementById('expositorVideo').value || null
    };
    if (!data.nombre) {
        alert('El nombre del expositor es obligatorio');
        return;
    }
    if (id) {
        await fetchAPI(`/api/admin/expositores/${id}`, { method: 'PUT', body: JSON.stringify(data) });
    } else {
        await fetchAPI('/api/admin/expositores', { method: 'POST', body: JSON.stringify(data) });
    }
    cerrarModalExpositor();
    cargarExpositores();
}

async function cargarExpositores() {
    if (!eventoId) return;
    const expositores = await fetchAPI(`/api/admin/eventos/${eventoId}/expositores`);
    const tbody = document.getElementById('tbodyExpositores'); // ← ID correcto
    if (!tbody) return;
    if (expositores.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7">No hay expositores registrados.学ﬂ学ﬂ';
        return;
    }
    let html = '';
    expositores.forEach(e => {
        html += `<tr>
            <td>${e.nombre}</td>
            <td>${e.rubro || '—'}</td>
            <td>${e.descripcion || '—'}</td>
            <td>${e.ubicacion || '—'}</td>
            <td>${e.imagen_logo ? '✓' : '—'}</td>
            <td>${e.video_url ? '✓' : '—'}</td>
            <td>
                <button class="btn btn-warning btn-editar-expositor" data-expositor='${JSON.stringify(e)}'>Editar</button>
                <button class="btn btn-danger btn-eliminar-expositor" data-id="${e.id}">Eliminar</button>
            </td>
        </tr>`;
    });
    tbody.innerHTML = html;
    document.querySelectorAll('.btn-editar-expositor').forEach(btn => {
        btn.addEventListener('click', () => abrirModalExpositor(JSON.parse(btn.dataset.expositor)));
    });
    document.querySelectorAll('.btn-eliminar-expositor').forEach(btn => {
        btn.addEventListener('click', async () => {
            if (confirm('¿Eliminar expositor?')) {
                await fetchAPI(`/api/admin/expositores/${btn.dataset.id}`, { method: 'DELETE' });
                cargarExpositores();
            }
        });
    });
}