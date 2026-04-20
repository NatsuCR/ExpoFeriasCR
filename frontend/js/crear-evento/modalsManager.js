import { programarActualizacion } from './previewManager.js';
import { subirImagen } from './uploadManager.js';

let filaEnEdicion = null;
let onModalConfirmadoCallback = null;

export function registrarOnModalConfirmado(callback) {
  onModalConfirmadoCallback = callback;
}

function notificarConfirmacion() {
  console.log('[modalsManager] Datos confirmados en tabla');
  if (onModalConfirmadoCallback) onModalConfirmadoCallback();
}

// ─── PRECIOS ───
export function abrirModalPrecio() {
  filaEnEdicion = null;
  document.getElementById('form-precio').reset();
  document.getElementById('modal-precio').style.display = 'flex';
}

export function cerrarModalPrecio() {
  document.getElementById('modal-precio').style.display = 'none';
}

export function agregarPrecioDelModal() {
  const fecha = document.getElementById('precio-fecha').value;
  const monto = document.getElementById('precio-monto').value;
  const promo = document.getElementById('precio-promocion').value.trim();
  const desc  = document.getElementById('precio-descripcion').value.trim();

  if (!fecha || !monto) { alert('Completa fecha y monto'); return; }

  if (filaEnEdicion) {
    filaEnEdicion.querySelector('.precio-fecha').value = fecha;
    filaEnEdicion.querySelector('.precio-monto').value = monto;
    filaEnEdicion.querySelector('.precio-promocion').value = promo;
    filaEnEdicion.querySelector('.precio-descripcion').value = desc;
  } else {
    crearFilaPrecio(fecha, monto, promo, desc);
  }

  programarActualizacion();
  notificarConfirmacion();
  cerrarModalPrecio();
}

function crearFilaPrecio(fecha, monto, promo, desc) {
  const row = document.createElement('tr');
  row.innerHTML = `
    <td><input type="date" value="${fecha}" class="precio-fecha"></td>
    <td><input type="number" value="${monto}" class="precio-monto"></td>
    <td><input type="text" value="${promo}" class="precio-promocion" placeholder="ej: 2x1"></td>
    <td><input type="text" value="${desc}" class="precio-descripcion" placeholder="Detalle"></td>
    <td>
      <div class="acciones-tabla">
        <button type="button" class="btn-warning btn-editar" title="Editar"><i class="fas fa-pen"></i></button>
        <button type="button" class="btn-danger btn-eliminar" title="Eliminar"><i class="fas fa-trash"></i></button>
      </div>
    </td>
  `;
  row.querySelector('.btn-eliminar').addEventListener('click', () => row.remove());
  row.querySelector('.btn-editar').addEventListener('click', () => editarPrecio(row));
  document.getElementById('precios-rows').appendChild(row);
}

export function duplicarUltimoPrecio() {
  const rows = document.querySelectorAll('#precios-rows tr');
  if (rows.length === 0) {
    alert('No hay precios que duplicar. Agrega uno primero.');
    return;
  }

  const lastRow = rows[rows.length - 1];
  const fechaStr = lastRow.querySelector('.precio-fecha').value;
  const monto = lastRow.querySelector('.precio-monto').value;
  const promo = lastRow.querySelector('.precio-promocion').value;
  const desc = lastRow.querySelector('.precio-descripcion').value;

  if (!fechaStr) {
    alert('El último precio no tiene fecha.');
    return;
  }

  // Sumar 1 día a la fecha
  const date = new Date(fechaStr + 'T12:00:00');
  date.setDate(date.getDate() + 1);
  const nextDateStr = date.toISOString().split('T')[0];

  crearFilaPrecio(nextDateStr, monto, promo, desc);
  
  programarActualizacion();
  notificarConfirmacion();
}

