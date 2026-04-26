/**
 * modals-actividades.js - Gestión del modal de actividades
 */
import { subirImagen } from './uploadManager.js';
import { programarActualizacion } from './previewManager.js';

let filaEnEdicion = null;

export function abrirModalActividad() {
  filaEnEdicion = null;
  document.getElementById('form-actividad')?.reset();
  if (document.getElementById('actividad-enlace-group')) document.getElementById('actividad-enlace-group').style.display = 'none';
  const fb = document.getElementById('feedback-actividad-img');
  if (fb) { fb.className = 'upload-feedback'; fb.style.display = 'none'; }
  const lista = document.getElementById('actividadImagenesLista');
  if (lista) lista.innerHTML = '';
  document.getElementById('modal-actividad').style.display = 'flex';
}

export function cerrarModalActividad() { 
  document.getElementById('modal-actividad').style.display = 'none'; 
}

export function agregarActividadDelModal(notificar) {
  const titulo      = document.getElementById('actividad-titulo').value.trim();
  const tipo        = document.getElementById('actividad-tipo').value.trim();
  const descripcion = document.getElementById('actividad-descripcion').value.trim();
  const fecha       = document.getElementById('actividad-fecha').value;
  const hora        = document.getElementById('actividad-hora').value;
  const lugar       = document.getElementById('actividad-lugar').value.trim();
  const imagenes = Array.from(document.querySelectorAll('#actividadImagenesLista .actividad-img-url')).map(i => i.value.trim()).filter(u => u);
  const esGratis    = document.getElementById('actividad-es-gratis').checked;
  const reqOnline   = document.getElementById('actividad-requiere-online').checked;
  const soloOnline  = document.getElementById('actividad-solo-online').checked;
  const enlace      = document.getElementById('actividad-enlace').value.trim();
  const video       = document.getElementById('actividad-video')?.value.trim() || '';

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
    filaEnEdicion.querySelector('.act-descripcion').value = descripcion;
    filaEnEdicion.querySelector('.act-imagenes').value = JSON.stringify(imagenes);
    filaEnEdicion.querySelector('.act-requiere-online').setAttribute('data-value', reqOnline);
    filaEnEdicion.querySelector('.act-solo-online').setAttribute('data-value', soloOnline);
    filaEnEdicion.querySelector('.act-enlace').value = enlace;
    const vidInpt = filaEnEdicion.querySelector('.act-video');
    if (vidInpt) vidInpt.value = video;

    // Actualizar badges visuales en la tabla
    const numImg = imagenes.length;
    const imgBadge = numImg > 0 ? `<span class="badge" style="background:#27ae60; color:white; padding:2px 6px; border-radius:4px; font-size:11px;">${numImg} img</span>` : '<span style="color:#ccc;">-</span>';
    const isOnline = reqOnline || soloOnline;
    const onlineBadge = isOnline ? `<span class="badge" style="background:#3498db; color:white; padding:2px 6px; border-radius:4px; font-size:11px;">SÍ</span>` : '<span style="color:#ccc;">-</span>';
    const videoBadge = video ? `<span class="badge" style="background:#f39c12; color:white; padding:2px 6px; border-radius:4px; font-size:11px;">SÍ</span>` : '<span style="color:#ccc;">-</span>';
    
    const cells = filaEnEdicion.querySelectorAll('td');
    if (cells.length >= 9) {
        cells[5].innerHTML = imgBadge;
        cells[6].innerHTML = videoBadge;
        cells[7].innerHTML = onlineBadge;
    }
  } else {
    crearFilaActividad(titulo, tipo, fecha, hora, lugar, esGratis, descripcion, imagenes, reqOnline, enlace, soloOnline, video);
  }
  
  programarActualizacion();
  if (notificar) notificar();
  cerrarModalActividad();
}

