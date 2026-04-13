/**
 * crear-evento.js
 * Vista previa con iframe igual al admin + submit funcional + uploads al servidor
 */

/* ══════════════════════════════════════════
   SUBIR IMAGEN AL SERVIDOR
   ══════════════════════════════════════════ */
async function subirImagen(file, feedbackId, btnEl) {
  const feedback = feedbackId ? document.getElementById(feedbackId) : null;
  if (feedback) { feedback.className = 'upload-feedback'; feedback.style.display = 'none'; }

  const token = localStorage.getItem('token');
  if (!token) { alert('Sesión expirada. Inicia sesión nuevamente.'); return null; }

  const originalHtml = btnEl ? btnEl.innerHTML : '';
  if (btnEl) { btnEl.innerHTML = '<span class="uploading-spinner"></span>'; btnEl.disabled = true; }

  const formData = new FormData();
  formData.append('image', file);

  try {
    const res = await fetch('/api/admin/upload', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: formData
    });
    const data = await res.json();
    if (data.success && data.url) {
      if (feedback) { feedback.className = 'upload-feedback ok'; feedback.textContent = '✓ Imagen subida correctamente'; }
      return data.url;
    }
    throw new Error(data.error || 'Error al subir imagen');
  } catch (err) {
    if (feedback) { feedback.className = 'upload-feedback err'; feedback.textContent = '✗ ' + err.message; }
    return null;
  } finally {
    if (btnEl) { btnEl.innerHTML = originalHtml; btnEl.disabled = false; }
  }
}

function bindUpload(btnId, fileId, targetInputId, feedbackId, onSuccess) {
  const btn  = document.getElementById(btnId);
  const file = document.getElementById(fileId);
  if (!btn || !file) return;
  btn.addEventListener('click', () => file.click());
  file.addEventListener('change', async (e) => {
    const f = e.target.files[0]; if (!f) return;
    const url = await subirImagen(f, feedbackId, btn);
    if (url) {
      if (targetInputId) document.getElementById(targetInputId).value = url;
      if (onSuccess) onSuccess(url);
    }
    file.value = '';
  });
}

/* ══════════════════════════════════════════
   VISTA PREVIA CON IFRAME
   ══════════════════════════════════════════ */
let previewAbierto = false;
let previewTimer   = null;

function getIframe()  { return document.getElementById('previewIframe'); }
function getSlug()    { return (document.getElementById('slug')?.value || '').trim(); }

function actualizarUrlBar() {
  const slug   = getSlug();
  const urlBar = document.getElementById('previewUrlBar');
  if (!urlBar) return;
  urlBar.textContent = slug
    ? `/evento.html?slug=${encodeURIComponent(slug)}`
    : '/evento.html?slug=...';
}

// Guardar datos del formulario en localStorage para vista previa
function guardarDatosPreview() {
  const get = (id) => (document.getElementById(id)?.value || '').trim();
  
  // Recolectar datos básicos con TODOS los colores
  const datosPreview = {
    nombre: get('nombre'),
    descripcion: get('descripcion'),
    fecha_inicio: get('fecha_inicio'),
    fecha_fin: get('fecha_fin'),
    ubicacion: get('ubicacion'),
    provincia: get('provincia'),
    imagen_portada: get('imagen_portada'),
    horario_imagen: get('horario_imagen'),
    mapa_embed: get('mapa_embed'),
    tipo_venta: get('tipo_venta'),
    url_venta_online: get('url_venta_online'),
    // Todos los colores
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
    color_menu_hover: get('color_menu_hover') || '',
    color_titulo_h3: get('color_titulo_h3') || '#2c1a0e',
    color_fondo_contacto: get('color_fondo_contacto') || '#f4e4c1',
    color_texto_contacto: get('color_texto_contacto') || '#2c1a0e',
    color_enlace_contacto: get('color_enlace_contacto') || '#8b5a2b',
    color_fondo_footer: get('color_fondo_footer') || '#8b5a2b',
    color_texto_footer: get('color_texto_footer') || '#ffffff'
  };
  
  // Recolectar precios
  datosPreview.precios = Array.from(document.querySelectorAll('#precios-rows tr')).map(row => ({
    fecha: row.querySelector('.precio-fecha')?.value || '',
    precio_normal: parseFloat(row.querySelector('.precio-monto')?.value) || 0,
    promocion: row.querySelector('.precio-promocion')?.value || '',
    descripcion_promocion: row.querySelector('.precio-descripcion')?.value || ''
  })).filter(p => p.fecha);

  // Recolectar actividades
  datosPreview.actividades = Array.from(document.querySelectorAll('#actividades-rows tr')).map(row => ({
    titulo: row.querySelector('.act-titulo')?.value || '',
    tipo: row.querySelector('.act-tipo')?.value || '',
    fecha: row.querySelector('.act-fecha')?.value || '',
    hora: row.querySelector('.act-hora')?.value || null,
    lugar: row.querySelector('.act-lugar')?.value || '',
    descripcion: row.querySelector('.act-descripcion')?.value || '',
    imagenes: (() => { 
      try { 
        const v = row.querySelector('.act-imagenes')?.value || '[]'; 
        return JSON.parse(v); 
      } catch(e){ 
        return []; 
      } 
    })(),
    es_gratis: row.querySelector('.act-gratis')?.dataset.value === 'true' ? 1 : 0,
    requiere_entrada_online: row.querySelector('.act-requiere-online')?.dataset.value === 'true',
    enlace_venta: row.querySelector('.act-enlace')?.value || ''
  })).filter(a => a.titulo);

  // Recolectar expositores
  datosPreview.expositores = Array.from(document.querySelectorAll('#expositores-rows tr')).map(row => ({
    nombre: row.querySelector('.exp-nombre')?.value || '',
    rubro: row.querySelector('.exp-rubro')?.value || '',
    ubicacion: row.querySelector('.exp-ubicacion')?.value || '',
    descripcion: row.querySelector('.exp-descripcion')?.value || '',
    logo: row.querySelector('.exp-logo')?.value || '',
    video: row.querySelector('.exp-video')?.value || ''
  })).filter(e => e.nombre);

  // Recolectar galería
  datosPreview.galeria = Array.from(document.querySelectorAll('#galeria-rows tr')).map(row => ({
    imagen_url: row.querySelector('.gal-url')?.value || '',
    orden: parseInt(row.querySelector('.gal-orden')?.value) || 0
  })).filter(g => g.imagen_url);
  
  // Garantizar que la clave sea única
  const previewKey = 'preview_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  localStorage.setItem(previewKey, JSON.stringify(datosPreview));
  window.previewDataKey = previewKey;
  
  return previewKey;
}

