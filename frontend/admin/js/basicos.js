// admin-eventos-basicos.js
async function cargarDatosEvento() {
    if (!eventoId) return;
    const evento = await fetchAPI(`/api/admin/eventos/${eventoId}`);
    document.getElementById('slug').value = evento.slug;
    document.getElementById('nombre').value = evento.nombre;
    document.getElementById('descripcion').value = evento.descripcion || '';
    document.getElementById('fecha_inicio').value = evento.fecha_inicio?.slice(0, 10) || '';
    document.getElementById('fecha_fin').value = evento.fecha_fin?.slice(0, 10) || '';
    document.getElementById('provincia').value = evento.provincia || '';
    document.getElementById('ubicacion').value = evento.ubicacion || '';
    document.getElementById('imagen_portada').value = evento.imagen_portada || '';
    document.getElementById('horario_imagen').value = evento.horario_imagen || '';
    document.getElementById('mapa_embed').value = evento.mapa_embed || '';
    document.getElementById('mapa_waze_embed').value = evento.mapa_waze_embed || '';
    document.getElementById('color_primario').value = evento.color_primario || '#c8102e';
    document.getElementById('color_secundario').value = evento.color_secundario || '#0033a0';
    document.getElementById('color_titulo_seccion').value = evento.color_titulo_seccion || '#2c1a0e';
    document.getElementById('color_fondo').value = evento.color_fondo || '#f4e4c1';
    document.getElementById('color_texto').value = evento.color_texto || '#2c1a0e';
    document.getElementById('color_descripcion_texto').value = evento.color_descripcion_texto || '#2c1a0e';
    document.getElementById('color_menu_fondo').value = evento.color_menu_fondo || '#ffffff';
    document.getElementById('color_menu_texto').value = evento.color_menu_texto || '#ffffff';
    document.getElementById('color_menu_fondo_hover').value = evento.color_menu_fondo_hover || '#000000';
    document.getElementById('color_menu_texto_hover').value = evento.color_menu_texto_hover || '#000000';
    document.getElementById('color_hero_overlay').value = evento.color_hero_overlay || 'rgba(0,0,0,0.4)';
    document.getElementById('tipo_venta').value = evento.tipo_venta || 'taquilla';
    document.getElementById('url_venta_online').value = evento.url_venta_online || '';
    document.getElementById('color_titulo_hero').value = evento.color_titulo_hero || '#FFFFFF';
    document.getElementById('color_descripcion_hero').value = evento.color_descripcion_hero || '#FFFFFF';
    document.getElementById('color_fondo_fechas').value = evento.color_fondo_fechas || '#d4a373';
    document.getElementById('color_texto_fechas').value = evento.color_texto_fechas || '#8b5a2b';
    document.getElementById('color_fondo_share').value = evento.color_fondo_share || '#ffffff';
    document.getElementById('color_texto_share').value = evento.color_texto_share || '#2c1a0e';
    document.getElementById('color_fondo_contacto').value = evento.color_fondo_contacto || '#f4e4c1';
    document.getElementById('color_texto_contacto').value = evento.color_texto_contacto || '#2c1a0e';
    document.getElementById('color_enlace_contacto').value = evento.color_enlace_contacto || '#8b5a2b';
    document.getElementById('color_fondo_footer').value = evento.color_fondo_footer || '#8b5a2b';
    document.getElementById('color_texto_footer').value = evento.color_texto_footer || '#ffffff';
    document.getElementById('color_titulo_h3').value = evento.color_titulo_h3 || '#2c1a0e';
    document.getElementById('color_buscador_expositores').value = evento.color_buscador_expositores || '#ffffff';
    document.getElementById('color_borde_buscador_expositores').value = evento.color_borde_buscador_expositores || '#eeeeee';
    document.getElementById('color_card_fondo').value = evento.color_card_fondo || '#ffffff';
    document.getElementById('color_card_borde').value = evento.color_card_borde || '#f0f0f0';
    document.getElementById('color_rubro_fondo').value = evento.color_rubro_fondo || '#f0f0f0';
    document.getElementById('color_rubro_texto').value = evento.color_rubro_texto || '#000000';
    document.getElementById('color_buscador_fondo').value = evento.color_buscador_fondo || '#ffffff';
    document.getElementById('color_buscador_borde').value = evento.color_buscador_borde || '#eeeeee';
    document.getElementById('color_btn_ver_mas').value = evento.color_btn_ver_mas || '#C8102E';
    document.getElementById('activo').checked = (evento.activo === 1);
    const tieneExpositoresVal = (evento.tiene_expositores != null) ? evento.tiene_expositores : 1;
    document.getElementById('tiene_expositores').value = tieneExpositoresVal;
    
    document.getElementById('formTitle').innerText = `Editando: ${evento.nombre}`;

    // Sincronizar visibilidad inicial
    toggleUrlVentaOnline();
    toggleExpositoresTab();

    // Actualizar badge de estado
    actualizarBadgeEstado(evento.activo);
}

function actualizarBadgeEstado(activo) {
    const badge = document.getElementById('badgeEstadoEvento');
    if (!badge) return;
    if (activo) {
        badge.textContent = '🟢 Publicado';
        badge.className = 'badge-estado badge-publicado';
    } else {
        badge.textContent = '🔴 No publicado';
        badge.className = 'badge-estado badge-borrador';
    }
}

