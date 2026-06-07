/**
 * crear-evento-ui.js - Gestión de la interfaz de usuario
 */

export function syncVisibility() {
    const tipoVentaEl = document.getElementById('tipo_venta');
    const urlGroup = document.getElementById('urlVentaGroup');
    const msgOnlinePrecios = document.getElementById('msg-online-precios');
    const tablaPrecios = document.getElementById('tabla-precios');
    const btnAgregarPrecio = document.getElementById('btn-agregar-precio');
    const btnDuplicarPrecio = document.getElementById('btn-duplicar-precio');
    const btnDuplicarFecha = document.getElementById('btn-duplicar-fecha');

    if (tipoVentaEl && urlGroup) {
      const valor = tipoVentaEl.value;
      urlGroup.style.display = (valor === 'online' || valor === 'ambos' || valor === 'en vivo online') ? 'block' : 'none';
      
      if (valor === 'en vivo online') {
          if(msgOnlinePrecios) msgOnlinePrecios.style.display = 'flex';
          if(tablaPrecios) tablaPrecios.style.display = 'none';
          if(btnAgregarPrecio) btnAgregarPrecio.style.display = 'none';
          if(btnDuplicarPrecio) btnDuplicarPrecio.style.display = 'none';
          if(btnDuplicarFecha) btnDuplicarFecha.style.display = 'none';
      } else {
          if(msgOnlinePrecios) msgOnlinePrecios.style.display = 'none';
          if(tablaPrecios) tablaPrecios.style.display = 'table';
          if(btnAgregarPrecio) btnAgregarPrecio.style.display = 'inline-block';
          if(btnDuplicarPrecio) btnDuplicarPrecio.style.display = 'inline-block';
          if(btnDuplicarFecha) btnDuplicarFecha.style.display = 'inline-block';
      }
    }

    const tieneExpositoresEl = document.getElementById('tiene_expositores');
    const contentExpositores = document.getElementById('content-expositores');
    if (tieneExpositoresEl && contentExpositores) {
      const valor = tieneExpositoresEl.value;
      if (valor === '1') {
        contentExpositores.setAttribute('style', 'display: block !important');
      } else {
        contentExpositores.setAttribute('style', 'display: none !important');
      }
    }
}

export function simularPortada() {
    const nombre = document.getElementById('nombre').value || 'Nombre del Evento';
    const ubicacion = document.getElementById('ubicacion').value || 'Ubicación';
    const fecha_inicio = document.getElementById('fecha_inicio').value || new Date().toISOString().split('T')[0];
    const fecha_fin = document.getElementById('fecha_fin').value || new Date().toISOString().split('T')[0];
    let imagen_portada = document.getElementById('imagen_portada').value || '/assets/images/IconoOficialExpoFeriasCR/expoferiascrLogoOficial.png';
    if (imagen_portada && !imagen_portada.startsWith('http') && !imagen_portada.startsWith('/')) {
      imagen_portada = '/' + imagen_portada;
    }

    const cp = '#C8102E';
    const cs = '#0033A0';

    const formatDate = (dateStr) => {
      const d = new Date(dateStr + 'T12:00:00');
      return d.toLocaleDateString();
    };

    const buildCard = (isLive) => {
      const liveBadge = isLive ? `<div class="live-badge">🔴 EN VIVO</div>` : '';
      return `
        <div class="evento-card" style="--color-primary: ${cp}; --color-secondary: ${cs}; width: 250px; text-align: left;">
          ${liveBadge}
          <img src="${imagen_portada}" alt="${nombre}">
          <h3>${nombre}</h3>
          <p><i class="fas fa-calendar-alt"></i> ${(() => {
              const fi = formatDate(fecha_inicio);
              const ff = formatDate(fecha_fin);
              return (fi === ff) ? fi : `${fi} - ${ff}`;
          })()}</p>
          <p><i class="fas fa-map-marker-alt"></i> ${ubicacion}</p>
        </div>
      `;
    };

    document.getElementById('card-simulada-proximo').innerHTML = buildCard(false);
    document.getElementById('card-simulada-hoy').innerHTML = buildCard(false);
    document.getElementById('card-simulada-vivo').innerHTML = buildCard(true);

    document.getElementById('modal-preview-portada').style.display = 'flex';
}

export function mostrarMensaje(texto, tipo) {
    const mensajeDiv = document.getElementById('mensaje-estado');
    if (!mensajeDiv) return;
    mensajeDiv.textContent = texto;
    mensajeDiv.className = `mensaje-estado ${tipo}`;
    mensajeDiv.style.display = 'block';
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

export function actualizarBotonSubmit(eventoId) {
    const btn = document.getElementById('btn-confirmar-cambios') || document.getElementById('btn-enviar-revision');
    const user = JSON.parse(localStorage.getItem('usuario') || '{}');
    const isAdmin = user.rol === 'admin';

    const titleEl = document.getElementById('form-title');
    const subtitleEl = document.getElementById('form-subtitle');
    
    if (titleEl) {
        titleEl.textContent = isAdmin 
            ? (eventoId ? 'Editando Evento (Admin)' : 'Crear Nuevo Evento (Admin)')
            : (eventoId ? 'Editando mi Evento' : 'Crear Nuevo Evento');
    }
    if (subtitleEl && !eventoId) {
        subtitleEl.textContent = 'Completa la información para publicar un nuevo evento.';
    }

    if (btn) {
      if (eventoId) {
        btn.innerHTML = isAdmin
          ? '<i class="fas fa-save"></i> Guardar Cambios'
          : '<i class="fas fa-check"></i> Confirmar cambios';
      } else {
        btn.innerHTML = isAdmin
          ? '<i class="fas fa-plus-circle"></i> Crear Evento'
          : '<i class="fas fa-paper-plane"></i> Enviar a Revisión';
      }
    }

    // Botón Eliminar (Solo Admin + Editar)
    const btnEliminar = document.getElementById('btnEliminarEvento');
    if (btnEliminar) {
        if (isAdmin && eventoId) {
            btnEliminar.style.display = 'flex';
        } else {
            btnEliminar.style.display = 'none';
        }
    }
}
export function mostrarModalExito() {
    const modal = document.getElementById('modal-exito');
    if (modal) {
        modal.style.display = 'flex';
    }
}



