/**
 * crearEventoMain.js
 * Clase principal para gestionar la creación de eventos
 */

import { bindUpload } from './uploadManager.js';
import {
  togglePreview, programarActualizacion, guardarDatosPreview, getIframe, getSlug,
  actualizarUrlBar
} from './previewManager.js';
import {
  abrirModalPrecio, cerrarModalPrecio, agregarPrecioDelModal,
  abrirModalActividad, cerrarModalActividad, agregarActividadDelModal, addActividadImageRow, editarActividad,
  abrirModalExpositor, cerrarModalExpositor, agregarExpositorDelModal, editarExpositor,
  abrirModalImagen, cerrarModalImagen, agregarImagenDelModal, editarImagen,
  editarPrecio, registrarOnModalConfirmado
} from './modalsManager.js';

export class CrearEvento {
  constructor() {
    this.verificarAutenticacion();
    
    const params = new URLSearchParams(window.location.search);
    this.eventoId = params.get('id') || null;

    this.tabBtns = document.querySelectorAll('.tab-btn');
    this.tabContents = document.querySelectorAll('.tab-content');
    this.mensajeDiv = document.getElementById('mensaje-estado');

    this.init();
    this.initUploads();
    this.initPreviewListeners();

    // Detectar modo edición
    this.eventoEstado = null;
    this.formDirty = false; // true solo si el usuario tocó algo en el formulario
    if (this.eventoId) {
      this.cargarEventoParaEdicion(this.eventoId);
    }
  }

getUsuarioStorage() {
  let uAdmin = JSON.parse(localStorage.getItem('user') || 'null');
  let uNormal = JSON.parse(localStorage.getItem('usuario') || 'null');
  if (window.location.pathname.includes('/admin/')) {
    return uAdmin || uNormal;
  }
  return uNormal || uAdmin;
}

verificarAutenticacion() {
  const usuario = this.getUsuarioStorage();
  if (!usuario) {
    alert('Debes iniciar sesión para poder acceder.');
    window.location.href = '/index.html';
  }
}