function programarActualizacion() {
  clearTimeout(previewTimer);
  previewTimer = setTimeout(() => {
    guardarDatosPreview();
    aplicarCambiosEnVivo();
  }, 400);
}

function abrirPreview() {
  const panel  = document.getElementById('previewPanel');
  const layout = document.getElementById('formLayout');
  panel.classList.add('visible');
  layout.classList.add('with-preview');
  previewAbierto = true;
  document.getElementById('btnTogglePreview').innerHTML = '<i class="fas fa-eye-slash"></i> Ocultar preview';

  const dataKey = guardarDatosPreview();
  const iframe = getIframe();
  iframe.src = `/evento.html?preview=1&dataKey=${dataKey}`;
  
  iframe.addEventListener('load', () => {
    setTimeout(aplicarCambiosEnVivo, 500);
  }, { once: true });
}

function cerrarPreview() {
  const panel  = document.getElementById('previewPanel');
  const layout = document.getElementById('formLayout');
  panel.classList.remove('visible');
  layout.classList.remove('with-preview');
  previewAbierto = false;
  document.getElementById('btnTogglePreview').innerHTML = '<i class="fas fa-eye"></i> Vista previa';
}

function togglePreview() {
  if (previewAbierto) { cerrarPreview(); } else { abrirPreview(); }
}

