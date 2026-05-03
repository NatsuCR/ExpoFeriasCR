// admin-precios.js
let precioEditandoId = null;

function abrirModalPrecio(precio = null) {
    if (precio) {
        document.getElementById('modalPrecioTitulo').innerText = 'Editar Precio';
        document.getElementById('precioId').value = precio.id;
        document.getElementById('precioFecha').value = precio.fecha.slice(0,10);
        document.getElementById('precioNormal').value = precio.precio_normal;
        document.getElementById('precioPromocion').value = precio.promocion || '';
        document.getElementById('precioDescripcion').value = precio.descripcion_promocion || '';
    } else {
        document.getElementById('modalPrecioTitulo').innerText = 'Agregar Precio';
        document.getElementById('precioId').value = '';
        document.getElementById('precioFecha').value = '';
        document.getElementById('precioNormal').value = '';
        document.getElementById('precioPromocion').value = '';
        document.getElementById('precioDescripcion').value = '';
    }
    document.getElementById('modalPrecio').style.display = 'flex';
}

function cerrarModalPrecio() { document.getElementById('modalPrecio').style.display = 'none'; }

async function guardarPrecioModal() {
    const id = document.getElementById('precioId').value;
    const data = {
        evento_id: eventoId,
        fecha: document.getElementById('precioFecha').value,
        precio_normal: parseFloat(document.getElementById('precioNormal').value),
        promocion: document.getElementById('precioPromocion').value || null,
        descripcion_promocion: document.getElementById('precioDescripcion').value || null
    };
    if (!data.fecha || isNaN(data.precio_normal)) {
        alert('Fecha y precio normal son obligatorios');
        return;
    }
    if (id) {
        await fetchAPI(`/api/admin/precios/${id}`, { method: 'PUT', body: JSON.stringify(data) });
    } else {
        await fetchAPI('/api/admin/precios', { method: 'POST', body: JSON.stringify(data) });
    }
    cerrarModalPrecio();
    cargarPrecios();
}

async function cargarPrecios() {
    if (!eventoId) return;
    const precios = await fetchAPI(`/api/admin/eventos/${eventoId}/precios`);
    const tbody = document.getElementById('tbodyPrecios');
    if (precios.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5">No hay precios registrados.</td></tr>';
        return;
    }
    let html = '';
    precios.forEach(p => {
        html += `<tr>
            <td>${new Date(p.fecha + 'T12:00:00').toLocaleDateString()}</td>
            <td>${p.precio_normal}</td>
            <td>${p.promocion || '—'}</td>
            <td>${p.descripcion_promocion || '—'}</td>
            <td>
                <button class="btn btn-warning btn-editar-precio" data-precio='${JSON.stringify(p)}'>Editar</button>
                <button class="btn btn-danger btn-eliminar-precio" data-id="${p.id}">Eliminar</button>
            </td>
        </tr>`;
    });
    tbody.innerHTML = html;
    document.querySelectorAll('.btn-editar-precio').forEach(btn => {
        btn.addEventListener('click', () => abrirModalPrecio(JSON.parse(btn.dataset.precio)));
    });
    document.querySelectorAll('.btn-eliminar-precio').forEach(btn => {
        btn.addEventListener('click', async () => {
            if (confirm('¿Eliminar este precio?')) {
                await fetchAPI(`/api/admin/precios/${btn.dataset.id}`, { method: 'DELETE' });
                cargarPrecios();
            }
        });
    });
}


