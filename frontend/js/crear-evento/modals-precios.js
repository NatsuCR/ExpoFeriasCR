/**
 * modals-precios.js - Gestión del modal de precios
 */
import { programarActualizacion } from './previewManager.js';

let filaEnEdicion = null;

export function abrirModalPrecio() {
  const tipoVenta = document.getElementById('tipo_venta')?.value;
  if (tipoVenta === 'gratis') {
    if (typeof window.mostrarAlertaPremium === 'function') {
        window.mostrarAlertaPremium(
            'Evento Gratuito',
            'Has configurado este evento como "Entrada Gratuita". No es necesario agregar precios ya que la sección de entradas no se mostrará al público.',
            'Entendido',
            'fas fa-ticket-alt'
        );
    } else {
        alert('Has configurado el evento como "Entrada Gratuita". No es necesario (ni posible) agregar precios.');
    }
    return;
  }
  filaEnEdicion = null;
  document.getElementById('form-precio')?.reset();
  document.getElementById('modal-precio').style.display = 'flex';
}

export function cerrarModalPrecio() { 
  document.getElementById('modal-precio').style.display = 'none'; 
}

export function agregarPrecioDelModal(notificar) {
  const fecha       = document.getElementById('precio-fecha').value;
  const monto       = document.getElementById('precio-monto').value;
  const promocion   = document.getElementById('precio-promocion').value || 'no';
  const descripcion = document.getElementById('precio-descripcion').value;
  if (!fecha || !monto) { alert('Completa fecha y precio'); return; }

  if (filaEnEdicion) {
    filaEnEdicion.querySelector('.precio-fecha').value = fecha;
    filaEnEdicion.querySelector('.precio-monto').value = monto;
    filaEnEdicion.querySelector('.precio-promocion').value = promocion;
    filaEnEdicion.querySelector('.precio-descripcion').value = descripcion;
  } else {
    crearFilaPrecio(fecha, monto, promocion, descripcion);
  }
  
  programarActualizacion();
  if (notificar) notificar();
  cerrarModalPrecio();
}

export function crearFilaPrecio(fecha, monto, promocion, descripcion) {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td data-label="Fecha"><input type="date" value="${fecha}" class="precio-fecha"></td>
      <td data-label="Normal (₡)"><input type="number" value="${monto}" class="precio-monto"></td>
      <td data-label="Promoción"><input type="text"   value="${promocion}" class="precio-promocion"></td>
      <td data-label="Descripción"><input type="text"   value="${descripcion}" class="precio-descripcion"></td>
      <td data-label="Acción">
        <div class="acciones-tabla">
          <button type="button" class="btn-warning btn-editar" title="Editar"><i class="fas fa-pen"></i></button>
          <button type="button" class="btn-danger btn-eliminar" title="Eliminar"><i class="fas fa-trash"></i></button>
        </div>
      </td>
    `;
    row.querySelector('.btn-eliminar').addEventListener('click', () => row.remove());
    row.querySelector('.btn-editar').addEventListener('click', () => {
        filaEnEdicion = row;
        document.getElementById('precio-fecha').value = row.querySelector('.precio-fecha').value;
        document.getElementById('precio-monto').value = row.querySelector('.precio-monto').value;
        document.getElementById('precio-promocion').value = row.querySelector('.precio-promocion').value;
        document.getElementById('precio-descripcion').value = row.querySelector('.precio-descripcion').value;
        document.getElementById('modal-precio').style.display = 'flex';
    });
    document.getElementById('precios-rows').appendChild(row);
}

export function duplicarUltimoPrecio(notificar) {
  const tipoVenta = document.getElementById('tipo_venta')?.value;
  if (tipoVenta === 'gratis') {
    if (typeof window.mostrarAlertaPremium === 'function') {
        window.mostrarAlertaPremium('Operación no permitida', 'El evento es gratuito, no puedes agregar precios.', 'Cerrar', 'fas fa-exclamation-circle');
    } else {
        alert('El evento es gratuito, no puedes agregar precios.');
    }
    return;
  }
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

  if (!fechaStr) { alert('El último precio no tiene fecha.'); return; }

  const date = new Date(fechaStr + 'T12:00:00');
  date.setDate(date.getDate() + 1);
  const nextDateStr = date.toISOString().split('T')[0];

  crearFilaPrecio(nextDateStr, monto, promo, desc);
  programarActualizacion();
  if (notificar) notificar();
}