// Aplicar cambios directamente dentro del iframe
function aplicarCambiosEnVivo() {
  const iframe = getIframe();
  let doc;
  try { doc = iframe.contentDocument; } catch (_) { return; }
  if (!doc || !doc.body) return;

  const get = (id) => (document.getElementById(id)?.value || '').trim();

  // Nombre
  const h1 = doc.getElementById('eventoNombre');
  if (h1) { h1.innerText = get('nombre') || 'Sin nombre'; h1.style.color = get('color_titulo_hero') || ''; }

  // Descripción
  const desc = doc.getElementById('eventoDescripcion');
  if (desc) { desc.innerText = get('descripcion'); desc.style.color = get('color_descripcion_hero') || ''; }

  // Descripción completa
  const infoCompleta = doc.getElementById('eventoInfoCompleta');
  if (infoCompleta) infoCompleta.innerText = get('descripcion');

  // Fechas hero
  const fi = get('fecha_inicio'), ff = get('fecha_fin');
  const fmt = s => s ? new Date(s + 'T12:00:00').toLocaleDateString('es-CR', { day:'2-digit', month:'short', year:'numeric' }) : '?';
  const fechaTexto = fi || ff ? (fi === ff ? fmt(fi) : `${fmt(fi)} al ${fmt(ff)}`) : '';
  const eventoFechas = doc.getElementById('eventoFechas');
  if (eventoFechas) eventoFechas.innerText = fechaTexto;
  const infoFechas = doc.getElementById('infoFechas');
  if (infoFechas) infoFechas.innerText = fi && ff ? `${fmt(fi)} - ${fmt(ff)}` : '';

  // Ubicación
  const ub = get('ubicacion');
  const infoUbicacion = doc.getElementById('infoUbicacion');
  if (infoUbicacion) infoUbicacion.innerText = ub;
  const ubicacionTexto = doc.getElementById('ubicacionTexto');
  if (ubicacionTexto) ubicacionTexto.innerText = ub;

  // Horario imagen
  const horarioImg = get('horario_imagen');
  const horarioContainer = doc.getElementById('horarioContainer');
  if (horarioContainer) {
    if (horarioImg) {
      horarioContainer.innerHTML = `<img src="${horarioImg}" alt="Horario del evento" style="max-width:100%; border-radius:8px;">`;
    } else {
      horarioContainer.innerHTML = '<p style="color:#999;">Horario no disponible</p>';
    }
  }

  // Mapa iframe
  const mapaEmbed = get('mapa_embed');
  const mapaContainer = doc.getElementById('mapaIframe');
  if (mapaContainer) {
    if (mapaEmbed) {
      mapaContainer.innerHTML = mapaEmbed;
    } else {
      mapaContainer.innerHTML = '<p style="color:#999;">Mapa no disponible</p>';
    }
  }

  // Precios
  const preciosData = Array.from(document.querySelectorAll('#precios-rows tr')).map(row => ({
    fecha: row.querySelector('.precio-fecha')?.value || '',
    precio_normal: parseFloat(row.querySelector('.precio-monto')?.value) || 0,
    promocion: row.querySelector('.precio-promocion')?.value || '',
    descripcion_promocion: row.querySelector('.precio-descripcion')?.value || ''
  })).filter(p => p.fecha);

  const tablaPrecios = doc.getElementById('tablaPrecios');
  if (tablaPrecios) {
    if (preciosData.length > 0) {
      let html = `<table class="tabla-precios-estilo"><thead><tr><th>Fecha</th><th>Precio normal</th><th>Promoción</th><th>Detalle</th></tr></thead><tbody>`;
      preciosData.forEach(p => {
        const fechaFmt = new Date(p.fecha + 'T12:00:00').toLocaleDateString('es-CR', { weekday: 'long', day: 'numeric', month: 'long' });
        const precioNum = parseFloat(p.precio_normal);
        const precioFormateado = isNaN(precioNum) ? '₡0' : new Intl.NumberFormat('es-CR', { style: 'currency', currency: 'CRC', minimumFractionDigits: 0 }).format(precioNum);
        html += `<tr><td>${fechaFmt}</td><td>${precioFormateado}</td><td>${p.promocion || '—'}</td><td>${p.descripcion_promocion || '—'}</td></tr>`;
      });
      html += `</tbody></table>`;
      tablaPrecios.innerHTML = html;
    } else {
      tablaPrecios.innerHTML = '<p style="color:#999;">No hay precios registrados</p>';
    }
  }

  // Expositores
  const ExpositoresData = Array.from(document.querySelectorAll('#expositores-rows tr')).map(row => ({
    nombre: row.querySelector('.exp-nombre')?.value || '',
    rubro: row.querySelector('.exp-rubro')?.value || '',
    ubicacion: row.querySelector('.exp-ubicacion')?.value || '',
    descripcion: row.querySelector('.exp-descripcion')?.value || '',
    logo: row.querySelector('.exp-logo')?.value || '',
    video: row.querySelector('.exp-video')?.value || ''
  })).filter(e => e.nombre);

  const ExpositoresGrid = doc.getElementById('expositoresGrid');
  if (expositoresGrid) {
    if (expositoresData.length > 0) {
      let html = '';
      ExpositoresData.forEach(exp => {
        const logoHtml = exp.logo ? `<img src="${exp.logo}" alt="${exp.nombre}" class="card-img-principal">` : '<div class="placeholder-img"></div>';
        html += `<div class="expositor-card">${logoHtml}<div class="card-content"><h3>${exp.nombre}</h3><p class="rubro"><strong>Rubro:</strong> ${exp.rubro}</p><p class="ubicacion"><strong>Ubicación:</strong> ${exp.ubicacion}</p><p class="descripcion">${exp.descripcion}</p></div></div>`;
      });
      ExpositoresGrid.innerHTML = html;
    } else {
      ExpositoresGrid.innerHTML = '<p style="color:#999;">No hay expositores registrados</p>';
    }
  }

  // Actividades
  const actividadesData = Array.from(document.querySelectorAll('#actividades-rows tr')).map(row => ({
    titulo: row.querySelector('.act-titulo')?.value || '',
    tipo: row.querySelector('.act-tipo')?.value || '',
    fecha: row.querySelector('.act-fecha')?.value || '',
    hora: row.querySelector('.act-hora')?.value || null,
    lugar: row.querySelector('.act-lugar')?.value || '',
    descripcion: row.querySelector('.act-descripcion')?.value || '',
    imagenes: (() => { try { const v = row.querySelector('.act-imagenes')?.value || '[]'; return JSON.parse(v); } catch(e){ return []; } })(),
    es_gratis: row.querySelector('.act-gratis')?.dataset.value === 'true',
    requiere_entrada_online: row.querySelector('.act-requiere-online')?.dataset.value === 'true',
    enlace_venta: row.querySelector('.act-enlace')?.value || ''
  })).filter(a => a.titulo);

  const actividadesGrid = doc.getElementById('actividadesGrid');
  if (actividadesGrid) {
    if (actividadesData.length > 0) {
      let html = '';
      actividadesData.forEach((act, actIndex) => {
        const fmt = s => s ? new Date(s + 'T12:00:00').toLocaleDateString('es-CR', { day:'2-digit', month:'short' }) : '?';
        let images = act.imagenes.filter(u => u);
        
        let imagesHtml = '';
        if (images.length > 0) {
          if (images.length === 1) {
            imagesHtml = `<img src="${images[0]}" alt="${act.titulo}" class="card-img-principal">`;
          } else {
            // Múltiples imágenes con carrusel < >
            imagesHtml = `<div class="actividad-carousel" data-idx="0">
              <button class="actividad-prev">&#10094;</button>
              <div class="actividad-viewport">
                <div class="actividad-track">
                  ${images.map(src => `<div class="actividad-slide"><img src="${src}" alt="${act.titulo}" class="card-img-principal"></div>`).join('')}
                </div>
              </div>
              <button class="actividad-next">&#10095;</button>
            </div>`;
          }
        } else {
          imagesHtml = '<div class="placeholder-img"></div>';
        }
        
        html += `<div class="actividad-card">
          ${imagesHtml}
          <div class="card-content">
            <h3>${act.titulo}</h3>
            <p class="tipo"><strong>Tipo:</strong> ${act.tipo}</p>
            <p class="fecha"><strong>Fecha:</strong> ${fmt(act.fecha)} ${act.hora || ''}</p>
            <p class="lugar"><strong>Lugar:</strong> ${act.lugar}</p>
            <p class="descripcion">${act.descripcion}</p>
            <p class="gratuito">${act.es_gratis ? '<strong>✓ Gratis</strong>' : '<strong>Requiere entrada</strong>'}</p>
            ${act.enlace_venta ? `<a href="${act.enlace_venta}" target="_blank" class="btn-comprar">Comprar entrada</a>` : ''}
          </div>
        </div>`;
      });
      actividadesGrid.innerHTML = html;

      // Inicializar carruseles de actividades
      actividadesGrid.querySelectorAll('.actividad-carousel').forEach(car => {
        const slides = car.querySelectorAll('.actividad-slide');
        if (slides.length <= 1) {
          // Ocultar flechas si solo hay una imagen
          car.querySelector('.actividad-prev')?.style.setProperty('display', 'none');
          car.querySelector('.actividad-next')?.style.setProperty('display', 'none');
        } else {
          let idx = 0;
          const prev = car.querySelector('.actividad-prev');
          const next = car.querySelector('.actividad-next');
          function update() {
            slides.forEach((s,i) => s.style.display = i === idx ? 'block' : 'none');
          }
          if (prev) prev.addEventListener('click', () => { idx = (idx - 1 + slides.length) % slides.length; update(); });
          if (next) next.addEventListener('click', () => { idx = (idx + 1) % slides.length; update(); });
          update();
        }
      });
    } else {
      actividadesGrid.innerHTML = '<p style="color:#999;">No hay actividades registradas</p>';
    }
  }

  // Imagen portada → hero
  const portadaUrl = get('imagen_portada');
  if (portadaUrl) {
    const slides = doc.getElementById('heroSlides');
    if (slides) {
      slides.innerHTML = `<div class="hero-slide active" style="background-image:url('${portadaUrl}');background-size:cover;background-position:center;width:100%;height:100%;position:absolute;"></div>`;
    }
  }

  // Galería (carrusel hero)
  const galeriaData = Array.from(document.querySelectorAll('#galeria-rows tr')).map(row => ({
    imagen_url: row.querySelector('.gal-url')?.value || '',
    orden: parseInt(row.querySelector('.gal-orden')?.value) || 0
  })).filter(g => g.imagen_url);

  if (galeriaData.length > 0) {
    const slides = doc.getElementById('heroSlides');
    if (slides) {
      slides.innerHTML = '';
      const sorted = galeriaData.slice().sort((a, b) => (a.orden || 0) - (b.orden || 0));
      sorted.forEach((g, idx) => {
        const div = document.createElement('div');
        div.className = 'hero-slide';
        div.style.backgroundImage = `url('${g.imagen_url}')`;
        div.style.backgroundSize = 'cover';
        div.style.backgroundPosition = 'center';
        div.style.width = '100%';
        div.style.height = '100%';
        div.style.position = 'absolute';
        div.style.display = idx === 0 ? 'block' : 'none';
        slides.appendChild(div);
      });
    }
  }

  // CSS variables → colores en tiempo real
  const r = doc.documentElement;
  r.style.setProperty('--evento-primario',    get('color_primario')    || '#8b5a2b');
  r.style.setProperty('--evento-secundario',  get('color_secundario')  || '#d4a373');
  r.style.setProperty('--evento-fondo',       get('color_fondo')       || '#f4e4c1');

  // Hero overlay
  const overlay = doc.querySelector('.hero-overlay');
  if (overlay) {
    const ov = get('color_hero_overlay');
    if (ov) overlay.style.backgroundColor = ov;
  }

  // Hero dates (fondo/color)
  const heroDates = doc.querySelector('.hero-dates');
  if (heroDates) {
    if (get('color_fondo_fechas'))  heroDates.style.backgroundColor = get('color_fondo_fechas');
    if (get('color_texto_fechas'))  heroDates.style.color = get('color_texto_fechas');
  }

  // H2 secciones
  if (get('color_titulo_seccion')) {
    doc.querySelectorAll('h2').forEach(h => h.style.color = get('color_titulo_seccion'));
  }

  // Nav links
  doc.querySelectorAll('.nav-links a').forEach(a => {
    if (get('color_menu_texto')) a.style.color = get('color_menu_texto');
  });

  // Footer
  const footer = doc.querySelector('footer');
  if (footer) {
    if (get('color_fondo_footer')) footer.style.backgroundColor = get('color_fondo_footer');
    if (get('color_texto_footer')) footer.style.color = get('color_texto_footer');
  }

  // Contacto
  const contacto = doc.querySelector('.contacto');
  if (contacto) {
    if (get('color_fondo_contacto')) contacto.style.backgroundColor = get('color_fondo_contacto');
    if (get('color_texto_contacto')) contacto.style.color = get('color_texto_contacto');
  }

  actualizarUrlBar();
}

