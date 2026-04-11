// admin-evento-form.js
const token = localStorage.getItem('token');
if (!token) window.location.href = 'login.html';

let eventoId = null;
const urlParams = new URLSearchParams(window.location.search);
const idParam = urlParams.get('id');
if (idParam) eventoId = parseInt(idParam);

// ==================== FUNCIONES AUXILIARES ====================
async function fetchAPI(url, options = {}) {
    const res = await fetch(url, {
        ...options,
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
    });
    if (res.status === 401) { localStorage.clear(); window.location.href = 'login.html'; }
    return res.json();
}

function mostrarMensaje(texto, tipo, contenedorId = 'globalMessage') {
    const div = document.getElementById(contenedorId);
    div.className = `message message-${tipo}`;
    div.innerText = texto;
    div.style.display = 'block';
    setTimeout(() => { div.style.display = 'none'; }, 4000);
}

// ==================== DATOS BÁSICOS ====================
async function cargarDatosEvento() {
    if (!eventoId) return;
    const evento = await fetchAPI(`/api/admin/eventos/${eventoId}`);
    document.getElementById('slug').value = evento.slug;
    document.getElementById('nombre').value = evento.nombre;
    document.getElementById('descripcion').value = evento.descripcion || '';
    document.getElementById('fecha_inicio').value = evento.fecha_inicio?.slice(0,10) || '';
    document.getElementById('fecha_fin').value = evento.fecha_fin?.slice(0,10) || '';
    document.getElementById('provincia').value = evento.provincia || '';
    document.getElementById('ubicacion').value = evento.ubicacion || '';
    document.getElementById('imagen_portada').value = evento.imagen_portada || '';
    document.getElementById('horario_imagen').value = evento.horario_imagen || '';
    document.getElementById('mapa_embed').value = evento.mapa_embed || '';
    document.getElementById('color_primario').value = evento.color_primario || '#8b5a2b';
    document.getElementById('color_secundario').value = evento.color_secundario || '#d4a373';
    document.getElementById('color_titulo_seccion').value = evento.color_titulo_seccion || '#2c1a0e';
    document.getElementById('color_fondo').value = evento.color_fondo || '#f4e4c1';
    document.getElementById('color_texto').value = evento.color_texto || '#2c1a0e';
    document.getElementById('color_menu_fondo').value = evento.color_menu_fondo || '#ffffff';
    document.getElementById('color_menu_texto').value = evento.color_menu_texto || '#ffffff';
    document.getElementById('color_menu_fondo_hover').value = evento.color_menu_fondo_hover || '#000000';
    document.getElementById('color_menu_texto_hover').value = evento.color_menu_texto_hover || '#000000';
    document.getElementById('color_hero_overlay').value = evento.color_hero_overlay || 'rgba(62,42,31,0.7)';
    document.getElementById('tipo_venta').value = evento.tipo_venta || 'taquilla';
    document.getElementById('url_venta_online').value = evento.url_venta_online || '';
    document.getElementById('color_titulo_hero').value = evento.color_titulo_hero || '#FFFFFF';
    document.getElementById('color_descripcion_hero').value = evento.color_descripcion_hero || '#FFFFFF';
    document.getElementById('color_fondo_fechas').value = evento.color_fondo_fechas || '#d4a373';
    document.getElementById('color_texto_fechas').value = evento.color_texto_fechas || '#8b5a2b';
    // Nuevos campos
    document.getElementById('color_fondo_contacto').value = evento.color_fondo_contacto || '#f4e4c1';
    document.getElementById('color_texto_contacto').value = evento.color_texto_contacto || '#2c1a0e';
    document.getElementById('color_enlace_contacto').value = evento.color_enlace_contacto || '#8b5a2b';
    document.getElementById('color_fondo_footer').value = evento.color_fondo_footer || '#8b5a2b';
    document.getElementById('color_texto_footer').value = evento.color_texto_footer || '#ffffff';
    document.getElementById('color_titulo_h3').value = evento.color_titulo_h3 || '#2c1a0e';  // ← NUEVO
    document.getElementById('activo').checked = evento.activo;
    document.getElementById('formTitle').innerText = `Editando: ${evento.nombre}`;
}