  async cargarEventoParaEdicion(id) {
  try {
    const token = localStorage.getItem('token');
    const usuario = this.getUsuarioStorage() || {};
    const esAdmin = usuario.rol === 'admin';
    const endpoint = esAdmin ? `/api/admin/eventos/${id}` : `/api/eventos/mi-evento/${id}`;
    const res = await fetch(endpoint, { headers: { 'Authorization': `Bearer ${token}` } });

    if (res.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('usuario');
      localStorage.removeItem('user');
      alert('Tu sesión expiró. Por favor inicia sesión nuevamente.');
      window.location.href = '/index.html';
      return;
    }
    if (res.status === 404) {
      this.mostrarMensaje('❌ Evento no encontrado o no tienes permiso para editarlo.', 'error');
      return;
    }
    if (!res.ok) {
      this.mostrarMensaje('❌ Error al cargar el evento. Intenta de nuevo.', 'error');
      return;
    }

    const data = await res.json();
    const evento = data.evento || data;
    if (!evento) return;
    this.eventoEstado = evento.estado;


    const camposBasicos = [
      'slug', 'nombre', 'descripcion', 'fecha_inicio', 'fecha_fin',
      'ubicacion', 'provincia', 'imagen_portada', 'horario_imagen',
      'mapa_embed', 'mapa_waze_embed', 'tipo_venta', 'url_venta_online',
      'color_primario', 'color_secundario', 'color_fondo', 'color_texto',
      'color_hero_overlay', 'color_titulo_seccion',
      'color_titulo_hero', 'color_descripcion_hero', 'color_fondo_fechas', 'color_texto_fechas',
      'color_menu_fondo', 'color_menu_texto', 'color_menu_fondo_hover', 'color_menu_texto_hover',
      'color_titulo_h3',
      'color_fondo_contacto', 'color_texto_contacto', 'color_enlace_contacto',
      'color_fondo_footer', 'color_texto_footer', 'tiene_expositores'
    ];

    camposBasicos.forEach(k => {
      const el = document.getElementById(k);
      if (el && evento[k] !== undefined && evento[k] !== null) {
        let value = evento[k];
        // Formatear fechas para input type="date"
        if ((k === 'fecha_inicio' || k === 'fecha_fin') && typeof value === 'string') {
          value = value.slice(0, 10);
        }
        el.value = value;
      }
    });

    if (evento.activo !== undefined && evento.activo !== null) {
      const checkActivo = document.getElementById('activo');
      if (checkActivo) checkActivo.checked = Boolean(evento.activo);
    }

    // Poblar precios
    if (data.precios && data.precios.length > 0) {
      const tbody = document.getElementById('precios-rows');
      if (tbody) {
        tbody.innerHTML = '';
        data.precios.forEach(p => {
          const tr = document.createElement('tr');
          tr.innerHTML = `
              <td><input type="date" class="precio-fecha" value="${p.fecha ? p.fecha.slice(0, 10) : ''}"></td>
              <td><input type="number" class="precio-monto" value="${p.precio_normal || 0}"></td>
              <td><input type="text" class="precio-promocion" value="${p.promocion || ''}"></td>
              <td><input type="text" class="precio-descripcion" value="${p.descripcion_promocion || ''}"></td>
              <td>
                <div class="acciones-tabla"><button type="button" class="btn-warning btn-editar" title="Editar"><i class="fas fa-pen"></i></button><button type="button" class="btn-danger btn-eliminar" title="Eliminar"><i class="fas fa-trash"></i></button></div>
              </td>
            `;
          tr.querySelector('.btn-eliminar').addEventListener('click', () => tr.remove());
          tr.querySelector('.btn-editar').addEventListener('click', () => editarPrecio(tr));
          tbody.appendChild(tr);
        });
      }
    }

    // Poblar actividades
    if (data.actividades && data.actividades.length > 0) {
      const tbody = document.getElementById('actividades-rows');
      if (tbody) {
        tbody.innerHTML = '';
        data.actividades.forEach(a => {
          let imagenes = [];
          if (a.imagen) {
            try { imagenes = JSON.parse(a.imagen); } catch (e) { imagenes = [a.imagen]; }
          }

          const tr = document.createElement('tr');
          tr.innerHTML = `
              <td><input type="text" class="act-titulo" value="${a.titulo || ''}"></td>
              <td><input type="text" class="act-tipo" value="${a.tipo || ''}"></td>
              <td><input type="date" class="act-fecha" value="${a.fecha ? a.fecha.slice(0, 10) : ''}"></td>
              <td><input type="time" class="act-hora" value="${a.hora ? a.hora.slice(0, 5) : ''}"></td>
              <td><input type="text" class="act-lugar" value="${a.lugar || ''}"></td>
              <td>
                <div style="max-width:150px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;" title="${(a.descripcion || '').replace(/"/g, '&quot;')}">
                  ${a.descripcion || '<span style="color:#ccc;">-</span>'}
                </div>
              </td>
              <td style="text-align:center;font-size:18px;">
                <span class="act-gratis" data-value="${a.es_gratis ? 'true' : 'false'}">${a.es_gratis ? '✅' : '❌'}</span>
              </td>
              <td>
                <div class="acciones-tabla"><button type="button" class="btn-warning btn-editar" title="Editar"><i class="fas fa-pen"></i></button><button type="button" class="btn-danger btn-eliminar" title="Eliminar"><i class="fas fa-trash"></i></button></div>
              </td>
              <td style="display:none;"><input type="text" class="act-descripcion" value="${a.descripcion || ''}"></td>
              <td style="display:none;"><input type="text" class="act-imagenes" value='${JSON.stringify(imagenes)}'></td>
              <td style="display:none;"><span class="act-requiere-online" data-value="${a.requiere_entrada_online ? 'true' : 'false'}"></span></td>
              <td style="display:none;"><input type="text" class="act-enlace" value="${a.enlace_venta || ''}"></td>
            `;
          tr.querySelector('.btn-eliminar').addEventListener('click', () => tr.remove());
          tr.querySelector('.btn-editar').addEventListener('click', () => editarActividad(tr));
          tbody.appendChild(tr);
        });
      }
    }

    // Poblar expositores
    if (data.expositores && data.expositores.length > 0) {
      const tbody = document.getElementById('expositores-rows');
      if (tbody) {
        tbody.innerHTML = '';
        data.expositores.forEach(e => {
          const tr = document.createElement('tr');

          let imagenes = [];
          try {
            const rawLogo = e.imagen_logo || e.logo;
            if (rawLogo && rawLogo.startsWith('[')) imagenes = JSON.parse(rawLogo);
            else if (rawLogo) imagenes = [rawLogo];
          } catch (err) { }

          const numImg = imagenes.length;
          const imgBadge = numImg > 0 ? `<span class="badge" style="background:#27ae60; color:white; padding:2px 6px; border-radius:4px; font-size:11px;">${numImg} img</span>` : '<span style="color:#ccc;">-</span>';
          const videoBadge = e.video_url ? `<span class="badge" style="background:#3498db; color:white; padding:2px 6px; border-radius:4px; font-size:11px;">SÍ</span>` : '<span style="color:#ccc;">-</span>';

          tr.innerHTML = `
              <td><input type="text" class="exp-nombre" value="${e.nombre || ''}"></td>
              <td><input type="text" class="exp-rubro" value="${e.rubro || ''}"></td>
              <td><input type="text" class="exp-ubicacion" value="${e.ubicacion || ''}"></td>
              <td style="text-align:center;">${imgBadge}</td>
              <td style="text-align:center;">${videoBadge}</td>
              <td>
                <div class="acciones-tabla"><button type="button" class="btn-warning btn-editar" title="Editar"><i class="fas fa-pen"></i></button><button type="button" class="btn-danger btn-eliminar" title="Eliminar"><i class="fas fa-trash"></i></button></div>
              </td>
              <td style="display:none;"><input type="text" class="exp-descripcion" value="${e.descripcion || ''}"></td>
              <td style="display:none;"><input type="text" class="exp-imagenes" value='${JSON.stringify(imagenes)}'></td>
              <td style="display:none;"><input type="text" class="exp-video" value="${e.video_url || ''}"></td>
            `;
          tr.querySelector('.btn-eliminar').addEventListener('click', () => tr.remove());
          tr.querySelector('.btn-editar').addEventListener('click', () => editarExpositor(tr));
          tbody.appendChild(tr);
        });
      }
    }

    // Poblar galería
    if (data.galeria && data.galeria.length > 0) {
      const tbody = document.getElementById('galeria-rows');
      if (tbody) {
        tbody.innerHTML = '';
        data.galeria.forEach(g => {
          const tr = document.createElement('tr');
          tr.innerHTML = `
              <td><img src="${g.imagen_url}" style="width:64px;height:48px;object-fit:cover;border-radius:6px;border:1px solid #eee;" onerror="this.style.display='none'"></td>
              <td><input type="text" class="gal-url" value="${g.imagen_url}"></td>
              <td><input type="number" class="gal-orden" value="${g.orden || 0}"></td>
              <td>
                <div class="acciones-tabla"><button type="button" class="btn-warning btn-editar" title="Editar"><i class="fas fa-pen"></i></button><button type="button" class="btn-danger btn-eliminar" title="Eliminar"><i class="fas fa-trash"></i></button></div>
              </td>
            `;
          tr.querySelector('.btn-eliminar').addEventListener('click', () => tr.remove());
          tr.querySelector('.btn-editar').addEventListener('click', () => editarImagen(tr));
          tbody.appendChild(tr);
        });
      }
    }

    programarActualizacion();

    // El DOM ya está completamente poblado aquí (las tablas se llenaron sincrónicamente)
    // Activar el watcher de cambios DESPUÉS de cargar para que no se marque dirty al cargar
    this.formDirty = false;
    this._iniciarWatcherCambios();

    if (evento.estado === 'aprobado') {
      this.mostrarMensaje('📝 Editando evento aprobado. Los cambios serán revisados por un admin antes de publicarse.', 'info');
    }
    if (evento.estado === 'edicion_pendiente') {
      this.mostrarMensaje('⏳ Tienes cambios en revisión. Puedes actualizarlos y volver a enviar.', 'info');
    }
  } catch (err) {
    console.error('Error cargando evento para edición', err);
  }
}

init() {
  this.tabBtns.forEach((btn, i) => btn.addEventListener('click', () => this.cambiarTab(i)));
  document.querySelectorAll('.tab-next-btn').forEach(b => b.addEventListener('click', e => { e.preventDefault(); this.irSiguienteTab(); }));
  document.querySelectorAll('.tab-prev-btn').forEach(b => b.addEventListener('click', e => { e.preventDefault(); this.irTabAnterior(); }));

  const esAdminStr = window.location.pathname.includes('/admin/') ? true : false;
  document.getElementById('btn-volver-crear')?.addEventListener('click', () => { window.location.href = esAdminStr ? '/admin/dashboard.html' : '/mi-cuenta.html'; });

  if (esAdminStr && this.eventoId) {
    const btnEliminar = document.getElementById('btnEliminarEvento');
    if (btnEliminar) {
      btnEliminar.style.display = 'inline-flex';
      btnEliminar.addEventListener('click', async () => {
        if (confirm('¿Estás seguro de que deseas eliminar este evento permanentemente? Esta acción no se puede deshacer.')) {
          try {
            btnEliminar.innerHTML = '<span class="spinner" style="width:14px;height:14px;border-width:2px;margin:0;"></span>';
            const token = localStorage.getItem('token');
            const res = await fetch(`/api/admin/eventos/${this.eventoId}`, {
              method: 'DELETE',
              headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!res.ok) throw new Error('Error al eliminar evento');
            alert('Evento eliminado correctamente');
            window.location.href = '/admin/dashboard.html';
          } catch (err) {
            console.error(err);
            alert('Error al eliminar evento. Revisa la consola.');
            btnEliminar.innerHTML = '<i class="fas fa-trash"></i> Eliminar Evento';
          }
        }
      });
    }
  }

  document.getElementById('btnTogglePreview')?.addEventListener('click', togglePreview);
  document.getElementById('btnReloadPreview')?.addEventListener('click', () => {
    if (window.previewDataKey) {
      const dataKey = guardarDatosPreview();
      const iframe = getIframe();
      iframe.src = `/evento.html?preview=1&dataKey=${dataKey}`;
    }
  });

  getIframe()?.addEventListener('load', () => { setTimeout(programarActualizacion, 150); });

  // Toggle de visibilidad de sección expositores
  const tieneExpEl = document.getElementById('tiene_expositores');
  const contentExp = document.getElementById('content-expositores');
  if (tieneExpEl && contentExp) {
    const act = () => { contentExp.style.display = tieneExpEl.value === '1' ? 'block' : 'none'; };
    tieneExpEl.addEventListener('change', act);
    act(); // Ejecutar al inicio por si venimos de edición
  }

  document.getElementById('btn-preview-portada')?.addEventListener('click', () => {
    this.simularPortada();
  });
  document.getElementById('btn-cerrar-preview-portada')?.addEventListener('click', () => {
    document.getElementById('modal-preview-portada').style.display = 'none';
  });

  document.getElementById('btn-agregar-precio')?.addEventListener('click', abrirModalPrecio);
  document.getElementById('btn-agregar-actividad')?.addEventListener('click', abrirModalActividad);
  document.getElementById('btn-agregar-expositor')?.addEventListener('click', abrirModalExpositor);
  document.getElementById('btn-agregar-imagen')?.addEventListener('click', abrirModalImagen);

  document.getElementById('actividad-requiere-online')?.addEventListener('change', function () {
    document.getElementById('actividad-enlace-group').style.display = this.checked ? 'block' : 'none';
  });

  this.actualizarBotonSubmit();
  const btnSubmit = document.getElementById('btn-confirmar-cambios') || document.getElementById('btn-enviar-revision');
  btnSubmit?.addEventListener('click', () => this.handleSubmit());
  document.getElementById('slug')?.addEventListener('input', actualizarUrlBar);
}

actualizarBotonSubmit() {
  const btn = document.getElementById('btn-confirmar-cambios') || document.getElementById('btn-enviar-revision');
  if (btn) {
    if (this.eventoId) {
      btn.innerHTML = '<i class="fas fa-check"></i> Confirmar cambios';
    } else {
      btn.innerHTML = '<i class="fas fa-paper-plane"></i> Enviar a Revisión';
    }
  }
}

/**
 * Activa listeners en todos los campos del formulario para detectar cambios reales.
 * Se llama DESPUÉS de que el formulario se llena con los datos cargados.
 * Solo marca el flag cuando el USUARIO interactúa (no cuando se llena programáticamente).
 */
_iniciarWatcherCambios() {
  const marcarDirty = () => { this.formDirty = true; };

  // Adjuntar a todos los inputs/selects/textareas del formulario
  // IMPORTANTE: el id del form es "form-crear-evento" (con guión al inicio)
  document.querySelectorAll(
    '#form-crear-evento input, #form-crear-evento select, #form-crear-evento textarea'
  ).forEach(el => {
    // Solo escuchar eventos de USUARIO (no los disparados programáticamente al cargar)
    el.addEventListener('input', marcarDirty);
    el.addEventListener('change', marcarDirty);
  });

  // Observar SOLO adición/eliminación de filas en las tablas dinámicas
  // (Cuando se agrega una fila nueva desde el modal)
  const tablas = ['#precios-rows', '#actividades-rows', '#expositores-rows', '#galeria-rows'];
  tablas.forEach(selector => {
    const el = document.querySelector(selector);
    if (!el) return;
    const obs = new MutationObserver(marcarDirty);
    obs.observe(el, { childList: true }); // solo filas añadidas/eliminadas
  });

  // Detectar cuando el usuario CONFIRMA una edición en cualquier modal
  // (tanto agregar nuevo como editar fila existente)
  registrarOnModalConfirmado(marcarDirty);
}

initPreviewListeners() {
  const camposWatch = [
    'nombre', 'descripcion', 'fecha_inicio', 'fecha_fin', 'ubicacion', 'provincia',
    'imagen_portada', 'horario_imagen', 'mapa_embed', 'mapa_waze_embed', 'tipo_venta', 'url_venta_online',
    'color_primario', 'color_secundario', 'color_fondo', 'color_texto',
    'color_hero_overlay', 'color_titulo_seccion',
    'color_titulo_hero', 'color_descripcion_hero', 'color_fondo_fechas', 'color_texto_fechas',
    'color_menu_fondo', 'color_menu_texto', 'color_menu_fondo_hover', 'color_menu_texto_hover',
    'color_titulo_h3',
    'color_fondo_contacto', 'color_texto_contacto', 'color_enlace_contacto',
    'color_fondo_footer', 'color_texto_footer', 'tiene_expositores'
  ];
  camposWatch.forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener('input', () => {
        console.log(`[Event] Input changed: ${id} = ${el.value}`);
        programarActualizacion();
      });
      el.addEventListener('change', () => {
        console.log(`[Event] Change event: ${id} = ${el.value}`);
        programarActualizacion();
      });
    }
  });

  const tipoVentaEl = document.getElementById('tipo_venta');
  if (tipoVentaEl) {
    tipoVentaEl.addEventListener('change', () => {
      const valor = tipoVentaEl.value;
      const urlGroup = document.getElementById('urlVentaGroup');
      if (urlGroup) {
        urlGroup.style.display = (valor === 'online' || valor === 'ambos') ? 'block' : 'none';
      }
      programarActualizacion();
    });
  }

  this.initTableObservers();
}