export function crearFilaActividad(titulo, tipo, fecha, hora, lugar, esGratis, descripcion, imagenes, reqOnline, enlace, soloOnline, video = '') {
    const numImg = (imagenes || []).length;
    const imgBadge = numImg > 0 ? `<span class="badge" style="background:#27ae60; color:white; padding:2px 6px; border-radius:4px; font-size:11px;">${numImg} img</span>` : '<span style="color:#ccc;">-</span>';
    const isOnline = reqOnline || soloOnline;
    const onlineBadge = isOnline ? `<span class="badge" style="background:#3498db; color:white; padding:2px 6px; border-radius:4px; font-size:11px;">SÍ</span>` : '<span style="color:#ccc;">-</span>';
    const videoBadge = video ? `<span class="badge" style="background:#f39c12; color:white; padding:2px 6px; border-radius:4px; font-size:11px;">SÍ</span>` : '<span style="color:#ccc;">-</span>';

    const row = document.createElement('tr');
    row.innerHTML = `
      <td data-label="Título"><input type="text" value="${titulo}" class="act-titulo"></td>
      <td data-label="Tipo"><input type="text" value="${tipo}"   class="act-tipo"></td>
      <td data-label="Fecha"><input type="date" value="${fecha}"  class="act-fecha"></td>
      <td data-label="Hora"><input type="time" value="${hora}"   class="act-hora"></td>
      <td data-label="Lugar"><input type="text" value="${lugar}"  class="act-lugar" placeholder="Lugar/escenario"></td>
      <td data-label="Imágenes" style="text-align:center;">${imgBadge}</td>
      <td data-label="Video" style="text-align:center;">${videoBadge}</td>
      <td data-label="Online" style="text-align:center;">${onlineBadge}</td>
      <td data-label="Gratis" style="text-align:center;font-size:18px;">
          <span class="act-gratis" data-value="${esGratis}">${esGratis ? '✅' : '❌'}</span>
      </td>
      <td data-label="Acción">
        <div class="acciones-tabla">
          <button type="button" class="btn-warning btn-editar" title="Editar"><i class="fas fa-pen"></i></button>
          <button type="button" class="btn-danger btn-eliminar" title="Eliminar"><i class="fas fa-trash"></i></button>
        </div>
      </td>
      <td style="display:none;"><input type="text" value="${descripcion}" class="act-descripcion"></td>
      <td style="display:none;"><input type="text" value='${JSON.stringify(imagenes)}' class="act-imagenes"></td>
      <td style="display:none;"><span class="act-requiere-online" data-value="${reqOnline}"></span></td>
      <td style="display:none;"><span class="act-solo-online" data-value="${soloOnline}"></span></td>
      <td style="display:none;"><input type="text" value="${enlace}" class="act-enlace"></td>
      <td style="display:none;"><input type="text" value="${video}" class="act-video"></td>
    `;
    row.querySelector('.btn-eliminar').addEventListener('click', () => row.remove());
    row.querySelector('.btn-editar').addEventListener('click', () => {
        filaEnEdicion = row;
        document.getElementById('actividad-titulo').value = row.querySelector('.act-titulo').value;
        document.getElementById('actividad-tipo').value = row.querySelector('.act-tipo').value;
        document.getElementById('actividad-fecha').value = row.querySelector('.act-fecha').value;
        document.getElementById('actividad-hora').value = row.querySelector('.act-hora').value;
        document.getElementById('actividad-lugar').value = row.querySelector('.act-lugar').value;
        document.getElementById('actividad-descripcion').value = row.querySelector('.act-descripcion').value;
        
        const reqOnlineVal = row.querySelector('.act-requiere-online').getAttribute('data-value') === 'true';
        const soloOnlineVal = row.querySelector('.act-solo-online')?.getAttribute('data-value') === 'true';
        document.getElementById('actividad-requiere-online').checked = reqOnlineVal;
        document.getElementById('actividad-solo-online').checked = soloOnlineVal;
        document.getElementById('actividad-es-gratis').checked = row.querySelector('.act-gratis').getAttribute('data-value') === 'true';
        const enlaceGrp = document.getElementById('actividad-enlace-group');
        if (enlaceGrp) enlaceGrp.style.display = (reqOnlineVal || soloOnlineVal) ? 'block' : 'none';
        document.getElementById('actividad-enlace').value = row.querySelector('.act-enlace').value;
        const vidInpt = document.getElementById('actividad-video');
        if (vidInpt) vidInpt.value = row.querySelector('.act-video')?.value || '';

        const lista = document.getElementById('actividadImagenesLista');
        if (lista) {
            lista.innerHTML = '';
            try {
                const imgs = JSON.parse(row.querySelector('.act-imagenes').value || '[]');
                imgs.forEach(url => addActividadImageRow(url));
            } catch(e) {}
        }
        document.getElementById('modal-actividad').style.display = 'flex';
    });
    document.getElementById('actividades-rows').appendChild(row);
}

