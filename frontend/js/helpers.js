/**
 * helpers.js - Funciones globales utilitarias para ExpoFeriasCR
 * Este archivo NO es un módulo para asegurar disponibilidad global inmediata.
 */

window.toggleDesc = function (btn) {

    const container = btn.closest('.desc-container');
    
    if (!container) {
        console.warn("No se encontró el contenedor .desc-container para el botón:", btn);
        return;
    }

    const full = container.querySelector('.desc-full');
    const short = container.querySelector('.desc-short');
    
    if (!full || !short) {
        console.warn("No se encontraron los elementos .desc-full o .desc-short dentro de:", container);
        return;
    }

    // Determinar estado actual basado en el estilo computado
    const isFullHidden = window.getComputedStyle(full).display === 'none';

    if (isFullHidden) {
        // Expandir
        short.style.setProperty('display', 'none');
        full.style.setProperty('display', 'block');
        btn.innerHTML = 'Ver menos';
    } else {
        // Colapsar
        full.style.setProperty('display', 'none');
        short.style.setProperty('display', '-webkit-box');
        btn.innerHTML = 'Ver más';
    }

    // Emitir evento para que otros componentes (como el carrusel) reaccionen
    document.dispatchEvent(new CustomEvent('descToggle', { 
        detail: { expanded: isFullHidden } 
    }));
};

window.formatDescription = function (text, forceFull = false) {
    if (!text) return '';

    // Si el texto es corto o se fuerza completo, no truncamos
    if (forceFull || text.length <= 140) {
        return `
            <div class="desc-container" style="text-align: center;">
                <p class="descripcion-texto descripcion desc-full" style="display: block; white-space: pre-wrap;">${text}</p>
            </div>
        `;
    }

    // Truncar para versión corta
    const shortText = text.substring(0, 140) + '...';
    
    return `
        <div class="desc-container" style="text-align: center;">
            <p class="descripcion-texto descripcion desc-short">${shortText}</p>
            <p class="descripcion-texto descripcion desc-full" style="white-space: pre-wrap; display: none;">${text}</p>
            <button type="button" onclick="window.toggleDesc(this)" class="btn-ver-mas">Ver más</button>
        </div>
    `;
};

/**
 * Muestra un modal de confirmación premium asíncrono.
 * Retorna una Promesa que resuelve en true (confirmado) o false (cancelado).
 */
window.confirmarAccion = function(titulo = '¿Estás seguro?', mensaje = 'Esta acción no se puede deshacer.', textoOk = 'Confirmar', claseOk = 'confirm-btn-danger') {
    return new Promise((resolve) => {
        // 1. Asegurar que el modal existe en el DOM
        let overlay = document.getElementById('custom-confirm-modal');
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.id = 'custom-confirm-modal';
            overlay.className = 'confirm-modal-overlay';
            overlay.innerHTML = `
                <div class="confirm-modal-content">
                    <div class="confirm-modal-icon" id="confirm-modal-icon">
                        <i class="fas fa-exclamation-triangle"></i>
                    </div>
                    <div class="confirm-modal-title" id="confirm-modal-title"></div>
                    <div class="confirm-modal-message" id="confirm-modal-message"></div>
                    <div class="confirm-modal-actions">
                        <button class="confirm-btn confirm-btn-cancel" id="confirm-btn-cancel">Cancelar</button>
                        <button class="confirm-btn" id="confirm-btn-ok"></button>
                    </div>
                </div>
            `;
            document.body.appendChild(overlay);
        }

        // 2. Configurar contenido y estilos
        document.getElementById('confirm-modal-title').innerText = titulo;
        document.getElementById('confirm-modal-message').innerText = mensaje;
        
        const btnOk = document.getElementById('confirm-btn-ok');
        const btnCancel = document.getElementById('confirm-btn-cancel');
        const modalIcon = document.getElementById('confirm-modal-icon');

        btnOk.innerText = textoOk;
        // Limpiar clases previas de color y añadir la nueva
        btnOk.className = 'confirm-btn ' + claseOk;
        
        // Cambiar icono según el tipo (éxito vs advertencia)
        if (claseOk.includes('success')) {
            modalIcon.innerHTML = '<i class="fas fa-check-circle" style="color: #27ae60;"></i>';
        } else {
            modalIcon.innerHTML = '<i class="fas fa-exclamation-triangle" style="color: #e74c3c;"></i>';
        }

        // 3. Mostrar modal
        overlay.classList.add('active');

        // 4. Manejadores de eventos (limpiando previos)
        const cleanup = (result) => {
            overlay.classList.remove('active');
            btnOk.onclick = null;
            btnCancel.onclick = null;
            resolve(result);
        };

        btnOk.onclick = () => cleanup(true);
        btnCancel.onclick = () => cleanup(false);
        overlay.onclick = (e) => { if(e.target === overlay) cleanup(false); };
    });
};