function construirData(activoValue) {
    return {
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
        mapa_waze_embed: document.getElementById('mapa_waze_embed').value,
        color_primario: document.getElementById('color_primario').value,
        color_secundario: document.getElementById('color_secundario').value,
        color_fondo: document.getElementById('color_fondo').value,
        color_titulo_seccion: document.getElementById('color_titulo_seccion').value,
        color_texto: document.getElementById('color_texto').value,
        color_descripcion_texto: document.getElementById('color_descripcion_texto').value,
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
        color_fondo_share: document.getElementById('color_fondo_share').value,
        color_texto_share: document.getElementById('color_texto_share').value,
        color_fondo_contacto: document.getElementById('color_fondo_contacto').value,
        color_texto_contacto: document.getElementById('color_texto_contacto').value,
        color_enlace_contacto: document.getElementById('color_enlace_contacto').value,
        color_fondo_footer: document.getElementById('color_fondo_footer').value,
        color_texto_footer: document.getElementById('color_texto_footer').value,
        color_titulo_h3: document.getElementById('color_titulo_h3').value,
        color_buscador_expositores: document.getElementById('color_buscador_expositores').value,
        color_borde_buscador_expositores: document.getElementById('color_borde_buscador_expositores').value,
        color_card_fondo: document.getElementById('color_card_fondo').value,
        color_card_borde: document.getElementById('color_card_borde').value,
        color_rubro_fondo: document.getElementById('color_rubro_fondo').value,
        color_rubro_texto: document.getElementById('color_rubro_texto').value,
        color_buscador_fondo: document.getElementById('color_buscador_fondo').value,
        color_buscador_borde: document.getElementById('color_buscador_borde').value,
        color_btn_ver_mas: document.getElementById('color_btn_ver_mas').value,
        tiene_expositores: parseInt(document.getElementById('tiene_expositores').value) || 0,
        activo: activoValue
    };
}

// Guardar en borrador (activo: false) — para vista previa
async function guardarBasicos() {
    const data = construirData(false);
    if (!data.slug || !data.nombre) {
        mostrarMensaje('Slug y Nombre son obligatorios', 'error');
        return;
    }
    try {
        let result;
        if (eventoId) {
            result = await fetchAPI(`/api/admin/eventos/${eventoId}`, { method: 'PUT', body: JSON.stringify(data) });
            mostrarMensaje('Vista previa guardada. El evento sigue inactivo.', 'success');
        } else {
            result = await fetchAPI('/api/admin/eventos', { method: 'POST', body: JSON.stringify(data) });
            eventoId = result.id;
            mostrarMensaje('Evento creado en borrador. Revisa la vista previa y luego publícalo.', 'success');
            window.history.pushState({}, '', `evento-form.html?id=${eventoId}`);
            document.getElementById('formTitle').innerText = `Editando: ${result.nombre}`;
            if (typeof cargarPrecios === 'function') cargarPrecios();
            if (typeof cargarActividades === 'function') cargarActividades();
            if (typeof cargarExpositores === 'function') cargarExpositores();
            if (typeof cargarGaleria === 'function') cargarGaleria();
        }
        actualizarBadgeEstado(false);
        return true;
    } catch (err) {
        mostrarMensaje('Error al guardar el evento', 'error');
        return false;
    }
}

// Publicar evento (activo: true) — con confirmación
async function publicarEvento() {
    if (!eventoId) {
        mostrarMensaje('Primero guarda la vista previa antes de publicar.', 'error');
        return;
    }
    // Mostrar modal de confirmación
    document.getElementById('modalConfirmarPublicar').style.display = 'flex';
}

async function confirmarPublicar() {
    document.getElementById('modalConfirmarPublicar').style.display = 'none';
    const data = construirData(true);
    try {
        await fetchAPI(`/api/admin/eventos/${eventoId}`, { method: 'PUT', body: JSON.stringify(data) });
        actualizarBadgeEstado(true);
        document.getElementById('activo').checked = true;
        mostrarMensaje('✅ ¡Evento publicado correctamente! Ya es visible al público.', 'success');
    } catch (err) {
        mostrarMensaje('Error al publicar el evento', 'error');
    }
}

function toggleUrlVentaOnline() {
    const tipo = document.getElementById('tipo_venta').value;
    const group = document.getElementById('urlVentaGroup');
    if (group) {
        group.style.display = (tipo === 'online' || tipo === 'ambos') ? 'block' : 'none';
    }
}

function toggleExpositoresTab() {
    const tiene = document.getElementById('tiene_expositores').value;
    const btn = document.querySelector('.tab-btn[data-tab="expositores"]');
    const content = document.getElementById('content-expositores');
    
    if (tiene == "1") {
        if (btn) btn.style.setProperty('display', 'inline-flex', 'important');
        if (content) content.style.setProperty('display', 'block', 'important');
    } else {
        if (btn) btn.style.setProperty('display', 'none', 'important');
        if (content) content.style.setProperty('display', 'none', 'important');
    }
}

// Event Listeners para visibilidad
document.getElementById('tipo_venta').addEventListener('change', toggleUrlVentaOnline);
document.getElementById('tiene_expositores').addEventListener('change', toggleExpositoresTab);

// Ejecutar visibilidad inicial
toggleUrlVentaOnline();
toggleExpositoresTab();