export function addActividadImageRow(initialUrl) {
  const lista = document.getElementById('actividadImagenesLista');
  if (!lista) return;
  const row = document.createElement('div');
  row.style.display = 'flex'; row.style.gap = '8px'; row.style.marginBottom = '8px';
  row.innerHTML = `
    <input type="text" class="actividad-img-url" placeholder="URL" value="${initialUrl || ''}" style="flex:1;">
    <button type="button" class="btn-secondary btn-subir-row">Subir</button>
    <button type="button" class="btn-danger btn-eliminar-row">X</button>
  `;
  row.querySelector('.btn-subir-row').onclick = () => {
    const fileInput = document.createElement('input');
    fileInput.type = 'file'; fileInput.accept = 'image/*';
    fileInput.onchange = async (e) => {
      const url = await subirImagen(e.target.files[0], 'feedback-actividad-img');
      if (url) row.querySelector('.actividad-img-url').value = url;
    };
    fileInput.click();
  };
  row.querySelector('.btn-eliminar-row').onclick = () => row.remove();
  lista.appendChild(row);
}

export function setupActividadUploads() {
  const btn = document.getElementById('btn-subir-actividad-multi');
  if (!btn) return;
  btn.onclick = () => {
    const fileInput = document.createElement('input');
    fileInput.type = 'file'; fileInput.accept = 'image/*';
    fileInput.multiple = true;
    fileInput.onchange = async (e) => {
      const files = Array.from(e.target.files);
      for (const f of files) {
        const url = await subirImagen(f, 'feedback-actividad-img', btn);
        if (url) addActividadImageRow(url);
      }
    };
    fileInput.click();
  };
  
  const btnAddUrl = document.getElementById('btnAgregarImagenActividad');
  if (btnAddUrl) btnAddUrl.onclick = () => addActividadImageRow('');

  const checkOnline = document.getElementById('actividad-requiere-online');
  const checkSoloOnline = document.getElementById('actividad-solo-online');
  const enlaceGrp = document.getElementById('actividad-enlace-group');

  if (checkOnline) {
    checkOnline.onchange = (e) => {
      if (enlaceGrp) {
          enlaceGrp.style.display = (e.target.checked || (checkSoloOnline && checkSoloOnline.checked)) ? 'block' : 'none';
      }
    };
  }
  if (checkSoloOnline) {
    checkSoloOnline.onchange = (e) => {
      if (e.target.checked) {
          if (checkOnline) checkOnline.checked = true;
          if (enlaceGrp) enlaceGrp.style.display = 'block';
      } else {
          // Si quitamos solo online, verificamos si aún requiere online
          if (enlaceGrp) enlaceGrp.style.display = (checkOnline && checkOnline.checked) ? 'block' : 'none';
      }
    };
  }

  const btnVideo = document.getElementById('btn-subir-actividad-video');
  if (btnVideo) {
    btnVideo.onclick = () => {
        const fileInput = document.createElement('input');
        fileInput.type = 'file'; 
        fileInput.accept = 'video/mp4,video/webm,video/ogg,video/quicktime';
        fileInput.onchange = async (e) => {
            const url = await subirImagen(e.target.files[0], 'feedback-actividad-img', btnVideo);
            if (url) {
                const vidInput = document.getElementById('actividad-video');
                if (vidInput) vidInput.value = url;
            }
        };
        fileInput.click();
    };
  }
}



