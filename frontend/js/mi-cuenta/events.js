/**
 * mi-cuenta/events.js - Gestión de eventos del usuario
 */

MiCuenta.prototype.cargarEventos = async function() {
  try {
    const t = Date.now();
    const response = await this.apiFetch(`/api/eventos/mis-eventos?t=${t}`, {
      headers: { 'Authorization': `Bearer ${this.getToken()}` },
      cache: 'no-store'
    });

    if (!response.ok) {
      throw new Error('Error al cargar eventos');
    }

    const data = await response.json();
    const eventos = data.eventos || [];

    this.eventosContenedor.innerHTML = '';

    if (eventos.length === 0) {
      this.eventosContenedor.innerHTML = `
        <div class="eventos-vacio">
          <i class="fas fa-inbox"></i>
          <p>Aún no has creado eventos</p>
          <p style="font-size: 12px;">Haz clic en "Crear Nuevo Evento" para empezar</p>
        </div>
      `;
      return;
    }

    eventos.forEach(evento => {
      const card = this.crearEventoCard(evento);
      this.eventosContenedor.appendChild(card);
    });
  } catch (error) {
    console.error('Error:', error);
    this.eventosContenedor.innerHTML = `
      <div class="eventos-vacio">
        <p>Error al cargar eventos</p>
      </div>
    `;
  }
};

MiCuenta.prototype.crearEventoCard = function(evento) {
  const card = document.createElement('div');
  card.className = 'evento-card';

  const formatFecha = (iso) => window.formatDateCR(iso, 'short');

  const statusClass = {
    pendiente: 'pendiente',
    aprobado: 'aprobado',
    rechazado: 'rechazado',
    edicion_pendiente: 'pendiente',
    finalizado: 'aprobado'
  }[evento.estado] || 'pendiente';

  const statusIcons = {
    pendiente: '⏳',
    aprobado: '✓',
    rechazado: '✕',
    edicion_pendiente: '⏳',
    finalizado: '✓'
  };

  const estadoTexto = {
    pendiente: 'En revisión',
    aprobado: 'Aprobado',
    rechazado: 'Rechazado',
    edicion_pendiente: 'Cambios en revisión',
    finalizado: 'Finalizado'
  };

  let contenidoRazon = '';
  if (evento.estado === 'rechazado' && evento.razon_rechazo) {
    contenidoRazon = `
      <div class="evento-razon-rechazo">
        <div class="evento-razon-titulo">Razón del rechazo:</div>
        <p>${evento.razon_rechazo}</p>
      </div>
    `;
  }

  card.innerHTML = `
    <div class="evento-card-header" style="position:relative;">
      <input type="checkbox" class="cb-evento-bulk" data-id="${evento.id}" style="position:absolute; right:10px; top:10px; transform:scale(1.3); cursor:pointer;">
      <h3 class="evento-card-titulo" style="padding-right:25px;">${this.escapeHtml(evento.nombre)}</h3>
      <div class="evento-card-fecha">
        <i class="fas fa-calendar"></i>
        ${formatFecha(evento.fecha_inicio)}
      </div>
    </div>
    <div class="evento-card-body">
      <div class="evento-status ${statusClass}">
        <span>${statusIcons[evento.estado]}</span>
        <span>${estadoTexto[evento.estado]}</span>
      </div>
      ${contenidoRazon}
    </div>
    <div class="evento-card-acciones">
      <button type="button" class="btn-card-ver" data-id="${evento.id}" title="Ver detalles / Editar">
        <i class="fas fa-pen-to-square"></i>
        <span>Ver / Editar</span>
      </button>
    </div>
  `;

  card.querySelector('.btn-card-ver').addEventListener('click', (e) => {
    e.stopPropagation();
    this.mostrarDetallesEvento(evento);
  });

  card.addEventListener('click', (e) => {
    if (e.target.type === 'checkbox') {
      this.verificarSeleccionados();
      return;
    }
    this.mostrarDetallesEvento(evento);
  });

  return card;
};

MiCuenta.prototype.verificarSeleccionados = function() {
  const totalCbs = document.querySelectorAll('.cb-evento-bulk');
  const checkedCbs = document.querySelectorAll('.cb-evento-bulk:checked');
  const btnEliminarPanel = document.getElementById('btn-eliminar-seleccionados');
  const selectAllCb = document.getElementById('seleccionar-todos-eventos');

  if (checkedCbs.length > 0) {
    btnEliminarPanel.style.opacity = '1';
    btnEliminarPanel.style.pointerEvents = 'auto';
  } else {
    btnEliminarPanel.style.opacity = '0.5';
    btnEliminarPanel.style.pointerEvents = 'none';
  }

  if (selectAllCb) {
    selectAllCb.checked = totalCbs.length > 0 && totalCbs.length === checkedCbs.length;
  }
};