async function guardarBasicos() {
    const data = {
        slug: document.getElementById('slug').value.trim(),
        nombre: document.getElementById('nombre').value.trim(),
        descripcion: document.getElementById('descripcion').value,
        fecha_inicio: document.getElementById('fecha_inicio').value,
        fecha_fin: document.getElementById('fecha_fin').value,
        provincia: document.getElementById('provincia').value,
        ubicacion: document.getElementById('ubicacion').value,
        imagen_portada: document.getElementById('imagen_portada').value,
        horario_imagen: document.getElementById('horario_imagen').value,
        mapa_embed: document.getElementById('mapa_embed').value,
        color_primario: document.getElementById('color_primario').value,
        color_secundario: document.getElementById('color_secundario').value,
        color_fondo: document.getElementById('color_fondo').value,
        color_titulo_seccion: document.getElementById('color_titulo_seccion').value,
        color_texto: document.getElementById('color_texto').value,
        color_menu_fondo: document.getElementById('color_menu_fondo').value,
        color_menu_texto: document.getElementById('color_menu_texto').value,
        color_menu_fondo_hover: document.getElementById('color_menu_fondo_hover').value || null,
        color_menu_texto_hover: document.getElementById('color_menu_texto_hover').value || null,
        color_hero_overlay: document.getElementById('color_hero_overlay').value,
        tipo_venta: document.getElementById('tipo_venta').value,
        url_venta_online: document.getElementById('url_venta_online').value || null,
        color_titulo_hero: document.getElementById('color_titulo_hero').value,
        color_descripcion_hero: document.getElementById('color_descripcion_hero').value,
        color_fondo_fechas: document.getElementById('color_fondo_fechas').value,
        color_texto_fechas: document.getElementById('color_texto_fechas').value,
        // Nuevos campos
        color_fondo_contacto: document.getElementById('color_fondo_contacto').value,
        color_texto_contacto: document.getElementById('color_texto_contacto').value,
        color_enlace_contacto: document.getElementById('color_enlace_contacto').value,
        color_fondo_footer: document.getElementById('color_fondo_footer').value,
        color_texto_footer: document.getElementById('color_texto_footer').value,
        color_titulo_h3: document.getElementById('color_titulo_h3').value,  // ← NUEVO
        activo: document.getElementById('activo').checked
    };
    if (!data.slug || !data.nombre) {
        mostrarMensaje('Slug y Nombre son obligatorios', 'error');
        return;
    }
    try {
        let result;
        if (eventoId) {
            result = await fetchAPI(`/api/admin/eventos/${eventoId}`, { method: 'PUT', body: JSON.stringify(data) });
            mostrarMensaje('Evento actualizado correctamente', 'success');
        } else {
            result = await fetchAPI('/api/admin/eventos', { method: 'POST', body: JSON.stringify(data) });
            eventoId = result.id;
            mostrarMensaje('Evento creado correctamente', 'success');
            window.history.pushState({}, '', `evento-form.html?id=${eventoId}`);
            document.getElementById('formTitle').innerText = `Editando: ${result.nombre}`;
            cargarPrecios();
            cargarActividades();
            cargarExpositores();
            cargarGaleria();
        }
    } catch (err) {
        mostrarMensaje('Error al guardar el evento', 'error');
    }
}

// ==================== PRECIOS ====================
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
            <td>${new Date(p.fecha).toLocaleDateString()}</td>
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

// ==================== ACTIVIDADES ====================
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
        tbody.innerHTML = '<td><td colspan="7">No hay actividades registradas.</td></tr>';
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

// ==================== EXPOSITORES ====================
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
function cerrarModalExpositor() { document.getElementById('modalExpositor').style.display = 'none'; }
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
    const tbody = document.getElementById('tbodyExpositores');
    if (expositores.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7">No hay expositores registrados.</td></tr>';
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

// ==================== GALERÍA ====================
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

// ==================== INICIALIZACIÓN Y PESTAÑAS ====================
function configurarTabs() {
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const tabId = btn.dataset.tab;
            document.querySelectorAll('.tab-pane').forEach(pane => pane.classList.remove('active'));
            document.getElementById(tabId).classList.add('active');
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            if (tabId === 'precios') cargarPrecios();
            if (tabId === 'actividades') cargarActividades();
            if (tabId === 'expositores') cargarExpositores();
            if (tabId === 'galeria') cargarGaleria();
        });
    });
}

document.getElementById('guardarBasicos').addEventListener('click', guardarBasicos);
document.getElementById('btnAgregarPrecio').addEventListener('click', () => abrirModalPrecio());
document.getElementById('guardarPrecioBtn').addEventListener('click', guardarPrecioModal);
document.getElementById('cancelarPrecioBtn').addEventListener('click', cerrarModalPrecio);
document.getElementById('btnAgregarActividad').addEventListener('click', () => abrirModalActividad());
document.getElementById('guardarActividadBtn').addEventListener('click', guardarActividadModal);
document.getElementById('cancelarActividadBtn').addEventListener('click', cerrarModalActividad);
document.getElementById('btnAgregarExpositor').addEventListener('click', () => abrirModalExpositor());
document.getElementById('guardarExpositorBtn').addEventListener('click', guardarExpositorModal);
document.getElementById('cancelarExpositorBtn').addEventListener('click', cerrarModalExpositor);
document.getElementById('btnAgregarImagen').addEventListener('click', () => abrirModalGaleria());
document.getElementById('guardarGaleriaBtn').addEventListener('click', guardarGaleriaModal);
document.getElementById('cancelarGaleriaBtn').addEventListener('click', cerrarModalGaleria);

if (eventoId) {
    cargarDatosEvento();
    cargarPrecios();
    cargarActividades();
    cargarExpositores();
    cargarGaleria();
}
configurarTabs();