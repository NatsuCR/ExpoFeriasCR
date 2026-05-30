import {
  crearFilaPrecio, crearFilaActividad, crearFilaExpositor, addGalleryRow
} from './modalsManager.js';

export async function cargarEventoParaEdicion(id, context) {
  try {
    const token = localStorage.getItem('token');
    const usuario = context.getUsuarioStorage() || {};
    const esAdmin = usuario.rol === 'admin';
    const endpoint = esAdmin ? `/api/admin/eventos/${id}` : `/api/eventos/mi-evento/${id}`;
    const res = await fetch(endpoint, { headers: { 'Authorization': `Bearer ${token}` } });

    if (res.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('usuario');
      alert('Tu sesión expiró. Por favor inicia sesión nuevamente.');
      window.location.href = '/index.html';
      return;
    }
    if (res.status === 404) {
      context.mostrarMensaje('❌ Evento no encontrado o no tienes permiso para editarlo.', 'error');
      return;
    }
    if (!res.ok) {
      context.mostrarMensaje('❌ Error al cargar el evento. Intenta de nuevo.', 'error');
      return;
    }

    const data = await res.json();
    const evento = data.evento || data;
    if (!evento) return;
    context.eventoEstado = evento.estado;

    const camposBasicos = [
      'slug', 'nombre', 'descripcion', 'fecha_inicio', 'fecha_fin',
      'ubicacion', 'provincia', 'canton', 'distrito', 'tipo_evento', 'imagen_portada', 'horario_imagen',
      'mapa_embed', 'mapa_waze_embed', 'tipo_venta', 'url_venta_online', 'activo',
      'color_primario', 'color_secundario', 'color_fondo', 'color_texto', 'color_iconos', 'color_descripcion_texto',
      'color_hero_overlay', 'color_titulo_seccion',
      'color_titulo_hero', 'color_descripcion_hero', 'color_fondo_fechas', 'color_texto_fechas',
      'color_menu_fondo', 'color_menu_texto', 'color_menu_fondo_hover', 'color_menu_texto_hover',
      'color_titulo_h3',
      'color_fondo_contacto', 'color_texto_contacto', 'color_enlace_contacto',
      'color_fondo_footer', 'color_texto_footer',
      'color_fondo_share', 'color_texto_share',
      'color_buscador_expositores', 'color_borde_buscador_expositores',
      'tiene_expositores', 'activo'
    ];

    camposBasicos.forEach(k => {
      const el = document.getElementById(k);
      let value = evento[k];
      if (value === undefined && data.shareConfig && data.shareConfig[k] !== undefined) value = data.shareConfig[k];
      if (el && value !== undefined && value !== null) {
        if ((k === 'fecha_inicio' || k === 'fecha_fin') && typeof value === 'string') value = value.slice(0, 10);

        // Manejo especial para combos dependientes de ubicación
        if (k === 'provincia') {
          el.value = value;
          el.dispatchEvent(new Event('change'));
        } else if (k === 'canton') {
          setTimeout(() => {
            el.value = value;
            el.dispatchEvent(new Event('change'));
          }, 150);
        } else if (k === 'distrito') {
          setTimeout(() => {
            el.value = value;
            el.dispatchEvent(new Event('change'));
          }, 350);

        } else {
          if (el.type === 'checkbox') {
            el.checked = !!value;
          } else {
            el.value = value;
          }
        }
      }
    });

    context.actualizarTodosLosSliders();
    context.syncVisibility();

    // Poblar tablas
    poblarTablas(data, context);

    import('./previewManager.js').then(m => m.programarActualizacion());

    if (evento.estado === 'aprobado') {
      context.mostrarMensaje('📝 Editando evento aprobado. Los cambios serán revisados por un admin.', 'info');
    }
    if (evento.estado === 'edicion_pendiente') {
      context.mostrarMensaje('⏳ Tienes cambios en revisión.', 'info');
    }
  } catch (err) {
    console.error('Error cargando evento para edición', err);
  }
}