MiCuenta.prototype.mostrarDetallesEvento = async function(eventoOriginal) {
  // Hacer una copia para no alterar el original y aplicar borrador si existe
  let evento = { ...eventoOriginal };
  if (evento.borrador_cambios) {
    try {
      const borrador = JSON.parse(evento.borrador_cambios);
      evento = { ...evento, ...borrador };
    } catch (e) {
      console.error('Error al parsear borrador_cambios', e);
    }
  }

  const modal = document.getElementById('modal-evento-detalles');
  const titulo = document.getElementById('modal-evento-titulo');
  const contenido = document.getElementById('modal-evento-contenido');
  const btnEditar = document.getElementById('btn-editar-evento');
  const btnEliminar = document.getElementById('btn-eliminar-evento');

  titulo.textContent = evento.nombre;

  btnEditar.style.display = ['pendiente', 'aprobado', 'finalizado', 'rechazado', 'edicion_pendiente'].includes(evento.estado) ? 'block' : 'none';
  btnEliminar.style.display = 'block';

  const formatFecha = (iso) => window.formatDateCR(iso);

  const estadoColor = {
    aprobado: '#27ae60',
    pendiente: '#f39c12',
    rechazado: '#e74c3c',
    edicion_pendiente: '#e67e22',
    finalizado: '#2980b9'
  }[evento.estado] || '#95a5a6';

  const estadoTexto = {
    aprobado: 'Aprobado ✓',
    pendiente: 'En revisión ⏳',
    rechazado: 'Rechazado ✕',
    edicion_pendiente: 'Cambios en revisión ⏳',
    finalizado: 'Finalizado'
  }[evento.estado] || evento.estado;

  let razonHtml = '';
  if (evento.razon_rechazo) {
    razonHtml = `
      <div style="background-color: #f8d7da; border: 1px solid #f5c6cb; border-radius: 6px; padding: 12px; margin: 15px 0;">
        <strong>Razón del rechazo:</strong><br>
        ${evento.razon_rechazo}
      </div>
    `;
  }

  let botoneAccion = '';
  if (evento.estado === 'aprobado') {
    botoneAccion = `
      <div style="margin-top: 15px; background-color: #d4edda; padding: 12px; border-radius: 6px;">
        <strong>✓ Este evento está visible en la plataforma</strong>
        <p style="margin: 5px 0 0 0; font-size: 13px; color: #155724;">Puedes compartir este evento con la comunidad.</p>
      </div>
    `;
  }

  contenido.innerHTML = `
    <div style="margin-bottom: 20px;">
      <div style="display: inline-block; background-color: ${estadoColor}; color: white; padding: 8px 16px; border-radius: 20px; font-weight: 600; margin-bottom: 15px;">
        ${estadoTexto}
      </div>
      <div style="margin-bottom: 15px;">
        <strong>Nombre:</strong><br>
        ${this.escapeHtml(evento.nombre)}
      </div>
      <div style="margin-bottom: 15px;">
        <strong>Fecha:</strong><br>
        ${formatFecha(evento.fecha_inicio)} al ${formatFecha(evento.fecha_fin)}
      </div>
      <div style="margin-bottom: 15px;">
        <strong>Ubicación:</strong><br>
        ${this.escapeHtml(evento.ubicacion || '—')}
      </div>
      <div style="margin-bottom: 15px;">
        <strong>Descripción:</strong><br>
        <div id="modal-descripcion-container" style="position: relative;">
          <div id="modal-descripcion-texto" style="font-size: 14px; color: #444; line-height: 1.5; overflow: hidden; max-height: 100px; transition: max-height 0.3s ease; word-break: break-word; white-space: pre-wrap;">
            ${this.escapeHtml(evento.descripcion || '—')}
          </div>
          <button id="btn-leer-mas" type="button" style="display: none; background: none; border: none; color: #0033a0; font-weight: bold; cursor: pointer; padding: 5px 0; font-size: 13px;">
            Ver más
          </button>
        </div>
      </div>
      ${razonHtml}
      ${botoneAccion}
    </div>
  `;

  // Lógica de "Ver más" para la descripción
  const descTexto = document.getElementById('modal-descripcion-texto');
  const btnLeerMas = document.getElementById('btn-leer-mas');
  
  if (descTexto && btnLeerMas) {
    // Esperar un momento a que el DOM se renderice para medir la altura
    setTimeout(() => {
      if (descTexto.scrollHeight > 100) {
        btnLeerMas.style.display = 'block';
      }
    }, 50);

    btnLeerMas.onclick = () => {
      if (descTexto.style.maxHeight === '100px') {
        descTexto.style.maxHeight = descTexto.scrollHeight + 'px';
        btnLeerMas.textContent = 'Ver menos';
      } else {
        descTexto.style.maxHeight = '100px';
        btnLeerMas.textContent = 'Ver más';
      }
    };
  }

  btnEditar.onclick = () => {
    window.location.href = `/crear-evento.html?id=${evento.id}`;
  };

  btnEliminar.onclick = async () => {
    const confirmado = await window.confirmarAccion('¿Eliminar evento?', '¿Estás seguro de que quieres eliminar este evento permanentemente? Esta acción no se puede deshacer.');
    if (confirmado) {
      this.eliminarEvento(evento.id);
    }
  };

  modal.style.display = 'flex';
};

MiCuenta.prototype.eliminarEvento = async function(eventoId) {
  try {
    const response = await this.apiFetch(`/api/eventos/${eventoId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${this.getToken()}` }
    });

    if (response.ok) {
      alert('Evento eliminado');
      document.getElementById('modal-evento-detalles').style.display = 'none';
      this.cargarEventos();
    } else {
      throw new Error('Error al eliminar');
    }
  } catch (error) {
    alert('Error: ' + error.message);
  }
};



