/**
 * modals-expositores.js - Gestión del modal de expositores
 */
import { subirImagen } from './uploadManager.js';
import { programarActualizacion } from './previewManager.js';

let filaEnEdicion = null;

export function abrirModalExpositor() {
  filaEnEdicion = null;
  document.getElementById('form-expositor')?.reset();
  const fb = document.getElementById('feedback-expositor-img');
  if (fb) { fb.className = 'upload-feedback'; fb.style.display = 'none'; }
  const lista = document.getElementById('expositorImagenesLista');
  if (lista) lista.innerHTML = '';
  document.getElementById('modal-expositor').style.display = 'flex';
}

export function cerrarModalExpositor() { 
  document.getElementById('modal-expositor').style.display = 'none'; 
}

export function agregarExpositorDelModal(notificar) {
  const nombre      = document.getElementById('expositor-nombre').value.trim();
  const rubro       = document.getElementById('expositor-rubro').value.trim();
  const descripcion = document.getElementById('expositor-descripcion').value.trim();
  const ubicacion   = document.getElementById('expositor-ubicacion').value.trim();
  const video       = document.getElementById('expositor-video').value.trim();

  const urls = Array.from(document.querySelectorAll('#expositorImagenesLista .expositor-img-url')).map(i => i.value.trim()).filter(u => u);
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

    // Actualizar badges visuales en la tabla
    const urls = JSON.parse(imagenesJSON || '[]');
    const numImg = urls.length;
    const imgBadge = numImg > 0 ? `<span class="badge" style="background:#27ae60; color:white; padding:2px 6px; border-radius:4px; font-size:11px;">${numImg} img</span>` : '<span style="color:#ccc;">-</span>';
    const videoBadge = video ? `<span class="badge" style="background:#3498db; color:white; padding:2px 6px; border-radius:4px; font-size:11px;">SÍ</span>` : '<span style="color:#ccc;">-</span>';
    
    const cells = filaEnEdicion.querySelectorAll('td');
    if (cells.length >= 5) {
        cells[3].innerHTML = imgBadge;
        cells[4].innerHTML = videoBadge;
    }
  } else {
    crearFilaExpositor(nombre, rubro, ubicacion, descripcion, imagenesJSON, video);
  }
  
  programarActualizacion();
  if (notificar) notificar();
  cerrarModalExpositor();
}

export function crearFilaExpositor(nombre, rubro, ubicacion, descripcion, imagenesJSON, video) {
    const row = document.createElement('tr');
    const urls = JSON.parse(imagenesJSON || '[]');
    const numImg = urls.length;
    const imgBadge = numImg > 0 ? `<span class="badge" style="background:#27ae60; color:white; padding:2px 6px; border-radius:4px; font-size:11px;">${numImg} img</span>` : '<span style="color:#ccc;">-</span>';
    const videoBadge = video ? `<span class="badge" style="background:#3498db; color:white; padding:2px 6px; border-radius:4px; font-size:11px;">SÍ</span>` : '<span style="color:#ccc;">-</span>';

    row.innerHTML = `
      <td data-label="Nombre"><input type="text" value="${nombre}" class="exp-nombre"></td>
      <td data-label="Categoría"><input type="text" value="${rubro}" class="exp-rubro"></td>
      <td data-label="Ubicación"><input type="text" value="${ubicacion}" class="exp-ubicacion"></td>
      <td data-label="Imágenes" style="text-align:center;">${imgBadge}</td>
      <td data-label="Video" style="text-align:center;">${videoBadge}</td>
      <td data-label="Acción">
        <div class="acciones-tabla">
          <button type="button" class="btn-warning btn-editar"><i class="fas fa-pen"></i></button>
          <button type="button" class="btn-danger btn-eliminar"><i class="fas fa-trash"></i></button>
        </div>
      </td>
      <td style="display:none;"><input type="text" value="${descripcion}" class="exp-descripcion"></td>
      <td style="display:none;"><input type="text" value='${imagenesJSON}' class="exp-imagenes"></td>
      <td style="display:none;"><input type="text" value="${video}" class="exp-video"></td>
    `;
    row.querySelector('.btn-eliminar').onclick = () => row.remove();
    row.querySelector('.btn-editar').onclick = () => editarExpositor(row);
    document.getElementById('expositores-rows').appendChild(row);
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
  row.style.marginBottom = '8px';
  row.innerHTML = `
    <input type="text" class="expositor-img-url" placeholder="URL de imagen" value="${initialUrl || ''}" style="flex:1;">
    <button type="button" class="btn-secondary btn-subir-row">Subir</button>
    <button type="button" class="btn-danger btn-eliminar-row">X</button>
  `;
  row.querySelector('.btn-subir-row').onclick = async () => {
    const fileInput = document.createElement('input');
    fileInput.type = 'file'; fileInput.accept = 'image/*';
    fileInput.onchange = async (e) => {
      const url = await subirImagen(e.target.files[0], 'feedback-expositor-img');
      if (url) row.querySelector('.expositor-img-url').value = url;
    };
    fileInput.click();
  };
  row.querySelector('.btn-eliminar-row').onclick = () => row.remove();
  lista.appendChild(row);
}

export function setupExpositorUploads() {
  const btn = document.getElementById('btn-subir-expositor-multi');
  if (!btn) return;
  btn.onclick = () => {
    const fileInput = document.createElement('input');
    fileInput.type = 'file'; fileInput.accept = 'image/*';
    fileInput.multiple = true;
    fileInput.onchange = async (e) => {
      const files = Array.from(e.target.files);
      for (const f of files) {
        const url = await subirImagen(f, 'feedback-expositor-img', btn);
        if (url) addExpositorImageRow(url);
      }
    };
    fileInput.click();
  };
  
  const btnAddUrl = document.getElementById('btnAgregarImagenExpositor');
  if (btnAddUrl) btnAddUrl.onclick = () => addExpositorImageRow('');

  const btnVideo = document.getElementById('btn-subir-expositor-video');
  if (btnVideo) {
    btnVideo.onclick = () => {
        const fileInput = document.createElement('input');
        fileInput.type = 'file'; 
        fileInput.accept = 'video/mp4,video/webm,video/ogg,video/quicktime';
        fileInput.onchange = async (e) => {
            const url = await subirImagen(e.target.files[0], 'feedback-expositor-img', btnVideo);
            if (url) {
                const vidInput = document.getElementById('expositor-video');
                if (vidInput) vidInput.value = url;
            }
        };
        fileInput.click();
    };
  }
}