export function editarPrecio(row) {
  filaEnEdicion = row;
  document.getElementById('precio-fecha').value = row.querySelector('.precio-fecha').value;
  document.getElementById('precio-monto').value = row.querySelector('.precio-monto').value;
  document.getElementById('precio-promocion').value = row.querySelector('.precio-promocion').value;
  document.getElementById('precio-descripcion').value = row.querySelector('.precio-descripcion').value;
  document.getElementById('modal-precio').style.display = 'flex';
}

// ─── ACTIVIDAD ───
export function abrirModalActividad() {
  filaEnEdicion = null;
  document.getElementById('form-actividad').reset();
  const fb = document.getElementById('feedback-actividad-img');
  if (fb) { fb.className = 'upload-feedback'; fb.style.display = 'none'; }
  const lista = document.getElementById('actividadImagenesLista');
  if (lista) lista.innerHTML = '';
  document.getElementById('modal-actividad').style.display = 'flex';
}

export function cerrarModalActividad() { 
  document.getElementById('modal-actividad').style.display = 'none'; 
}

export function agregarActividadDelModal() {
  const titulo      = document.getElementById('actividad-titulo').value.trim();
  const tipo        = document.getElementById('actividad-tipo').value.trim();
  const fecha       = document.getElementById('actividad-fecha').value;
  const hora        = document.getElementById('actividad-hora').value;
  const lugar       = document.getElementById('actividad-lugar').value.trim();
  const descripcion = document.getElementById('actividad-descripcion').value.trim();
  const esGratis    = document.getElementById('actividad-es-gratis').checked;
  const reqOnline   = document.getElementById('actividad-requiere-online').checked;
  const enlace      = document.getElementById('actividad-enlace').value.trim();

  // Recopilar imagenes
  const imagenes = [];
  document.querySelectorAll('.actividad-img-url').forEach(inpt => {
    const val = inpt.value.trim();
    if (val) imagenes.push(val);
  });

  if (!titulo || !tipo || !fecha) { alert('Completa título, tipo y fecha'); return; }

  if (filaEnEdicion) {
    filaEnEdicion.querySelector('.act-titulo').value = titulo;
    filaEnEdicion.querySelector('.act-tipo').value = tipo;
    filaEnEdicion.querySelector('.act-fecha').value = fecha;
    filaEnEdicion.querySelector('.act-hora').value = hora;
    filaEnEdicion.querySelector('.act-lugar').value = lugar;
    const spanGratis = filaEnEdicion.querySelector('.act-gratis');
    spanGratis.setAttribute('data-value', esGratis);
    spanGratis.textContent = esGratis ? '✅' : '❌';
    
    // Actualizar descripción visible
    const descCell = filaEnEdicion.querySelectorAll('td')[5];
    if (descCell) {
        descCell.innerHTML = `<div style="max-width:200px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;" title="${descripcion}">${descripcion || '-'}</div>`;
    }

    filaEnEdicion.querySelector('.act-descripcion').value = descripcion;
    const imgInpt = filaEnEdicion.querySelector('.act-imagenes');
    if (imgInpt) imgInpt.value = JSON.stringify(imagenes);
    filaEnEdicion.querySelector('.act-requiere-online').setAttribute('data-value', reqOnline);
    filaEnEdicion.querySelector('.act-enlace').value = enlace;
  } else {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td><input type="text" value="${titulo}" class="act-titulo"></td>
      <td><input type="text" value="${tipo}"   class="act-tipo"></td>
      <td><input type="date" value="${fecha}"  class="act-fecha"></td>
      <td><input type="time" value="${hora}"   class="act-hora"></td>
      <td><input type="text" value="${lugar}"  class="act-lugar" placeholder="Lugar/escenario"></td>
      <td>
        <div style="max-width:150px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;" title="${descripcion.replace(/"/g, '&quot;')}">
          ${descripcion || '<span style="color:#ccc;">-</span>'}
        </div>
      </td>
      <td style="text-align:center;font-size:18px;">
          <span class="act-gratis" data-value="${esGratis}">${esGratis ? '✅' : '❌'}</span>
      </td>
      <td>
        <div class="acciones-tabla">
          <button type="button" class="btn-warning btn-editar" title="Editar"><i class="fas fa-pen"></i></button>
          <button type="button" class="btn-danger btn-eliminar" title="Eliminar"><i class="fas fa-trash"></i></button>
        </div>
      </td>
      <td style="display:none;"><input type="text" value="${descripcion}" class="act-descripcion"></td>
      <td style="display:none;"><input type="text" value='${JSON.stringify(imagenes)}' class="act-imagenes"></td>
      <td style="display:none;"><span class="act-requiere-online" data-value="${reqOnline}"></span></td>
      <td style="display:none;"><input type="text" value="${enlace}" class="act-enlace"></td>
    `;
    row.querySelector('.btn-eliminar').addEventListener('click', () => row.remove());
    row.querySelector('.btn-editar').addEventListener('click', () => editarActividad(row));
    document.getElementById('actividades-rows').appendChild(row);
  }
  
  programarActualizacion();
  notificarConfirmacion();
  cerrarModalActividad();
}

export function editarActividad(row) {
  filaEnEdicion = row;
  document.getElementById('actividad-titulo').value = row.querySelector('.act-titulo').value;
  document.getElementById('actividad-tipo').value = row.querySelector('.act-tipo').value;
  document.getElementById('actividad-fecha').value = row.querySelector('.act-fecha').value;
  document.getElementById('actividad-hora').value = row.querySelector('.act-hora').value;
  document.getElementById('actividad-lugar').value = row.querySelector('.act-lugar').value;
  document.getElementById('actividad-descripcion').value = row.querySelector('.act-descripcion').value;
  
  const reqOnline = row.querySelector('.act-requiere-online').getAttribute('data-value') === 'true';
  document.getElementById('actividad-requiere-online').checked = reqOnline;
  document.getElementById('actividad-es-gratis').checked = row.querySelector('.act-gratis').getAttribute('data-value') === 'true';
  const enlaceGrp = document.getElementById('actividad-enlace-group');
  if (enlaceGrp) enlaceGrp.style.display = reqOnline ? 'block' : 'none';
  document.getElementById('actividad-enlace').value = row.querySelector('.act-enlace').value;

  const lista = document.getElementById('actividadImagenesLista');
  if (lista) {
    lista.innerHTML = '';
    try {
      const imagenes = JSON.parse(row.querySelector('.act-imagenes').value || '[]');
      imagenes.forEach(url => addActividadImageRow(url));
    } catch(e) {}
  }

  document.getElementById('modal-actividad').style.display = 'flex';
}

export function addActividadImageRow(initialUrl) {
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

export function abrirModalExpositor() {
  filaEnEdicion = null;
  document.getElementById('form-expositor').reset();
  const fb = document.getElementById('feedback-expositor-img');
  if (fb) { fb.className = 'upload-feedback'; fb.style.display = 'none'; }
  const lista = document.getElementById('expositorImagenesLista');
  if (lista) lista.innerHTML = '';
  document.getElementById('modal-expositor').style.display = 'flex';
}

export function cerrarModalExpositor() { 
  document.getElementById('modal-expositor').style.display = 'none'; 
}

export function agregarExpositorDelModal() {
  const nombre      = document.getElementById('expositor-nombre').value.trim();
  const rubro       = document.getElementById('expositor-rubro').value.trim();
  const descripcion = document.getElementById('expositor-descripcion').value.trim();
  const ubicacion   = document.getElementById('expositor-ubicacion').value.trim();
  const video       = document.getElementById('expositor-video').value.trim();

  // Recopilar urls de imagenes
  const urls = [];
  document.querySelectorAll('.expositor-img-url').forEach(inpt => {
    const val = inpt.value.trim();
    if (val) urls.push(val);
  });
  const imagenesJSON = JSON.stringify(urls);

  if (!nombre || !rubro || !ubicacion) { alert('Completa nombre, categoría y ubicación'); return; }

  if (filaEnEdicion) {
    filaEnEdicion.querySelector('.exp-nombre').value = nombre;
    filaEnEdicion.querySelector('.exp-rubro').value = rubro;
    filaEnEdicion.querySelector('.exp-ubicacion').value = ubicacion;
    filaEnEdicion.querySelector('.exp-descripcion').value = descripcion;
    const imgInpt = filaEnEdicion.querySelector('.exp-imagenes');
    if (imgInpt) imgInpt.value = imagenesJSON;
    filaEnEdicion.querySelector('.exp-video').value = video;

    // Actualizar descripción visible
    const descCell = filaEnEdicion.querySelectorAll('td')[3];
    if (descCell) {
        descCell.innerHTML = `<div style="max-width:150px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;" title="${descripcion.replace(/"/g, '&quot;')}">${descripcion || '-'}</div>`;
    }

    // Actualizar badges visuales
    const cells = filaEnEdicion.querySelectorAll('td');
    const numImg = urls.length;
    cells[4].innerHTML = numImg > 0 ? `<span class="badge" style="background:#27ae60; color:white; padding:2px 6px; border-radius:4px; font-size:11px;">${numImg} img</span>` : '<span style="color:#ccc;">-</span>';
    cells[5].innerHTML = video ? `<span class="badge" style="background:#3498db; color:white; padding:2px 6px; border-radius:4px; font-size:11px;">SÍ</span>` : '<span style="color:#ccc;">-</span>';
  } else {
    const row = document.createElement('tr');
    
    // Generar un pequeño badge para las imágenes
    const numImg = urls.length;
    const imgBadge = numImg > 0 ? `<span class="badge" style="background:#27ae60; color:white; padding:2px 6px; border-radius:4px; font-size:11px;">${numImg} img</span>` : '<span style="color:#ccc;">-</span>';
    const videoBadge = video ? `<span class="badge" style="background:#3498db; color:white; padding:2px 6px; border-radius:4px; font-size:11px;">SÍ</span>` : '<span style="color:#ccc;">-</span>';

    row.innerHTML = `
      <td><input type="text" value="${nombre}"   class="exp-nombre"></td>
      <td><input type="text" value="${rubro}"    class="exp-rubro"></td>
      <td><input type="text" value="${ubicacion}"class="exp-ubicacion"></td>
      <td>
        <div style="max-width:150px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;" title="${descripcion.replace(/"/g, '&quot;')}">
          ${descripcion || '<span style="color:#ccc;">-</span>'}
        </div>
      </td>
      <td style="text-align:center;">${imgBadge}</td>
      <td style="text-align:center;">${videoBadge}</td>
      <td>
        <div class="acciones-tabla">
          <button type="button" class="btn-warning btn-editar" title="Editar"><i class="fas fa-pen"></i></button>
          <button type="button" class="btn-danger btn-eliminar" title="Eliminar"><i class="fas fa-trash"></i></button>
        </div>
      </td>
      <td style="display:none;"><input type="text" value="${descripcion}" class="exp-descripcion"></td>
      <td style="display:none;"><input type="text" value='${imagenesJSON}' class="exp-imagenes"></td>
      <td style="display:none;"><input type="text" value="${video}"       class="exp-video"></td>
    `;
    row.querySelector('.btn-eliminar').addEventListener('click', () => row.remove());
    row.querySelector('.btn-editar').addEventListener('click', () => editarExpositor(row));
    document.getElementById('expositores-rows').appendChild(row);
  }
  
  programarActualizacion();
  notificarConfirmacion();
  cerrarModalExpositor();
}

