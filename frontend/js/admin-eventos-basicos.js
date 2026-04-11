// admin-eventos-basicos.js
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
    document.getElementById('color_fondo_contacto').value = evento.color_fondo_contacto || '#f4e4c1';
    document.getElementById('color_texto_contacto').value = evento.color_texto_contacto || '#2c1a0e';
    document.getElementById('color_enlace_contacto').value = evento.color_enlace_contacto || '#8b5a2b';
    document.getElementById('color_fondo_footer').value = evento.color_fondo_footer || '#8b5a2b';
    document.getElementById('color_texto_footer').value = evento.color_texto_footer || '#ffffff';
    document.getElementById('color_titulo_h3').value = evento.color_titulo_h3 || '#2c1a0e';
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
        color_fondo_contacto: document.getElementById('color_fondo_contacto').value,
        color_texto_contacto: document.getElementById('color_texto_contacto').value,
        color_enlace_contacto: document.getElementById('color_enlace_contacto').value,
        color_fondo_footer: document.getElementById('color_fondo_footer').value,
        color_texto_footer: document.getElementById('color_texto_footer').value,
        color_titulo_h3: document.getElementById('color_titulo_h3').value,
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
            if (typeof cargarPrecios === 'function') cargarPrecios();
            if (typeof cargarActividades === 'function') cargarActividades();
            if (typeof cargarExpositores === 'function') cargarExpositores();
            if (typeof cargarGaleria === 'function') cargarGaleria();
        }
    } catch (err) {
        mostrarMensaje('Error al guardar el evento', 'error');
    }
}