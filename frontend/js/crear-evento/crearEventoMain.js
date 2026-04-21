/**
 * crearEventoMain.js
 * Clase principal para gestionar la creación de eventos
 */

// Interceptor global para renovación de tokens
(function () {
  const originalFetch = window.fetch;
  window.fetch = async function (...args) {
    const response = await originalFetch(...args);
    const newToken = response.headers.get('X-New-Token');
    if (newToken) {
      localStorage.setItem('token', newToken);
    }
    return response;
  };
})();

import { bindUpload } from './uploadManager.js?v=6.0';
import {
  togglePreview, programarActualizacion, guardarDatosPreview, getIframe, getSlug,
  actualizarUrlBar
} from './previewManager.js?v=6.0';
import {
  abrirModalPrecio, cerrarModalPrecio, agregarPrecioDelModal,
  abrirModalActividad, cerrarModalActividad, agregarActividadDelModal, addActividadImageRow, editarActividad,
  abrirModalExpositor, cerrarModalExpositor, agregarExpositorDelModal, editarExpositor,
  abrirModalImagen, cerrarModalImagen, agregarImagenDelModal, editarImagen, addGalleryRow,
  editarPrecio, registrarOnModalConfirmado, duplicarUltimoPrecio
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
    this.initOpacitySliders(); // Control de opacidad simplificado
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
    let uAdmin = JSON.parse(localStorage.getItem('usuario') || 'null');
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
        'color_primario', 'color_secundario', 'color_fondo', 'color_texto', 'color_descripcion_texto',
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

        // Si no está en 'evento', probar en 'data.shareConfig' (nueva tabla)
        if (value === undefined && data.shareConfig && data.shareConfig[k] !== undefined) {
          value = data.shareConfig[k];
        }

        if (el && value !== undefined && value !== null) {
          // Formatear fechas para input type="date"
          if ((k === 'fecha_inicio' || k === 'fecha_fin') && typeof value === 'string') {
            value = value.slice(0, 10);
          }
          el.value = value;
        }
      });

      // Sincronizar sliders de opacidad
      this.actualizarTodosLosSliders();

      // CORRECCIÓN: Mostrar u ocultar el campo de URL de entradas según el modo cargado
      const tipoVenta = document.getElementById('tipo_venta')?.value;
      const urlGroup = document.getElementById('urlVentaGroup');
      if (urlGroup && (tipoVenta === 'online' || tipoVenta === 'ambos')) {
        urlGroup.style.display = 'block';
      } else {
        urlGroup.style.display = 'none';
      }

      if (evento.activo !== undefined && evento.activo !== null) {
        const checkActivo = document.getElementById('activo');
        if (checkActivo) checkActivo.checked = Boolean(evento.activo);
      }

      // Sincronizar visibilidad de todo el formulario al finalizar la carga
      this.syncVisibility();

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
              if (Array.isArray(a.imagen)) {
                imagenes = a.imagen;
              } else {
                try { 
                  imagenes = JSON.parse(a.imagen); 
                } catch (e) { 
                  imagenes = [a.imagen]; 
                }
              }
            }
            // Limpieza y normalización de rutas
            imagenes = (Array.isArray(imagenes) ? imagenes : [imagenes])
              .filter(u => u && u !== 'null' && typeof u === 'string');

            const tr = document.createElement('tr');
            tr.innerHTML = `
        <td><input type="text" value="${a.titulo || ''}" class="act-titulo"></td>
        <td><input type="text" value="${a.tipo || ''}"   class="act-tipo"></td>
        <td><input type="date" value="${a.fecha ? a.fecha.slice(0, 10) : ''}"  class="act-fecha"></td>
        <td><input type="time" value="${a.hora ? a.hora.slice(0, 5) : ''}"   class="act-hora"></td>
        <td><input type="text" value="${a.lugar || ''}"  class="act-lugar"></td>
        <td><div style="max-width:200px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;" title="${a.descripcion || ''}">${a.descripcion || '-'}</div></td>
        <td style="text-align:center;font-size:18px;">
            <span class="act-gratis" data-value="${a.es_gratis ? 'true' : 'false'}">${a.es_gratis ? '✅' : '❌'}</span>
        </td>
        <td>
          <div class="acciones-tabla">
            <button type="button" class="btn-warning btn-editar" title="Editar"><i class="fas fa-pen"></i></button>
            <button type="button" class="btn-danger btn-eliminar" title="Eliminar"><i class="fas fa-trash"></i></button>
          </div>
        </td>
        <td style="display:none;"><input type="text" value="${a.descripcion || ''}" class="act-descripcion"></td>
        <td style="display:none;"><input type="text" value='${JSON.stringify(imagenes)}' class="act-imagenes"></td>
        <td style="display:none;"><span class="act-requiere-online" data-value="${a.requiere_entrada_online ? 'true' : 'false'}"></span></td>
        <td style="display:none;"><input type="text" value="${a.enlace_venta || ''}" class="act-enlace"></td>
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
            let rawLogo = e.imagen_logo || e.logo;
            if (rawLogo) {
              if (Array.isArray(rawLogo)) {
                imagenes = rawLogo;
              } else {
                try {
                  if (typeof rawLogo === 'string' && rawLogo.startsWith('[')) {
                    imagenes = JSON.parse(rawLogo);
                  } else {
                    imagenes = [rawLogo];
                  }
                } catch (err) {
                  imagenes = [rawLogo];
                }
              }
            }
            // Limpieza y normalización
            imagenes = (Array.isArray(imagenes) ? imagenes : [imagenes])
              .filter(u => u && u !== 'null' && typeof u === 'string');

            const numImg = imagenes.length;
            const imgBadge = numImg > 0 ? `<span class="badge" style="background:#27ae60; color:white; padding:2px 6px; border-radius:4px; font-size:11px;">${numImg} img</span>` : '<span style="color:#ccc;">-</span>';
            const videoBadge = (e.video_url || e.video) ? `<span class="badge" style="background:#3498db; color:white; padding:2px 6px; border-radius:4px; font-size:11px;">SÍ</span>` : '<span style="color:#ccc;">-</span>';

            tr.innerHTML = `
        <td><input type="text" value="${e.nombre || ''}"   class="exp-nombre"></td>
        <td><input type="text" value="${e.tipo_expositor || e.rubro || ''}"    class="exp-rubro"></td>
        <td><input type="text" value="${e.ubicacion || ''}"class="exp-ubicacion"></td>
        <td><div style="max-width:180px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;" title="${e.descripcion || ''}">${e.descripcion || '-'}</div></td>
        <td style="text-align:center;">${imgBadge}</td>
        <td style="text-align:center;">${videoBadge}</td>
        <td>
          <div class="acciones-tabla">
            <button type="button" class="btn-warning btn-editar" title="Editar"><i class="fas fa-pen"></i></button>
            <button type="button" class="btn-danger btn-eliminar" title="Eliminar"><i class="fas fa-trash"></i></button>
          </div>
        </td>
        <td style="display:none;"><input type="text" value="${e.descripcion || ''}" class="exp-descripcion"></td>
        <td style="display:none;"><input type="text" value='${JSON.stringify(imagenes)}' class="exp-imagenes"></td>
        <td style="display:none;"><input type="text" value="${e.video_url || e.video || ''}" class="exp-video"></td>
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
    const esAdminPath = window.location.pathname.includes('/admin/');

    this.tabBtns.forEach((btn, i) => btn.addEventListener('click', () => this.cambiarTab(i)));
    document.querySelectorAll('.tab-next-btn').forEach(b => b.addEventListener('click', e => { e.preventDefault(); this.irSiguienteTab(); }));
    document.querySelectorAll('.tab-prev-btn').forEach(b => b.addEventListener('click', e => { e.preventDefault(); this.irTabAnterior(); }));

    // Botón Volver (Navbar)
    const btnVolver = document.getElementById('btn-volver-crear');
    if (btnVolver) {
      btnVolver.addEventListener('click', (e) => {
        e.preventDefault();
        console.log('[CrearEvento] Volviendo... esAdmin:', esAdminPath);
        window.location.href = esAdminPath ? '/admin/dashboard.html' : '/mi-cuenta.html';
      });
    }

    if (esAdminPath && this.eventoId) {
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

    document.getElementById('btn-preview-portada')?.addEventListener('click', () => {
      this.simularPortada();
    });
    document.getElementById('btn-cerrar-preview-portada')?.addEventListener('click', () => {
      document.getElementById('modal-preview-portada').style.display = 'none';
    });

    document.getElementById('btn-agregar-precio')?.addEventListener('click', () => {
      const tipoVenta = document.getElementById('tipo_venta')?.value;
      if (tipoVenta === 'gratis') {
        window.mostrarAlertaPremium(
          'Entrada Gratuita',
          'El Tipo de Venta de Entradas es "Entrada Gratuita". Para agregar precios, por favor cambia el tipo de venta en la pestaña "Datos básicos".',
          'Entendido',
          'fas fa-ticket-alt'
        );
        return;
      }
      abrirModalPrecio();
    });

    document.getElementById('btn-duplicar-precio')?.addEventListener('click', () => {
      const tipoVenta = document.getElementById('tipo_venta')?.value;
      if (tipoVenta === 'gratis') {
        window.mostrarAlertaPremium(
          'Entrada Gratuita',
          'El Tipo de Venta de Entradas es "Entrada Gratuita". No se pueden duplicar precios en un evento gratuito.',
          'Entendido',
          'fas fa-copy'
        );
        return;
      }
      duplicarUltimoPrecio();
    });
    document.getElementById('btn-agregar-actividad')?.addEventListener('click', abrirModalActividad);
    document.getElementById('btn-agregar-expositor')?.addEventListener('click', abrirModalExpositor);
    document.getElementById('btn-agregar-imagen')?.addEventListener('click', abrirModalImagen);

    // Device Toggles en Vista Final
    document.querySelectorAll('.device-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.device-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const device = btn.dataset.device;
        const previewWrap = document.getElementById('integratedPreview');
        if (previewWrap) {
          previewWrap.className = 'integrated-preview ' + device;
        }
      });
    });

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
      const user = JSON.parse(localStorage.getItem('usuario') || '{}');
      const isAdmin = user.rol === 'admin';

      if (this.eventoId) {
        // Modo Edición
        btn.innerHTML = isAdmin
          ? '<i class="fas fa-save"></i> Guardar Cambios'
          : '<i class="fas fa-check"></i> Confirmar cambios';
      } else {
        // Modo Creación
        btn.innerHTML = isAdmin
          ? '<i class="fas fa-plus-circle"></i> Crear Evento'
          : '<i class="fas fa-paper-plane"></i> Enviar a Revisión';
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
      'color_primario', 'color_secundario', 'color_fondo', 'color_texto', 'color_descripcion_texto',
      'color_hero_overlay', 'color_titulo_seccion',
      'color_titulo_hero', 'color_descripcion_hero', 'color_fondo_fechas', 'color_texto_fechas',
      'color_menu_fondo', 'color_menu_texto', 'color_menu_fondo_hover', 'color_menu_texto_hover',
      'color_titulo_h3',
      'color_fondo_contacto', 'color_texto_contacto', 'color_enlace_contacto',
      'color_fondo_footer', 'color_texto_footer',
      'color_fondo_share', 'color_texto_share',
      'color_buscador_expositores', 'color_borde_buscador_expositores',
      'tiene_expositores'
    ];
    camposWatch.forEach(id => {
      const el = document.getElementById(id);
      if (el) {
        el.addEventListener('input', () => {
          console.log(`[Event] Input changed: ${id} = ${el.value}`);
          this.formDirty = true;
          programarActualizacion();
        });
        el.addEventListener('change', () => {
          console.log(`[Event] Change event: ${id} = ${el.value}`);
          this.formDirty = true;
          programarActualizacion();
        });
      }
    });

    const tipoVentaEl = document.getElementById('tipo_venta');
    if (tipoVentaEl) {
      tipoVentaEl.addEventListener('change', () => {
        this.syncVisibility();
        this.formDirty = true;
        programarActualizacion();
      });
    }

    const tieneExpositoresEl = document.getElementById('tiene_expositores');
    if (tieneExpositoresEl) {
      tieneExpositoresEl.addEventListener('change', () => {
        this.syncVisibility();
        this.formDirty = true;
        programarActualizacion();
      });
    }

    // Inicializar visibilidad
    this.syncVisibility();

    this.initTableObservers();
  }

  /**
   * Sincroniza la visibilidad de secciones dinámicas (Expositores, URL de Venta, etc.)
   * basada en los valores actuales de los selectores.
   */
  syncVisibility() {
    console.log('[Visibility] Sincronizando secciones...');
    
    // 1. Tipo de Venta / URL Online
    const tipoVentaEl = document.getElementById('tipo_venta');
    const urlGroup = document.getElementById('urlVentaGroup');
    if (tipoVentaEl && urlGroup) {
      const valor = tipoVentaEl.value;
      urlGroup.style.display = (valor === 'online' || valor === 'ambos') ? 'block' : 'none';
    }

    // 2. Expositores
    const tieneExpositoresEl = document.getElementById('tiene_expositores');
    const contentExpositores = document.getElementById('content-expositores');
    if (tieneExpositoresEl && contentExpositores) {
      const valor = tieneExpositoresEl.value;
      console.log(`[Visibility] Expositores value: ${valor}`);
      // Forzar visibilidad. Usamos !important si es necesario mediante JS.
      if (valor === '1') {
        contentExpositores.setAttribute('style', 'display: block !important');
      } else {
        contentExpositores.setAttribute('style', 'display: none !important');
      }
    }
  }

  initTableObservers() {
    const tables = ['precios-rows', 'actividades-rows', 'expositores-rows', 'galeria-rows'];
    tables.forEach(tableId => {
      const table = document.getElementById(tableId);
      if (table) {
        const observer = new MutationObserver(() => {
          this.formDirty = true;
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
      fileInput.multiple = true; // Permitir selección múltiple
      fileInput.style.display = 'none';
      document.body.appendChild(fileInput);
      fileInput.addEventListener('change', async (e) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) { fileInput.remove(); return; }

        const { subirImagen } = await import('./uploadManager.js');
        for (const f of files) {
          const url = await subirImagen(f, 'feedback-actividad-img', null);
          if (url) addActividadImageRow(url);
        }
        fileInput.remove();
      });
      fileInput.click();
    });

    document.getElementById('btnAgregarImagenExpositor')?.addEventListener('click', () => {
      import('./modalsManager.js').then(m => m.addExpositorImageRow(''));
    });

    // Vincular subida de video de expositor
    bindUpload('btn-subir-expositor-video', 'archivo-expositor-video', 'expositor-video', 'feedback-expositor-img');

    document.getElementById('btn-subir-expositor-multi')?.addEventListener('click', async () => {
      const fileInput = document.createElement('input');
      fileInput.type = 'file';
      fileInput.accept = 'image/*';
      fileInput.multiple = true; // Permitir selección múltiple
      fileInput.style.display = 'none';
      document.body.appendChild(fileInput);
      fileInput.addEventListener('change', async (e) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) { fileInput.remove(); return; }

        const { subirImagen } = await import('./uploadManager.js');
        const { addExpositorImageRow } = await import('./modalsManager.js');
        for (const f of files) {
          const url = await subirImagen(f, 'feedback-expositor-img', null);
          if (url) addExpositorImageRow(url);
        }
        fileInput.remove();
      });
      fileInput.click();
    });

    const btnSubirGal = document.getElementById('btn-subir-galeria');
    const inputGal = document.getElementById('archivo-imagen-galeria');
    if (btnSubirGal && inputGal) {
      btnSubirGal.addEventListener('click', () => inputGal.click());
      inputGal.addEventListener('change', async (e) => {
        const { subirImagen } = await import('./uploadManager.js');
        const files = Array.from(e.target.files);
        if (files.length === 0) return;

        const originalBtnHtml = btnSubirGal.innerHTML;
        btnSubirGal.disabled = true;
        
        let subidas = 0;
        for (const [index, f] of files.entries()) {
          btnSubirGal.innerHTML = `<i class="fas fa-spinner fa-spin"></i> ${index + 1}/${files.length}`;
          const url = await subirImagen(f, 'feedback-galeria', null);
          if (url) {
            addGalleryRow(url);
            subidas++;
          }
        }

        btnSubirGal.innerHTML = originalBtnHtml;
        btnSubirGal.disabled = false;
        inputGal.value = '';

        if (subidas > 0) {
          programarActualizacion();
          cerrarModalImagen();
          if (window.mostrarAlertaPremium) {
            window.mostrarAlertaPremium('Galería Actualizada', `Se han añadido ${subidas} imágenes correctamente.`, 'Entendido', 'fas fa-images');
          }
        }
      });
    }

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

    // 🔥 Autocarga del Preview Integrado si entramos a la "Vista Final"
    const targetTab = this.tabBtns[index]?.dataset.tab;
    if (targetTab === 'vista-final') {
      const finalIframe = document.getElementById('finalPreviewIframe');
      if (finalIframe) {
        // Guardar datos actuales antes de cargar
        const dataKey = guardarDatosPreview();
        
        // Si está en blanco, inicializar URL. Si ya tiene URL, refrescar datos.
        if (finalIframe.src === 'about:blank' || !finalIframe.src || finalIframe.src === window.location.href) {
          finalIframe.src = `/evento.html?preview=1&dataKey=${dataKey}`;
        } else {
          // Ya cargado, solo aplicamos los últimos cambios
          programarActualizacion();
        }
      }
    }
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
    let imagen_portada = document.getElementById('imagen_portada').value || '/assets/images/LogoOficialExpoFeriasCR/LogoExpoFeriasCR1.png';
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
      color_descripcion_texto: get('color_descripcion_texto') || '#2c1a0e',
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
      color_fondo_share: get('color_fondo_share') || 'rgba(255, 255, 255, 0.5)',
      color_texto_share: get('color_texto_share') || '#2c1a0e',
      color_buscador_expositores: get('color_buscador_expositores') || '#ffffff',
      color_borde_buscador_expositores: get('color_borde_buscador_expositores') || '#eeeeee',
      activo: document.getElementById('activo')?.checked ? 1 : 0,
      tiene_expositores: parseInt(document.getElementById('tiene_expositores')?.value) || 0
    };

    const recolectarTabla = (selector, campos) => {
      return Array.from(document.querySelectorAll(selector)).map(row => {
        const obj = {};
        Object.entries(campos).forEach(([key, sel]) => {
          const el = row.querySelector(sel);
          if (!el) return;
          if (key === 'precio_normal' || key === 'orden') obj[key] = parseInt(el.value) || 0;
          else if (key === 'imagen' || key === 'logo') {
            const val = (el.value || '').trim();
            if (!val) {
              obj[key] = [];
            } else if (val.startsWith('[')) {
              try {
                const parsed = JSON.parse(val);
                obj[key] = Array.isArray(parsed) ? parsed : [parsed];
              } catch (e) {
                obj[key] = [val]; // Fallback a string si falla el parseo
              }
            } else {
              // Manejar el caso de una URL única o separada por comas
              obj[key] = val.includes(',') ? val.split(',').map(s => s.trim()) : [val];
            }
          } else if (key === 'es_gratis' || key === 'requiere_entrada_online') {
            obj[key] = el.dataset?.value === 'true' ? 1 : 0;
          } else {
            obj[key] = el.value || '';
          }
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
      imagen_url: '.gal-url'
    }).filter(g => g.imagen_url);

    const formData = { ...datosBasicos, precios, actividades, expositores, galeria };
    console.log('[CrearEvento] Enviando datos al servidor:', formData);

    if (btn) { btn.innerHTML = '<span class="uploading-spinner"></span> Enviando…'; btn.disabled = true; }

    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No hay sesión activa. Por favor inicia sesión.');

      // ── Verificar si hubo cambios (aplica a CUALQUIER rol cuando edita un evento aprobado) ──
      if (this.eventoId && this.eventoEstado) {
        const esAprobadoOEnRevision = ['aprobado', 'edicion_pendiente'].includes(this.eventoEstado);
        if (esAprobadoOEnRevision && !this.formDirty) {
          if (btn) { this.actualizarBotonSubmit(); btn.disabled = false; }
          const user = JSON.parse(localStorage.getItem('usuario') || '{}');
          const msg = (user.rol === 'admin')
            ? 'ℹ️ No has hecho ningún cambio. Modifica algún campo antes de guardar.'
            : 'ℹ️ No has hecho ningún cambio. Modifica algún campo antes de enviar a revisión.';
          this.mostrarMensaje(msg, 'info');
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
            body: JSON.stringify(formData)
          });
        } else {
          response = await fetch('/api/admin/eventos', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify(formData)
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
            body: JSON.stringify(formData)
          });
        } else {
          response = await fetch('/api/eventos/crear', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify(formData)
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
  initOpacitySliders() {
    const handleSlider = (sliderId, labelId, hiddenId, textPrefix) => {
      const slider = document.getElementById(sliderId);
      const label = document.getElementById(labelId);
      const hidden = document.getElementById(hiddenId);
      if (!slider || !hidden) return;
      slider.addEventListener('input', (e) => {
        const val = parseFloat(e.target.value);
        // Mostrar oscuridad (ej: 0.65 -> 65%)
        if (label) label.innerText = `${textPrefix}: ${Math.round(val * 100)}%`;
        // La opacidad real es el inverso (ej: 1 - 0.65 = 0.35)
        const opacityResult = (1 - val).toFixed(2);
        // Guardar como RGBA para compatibilidad total
        hidden.value = `rgba(0, 0, 0, ${opacityResult})`;
        hidden.dispatchEvent(new Event('input', { bubbles: true }));
      });
    };
    handleSlider('opacidad_hero_slider', 'opacidad_hero_label', 'color_hero_overlay', 'Oscuridad');
  }

  actualizarTodosLosSliders() {
    const hidden = document.getElementById('color_hero_overlay');
    const slider = document.getElementById('opacidad_hero_slider');
    const label = document.getElementById('opacidad_hero_label');
    const textPrefix = 'Oscuridad';
    if (hidden && slider) {
      let val;
      const rawValue = hidden.value || "";
      if (rawValue.includes('rgba')) {
        const parts = rawValue.split(',');
        val = parseFloat(parts[parts.length - 1]);
      } else {
        val = parseFloat(rawValue);
      }

      if (!isNaN(val)) {
        // La oscuridad sombreada es 1 - opacidad (ej: 1 - 0.35 = 0.65)
        const darknessVal = (1 - val).toFixed(2);
        slider.value = darknessVal;
        if (label) label.innerText = `${textPrefix}: ${Math.round(darknessVal * 100)}%`;
      }
    }
  }
}
