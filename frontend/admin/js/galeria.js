// admin-galeria.js
let galeriaEditandoId = null;

function abrirModalGaleria(imagen = null) {
    document.getElementById('modalGaleriaTitulo').innerText = imagen ? 'Editar Imagen' : 'Agregar Imagen';
    document.getElementById('galeriaId').value = imagen ? imagen.id : '';
    document.getElementById('galeriaUrl').value = imagen ? imagen.imagen_url : '';
    document.getElementById('galeriaOrden').value = imagen ? imagen.orden : 0;
    document.getElementById('modalGaleria').style.display = 'flex';
}

function cerrarModalGaleria() {
    document.getElementById('modalGaleria').style.display = 'none';
}

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
    try {
        if (id) {
            await fetchAPI(`/api/admin/galeria/${id}`, { method: 'PUT', body: JSON.stringify(data) });
        } else {
            await fetchAPI('/api/admin/galeria', { method: 'POST', body: JSON.stringify(data) });
        }
        cerrarModalGaleria();
        cargarGaleria(); // recargar la tabla
    } catch (error) {
        console.error(error);
        alert('Error al guardar la imagen');
    }
}

async function cargarGaleria() {
    if (!eventoId) {
        console.warn('eventoId no definido, no se puede cargar galería');
        return;
    }
    try {
        const imagenes = await fetchAPI(`/api/admin/eventos/${eventoId}/galeria`);
        const tbody = document.getElementById('galeria-rows');
        if (!tbody) return;
        // Limpiar tabla
        tbody.innerHTML = '';
        if (imagenes.length === 0) {
            const row = tbody.insertRow();
            const cell = row.insertCell(0);
            cell.colSpan = 3;
            cell.textContent = 'No hay imágenes en la galería.';
            return;
        }
        imagenes.forEach(img => {
            const row = tbody.insertRow();
            const cellUrl = row.insertCell(0);
            const cellOrden = row.insertCell(1);
            const cellAcciones = row.insertCell(2);
            cellUrl.textContent = img.imagen_url;
            cellOrden.textContent = img.orden;
            const btnEditar = document.createElement('button');
            btnEditar.textContent = 'Editar';
            btnEditar.className = 'btn btn-warning btn-editar-galeria';
            btnEditar.dataset.id = img.id;
            btnEditar.dataset.url = img.imagen_url;
            btnEditar.dataset.orden = img.orden;
            const btnEliminar = document.createElement('button');
            btnEliminar.textContent = 'Eliminar';
            btnEliminar.className = 'btn btn-danger btn-eliminar-galeria';
            btnEliminar.dataset.id = img.id;
            cellAcciones.appendChild(btnEditar);
            cellAcciones.appendChild(btnEliminar);
        });
        // Asignar eventos a los botones dinámicos
        document.querySelectorAll('.btn-editar-galeria').forEach(btn => {
            btn.addEventListener('click', () => {
                abrirModalGaleria({
                    id: btn.dataset.id,
                    imagen_url: btn.dataset.url,
                    orden: btn.dataset.orden
                });
            });
        });
        document.querySelectorAll('.btn-eliminar-galeria').forEach(btn => {
            btn.addEventListener('click', async () => {
                if (confirm('¿Eliminar esta imagen?')) {
                    await fetchAPI(`/api/admin/galeria/${btn.dataset.id}`, { method: 'DELETE' });
                    cargarGaleria();
                }
            });
        });
    } catch (error) {
        console.error('Error cargando galería:', error);
        const tbody = document.getElementById('tbodyGaleria');
        if (tbody) tbody.innerHTML = '<tr><td colspan="3">Error al cargar imágenes.学ﬂ学ﬂ';
    }
}