/**
 * Muestra una alerta premium de solo información (un botón).
 */
window.mostrarAlertaPremium = function(titulo = 'Atención', mensaje = '', textoBoton = 'Entendido', icono = 'fas fa-info-circle') {
    return new Promise((resolve) => {
        let overlay = document.getElementById('custom-confirm-modal');
        if (!overlay) {
            // Reutilizar el mismo contenedor si existe, o crearlo
            overlay = document.createElement('div');
            overlay.id = 'custom-confirm-modal';
            overlay.className = 'confirm-modal-overlay';
            overlay.innerHTML = `
                <div class="confirm-modal-content">
                    <div class="confirm-modal-icon" id="confirm-modal-icon"></div>
                    <div class="confirm-modal-title" id="confirm-modal-title"></div>
                    <div class="confirm-modal-message" id="confirm-modal-message"></div>
                    <div class="confirm-modal-actions">
                        <button class="confirm-btn confirm-btn-cancel" id="confirm-btn-cancel" style="display:none;"></button>
                        <button class="confirm-btn confirm-btn-success" id="confirm-btn-ok"></button>
                    </div>
                </div>
            `;
            document.body.appendChild(overlay);
        }

        document.getElementById('confirm-modal-title').innerText = titulo;
        document.getElementById('confirm-modal-message').innerText = mensaje;
        
        const btnOk = document.getElementById('confirm-btn-ok');
        const btnCancel = document.getElementById('confirm-btn-cancel');
        const modalIcon = document.getElementById('confirm-modal-icon');

        btnOk.innerText = textoBoton;
        btnOk.className = 'confirm-btn confirm-btn-success'; // Siempre verde para info/alerta
        btnCancel.style.display = 'none'; // Ocultar cancelar para alertas de info
        
        modalIcon.innerHTML = `<i class="${icono}" style="color: #f1c40f;"></i>`;

        overlay.classList.add('active');

        const cleanup = () => {
            overlay.classList.remove('active');
            btnOk.onclick = null;
            resolve();
        };

        btnOk.onclick = cleanup;
        overlay.onclick = (e) => { if(e.target === overlay) cleanup(); };
    });
};

/**
 * window.formatDateCR - Formateador universal de fechas para ExpoFeriasCR
 * @param {string} dStr - Cadena de fecha (ISO, YYYY-MM-DD, etc.)
 * @param {string} option - 'long' (default) o 'short'
 */
window.formatDateCR = function (dStr, option = 'long') {
    if (!dStr || dStr === 'Invalid Date' || dStr === 'N/A' || dStr === 'null') return '—';
    try {
        let clean = String(dStr);
        if (clean.includes('T')) clean = clean.split('T')[0];
        if (clean.includes(' ')) clean = clean.split(' ')[0];
        
        const parts = clean.split('-');
        if (parts.length !== 3) return '—';
        
        // Crear fecha local por componentes para evitar desfases de zona horaria
        const d = new Date(parts[0], parts[1] - 1, parts[2]);
        if (isNaN(d.getTime())) return '—';
        
        if (option === 'short') {
            return d.toLocaleDateString('es-CR', { day: '2-digit', month: 'short' });
        }
        
        return d.toLocaleDateString('es-CR', { 
            day: '2-digit', 
            month: 'long', 
            year: 'numeric' 
        });
    } catch (e) { 
        console.error('[Helper] Error formateando fecha:', e);
        return '—'; 
    }
};