initTableObservers() {
  const tables = ['precios-rows', 'actividades-rows', 'expositores-rows', 'galeria-rows'];
  tables.forEach(tableId => {
    const table = document.getElementById(tableId);
    if (table) {
      const observer = new MutationObserver(() => {
        programarActualizacion();
      });
      observer.observe(table, { childList: true, subtree: true });
    }
  });
}

initUploads() {
  bindUpload('btn-subir-portada', 'archivo-portada', 'imagen_portada', 'feedback-portada', () => {
    programarActualizacion();
  });

  bindUpload('btn-subir-horario', 'archivo-horario', 'horario_imagen', 'feedback-horario', () => {
    programarActualizacion();
  });

  document.getElementById('btnAgregarImagenActividad')?.addEventListener('click', () => addActividadImageRow(''));
  document.getElementById('btn-subir-actividad-multi')?.addEventListener('click', async () => {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*';
    fileInput.style.display = 'none';
    document.body.appendChild(fileInput);
    fileInput.addEventListener('change', async (e) => {
      const f = e.target.files[0]; if (!f) { fileInput.remove(); return; }
      const { subirImagen } = await import('./uploadManager.js');
      const url = await subirImagen(f, 'feedback-actividad-img', null);
      if (url) addActividadImageRow(url);
      fileInput.remove();
    });
    fileInput.click();
  });

  document.getElementById('btnAgregarImagenExpositor')?.addEventListener('click', () => {
    import('./modalsManager.js').then(m => m.addExpositorImageRow(''));
  });
  document.getElementById('btn-subir-expositor-multi')?.addEventListener('click', async () => {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*';
    fileInput.style.display = 'none';
    document.body.appendChild(fileInput);
    fileInput.addEventListener('change', async (e) => {
      const f = e.target.files[0]; if (!f) { fileInput.remove(); return; }
      const { subirImagen } = await import('./uploadManager.js');
      const url = await subirImagen(f, 'feedback-expositor-img', null);
      if (url) {
        const { addExpositorImageRow } = await import('./modalsManager.js');
        addExpositorImageRow(url);
      }
      fileInput.remove();
    });
    fileInput.click();
  });

  bindUpload('btn-subir-galeria', 'archivo-imagen-galeria', 'imagen-url', 'feedback-galeria', (url) => {
    const img = document.getElementById('preview-galeria-img');
    const wrap = document.getElementById('preview-galeria-img-wrap');
    if (img && wrap) { img.src = url; wrap.style.display = 'block'; }
  });

  document.getElementById('imagen-url')?.addEventListener('input', (e) => {
    const url = e.target.value.trim();
    const img = document.getElementById('preview-galeria-img');
    const wrap = document.getElementById('preview-galeria-img-wrap');
    if (img && wrap) {
      if (url) { img.src = url; wrap.style.display = 'block'; }
      else { wrap.style.display = 'none'; }
    }
  });
}