/* ══════════════════════════════════════════
   CLASE PRINCIPAL
   ══════════════════════════════════════════ */
class CrearEvento {
  constructor() {
    this.verificarAutenticacion();
    this.tabBtns     = document.querySelectorAll('.tab-btn');
    this.tabContents = document.querySelectorAll('.tab-content');
    this.mensajeDiv  = document.getElementById('mensaje-estado');
    this.init();
    this.initUploads();
    this.initPreviewListeners();

    // Detectar modo edición (si url contiene ?id=)
    const params = new URLSearchParams(window.location.search);
    this.eventoId = params.get('id') || null;
    this.eventoEstado = null;
    if (this.eventoId) {
      this.cargarEventoParaEdicion(this.eventoId);
    }
  }

  verificarAutenticacion() {
    const usuario = JSON.parse(localStorage.getItem('usuario') || 'null');
    if (!usuario) {
      alert('Debes iniciar sesión para crear un evento');
      window.location.href = '/index.html';
    }
  }

  async cargarEventoParaEdicion(id) {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/eventos/mi-evento/${id}`, { headers: { 'Authorization': `Bearer ${token}` } });
      if (!res.ok) return;
      const data = await res.json();
      const evento = data.evento || data;
      if (!evento) return;
      this.eventoEstado = evento.estado;

      // Poblar campos básicos
      const camposBasicos = [
        'slug', 'nombre', 'descripcion', 'fecha_inicio', 'fecha_fin', 
        'ubicacion', 'provincia', 'imagen_portada', 'horario_imagen', 
        'mapa_embed', 'tipo_venta', 'url_venta_online',
        'color_primario', 'color_secundario', 'color_fondo', 'color_texto',
        'color_hero_overlay', 'color_titulo_seccion',
        'color_titulo_hero', 'color_descripcion_hero', 'color_fondo_fechas', 'color_texto_fechas',
        'color_menu_fondo', 'color_menu_texto', 'color_menu_hover', 'color_titulo_h3',
        'color_fondo_contacto', 'color_texto_contacto', 'color_enlace_contacto',
        'color_fondo_footer', 'color_texto_footer'
      ];
      
      camposBasicos.forEach(k => {
        const el = document.getElementById(k);
        if (el && evento[k] !== undefined && evento[k] !== null) el.value = evento[k];
      });

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
              try { imagenes = JSON.parse(a.imagen); } catch(e) { imagenes = [a.imagen]; }
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

      // Actualizar preview
      programarActualizacion();

      // Mostrar mensaje si es evento aprobado que fue editado
      if (evento.estado === 'aprobado') {
        this.mostrarMensaje('📝 Editando evento aprobado. Los cambios serán revisados por un admin antes de publicarse.', 'info');
      }
    } catch (err) {
      console.error('Error cargando evento para edición', err);
    }
  }

  init() {
    // Navegación tabs
    this.tabBtns.forEach((btn, i) => btn.addEventListener('click', () => this.cambiarTab(i)));
    document.querySelectorAll('.tab-next-btn').forEach(b => b.addEventListener('click', e => { e.preventDefault(); this.irSiguienteTab(); }));
    document.querySelectorAll('.tab-prev-btn').forEach(b => b.addEventListener('click', e => { e.preventDefault(); this.irTabAnterior(); }));

    // Volver
    document.getElementById('btn-volver-crear')?.addEventListener('click', () => { window.location.href = '/mi-cuenta.html'; });

    // Toggle preview
    document.getElementById('btnTogglePreview')?.addEventListener('click', togglePreview);
    document.getElementById('btnReloadPreview')?.addEventListener('click', () => {
      if (window.previewDataKey) {
        const dataKey = guardarDatosPreview();
        const iframe = getIframe();
        iframe.src = `/evento.html?preview=1&dataKey=${dataKey}`;
      }
    });

    // Iframe onload → aplicar cambios en vivo
    getIframe()?.addEventListener('load', () => { setTimeout(aplicarCambiosEnVivo, 150); });

    // Botones de agregar en tablas
    document.getElementById('btn-agregar-precio')?.addEventListener('click', abrirModalPrecio);
    document.getElementById('btn-agregar-actividad')?.addEventListener('click', abrirModalActividad);
    document.getElementById('btn-agregar-expositor')?.addEventListener('click', abrirModalExpositor);
    document.getElementById('btn-agregar-imagen')?.addEventListener('click', abrirModalImagen);

    // Checkbox actividad requiere online
    document.getElementById('actividad-requiere-online')?.addEventListener('change', function () {
      document.getElementById('actividad-enlace-group').style.display = this.checked ? 'block' : 'none';
    });

    // Botón enviar a revisión
    document.getElementById('btn-enviar-revision')?.addEventListener('click', () => this.handleSubmit());

    // Actualizar preview-url-bar cuando cambia el slug
    document.getElementById('slug')?.addEventListener('input', actualizarUrlBar);
  }

  initPreviewListeners() {
    // Escuchar todos los campos de datos básicos
    const camposWatch = [
      'nombre', 'descripcion', 'fecha_inicio', 'fecha_fin', 'ubicacion', 'provincia',
      'imagen_portada', 'horario_imagen', 'mapa_embed', 'tipo_venta', 'url_venta_online',
      'color_primario', 'color_secundario', 'color_fondo', 'color_texto',
      'color_hero_overlay', 'color_titulo_seccion',
      'color_titulo_hero', 'color_descripcion_hero', 'color_fondo_fechas', 'color_texto_fechas',
      'color_menu_fondo', 'color_menu_texto', 'color_menu_hover', 'color_titulo_h3',
      'color_fondo_contacto', 'color_texto_contacto', 'color_enlace_contacto',
      'color_fondo_footer', 'color_texto_footer'
    ];
    camposWatch.forEach(id => {
      const el = document.getElementById(id);
      if (el) {
        el.addEventListener('input',  programarActualizacion);
        el.addEventListener('change', programarActualizacion);
      }
    });

    // Mostrar/ocultar campo URL venta online según tipo_venta
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

    // Observer para detectar cambios en las tablas
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
    // Portada
    bindUpload('btn-subir-portada', 'archivo-portada', 'imagen_portada', 'feedback-portada', () => {
      programarActualizacion();
    });

    // Horario imagen
    bindUpload('btn-subir-horario', 'archivo-horario', 'horario_imagen', 'feedback-horario', () => {
      programarActualizacion();
    });

    // Imagen actividad (modal)
    document.getElementById('btnAgregarImagenActividad')?.addEventListener('click', () => addActividadImageRow(''));
    document.getElementById('btn-subir-actividad-multi')?.addEventListener('click', async () => {
      const fileInput = document.createElement('input');
      fileInput.type = 'file';
      fileInput.accept = 'image/*';
      fileInput.style.display = 'none';
      document.body.appendChild(fileInput);
      fileInput.addEventListener('change', async (e) => {
        const f = e.target.files[0]; if (!f) { fileInput.remove(); return; }
        const url = await subirImagen(f, 'feedback-actividad-img', null);
        if (url) addActividadImageRow(url);
        fileInput.remove();
      });
      fileInput.click();
    });

    // Logo expositor (modal)
    bindUpload('btn-subir-logo', 'archivo-logo', 'expositor-logo', 'feedback-logo');

    // Imagen galería (modal)
    bindUpload('btn-subir-galeria', 'archivo-imagen-galeria', 'imagen-url', 'feedback-galeria', (url) => {
      const img  = document.getElementById('preview-galeria-img');
      const wrap = document.getElementById('preview-galeria-img-wrap');
      if (img && wrap) { img.src = url; wrap.style.display = 'block'; }
    });

    // Preview imagen galería al pegar URL manualmente
    document.getElementById('imagen-url')?.addEventListener('input', (e) => {
      const url  = e.target.value.trim();
      const img  = document.getElementById('preview-galeria-img');
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

  async handleSubmit() {
    const btn = document.getElementById('btn-enviar-revision');

    // Validar campos requeridos
    const slug        = document.getElementById('slug')?.value.trim();
    const nombre      = document.getElementById('nombre')?.value.trim();
    const fechaInicio = document.getElementById('fecha_inicio')?.value;
    const fechaFin    = document.getElementById('fecha_fin')?.value;
    const ubicacion   = document.getElementById('ubicacion')?.value.trim();
    const provincia   = document.getElementById('provincia')?.value;

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

    // Recolectar todos los datos
    const datosBasicos = {
      slug,
      nombre,
      descripcion:  document.getElementById('descripcion')?.value.trim() || '',
      fecha_inicio: fechaInicio,
      fecha_fin:    fechaFin,
      ubicacion,
      provincia,
      imagen_portada:        document.getElementById('imagen_portada')?.value.trim()        || null,
      horario_imagen:        document.getElementById('horario_imagen')?.value.trim()        || null,
      mapa_embed:            document.getElementById('mapa_embed')?.value.trim()            || null,
      tipo_venta:            document.getElementById('tipo_venta')?.value                   || 'taquilla',
      url_venta_online:      document.getElementById('url_venta_online')?.value.trim()      || null,
      color_primario:        document.getElementById('color_primario')?.value               || '#8b5a2b',
      color_secundario:      document.getElementById('color_secundario')?.value             || '#d4a373',
      color_fondo:           document.getElementById('color_fondo')?.value                  || '#f4e4c1',
      color_texto:            document.getElementById('color_texto')?.value                  || '#2c1a0e',
      color_hero_overlay:    document.getElementById('color_hero_overlay')?.value           || 'rgba(62,42,31,0.7)',
      color_titulo_seccion:  document.getElementById('color_titulo_seccion')?.value         || '#2c1a0e',
      color_titulo_hero:     document.getElementById('color_titulo_hero')?.value            || '#ffffff',
      color_descripcion_hero:document.getElementById('color_descripcion_hero')?.value       || '#ffffff',
      color_fondo_fechas:    document.getElementById('color_fondo_fechas')?.value          || '#d4a373',
      color_texto_fechas:    document.getElementById('color_texto_fechas')?.value           || '#8b5a2b',
      color_menu_fondo:      document.getElementById('color_menu_fondo')?.value            || '#ffffff',
      color_menu_texto:      document.getElementById('color_menu_texto')?.value            || '#ffffff',
      color_menu_hover:      document.getElementById('color_menu_hover')?.value            || '',
      color_titulo_h3:       document.getElementById('color_titulo_h3')?.value             || '#2c1a0e',
      color_fondo_contacto:  document.getElementById('color_fondo_contacto')?.value        || '#f4e4c1',
      color_texto_contacto:  document.getElementById('color_texto_contacto')?.value        || '#2c1a0e',
      color_enlace_contacto: document.getElementById('color_enlace_contacto')?.value       || '#8b5a2b',
      color_fondo_footer:    document.getElementById('color_fondo_footer')?.value          || '#8b5a2b',
      color_texto_footer:    document.getElementById('color_texto_footer')?.value          || '#ffffff'
    };

    // Recolectar tablas
    const precios = Array.from(document.querySelectorAll('#precios-rows tr')).map(row => ({
      fecha:                row.querySelector('.precio-fecha')?.value || '',
      precio_normal:        parseFloat(row.querySelector('.precio-monto')?.value) || 0,
      promocion:            row.querySelector('.precio-promocion')?.value || '',
      descripcion_promocion:row.querySelector('.precio-descripcion')?.value || ''
    })).filter(p => p.fecha);

    const actividades = Array.from(document.querySelectorAll('#actividades-rows tr')).map(row => ({
      titulo:                   row.querySelector('.act-titulo')?.value || '',
      tipo:                     row.querySelector('.act-tipo')?.value || '',
      fecha:                    row.querySelector('.act-fecha')?.value || '',
      hora:                     row.querySelector('.act-hora')?.value || null,
      lugar:                    row.querySelector('.act-lugar')?.value || '',
      descripcion:              row.querySelector('.act-descripcion')?.value || '',
      imagen:                  (() => { 
        try { 
          const v = row.querySelector('.act-imagenes')?.value || '[]'; 
          return JSON.parse(v); 
        } catch(e){ return []; } 
      })(),
      es_gratis:                row.querySelector('.act-gratis')?.dataset.value === 'true' ? 1 : 0,
      requiere_entrada_online:  row.querySelector('.act-requiere-online')?.dataset.value === 'true',
      enlace_venta:             row.querySelector('.act-enlace')?.value || ''
    })).filter(a => a.titulo);

    const expositores = Array.from(document.querySelectorAll('#expositores-rows tr')).map(row => ({
      nombre:     row.querySelector('.exp-nombre')?.value || '',
      rubro:      row.querySelector('.exp-rubro')?.value || '',
      ubicacion:  row.querySelector('.exp-ubicacion')?.value || '',
      descripcion:row.querySelector('.exp-descripcion')?.value || '',
      logo:       row.querySelector('.exp-logo')?.value || '',
      video:      row.querySelector('.exp-video')?.value || ''
    })).filter(e => e.nombre);

    const galeria = Array.from(document.querySelectorAll('#galeria-rows tr')).map(row => ({
      imagen_url: row.querySelector('.gal-url')?.value || '',
      orden:      parseInt(row.querySelector('.gal-orden')?.value) || 0
    })).filter(g => g.imagen_url);

    // Deshabilitar botón durante el envío
    if (btn) { btn.innerHTML = '<span class="uploading-spinner"></span> Enviando…'; btn.disabled = true; }

    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No hay sesión activa. Por favor inicia sesión.');

      let response;
      if (this.eventoId) {
        // Editando evento existente
        response = await fetch(`/api/eventos/${this.eventoId}/editar-aprobado`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ ...datosBasicos, precios, actividades, expositores, galeria })
        });
      } else {
        // Creando nuevo evento
        response = await fetch('/api/eventos/crear', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ ...datosBasicos, precios, actividades, exposiciones:Expoitores, galeria })
        });
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `Error del servidor (${response.status})`);
      }

      // Éxito
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
      // Actualizar mensaje según corresponda
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
    this.mensajeDiv.className   = `mensaje-estado ${tipo}`;
    this.mensajeDiv.style.display = 'block';
    if (tipo !== 'error') {
      setTimeout(() => { this.mensajeDiv.style.display = 'none'; }, 8000);
    }
  }
}

/* ══════════════════════════════════════════
   ACTUALIZAR VALORES DE COLORES EN TIEMPO REAL
   ══════════════════════════════════════════ */
function initColorListeners() {
    const colorCampos = ['color_primario', 'color_secundario', 'color_fondo', 'color_titulo_hero', 'color_fondo_footer'];
    
    colorCampos.forEach(id => {
        const input = document.getElementById(id);
        const valueDisplay = document.getElementById(id + '_value');
        
        if (input && valueDisplay) {
            input.addEventListener('input', () => {
                valueDisplay.textContent = input.value;
                programarActualizacion();
            });
        }
    });
}

/* ══════════════════════════════════════════
   ARRANQUE
   ══════════════════════════════════════════ */
let app;
document.addEventListener('DOMContentLoaded', () => { 
    app = new CrearEvento(); 
    initColorListeners();
});

/* ══════════════════════════════════════════
   MODALES
   ══════════════════════════════════════════ */

// ─── PRECIO ───
function abrirModalPrecio() {
  document.getElementById('form-precio').reset();
  document.getElementById('modal-precio').style.display = 'flex';
}
function cerrarModalPrecio() { document.getElementById('modal-precio').style.display = 'none'; }
function agregarPrecioDelModal() {
  const fecha       = document.getElementById('precio-fecha').value;
  const monto       = document.getElementById('precio-monto').value;
  const promocion   = document.getElementById('precio-promocion').value || 'no';
  const descripcion = document.getElementById('precio-descripcion').value;
  if (!fecha || !monto) { alert('Completa fecha y precio'); return; }

  const row = document.createElement('tr');
  row.innerHTML = `
    <td><input type="date" value="${fecha}" class="precio-fecha"></td>
    <td><input type="number" value="${monto}" class="precio-monto"></td>
    <td><input type="text"   value="${promocion}" class="precio-promocion"></td>
    <td><input type="text"   value="${descripcion}" class="precio-descripcion"></td>
    <td><button type="button" class="btn-danger btn-eliminar">Eliminar</button></td>
  `;
  row.querySelector('.btn-eliminar').addEventListener('click', () => row.remove());
  document.getElementById('precios-rows').appendChild(row);
  cerrarModalPrecio();
}

// ─── ACTIVIDAD ───
function abrirModalActividad() {
  document.getElementById('form-actividad').reset();
  document.getElementById('actividad-enlace-group').style.display = 'none';
  const fb = document.getElementById('feedback-actividad-img');
  if (fb) { fb.className = 'upload-feedback'; fb.style.display = 'none'; }
  const lista = document.getElementById('actividadImagenesLista');
  if (lista) lista.innerHTML = '';
  document.getElementById('modal-actividad').style.display = 'flex';
}
function cerrarModalActividad() { document.getElementById('modal-actividad').style.display = 'none'; }
function agregarActividadDelModal() {
  const titulo      = document.getElementById('actividad-titulo').value.trim();
  const tipo        = document.getElementById('actividad-tipo').value.trim();
  const descripcion = document.getElementById('actividad-descripcion').value.trim();
  const fecha       = document.getElementById('actividad-fecha').value;
  const hora        = document.getElementById('actividad-hora').value;
  const lugar       = document.getElementById('actividad-lugar').value.trim();
  const imagenes = Array.from(document.querySelectorAll('#actividadImagenesLista .actividad-img-url')).map(i => i.value.trim()).filter(u => u);
  const esGratis    = document.getElementById('actividad-es-gratis').checked;
  const reqOnline   = document.getElementById('actividad-requiere-online').checked;
  const enlace      = document.getElementById('actividad-enlace').value.trim();

  if (!titulo || !tipo || !fecha) { alert('Completa título, tipo y fecha'); return; }

  const row = document.createElement('tr');
  row.innerHTML = `
    <td><input type="text" value="${titulo}" class="act-titulo"></td>
    <td><input type="text" value="${tipo}"   class="act-tipo"></td>
    <td><input type="date" value="${fecha}"  class="act-fecha"></td>
    <td><input type="time" value="${hora}"   class="act-hora"></td>
    <td><input type="text" value="${lugar}"  class="act-lugar" placeholder="Lugar/escenario"></td>
    <td style="text-align:center;font-size:18px;">
        <span class="act-gratis" data-value="${esGratis}">${esGratis ? '✅' : '❌'}</span>
    </td>
    <td><button type="button" class="btn-danger btn-eliminar">Eliminar</button></td>
    <td style="display:none;"><input type="text" value="${descripcion}" class="act-descripcion"></td>
    <td style="display:none;"><input type="text" value='${JSON.stringify(imagenes)}' class="act-imagenes"></td>
    <td style="display:none;"><span class="act-requiere-online" data-value="${reqOnline}"></span></td>
    <td style="display:none;"><input type="text" value="${enlace}" class="act-enlace"></td>
  `;
  row.querySelector('.btn-eliminar').addEventListener('click', () => row.remove());
  document.getElementById('actividades-rows').appendChild(row);
  cerrarModalActividad();
}

// Añade una fila de input URL en el modal de actividad
function addActividadImageRow(initialUrl) {
  const lista = document.getElementById('actividadImagenesLista');
  if (!lista) return;
  const row = document.createElement('div');
  row.style.display = 'flex';
  row.style.gap = '8px';
  row.style.alignItems = 'center';
  row.innerHTML = `
    <input type="text" class="actividad-img-url" placeholder="URL de imagen" value="${initialUrl || ''}" style="flex:1;padding:8px;border:1px solid #ddd;border-radius:6px;">
    <button type="button" class="btn-secondary btn-subir-row">Subir</button>
    <button type="button" class="btn-danger btn-eliminar-row">Eliminar</button>
  `;
  const subirBtn = row.querySelector('.btn-subir-row');
  subirBtn.addEventListener('click', () => {
    const fileInput = document.createElement('input');
    fileInput.type = 'file'; fileInput.accept = 'image/*'; fileInput.style.display = 'none';
    document.body.appendChild(fileInput);
    fileInput.addEventListener('change', async (e) => {
      const f = e.target.files[0]; if (!f) { fileInput.remove(); return; }
      const url = await subirImagen(f, 'feedback-actividad-img', null);
      if (url) row.querySelector('.actividad-img-url').value = url;
      fileInput.remove();
    });
    fileInput.click();
  });
  row.querySelector('.btn-eliminar-row').addEventListener('click', () => row.remove());
  lista.appendChild(row);
}

// ─── EXPOSITOR ───
function abrirModalExpositor() {
  document.getElementById('form-expositor').reset();
  const fb = document.getElementById('feedback-logo');
  if (fb) { fb.className = 'upload-feedback'; fb.style.display = 'none'; }
  document.getElementById('modal-expositor').style.display = 'flex';
}
function cerrarModalExpositor() { document.getElementById('modal-expositor').style.display = 'none'; }
function agregarExpositorDelModal() {
  const nombre      = document.getElementById('expositor-nombre').value.trim();
  const rubro       = document.getElementById('expositor-rubro').value.trim();
  const descripcion = document.getElementById('expositor-descripcion').value.trim();
  const ubicacion   = document.getElementById('expositor-ubicacion').value.trim();
  const logo        = document.getElementById('expositor-logo').value.trim();
  const video       = document.getElementById('expositor-video').value.trim();

  if (!nombre || !rubro || !ubicacion) { alert('Completa nombre, rubro y ubicación'); return; }

  const row = document.createElement('tr');
  row.innerHTML = `
    <td><input type="text" value="${nombre}"   class="exp-nombre"></td>
    <td><input type="text" value="${rubro}"    class="exp-rubro"></td>
    <td><input type="text" value="${ubicacion}"class="exp-ubicacion"></td>
    <td><button type="button" class="btn-danger btn-eliminar">Eliminar</button></td>
    <td style="display:none;"><input type="text" value="${descripcion}" class="exp-descripcion"></td>
    <td style="display:none;"><input type="text" value="${logo}"        class="exp-logo"></td>
    <td style="display:none;"><input type="text" value="${video}"       class="exp-video"></td>
  `;
  row.querySelector('.btn-eliminar').addEventListener('click', () => row.remove());
  document.getElementById('expositores-rows').appendChild(row);
  cerrarModalExpositor();
}

// ─── GALERÍA ───
function abrirModalImagen() {
  document.getElementById('form-imagen').reset();
  const fb = document.getElementById('feedback-galeria');
  if (fb) { fb.className = 'upload-feedback'; fb.style.display = 'none'; }
  const wrap = document.getElementById('preview-galeria-img-wrap');
  if (wrap) wrap.style.display = 'none';
  document.getElementById('modal-imagen').style.display = 'flex';
}
function cerrarModalImagen() { document.getElementById('modal-imagen').style.display = 'none'; }
function agregarImagenDelModal() {
  const url   = document.getElementById('imagen-url').value.trim();
  const orden = document.getElementById('imagen-orden').value || '0';

  if (!url) { alert('Ingresa o sube una imagen'); return; }

  const row = document.createElement('tr');
  row.innerHTML = `
    <td>
      <img src="${url}" alt="img"
           style="width:64px;height:48px;object-fit:cover;border-radius:6px;border:1px solid #eee;"
           onerror="this.style.display='none'">
    </td>
    <td><input type="text"   value="${url}"   class="gal-url"   style="width:100%;max-width:220px;padding:6px;border:1px solid #ddd;border-radius:4px;font-size:12px;"></td>
    <td><input type="number" value="${orden}" class="gal-orden" style="width:60px;padding:6px;border:1px solid #ddd;border-radius:4px;font-size:12px;"></td>
    <td><button type="button" class="btn-danger btn-eliminar">Eliminar</button></td>
  `;
  row.querySelector('.btn-eliminar').addEventListener('click', () => row.remove());
  row.querySelector('.gal-url').addEventListener('input', (e) => {
    row.querySelector('img').src = e.target.value;
  });
  document.getElementById('galeria-rows').appendChild(row);
  cerrarModalImagen();
}