export function editarExpositor(row) {
  filaEnEdicion = row;
  document.getElementById('expositor-nombre').value = row.querySelector('.exp-nombre').value;
  document.getElementById('expositor-rubro').value = row.querySelector('.exp-rubro').value;
  document.getElementById('expositor-ubicacion').value = row.querySelector('.exp-ubicacion').value;
  document.getElementById('expositor-descripcion').value = row.querySelector('.exp-descripcion').value;
  document.getElementById('expositor-video').value = row.querySelector('.exp-video').value;

  const lista = document.getElementById('expositorImagenesLista');
  if (lista) {
    lista.innerHTML = '';
    try {
      const imagenes = JSON.parse(row.querySelector('.exp-imagenes').value || '[]');
      imagenes.forEach(url => addExpositorImageRow(url));
    } catch(e) {}
  }

  document.getElementById('modal-expositor').style.display = 'flex';
}

export function addExpositorImageRow(initialUrl) {
  const lista = document.getElementById('expositorImagenesLista');
  if (!lista) return;
  const row = document.createElement('div');
  row.style.display = 'flex';
  row.style.gap = '8px';
  row.style.alignItems = 'center';
  row.innerHTML = `
    <input type="text" class="expositor-img-url" placeholder="URL de imagen" value="${initialUrl || ''}" style="flex:1;padding:8px;border:1px solid #ddd;border-radius:6px;">
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
      const url = await subirImagen(f, 'feedback-expositor-img', null);
      if (url) row.querySelector('.expositor-img-url').value = url;
      fileInput.remove();
    });
    fileInput.click();
  });
  row.querySelector('.btn-eliminar-row').addEventListener('click', () => row.remove());
  lista.appendChild(row);
}

// ─── GALERÍA ───
export function abrirModalImagen() {
  filaEnEdicion = null;
  document.getElementById('form-imagen').reset();
  const fb = document.getElementById('feedback-galeria');
  if (fb) { fb.className = 'upload-feedback'; fb.style.display = 'none'; }
  const wrap = document.getElementById('preview-galeria-img-wrap');
  if (wrap) wrap.style.display = 'none';
  document.getElementById('modal-imagen').style.display = 'flex';
}

export function cerrarModalImagen() { 
  document.getElementById('modal-imagen').style.display = 'none'; 
}

export function agregarImagenDelModal() {
  const url   = document.getElementById('imagen-url').value.trim();

  if (!url) { alert('Ingresa o sube una imagen'); return; }

  if (filaEnEdicion) {
    filaEnEdicion.querySelector('.gal-url').value = url;
    const imgEl = filaEnEdicion.querySelector('img');
    if (imgEl) imgEl.src = url;
  } else {
    addGalleryRow(url);
  }
  
  programarActualizacion();
  notificarConfirmacion();
  cerrarModalImagen();
}

export function editarImagen(row) {
  filaEnEdicion = row;
  document.getElementById('imagen-url').value = row.querySelector('.gal-url').value;

  const wrap = document.getElementById('preview-galeria-img-wrap');
  const imgPreview = document.getElementById('preview-galeria-img');
  if (wrap && imgPreview) {
    imgPreview.src = document.getElementById('imagen-url').value;
    wrap.style.display = 'block';
  }

  document.getElementById('modal-imagen').style.display = 'flex';
}

export function addGalleryRow(url) {
  const row = document.createElement('tr');
  row.innerHTML = `
    <td>
      <img src="${url}" alt="img"
           style="width:64px;height:48px;object-fit:cover;border-radius:6px;border:1px solid #eee;"
           onerror="this.style.display='none'">
    </td>
    <td><input type="text"   value="${url}"   class="gal-url"   style="width:100%;max-width:220px;padding:6px;border:1px solid #ddd;border-radius:4px;font-size:12px;"></td>
    <td>
      <div class="acciones-tabla">
        <button type="button" class="btn-warning btn-editar" title="Editar"><i class="fas fa-pen"></i></button>
        <button type="button" class="btn-danger btn-eliminar" title="Eliminar"><i class="fas fa-trash"></i></button>
      </div>
    </td>
  `;
  row.querySelector('.btn-eliminar').addEventListener('click', () => row.remove());
  row.querySelector('.btn-editar').addEventListener('click', () => editarImagen(row));
  row.querySelector('.gal-url').addEventListener('input', (e) => {
    row.querySelector('img').src = e.target.value;
  });
  document.getElementById('galeria-rows').appendChild(row);
}