cambiarTab(index) {
  this.tabBtns.forEach((b, i) => b.classList.toggle('active', i === index));
  this.tabContents.forEach((c, i) => c.classList.toggle('active', i === index));
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

irSiguienteTab() {
  const cur = Array.from(this.tabContents).indexOf(document.querySelector('.tab-content.active'));
  // Removida validación obligatoria para permitir navegación libre entre pestañas
  if (cur < this.tabContents.length - 1) this.cambiarTab(cur + 1);
}

irTabAnterior() {
  const cur = Array.from(this.tabContents).indexOf(document.querySelector('.tab-content.active'));
  if (cur > 0) this.cambiarTab(cur - 1);
}

validarTabActual() {
  const activeTab = document.querySelector('.tab-content.active');
  if (!activeTab) return true;
  for (const input of activeTab.querySelectorAll('input[required], select[required]')) {
    if (!input.value.trim()) return false;
  }
  return true;
}

simularPortada() {
  const nombre = document.getElementById('nombre').value || 'Nombre del Evento';
  const ubicacion = document.getElementById('ubicacion').value || 'Ubicación';
  const fecha_inicio = document.getElementById('fecha_inicio').value || new Date().toISOString().split('T')[0];
  const fecha_fin = document.getElementById('fecha_fin').value || new Date().toISOString().split('T')[0];
  let imagen_portada = document.getElementById('imagen_portada').value || '/assets/images/default-feria.jpg';
  if (imagen_portada && !imagen_portada.startsWith('http') && !imagen_portada.startsWith('/')) {
    imagen_portada = '/' + imagen_portada;
  }

  // Colores para la tarjeta (Hardcoded site defaults for Index cards to match brand)
  const cp = '#C8102E'; // Red primary
  const cs = '#0033A0'; // Blue secondary

  const formatDate = (dateStr) => {
    const d = new Date(dateStr + 'T12:00:00');
    return d.toLocaleDateString();
  };

  const buildCard = (isLive) => {
    const liveBadge = isLive ? `<div class="live-badge">🔴 EN VIVO</div>` : '';
    return `
        <div class="evento-card" style="--color-primary: ${cp}; --color-secondary: ${cs}; width: 250px; text-align: left;">
          ${liveBadge}
          <img src="${imagen_portada}" alt="${nombre}">
          <h3>${nombre}</h3>
          <p>${formatDate(fecha_inicio)} - ${formatDate(fecha_fin)}</p>
          <p>${ubicacion}</p>
          <a href="#" class="btn-ver" onclick="return false;">Ver más</a>
        </div>
      `;
  };

  document.getElementById('card-simulada-proximo').innerHTML = buildCard(false);
  document.getElementById('card-simulada-hoy').innerHTML = buildCard(false);
  document.getElementById('card-simulada-vivo').innerHTML = buildCard(true);

  document.getElementById('modal-preview-portada').style.display = 'flex';
}

  async handleSubmit() {
  const btn = document.getElementById('btn-confirmar-cambios') || document.getElementById('btn-enviar-revision');

  const slug = document.getElementById('slug')?.value.trim();
  const nombre = document.getElementById('nombre')?.value.trim();
  const fechaInicio = document.getElementById('fecha_inicio')?.value;
  const fechaFin = document.getElementById('fecha_fin')?.value;
  const ubicacion = document.getElementById('ubicacion')?.value.trim();
  const provincia = document.getElementById('provincia')?.value;

  if (!slug || !nombre || !fechaInicio || !fechaFin || !ubicacion || !provincia) {
    this.mostrarMensaje('⚠️ Completa todos los campos obligatorios en "Datos Básicos"', 'error');
    this.cambiarTab(0);
    return;
  }

  if (new Date(fechaFin) < new Date(fechaInicio)) {
    this.mostrarMensaje('⚠️ La fecha de finalización no puede ser anterior a la de inicio', 'error');
    this.cambiarTab(0);
    return;
  }

  const get = (id) => (document.getElementById(id)?.value || '').trim();

  const datosBasicos = {
    slug, nombre,
    descripcion: get('descripcion') || '',
    fecha_inicio: fechaInicio,
    fecha_fin: fechaFin,
    ubicacion, provincia,
    imagen_portada: get('imagen_portada') || null,
    horario_imagen: get('horario_imagen') || null,
    mapa_embed: get('mapa_embed') || null,
    mapa_waze_embed: get('mapa_waze_embed') || null,
    tipo_venta: get('tipo_venta') || 'taquilla',
    url_venta_online: get('url_venta_online') || null,
    color_primario: get('color_primario') || '#8b5a2b',
    color_secundario: get('color_secundario') || '#d4a373',
    color_fondo: get('color_fondo') || '#f4e4c1',
    color_texto: get('color_texto') || '#2c1a0e',
    color_hero_overlay: get('color_hero_overlay') || 'rgba(62,42,31,0.7)',
    color_titulo_seccion: get('color_titulo_seccion') || '#2c1a0e',
    color_titulo_hero: get('color_titulo_hero') || '#ffffff',
    color_descripcion_hero: get('color_descripcion_hero') || '#ffffff',
    color_fondo_fechas: get('color_fondo_fechas') || '#d4a373',
    color_texto_fechas: get('color_texto_fechas') || '#8b5a2b',
    color_menu_fondo: get('color_menu_fondo') || '#ffffff',
    color_menu_texto: get('color_menu_texto') || '#ffffff',
    color_menu_fondo_hover: get('color_menu_fondo_hover') || '',
    color_menu_texto_hover: get('color_menu_texto_hover') || '',
    color_titulo_h3: get('color_titulo_h3') || '#2c1a0e',
    color_fondo_contacto: get('color_fondo_contacto') || '#f4e4c1',
    color_texto_contacto: get('color_texto_contacto') || '#2c1a0e',
    color_enlace_contacto: get('color_enlace_contacto') || '#8b5a2b',
    color_fondo_footer: get('color_fondo_footer') || '#8b5a2b',
    color_texto_footer: get('color_texto_footer') || '#ffffff',
    tiene_expositores: parseInt(get('tiene_expositores') || '1'),
    activo: document.getElementById('activo')?.checked ? 1 : 0
  };

  const recolectarTabla = (selector, campos) => {
    return Array.from(document.querySelectorAll(selector)).map(row => {
      const obj = {};
      Object.entries(campos).forEach(([key, sel]) => {
        const el = row.querySelector(sel);
        if (!el) return;
        if (key === 'precio_normal' || key === 'orden') obj[key] = parseInt(el.value) || 0;
        else if (key === 'imagen') {
          try { obj[key] = JSON.parse(el.value || '[]'); } catch (e) { obj[key] = []; }
        } else if (key === 'es_gratis' || key === 'requiere_entrada_online') {
          obj[key] = el.dataset?.value === 'true' ? 1 : 0;
        } else obj[key] = el.value || '';
      });
      return obj;
    });
  };

  const precios = recolectarTabla('#precios-rows tr', {
    fecha: '.precio-fecha',
    precio_normal: '.precio-monto',
    promocion: '.precio-promocion',
    descripcion_promocion: '.precio-descripcion'
  }).filter(p => p.fecha);

  const actividades = recolectarTabla('#actividades-rows tr', {
    titulo: '.act-titulo',
    tipo: '.act-tipo',
    fecha: '.act-fecha',
    hora: '.act-hora',
    lugar: '.act-lugar',
    descripcion: '.act-descripcion',
    imagen: '.act-imagenes',
    es_gratis: '.act-gratis',
    requiere_entrada_online: '.act-requiere-online',
    enlace_venta: '.act-enlace'
  }).filter(a => a.titulo);

  const expositores = recolectarTabla('#expositores-rows tr', {
    nombre: '.exp-nombre',
    rubro: '.exp-rubro',
    ubicacion: '.exp-ubicacion',
    descripcion: '.exp-descripcion',
    logo: '.exp-imagenes',
    video: '.exp-video'
  }).filter(e => e.nombre);

  const galeria = recolectarTabla('#galeria-rows tr', {
    imagen_url: '.gal-url',
    orden: '.gal-orden'
  }).filter(g => g.imagen_url);

  if (btn) { btn.innerHTML = '<span class="uploading-spinner"></span> Enviando…'; btn.disabled = true; }

  try {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('No hay sesión activa. Por favor inicia sesión.');

    // ── Verificar si hubo cambios (aplica a CUALQUIER rol cuando edita un evento aprobado) ──
    if (this.eventoId && this.eventoEstado) {
      const esAprobadoOEnRevision = ['aprobado', 'edicion_pendiente'].includes(this.eventoEstado);
      if (esAprobadoOEnRevision && !this.formDirty) {
        if (btn) { this.actualizarBotonSubmit(); btn.disabled = false; }
        this.mostrarMensaje('ℹ️ No has hecho ningún cambio. Modifica algún campo antes de enviar a revisión.', 'info');
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
    }

    const usuario = this.getUsuarioStorage() || {};
    const esAdmin = usuario.rol === 'admin';

    // Determinar si aunque el usuario sea admin, el evento pertenece a la sesión de usuario normal
    // (detectado porque venimos de mi-cuenta.html donde solo el usuario puede editar sus propios eventos)
    const uNormal = JSON.parse(localStorage.getItem('usuario') || 'null');
    const esEdicionUsuario = this.eventoId && uNormal && uNormal.rol !== 'admin';

    let response;
    if (esAdmin && !esEdicionUsuario) {
      if (this.eventoId) {
        response = await fetch(`/api/admin/eventos/${this.eventoId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify({ ...datosBasicos, precios, actividades, expositores, galeria })
        });
      } else {
        response = await fetch('/api/admin/eventos', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify({ ...datosBasicos, precios, actividades, expositores, galeria })
        });
      }
    } else {
      if (this.eventoId) {
        // Bloquear si el estado no se cargó
        if (!this.eventoEstado) {
          if (btn) { this.actualizarBotonSubmit(); btn.disabled = false; }
          this.mostrarMensaje('❌ No se pudo cargar el estado del evento. Recarga la página e intenta de nuevo.', 'error');
          return;
        }
        response = await fetch(`/api/eventos/${this.eventoId}/editar-aprobado`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify({ ...datosBasicos, precios, actividades, expositores, galeria })
        });
      } else {
        response = await fetch('/api/eventos/crear', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify({ ...datosBasicos, precios, actividades, expositores, galeria })
        });
      }
    }

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || `Error del servidor (${response.status})`);
    }

    this.mostrarModalExito(data.message);

  } catch (error) {
    console.error('Error al enviar evento:', error);
    this.mostrarMensaje('❌ ' + error.message, 'error');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  } finally {
    if (btn) {
      this.actualizarBotonSubmit();
      btn.disabled = false;
    }
  }
}

mostrarModalExito(mensaje) {
  const esAdmin = this.getUsuarioStorage()?.rol === 'admin';
  if (esAdmin) {
    this.mostrarMensaje('Datos guardados correctamente', 'success');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    return;
  }
  const modal = document.getElementById('modal-exito');
  if (modal) {
    const msgEl = modal.querySelector('.modal-mensaje');
    if (msgEl) {
      msgEl.innerHTML = mensaje || 'Tu evento ha sido enviado correctamente a revisión.<br>Nuestro equipo lo revisará en un plazo de <strong>24 a 72 horas</strong>.';
    }
    modal.style.display = 'flex';
    document.getElementById('btn-ir-cuenta')?.addEventListener('click', () => {
      window.location.href = '/mi-cuenta.html';
    });
  }
}

mostrarMensaje(texto, tipo) {
  if (!this.mensajeDiv) return;
  this.mensajeDiv.textContent = texto;
  this.mensajeDiv.className = `mensaje-estado ${tipo}`;
  this.mensajeDiv.style.display = 'block';
  if (tipo !== 'error') {
    setTimeout(() => { this.mensajeDiv.style.display = 'none'; }, 8000);
  }
}
}