function poblarTablas(data, context) {
  // Precios
  if (data.precios) {
    const tbody = document.getElementById('precios-rows');
    if (tbody) {
      tbody.innerHTML = '';
      data.precios.forEach(p => {
        crearFilaPrecio(p.fecha ? p.fecha.slice(0, 10) : '', p.precio_normal || 0, p.promocion || '', p.descripcion_promocion || '');
      });
    }
  }

  // Actividades
  if (data.actividades) {
    const tbody = document.getElementById('actividades-rows');
    if (tbody) {
      tbody.innerHTML = '';
      data.actividades.forEach(a => {
        let imagenes = [];
        try {
          if (typeof a.imagen === 'string') {
            if (a.imagen.startsWith('[')) imagenes = JSON.parse(a.imagen);
            else imagenes = a.imagen.split(',').map(s => s.trim()).filter(Boolean);
          } else if (Array.isArray(a.imagen)) {
            imagenes = a.imagen;
          }
        } catch (e) { imagenes = a.imagen ? [a.imagen] : []; }

        crearFilaActividad(
          a.titulo || '', a.tipo || '', a.fecha ? a.fecha.slice(0, 10) : '',
          a.hora || '', a.lugar || '', a.es_gratis == 1 || a.es_gratis === true || a.es_gratis === 'true', a.descripcion || '',
          imagenes, a.requiere_entrada_online == 1 || a.requiere_entrada_online === true || a.requiere_entrada_online === 'true', a.enlace_venta || '', a.solo_online == 1 || a.solo_online === true || a.solo_online === 'true', a.video_url || '', a.en_vivo == 1 || a.en_vivo === true || a.en_vivo === 'true' || a.enVivo == 1 || a.enVivo === true || a.enVivo === 'true'
        );
      });
    }
  }

  // Expositores
  if (data.expositores) {
    const tbody = document.getElementById('expositores-rows');
    if (tbody) {
      tbody.innerHTML = '';
      data.expositores.forEach(e => {
        let imagenes = [];
        const val = e.imagen_logo || e.logo || e.imagenes;
        try {
          if (typeof val === 'string') {
            if (val.startsWith('[')) imagenes = JSON.parse(val);
            else if (val) imagenes = val.split(',').map(s => s.trim()).filter(Boolean);
          } else if (Array.isArray(val)) {
            imagenes = val;
          }
        } catch (ex) { imagenes = val ? [val] : []; }

        crearFilaExpositor(
          e.nombre || '', e.tipo_expositor || e.rubro || '', e.ubicacion || '',
          e.descripcion || '', JSON.stringify(imagenes), e.video_url || e.video || ''
        );
      });
    }
  }

  // Galería
  if (data.galeria) {
    const tbody = document.getElementById('galeria-rows');
    if (tbody) {
      tbody.innerHTML = '';
      data.galeria.forEach(g => {
        addGalleryRow(g.imagen_url || '', g.orden || 0);
      });
    }
  }
}

export async function handleSubmit(context) {
  const btn = document.getElementById('btn-confirmar-cambios') || document.getElementById('btn-enviar-revision');
  const slug = (document.getElementById('slug')?.value || '').trim();
  const nombre = (document.getElementById('nombre')?.value || '').trim();
  const fechaInicio = document.getElementById('fecha_inicio')?.value;
  const fechaFin = document.getElementById('fecha_fin')?.value;
  const ubicacion = (document.getElementById('ubicacion')?.value || '').trim();
  const provincia = document.getElementById('provincia')?.value;
  const tipoEvento = document.getElementById('tipo_evento')?.value;

  if (!slug || !nombre || !fechaInicio || !fechaFin || !ubicacion || !provincia || !tipoEvento) {
    context.mostrarMensaje('⚠️ Completa los campos obligatorios (incluyendo Tipo de Evento)', 'error');
    context.cambiarTab(0);
    return;
  }

  const get = (id) => (document.getElementById(id)?.value || '').trim();
  const formData = {
    slug, nombre, descripcion: get('descripcion'), fecha_inicio: fechaInicio, fecha_fin: fechaFin,
    ubicacion, provincia, canton: get('canton'), distrito: get('distrito'), tipo_evento: tipoEvento,
    imagen_portada: get('imagen_portada'), horario_imagen: get('horario_imagen'), mapa_embed: get('mapa_embed'), mapa_waze_embed: get('mapa_waze_embed'),
    tipo_venta: get('tipo_venta'), url_venta_online: get('url_venta_online'), color_primario: get('color_primario'), color_secundario: get('color_secundario'),
    color_fondo: get('color_fondo'), color_texto: get('color_texto'), color_descripcion_texto: get('color_descripcion_texto'), color_hero_overlay: get('color_hero_overlay'),
    color_titulo_seccion: get('color_titulo_seccion'), color_titulo_hero: get('color_titulo_hero'), color_descripcion_hero: get('color_descripcion_hero'),
    color_fondo_fechas: get('color_fondo_fechas'), color_texto_fechas: get('color_texto_fechas'), color_menu_fondo: get('color_menu_fondo'), color_menu_texto: get('color_menu_texto'),
    color_menu_fondo_hover: get('color_menu_fondo_hover'), color_menu_texto_hover: get('color_menu_texto_hover'), color_titulo_h3: get('color_titulo_h3'),
    color_fondo_contacto: get('color_fondo_contacto'), color_texto_contacto: get('color_texto_contacto'), color_enlace_contacto: get('color_enlace_contacto'),
    color_fondo_footer: get('color_fondo_footer'), color_texto_footer: get('color_texto_footer'), color_fondo_share: get('color_fondo_share'), color_texto_share: get('color_texto_share'),
    color_iconos: get('color_iconos'),
    color_buscador_expositores: get('color_buscador_expositores'), color_borde_buscador_expositores: get('color_borde_buscador_expositores'),
    activo: document.getElementById('activo')?.checked ? 1 : 0,
    tiene_expositores: parseInt(document.getElementById('tiene_expositores')?.value) || 0,
    precios: recolectarTabla('#precios-rows tr', { fecha: '.precio-fecha', precio_normal: '.precio-monto', promocion: '.precio-promocion', descripcion_promocion: '.precio-descripcion' }).filter(p => p.fecha),
    actividades: recolectarTabla('#actividades-rows tr', { titulo: '.act-titulo', tipo: '.act-tipo', fecha: '.act-fecha', hora: '.act-hora', lugar: '.act-lugar', descripcion: '.act-descripcion', imagen: '.act-imagenes', video_url: '.act-video', es_gratis: '.act-gratis', requiere_entrada_online: '.act-requiere-online', solo_online: '.act-solo-online', en_vivo: '.act-en-vivo', enlace_venta: '.act-enlace' }).filter(a => a.titulo),
    expositores: recolectarTabla('#expositores-rows tr', { nombre: '.exp-nombre', rubro: '.exp-rubro', ubicacion: '.exp-ubicacion', descripcion: '.exp-descripcion', logo: '.exp-imagenes', video: '.exp-video' }).filter(e => e.nombre),
    galeria: recolectarTabla('#galeria-rows tr', { imagen_url: '.gal-url' }).filter(g => g.imagen_url)
  };

  if (btn) { btn.innerHTML = 'Enviando...'; btn.disabled = true; }
  try {
    const token = localStorage.getItem('token');
    const usuario = context.getUsuarioStorage() || {};
    const esAdmin = usuario.rol === 'admin';
    const uNormal = JSON.parse(localStorage.getItem('usuario') || 'null');
    const esEdicionUsuario = context.eventoId && uNormal && uNormal.rol !== 'admin';

    let response;
    if (esAdmin && !esEdicionUsuario) {
      response = await fetch(context.eventoId ? `/api/admin/eventos/${context.eventoId}` : '/api/admin/eventos', {
        method: context.eventoId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(formData)
      });
    } else {
      response = await fetch(context.eventoId ? `/api/eventos/${context.eventoId}/editar-aprobado` : '/api/eventos/crear', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(formData)
      });
    }

    const data = await response.json();
    if (!response.ok) throw new Error(data.error || `Error ${response.status}`);

    if (esAdmin) {
      context.mostrarMensaje(context.eventoId ? '✅ Guardado exitoso' : '✅ Creado correctamente', 'success');
      if (!context.eventoId && data.id) {
        // Si era nuevo, redirigir a edición para que no se duplique al re-enviar
        setTimeout(() => {
          const url = new URL(window.location.href);
          url.searchParams.set('id', data.id);
          window.location.href = url.toString();
        }, 1500);
      }
    } else {
      context.mostrarModalExito(data.message);
    }
  } catch (error) {
    context.mostrarMensaje('❌ ' + error.message, 'error');
  } finally {
    if (btn) { context.actualizarBotonSubmit(); btn.disabled = false; }
  }
}

