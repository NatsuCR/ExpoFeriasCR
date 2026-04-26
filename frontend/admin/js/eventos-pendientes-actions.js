/**
 * eventos-pendientes-actions.js - Acciones de aprobación y rechazo
 */

export async function aprobarEvento(eventoId, context) {
    const confirmado = await window.confirmarAccion(
      '¿Aprobar este evento?',
      'Se enviará un correo de notificación al organizador.',
      'Aprobar',
      'confirm-btn-success'
    );
    if (!confirmado) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/admin/eventos-pendientes/${eventoId}/aprobar`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Error al aprobar evento');
      }
      window.mostrarMensaje('✓ Evento aprobado exitosamente.', 'success');
      context.cerrarModalPreview();
      context.cargarEventos();
      setTimeout(() => location.reload(), 1500);
    } catch (error) {
      window.mostrarMensaje('Error: ' + error.message, 'error');
    }
}

export async function confirmarRechazo(context) {
    const razon = document.getElementById('razon-rechazo').value.trim();
    if (!razon) {
      window.mostrarMensaje('Ingresa una razón para rechazar', 'error');
      return;
    }
    const confirmado = await window.confirmarAccion(
      '¿Confirmar rechazo?',
      'Se enviará el motivo del rechazo al usuario.',
      'Rechazar',
      'confirm-btn-danger'
    );
    if (!confirmado) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/admin/eventos-pendientes/${context.eventosAprobar}/rechazar`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ razonRechazo: razon })
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Error al rechazar evento');
      }
      window.mostrarMensaje('✓ Evento rechazado.', 'success');
      context.cerrarModalRechazo();
      context.cerrarModalPreview();
      context.cargarEventos();
      setTimeout(() => location.reload(), 1500);
    } catch (error) {
      window.mostrarMensaje('Error: ' + error.message, 'error');
    }
}



