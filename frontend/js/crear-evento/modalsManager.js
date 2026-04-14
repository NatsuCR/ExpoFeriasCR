/**
 * modalsManager.js
 * Gestiona todos los modales (Precio, Actividad, Expositor, Galería)
 */

import { subirImagen } from './uploadManager.js';
import { programarActualizacion } from './previewManager.js';

// ─── PRECIO ───
export function abrirModalPrecio() {
  document.getElementById('form-precio').reset();
  document.getElementById('modal-precio').style.display = 'flex';
}

export function cerrarModalPrecio() { 
  document.getElementById('modal-precio').style.display = 'none'; 
}

export function agregarPrecioDelModal() {
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
  programarActualizacion();
  cerrarModalPrecio();
}

// ─── ACTIVIDAD ───
export function abrirModalActividad() {
  document.getElementById('form-actividad').reset();
  document.getElementById('actividad-enlace-group').style.display = 'none';
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
  programarActualizacion();
  cerrarModalActividad();
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

// ─── EXPOSITOR ───
export function abrirModalExpositor() {
  document.getElementById('form-expositor').reset();
  const fb = document.getElementById('feedback-logo');
  if (fb) { fb.className = 'upload-feedback'; fb.style.display = 'none'; }
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
  programarActualizacion();
  cerrarModalExpositor();
}

// ─── GALERÍA ───
export function abrirModalImagen() {
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
  programarActualizacion();
  cerrarModalImagen();
}
