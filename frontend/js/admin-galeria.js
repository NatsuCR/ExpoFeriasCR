// admin-galeria.js
let galeriaEditandoId = null;

function abrirModalGaleria(imagen = null) {
    document.getElementById('modalGaleriaTitulo').innerText = imagen ? 'Editar Imagen' : 'Agregar Imagen';
    document.getElementById('galeriaId').value = imagen ? imagen.id : '';
    document.getElementById('galeriaUrl').value = imagen ? imagen.imagen_url : '';
    document.getElementById('galeriaOrden').value = imagen ? imagen.orden : 0;
    document.getElementById('modalGaleria').style.display = 'flex';
}

function cerrarModalGaleria() { document.getElementById('modalGaleria').style.display = 'none'; }

async function guardarGaleriaModal() {
    const id = document.getElementById('galeriaId').value;
    const data = {
        evento_id: eventoId,
        imagen_url: document.getElementById('galeriaUrl').value,
        orden: parseInt(document.getElementById('galeriaOrden').value) || 0
    };
    if (!data.imagen_url) {
        alert('La URL de la imagen es obligatoria');
        return;
    }
    if (id) {
        await fetchAPI(`/api/admin/galeria/${id}`, { method: 'PUT', body: JSON.stringify(data) });
    } else {
        await fetchAPI('/api/admin/galeria', { method: 'POST', body: JSON.stringify(data) });
    }
    cerrarModalGaleria();
    cargarGaleria();
}

async function cargarGaleria() {
    if (!eventoId) return;
    const imagenes = await fetchAPI(`/api/admin/eventos/${eventoId}/galeria`);
    const tbody = document.getElementById('tbodyGaleria');
    if (imagenes.length === 0) {
        tbody.innerHTML = '<tr><td colspan="3">No hay imágenes en la galería.</td></tr>';
        return;
    }
    let html = '';
    imagenes.forEach(img => {
        html += `<tr>
            <td>${img.imagen_url}</td>
            <td>${img.orden}</td>
            <td>
                <button class="btn btn-warning btn-editar-galeria" data-imagen='${JSON.stringify(img)}'>Editar</button>
                <button class="btn btn-danger btn-eliminar-galeria" data-id="${img.id}">Eliminar</button>
            </td>
        </tr>`;
    });
    tbody.innerHTML = html;
    document.querySelectorAll('.btn-editar-galeria').forEach(btn => {
        btn.addEventListener('click', () => abrirModalGaleria(JSON.parse(btn.dataset.imagen)));
    });
    document.querySelectorAll('.btn-eliminar-galeria').forEach(btn => {
        btn.addEventListener('click', async () => {
            if (confirm('¿Eliminar esta imagen?')) {
                await fetchAPI(`/api/admin/galeria/${btn.dataset.id}`, { method: 'DELETE' });
                cargarGaleria();
            }
        });
    });
}