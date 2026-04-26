/**
 * modals-galeria.js - Gestión del modal de galería
 */
import { programarActualizacion } from './previewManager.js';

let filaEnEdicion = null;
let imagenesPendientes = [];

export function abrirModalImagen() {
  filaEnEdicion = null;
  imagenesPendientes = [];
  document.getElementById('form-imagen')?.reset();
  const wrap = document.getElementById('preview-galeria-img-wrap');
  if (wrap) {
    wrap.style.display = 'none';
    wrap.innerHTML = '<div id="pending-gallery-container" style="display:flex; flex-wrap:wrap; gap:10px;"></div>';
  }
  document.getElementById('modal-imagen').style.display = 'flex';
}

export function cerrarModalImagen() { 
  document.getElementById('modal-imagen').style.display = 'none'; 
}

export function addPendingImage(url) {
  if (!url) return;
  imagenesPendientes.push(url);
  const wrap = document.getElementById('preview-galeria-img-wrap');
  const container = document.getElementById('pending-gallery-container');
  if (wrap && container) {
    wrap.style.display = 'block';
    const img = document.createElement('img');
    img.src = url;
    img.style.width = '80px';
    img.style.height = '60px';
    img.style.objectFit = 'cover';
    img.style.borderRadius = '4px';
    img.style.border = '1px solid #ddd';
    container.appendChild(img);
  }
}

export function agregarImagenDelModal(notificar) {
  const urlInput = document.getElementById('imagen-url').value.trim();
  const orden = document.getElementById('imagen-orden')?.value || '0';

  // Si estamos editando una fila existente
  if (filaEnEdicion) {
    const finalUrl = urlInput || (imagenesPendientes.length > 0 ? imagenesPendientes[0] : '');
    if (!finalUrl) { alert('Ingresa o sube una imagen'); return; }
    
    filaEnEdicion.querySelector('.gal-url').value = finalUrl;
    if (filaEnEdicion.querySelector('.gal-orden')) filaEnEdicion.querySelector('.gal-orden').value = orden;
    const imgEl = filaEnEdicion.querySelector('img');
    if (imgEl) imgEl.src = finalUrl;
  } else {
    // Si estamos agregando nuevas
    const todasLasUrls = [...imagenesPendientes];
    if (urlInput) todasLasUrls.push(urlInput);

    if (todasLasUrls.length === 0) { alert('Ingresa o sube al menos una imagen'); return; }

    todasLasUrls.forEach(url => addGalleryRow(url, orden));
  }
  
  programarActualizacion();
  if (notificar) notificar();
  cerrarModalImagen();
}

export function addGalleryRow(url, orden = '0') {
  const row = document.createElement('tr');
  row.innerHTML = `
    <td data-label="Vista Previa"><img src="${url}" style="width:64px;height:48px;object-fit:cover;border-radius:6px;"></td>
    <td data-label="URL"><input type="text" value="${url}" class="gal-url" style="width:100%;"></td>
    <td data-label="Orden"><input type="number" value="${orden}" class="gal-orden" style="width:60px;"></td>
    <td data-label="Acción">
      <div class="acciones-tabla">
        <button type="button" class="btn-warning btn-editar"><i class="fas fa-pen"></i></button>
        <button type="button" class="btn-danger btn-eliminar"><i class="fas fa-trash"></i></button>
      </div>
    </td>
  `;
  row.querySelector('.btn-eliminar').onclick = () => row.remove();
  row.querySelector('.btn-editar').onclick = () => {
      filaEnEdicion = row;
      document.getElementById('imagen-url').value = row.querySelector('.gal-url').value;
      if (document.getElementById('imagen-orden')) document.getElementById('imagen-orden').value = row.querySelector('.gal-orden').value;
      document.getElementById('modal-imagen').style.display = 'flex';
  };
  document.getElementById('galeria-rows').appendChild(row);
  programarActualizacion();
}



