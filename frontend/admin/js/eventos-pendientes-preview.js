/**
 * eventos-pendientes-preview.js - Lógica de previsualización para el admin
 */

export async function verEvento(eventoId, context) {
    try {
        const token = localStorage.getItem('token');
        const res = await fetch(`/api/admin/eventos-pendientes/${eventoId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!res.ok) throw new Error('Error al cargar detalle');

        const fullData = await res.json();
        const evento = fullData.evento;
        context.eventoActualModal = evento;

        const datosPreview = normalizarDatosPreview(fullData);
        const dataKey = 'preview_' + Date.now();
        localStorage.setItem(dataKey, JSON.stringify(datosPreview));

        // Mejorar el formato de fecha para la sidebar
        const fechaCreacion = evento.created_at ? new Date(evento.created_at).toLocaleDateString('es-CR') : 'N/A';

        const html = `
        <div style="display:flex; gap: 0; height: calc(100vh - 200px); overflow: hidden; background: #fff; border-radius: 0 0 12px 12px;">
          <!-- Barra Lateral Izquierda: Info y Simulaciones -->
          <div style="width: 380px; flex-shrink: 0; border-right: 1px solid #e0e0e0; overflow-y: auto; padding: 25px; background: #fafafa;">
            
            <div class="preview-sidebar-section" style="margin-bottom: 35px;">
              <h4 style="margin: 0 0 15px 0; color: #c8102e; font-size: 16px; border-bottom: 2px solid #e5d5c5; padding-bottom: 8px; display: flex; align-items: center; gap: 10px;">
                <i class="fas fa-user-circle"></i> Información del Usuario
              </h4>
              <div style="font-size: 14px; color: #444; display: flex; flex-direction: column; gap: 12px; background: white; padding: 15px; border-radius: 12px; border: 1px solid #eee;">
                <p style="margin:0;"><strong>Nombre:</strong> ${context.escapeHtml(evento.usuario_nombre || 'N/A')}</p>
                <p style="margin:0;"><strong>Email:</strong> ${context.escapeHtml(evento.usuario_email || 'N/A')}</p>
                <p style="margin:0;"><strong>Fecha Registro:</strong> ${fechaCreacion}</p>
                <div style="display: flex; align-items: center; gap: 8px;">
                    <strong>Estado:</strong> ${context.getEstadoBadge(evento.estado)}
                </div>
                ${evento.razon_rechazo ? `
                  <div style="background: #fff5f5; padding: 12px; border-radius: 8px; border-left: 4px solid #e74c3c; margin-top: 5px;">
                    <p style="margin:0; color:#c0392b; font-size: 13px;"><strong>Razón de rechazo anterior:</strong><br>${context.escapeHtml(evento.razon_rechazo)}</p>
                  </div>` : ''}
              </div>
            </div>

            <div class="preview-sidebar-section">
              <h4 style="margin: 0 0 20px 0; color: #c8102e; font-size: 16px; border-bottom: 2px solid #e5d5c5; padding-bottom: 8px; display: flex; align-items: center; gap: 10px;">
                <i class="fas fa-th-large"></i> Simulación Portada (Index)
              </h4>
              
              <div style="display: flex; flex-direction: column; gap: 35px;">
                <div>
                  <span style="font-size: 11px; color: #c8102e; font-weight: 800; text-transform: uppercase; margin-bottom: 12px; display: block; letter-spacing: 1px; border-left: 3px solid #c8102e; padding-left: 10px;">NORMAL / HOY</span>
                  ${buildCardPreview(evento, false)}
                </div>
                
                <div>
                  <span style="font-size: 11px; color: #e74c3c; font-weight: 800; text-transform: uppercase; margin-bottom: 12px; display: block; letter-spacing: 1px; border-left: 3px solid #e74c3c; padding-left: 10px;">EN VIVO</span>
                  ${buildCardPreview(evento, true)}
                </div>

                <div>
                  <span style="font-size: 11px; color: #555; font-weight: 800; text-transform: uppercase; margin-bottom: 12px; display: block; letter-spacing: 1px; border-left: 3px solid #555; padding-left: 10px;">PRÓXIMOS EVENTOS</span>
                  ${buildCardPreview(evento, false)}
                </div>
              </div>
            </div>
          </div>

          <!-- Contenido Principal: Iframe con vista premium -->
          <div style="flex: 1; display: flex; flex-direction: column; background: #f0f0f0;">
            <div style="padding: 12px 25px; background: white; border-bottom: 1px solid #ddd; display: flex; align-items: center; justify-content: space-between; box-shadow: 0 2px 5px rgba(0,0,0,0.05); z-index: 10;">
               <div style="display: flex; align-items: center; gap: 15px;">
                   <i class="fas fa-laptop" style="color: #666; font-size: 18px;" id="icon-device-preview"></i>
                   <span style="font-weight: 700; color: #333; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px;" id="title-device-preview">Vista Previa del Evento (Web Completa)</span>
                   ${evento.tipo_evento ? `<span style="background: #c8102e; color: white; padding: 2px 10px; border-radius: 4px; font-size: 12px; font-weight: bold; margin-left: 10px;">${evento.tipo_evento}</span>` : ''}
                </div>
               <div style="display: flex; gap: 15px; align-items: center;">
                  <button id="btn-toggle-mobile-preview" class="btn-secondary" style="padding: 4px 10px; font-size: 12px;"><i class="fas fa-mobile-alt"></i> Ver en Celular</button>
                  <div style="display: flex; gap: 8px;">
                    <span style="width: 10px; height: 10px; border-radius: 50%; background: #ff5f56; border: 1px solid #e14e47;"></span>
                    <span style="width: 10px; height: 10px; border-radius: 50%; background: #ffbd2e; border: 1px solid #e1a116;"></span>
                    <span style="width: 10px; height: 10px; border-radius: 50%; background: #27c93f; border: 1px solid #1ba531;"></span>
                  </div>
               </div>
            </div>
            <div id="iframe-container-preview" style="flex: 1; position: relative; padding: 0; display: flex; justify-content: center; align-items: center; background: #f0f0f0; overflow: hidden;">
                <iframe id="iframe-preview-admin" src="/evento.html?preview=1&dataKey=${dataKey}" style="width: 100%; height: 100%; border: none; background: white; transition: all 0.3s ease;"></iframe>
            </div>
          </div>
        </div>
      `;

        document.getElementById('evento-preview-contenido').innerHTML = html;
        
        setTimeout(() => {
            const btnToggleMobile = document.getElementById('btn-toggle-mobile-preview');
            const iframe = document.getElementById('iframe-preview-admin');
            const iconDevice = document.getElementById('icon-device-preview');
            const titleDevice = document.getElementById('title-device-preview');
            let isMobile = false;
            if (btnToggleMobile) {
                btnToggleMobile.addEventListener('click', () => {
                    isMobile = !isMobile;
                    if (isMobile) {
                        iframe.style.width = '375px';
                        iframe.style.height = '812px';
                        iframe.style.borderRadius = '30px';
                        iframe.style.boxShadow = '0 10px 30px rgba(0,0,0,0.2)';
                        iframe.style.border = '12px solid #333';
                        iconDevice.className = 'fas fa-mobile-alt';
                        titleDevice.textContent = 'Vista Previa del Evento (Celular)';
                        btnToggleMobile.innerHTML = '<i class="fas fa-laptop"></i> Ver en Web';
                    } else {
                        iframe.style.width = '100%';
                        iframe.style.height = '100%';
                        iframe.style.borderRadius = '0';
                        iframe.style.boxShadow = 'none';
                        iframe.style.border = 'none';
                        iconDevice.className = 'fas fa-laptop';
                        titleDevice.textContent = 'Vista Previa del Evento (Web Completa)';
                        btnToggleMobile.innerHTML = '<i class="fas fa-mobile-alt"></i> Ver en Celular';
                    }
                });
            }
        }, 100);

        // Forzar dimensiones del modal para el split view
        const modalContenedor = document.querySelector('#modal-evento-preview .modal-contenedor');
        if (modalContenedor) {
            modalContenedor.style.maxWidth = '1300px';
            modalContenedor.style.width = '98%';
            modalContenedor.style.borderRadius = '12px';
            modalContenedor.style.overflow = 'hidden';

            const modalBody = modalContenedor.querySelector('.modal-body');
            if (modalBody) {
                modalBody.style.padding = '0';
                modalBody.style.maxHeight = 'none';
            }
        }

        const puedeAccion = ['pendiente', 'edicion_pendiente'].includes(evento.estado);
        document.getElementById('btn-modal-aprobar').style.display = puedeAccion ? 'block' : 'none';
        document.getElementById('btn-modal-rechazar').style.display = puedeAccion ? 'block' : 'none';
        document.getElementById('modal-evento-preview').style.display = 'flex';
    } catch (error) {
        console.error(error);
        alert('Error al cargar evento: ' + error.message);
    }
}

function parseImagenes(valor) {
    if (!valor) return [];
    if (Array.isArray(valor)) return valor.filter(Boolean);
    if (typeof valor !== 'string') return [];

    let trimmed = valor.trim();
    if (trimmed.startsWith('[')) {
        try {
            const parsed = JSON.parse(trimmed);
            if (Array.isArray(parsed)) return parsed.filter(Boolean);
        } catch (_) {
            trimmed = trimmed.replace(/^\[/, '').replace(/\]$/, '');
        }
    }
    return trimmed.split(',')
        .map(s => s.trim().replace(/^["']/, '').replace(/["']$/, '').trim())
        .filter(s => s && s !== '[' && s !== ']');
}

function buildCardPreview(evento, isLive) {
    const cp = evento.color_primario || '#C8102E';
    const cs = evento.color_secundario || '#0033A0';
    const ci = evento.color_iconos || cp;

    // Limpieza de imágenes
    const imagenes = parseImagenes(evento.imagen_portada);
    let img = (imagenes && imagenes.length > 0) ? imagenes[0] : '/assets/images/IconoOficialExpoFeriasCR/expoferiascrLogoOficial.png';

    if (img && !img.startsWith('http') && !img.startsWith('/')) {
        img = '/' + img;
    }

    const liveBadge = isLive ? `
        <div class="preview-live-badge">
            <span class="pulse-dot"></span> EN VIVO
        </div>` : '';

    const formatDateRange = (start, end) => {
        const parseDate = (str) => {
            if (!str || str === 'Invalid Date' || str === 'null' || str === 'undefined') return null;
            // Si ya es un objeto Date
            if (str instanceof Date) return isNaN(str.getTime()) ? null : str;

            // Manejar formatos YYYY-MM-DD
            if (typeof str === 'string' && /^\d{4}-\d{2}-\d{2}/.test(str)) {
                const d = new Date(str);
                return isNaN(d.getTime()) ? null : d;
            }

            const d = new Date(str);
            return isNaN(d.getTime()) ? null : d;
        };

        const d1 = parseDate(start);
        const d2 = parseDate(end);

        const options = { day: 'numeric', month: 'long' };
        const yearOption = { year: 'numeric' };

        if (!d1) {
            return (start && start !== 'Invalid Date' && start !== 'null') ? start : 'Fecha por confirmar';
        }

        if (!d2 || d1.getTime() === d2.getTime()) {
            return d1.toLocaleDateString('es-CR', { ...options, ...yearOption });
        }

        if (d1.getMonth() === d2.getMonth() && d1.getFullYear() === d2.getFullYear()) {
            return `${d1.getDate()} al ${d2.getDate()} de ${d1.toLocaleDateString('es-CR', { month: 'long', ...yearOption })}`;
        }

        return `${d1.toLocaleDateString('es-CR', options)} - ${d2.toLocaleDateString('es-CR', { ...options, ...yearOption })}`;
    };

    const fechaStr = formatDateRange(evento.fecha_inicio, evento.fecha_fin);

    return `
        <style>
            .preview-live-badge {
                position: absolute;
                top: 15px;
                right: 15px;
                background: #ff0000;
                color: white;
                padding: 5px 12px;
                border-radius: 25px;
                font-size: 10px;
                font-weight: 900;
                z-index: 5;
                display: flex;
                align-items: center;
                gap: 6px;
                box-shadow: 0 4px 10px rgba(255,0,0,0.3);
                animation: pulseAnim 2s infinite;
            }
            .pulse-dot {
                width: 7px;
                height: 7px;
                background: white;
                border-radius: 50%;
                display: inline-block;
            }
            @keyframes pulseAnim {
                0% { opacity: 0.8; transform: scale(0.95); }
                50% { opacity: 1; transform: scale(1); }
                100% { opacity: 0.8; transform: scale(0.95); }
            }
            .card-btn-sim {
                background: #0033A0;
                color: white;
                padding: 10px 0;
                width: 85%;
                border-radius: 8px;
                font-size: 12px;
                font-weight: 700;
                text-transform: uppercase;
                letter-spacing: 1px;
                text-align: center;
                margin: 15px auto;
                box-shadow: 0 4px 10px rgba(0, 51, 160, 0.2);
            }
        </style>
        <div class="evento-card-preview-container" style="width: 100%; max-width: 300px; background: white; border-radius: 20px; overflow: hidden; box-shadow: 0 15px 35px rgba(0,0,0,0.08); position: relative; border: 1px solid #f2f2f2; margin: 0 auto;">
            <div style="height: 160px; overflow: hidden; background: #eee; position: relative;">
                <img src="${img}" style="width: 100%; height: 100%; object-fit: cover;">
                ${liveBadge}
                <div style="position: absolute; bottom: 0; left: 0; right: 0; height: 60%; background: linear-gradient(to top, rgba(0,0,0,0.5), transparent);"></div>
            </div>
            <div style="padding: 20px;">
                <h3 style="font-size: 18px; margin: 0 0 10px 0; color: #111; font-weight: 800; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; font-family: 'Playfair Display', serif;">${evento.nombre}</h3>
                
                <div style="display: flex; flex-direction: column; gap: 8px;">
                    <p style="font-size: 13px; margin: 0; color: #666; display: flex; align-items: center; gap: 10px; font-weight: 500;">
                        <i class="fas fa-calendar-alt" style="color:${ci}; width:16px;"></i> 
                        <span>${fechaStr}</span>
                    </p>
                    <p style="font-size: 13px; margin: 0; color: #666; display: flex; align-items: center; gap: 10px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; font-weight: 500;">
                        <i class="fas fa-map-marker-alt" style="color:${ci}; width:16px;"></i> 
                        <span>${evento.ubicacion || 'Ubicación'}</span>
                    </p>
                </div>

                <div class="card-btn-sim">Ver más</div>
            </div>
        </div>
    `;
}

function normalizarDatosPreview(fullData) {
    const evento = fullData.evento;
    return {
        ...evento,
        precios: fullData.precios || [],
        actividades: fullData.actividades || [],
        expositores: fullData.expositores || [],
        galeria: fullData.galeria || []
    };
}




