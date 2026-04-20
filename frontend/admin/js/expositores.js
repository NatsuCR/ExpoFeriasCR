// admin-expositores.js

// ── Helpers de multi-imagen (compartidos con actividades) ──────────────────

function parseImagenes(valor) {
    if (!valor) return [];
    try {
        const parsed = JSON.parse(valor);
        if (Array.isArray(parsed)) return parsed.filter(Boolean);
    } catch (_) { }
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
        agregarFilaImagen(listaId);
    } else {
        urls.forEach(url => agregarFilaImagen(listaId, url));
    }
}

// ── Modal ─────────────────────────────────────────────────────────────────

function abrirModalExpositor(expositor = null) {
    document.getElementById('modalExpositorTitulo').innerText = expositor ? 'Editar Expositor' : 'Agregar Expositor';
    document.getElementById('expositorId').value = expositor ? expositor.id : '';
    document.getElementById('expositorNombre').value = expositor ? expositor.nombre : '';
    document.getElementById('expositorRubro').value = expositor ? expositor.rubro || '' : '';
    document.getElementById('expositorDescripcion').value = expositor ? expositor.descripcion || '' : '';
    document.getElementById('expositorUbicacion').value = expositor ? expositor.ubicacion || '' : '';
    document.getElementById('expositorVideo').value = expositor ? expositor.video_url || '' : '';

    poblarImagenesLista('expositorImagenesLista', expositor ? expositor.imagen_logo : null);
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
        imagen_logo: serializarImagenes('expositorImagenesLista'),
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

// ── Lista ─────────────────────────────────────────────────────────────────

async function cargarExpositores() {
    if (!eventoId) return;
    const expositores = await fetchAPI(`/api/admin/eventos/${eventoId}/expositores`);
    const tbody = document.getElementById('expositores-rows');
    if (!tbody) return;
    if (expositores.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7">No hay expositores registrados.</td></tr>';
        return;
    }
    let html = '';
    expositores.forEach(e => {
        const imgs = parseImagenes(e.imagen_logo);
        const imgBadge = imgs.length > 1 ? `${imgs.length} imgs` : (imgs.length === 1 ? '✓' : '—');
        html += `<tr>
            <td>${e.nombre}</td>
            <td>${e.rubro || '—'}</td>
            <td>${e.descripcion || '—'}</td>
            <td>${e.ubicacion || '—'}</td>
            <td>${imgBadge}</td>
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

// ── Eventos del modal ─────────────────────────────────────────────────────

document.getElementById('btnAgregarImagenExpositor').addEventListener('click', () => {
    agregarFilaImagen('expositorImagenesLista');
});