export async function eliminarEvento(id, context) {
  if (!confirm('¿Estás seguro de que deseas eliminar este evento? Esta acción no se puede deshacer.')) {
    return;
  }

  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`/api/admin/eventos/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (response.ok) {
      alert('Evento eliminado correctamente');
      window.location.href = '/admin/dashboard.html';
    } else {
      const data = await response.json();
      throw new Error(data.error || 'Error al eliminar');
    }
  } catch (error) {
    alert('❌ ' + error.message);
  }
}

function recolectarTabla(selector, campos) {
  return Array.from(document.querySelectorAll(selector)).map(row => {
    const obj = {};
    Object.entries(campos).forEach(([key, sel]) => {
      const el = row.querySelector(sel);
      if (!el) return;
      if (key === 'precio_normal' || key === 'orden') {
        const rawVal = (el.value || '').trim();
        const cleanVal = rawVal.replace(/[^\d.]/g, '');
        obj[key] = parseFloat(cleanVal) || 0;
      }
      else if (key === 'imagen' || key === 'logo') {
        let val = (el.value || '').trim();
        if (!val) {
          obj[key] = [];
        } else if (val.startsWith('[')) {
          try {
            const parsed = JSON.parse(val);
            obj[key] = Array.isArray(parsed) ? parsed.filter(Boolean) : [val];
          } catch (e) {
            // Limpieza manual si el JSON es inválido
            const cleaned = val.replace(/^\[/, '').replace(/\]$/, '');
            obj[key] = cleaned.split(',')
              .map(s => s.trim().replace(/^["']/, '').replace(/["']$/, '').trim())
              .filter(Boolean);
          }
        } else {
          obj[key] = val.split(',').map(s => s.trim().replace(/^["']/, '').replace(/["']$/, '').trim()).filter(Boolean);
        }
      } else if (key === 'es_gratis' || key === 'requiere_entrada_online' || key === 'solo_online' || key === 'en_vivo') {
        obj[key] = el.dataset?.value === 'true' ? 1 : 0;
      } else obj[key] = el.value || '';
    });
    return obj;
  });
}



