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
  abrirModalActividad, cerrarModalActividad, agregarActividadDelModal, addActividadImageRow,
  abrirModalExpositor, cerrarModalExpositor, agregarExpositorDelModal,
  abrirModalImagen, cerrarModalImagen, agregarImagenDelModal
} from './modalsManager.js';

export class CrearEvento {
  constructor() {
    this.verificarAutenticacion();
    this.tabBtns = document.querySelectorAll('.tab-btn');
    this.tabContents = document.querySelectorAll('.tab-content');
    this.mensajeDiv = document.getElementById('mensaje-estado');
    this.init();
    this.initUploads();
    this.initPreviewListeners();

    // Detectar modo edición
    const params = new URLSearchParams(window.location.search);
    this.eventoId = params.get('id') || null;
    this.eventoEstado = null;
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
      if (!res.ok) return;
      const data = await res.json();
      const evento = data.evento || data;
      if (!evento) return;
      this.eventoEstado = evento.estado;

      const camposBasicos = [
        'slug', 'nombre', 'descripcion', 'fecha_inicio', 'fecha_fin',
        'ubicacion', 'provincia', 'imagen_portada', 'horario_imagen',
        'mapa_embed', 'tipo_venta', 'url_venta_online',
        'color_primario', 'color_secundario', 'color_fondo', 'color_texto',
        'color_hero_overlay', 'color_titulo_seccion',
        'color_titulo_hero', 'color_descripcion_hero', 'color_fondo_fechas', 'color_texto_fechas',
        'color_menu_fondo', 'color_menu_texto', 'color_menu_fondo_hover', 'color_menu_texto_hover',
        'color_titulo_h3',
        'color_fondo_contacto', 'color_texto_contacto', 'color_enlace_contacto',
        'color_fondo_footer', 'color_texto_footer'
      ];

      camposBasicos.forEach(k => {
        const el = document.getElementById(k);
        if (el && evento[k] !== undefined && evento[k] !== null) el.value = evento[k];
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
              <td><button type="button" class="btn-danger btn-eliminar">Eliminar</button></td>
            `;
            tr.querySelector('.btn-eliminar').addEventListener('click', () => tr.remove());
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
              <td style="text-align:center;font-size:18px;">
                <span class="act-gratis" data-value="${a.es_gratis ? 'true' : 'false'}">${a.es_gratis ? '✅' : '❌'}</span>
              </td>
              <td><button type="button" class="btn-danger btn-eliminar">Eliminar</button></td>
              <td style="display:none;"><input type="text" class="act-descripcion" value="${a.descripcion || ''}"></td>
              <td style="display:none;"><input type="text" class="act-imagenes" value='${JSON.stringify(imagenes)}'></td>
              <td style="display:none;"><span class="act-requiere-online" data-value="${a.requiere_entrada_online ? 'true' : 'false'}"></span></td>
              <td style="display:none;"><input type="text" class="act-enlace" value="${a.enlace_venta || ''}"></td>
            `;
            tr.querySelector('.btn-eliminar').addEventListener('click', () => tr.remove());
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
            tr.innerHTML = `
              <td><input type="text" class="exp-nombre" value="${e.nombre || ''}"></td>
              <td><input type="text" class="exp-rubro" value="${e.rubro || ''}"></td>
              <td><input type="text" class="exp-ubicacion" value="${e.ubicacion || ''}"></td>
              <td><button type="button" class="btn-danger btn-eliminar">Eliminar</button></td>
              <td style="display:none;"><input type="text" class="exp-descripcion" value="${e.descripcion || ''}"></td>
              <td style="display:none;"><input type="text" class="exp-logo" value="${e.logo || ''}"></td>
              <td style="display:none;"><input type="text" class="exp-video" value="${e.video_url || ''}"></td>
            `;
            tr.querySelector('.btn-eliminar').addEventListener('click', () => tr.remove());
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
              <td><button type="button" class="btn-danger btn-eliminar">Eliminar</button></td>
            `;
            tr.querySelector('.btn-eliminar').addEventListener('click', () => tr.remove());
            tbody.appendChild(tr);
          });
        }
      }

      programarActualizacion();

      if (evento.estado === 'aprobado') {
        this.mostrarMensaje('📝 Editando evento aprobado. Los cambios serán revisados por un admin antes de publicarse.', 'info');
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

    document.getElementById('btn-enviar-revision')?.addEventListener('click', () => this.handleSubmit());
    document.getElementById('slug')?.addEventListener('input', actualizarUrlBar);
  }

  initPreviewListeners() {
    const camposWatch = [
      'nombre', 'descripcion', 'fecha_inicio', 'fecha_fin', 'ubicacion', 'provincia',
      'imagen_portada', 'horario_imagen', 'mapa_embed', 'tipo_venta', 'url_venta_online',
      'color_primario', 'color_secundario', 'color_fondo', 'color_texto',
      'color_hero_overlay', 'color_titulo_seccion',
      'color_titulo_hero', 'color_descripcion_hero', 'color_fondo_fechas', 'color_texto_fechas',
      'color_menu_fondo', 'color_menu_texto', 'color_menu_fondo_hover', 'color_menu_texto_hover',
      'color_titulo_h3',
      'color_fondo_contacto', 'color_texto_contacto', 'color_enlace_contacto',
      'color_fondo_footer', 'color_texto_footer'
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
    if (!this.validarTabActual()) { this.mostrarMensaje('Completa los campos obligatorios antes de continuar', 'error'); return; }
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
    const imagen_portada = document.getElementById('imagen_portada').value || '/assets/images/default-feria.jpg';

    const formatDate = (dateStr) => {
      const d = new Date(dateStr + 'T12:00:00');
      return d.toLocaleDateString();
    };

    const buildCard = (isLive) => {
      const liveBadge = isLive ? `<div class="live-badge" style="position:absolute; top:10px; right:10px; background:#e74c3c; color:white; padding:4px 8px; border-radius:4px; font-weight:bold; font-size:12px; z-index:10;">🔴 EN VIVO</div>` : '';
      return `
        ${liveBadge}
        <img src="${imagen_portada}" alt="${nombre}" style="width:100%; height:180px; object-fit:cover; border-bottom:1px solid #eee;">
        <div style="padding:15px;">
          <h3 style="margin:0 0 10px; font-size:18px; color:#333;">${nombre}</h3>
          <p style="margin:5px 0; color:#666; font-size:14px;">${formatDate(fecha_inicio)} - ${formatDate(fecha_fin)}</p>
          <p style="margin:5px 0 15px; color:#666; font-size:14px;">${ubicacion}</p>
          <button type="button" class="btn-primary" style="width:100%; padding:8px; border:none; background:#0033A0; color:white; border-radius:4px; font-size:14px; cursor:pointer;">Ver más</button>
        </div>
      `;
    };

    document.getElementById('card-simulada-proximo').innerHTML = buildCard(false);
    document.getElementById('card-simulada-hoy').innerHTML = buildCard(false);
    document.getElementById('card-simulada-vivo').innerHTML = buildCard(true);

    document.getElementById('modal-preview-portada').style.display = 'flex';
  }

  async handleSubmit() {
    const btn = document.getElementById('btn-enviar-revision');

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

      const usuario = this.getUsuarioStorage() || {};
      const esAdmin = usuario.rol === 'admin';

      let response;
      if (esAdmin) {
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
        btn.innerHTML = '<i class="fas fa-paper-plane"></i> Enviar a Revisión';
        btn.disabled = false;
      }
    }
  }

  mostrarModalExito(mensaje) {
    const modal = document.getElementById('modal-exito');
    if (modal) {
      const msgEl = modal.querySelector('.modal-mensaje');
      const esAdmin = this.getUsuarioStorage()?.rol === 'admin';
      if (msgEl) {
        msgEl.innerHTML = mensaje || (esAdmin ? 'El evento ha sido guardado correctamente.' : 'Tu evento ha sido enviado correctamente a revisión.<br>Nuestro equipo lo revisará en un plazo de <strong>24 a 72 horas</strong>.');
      }
      modal.style.display = 'flex';
      document.getElementById('btn-ir-cuenta')?.addEventListener('click', () => {
        window.location.href = esAdmin ? '/admin/dashboard.html' : '/mi-cuenta.html';
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
