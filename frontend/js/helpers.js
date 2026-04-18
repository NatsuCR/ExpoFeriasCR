/**
 * helpers.js - Funciones globales utilitarias para ExpoFeriasCR
 * Este archivo NO es un módulo para asegurar disponibilidad global inmediata.
 */

window.toggleDesc = function (btn) {
    console.log("toggleDesc (v3) FINAL ejecutado sobre:", btn);
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
        short.style.setProperty('display', 'none', 'important');
        full.style.setProperty('display', 'block', 'important');
        btn.innerHTML = 'Ver menos';
    } else {
        // Colapsar
        full.style.setProperty('display', 'none', 'important');
        short.style.setProperty('display', '-webkit-box', 'important');
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
    // v3: Truncamiento a 140 para confirmar visualmente la carga del nuevo script
    if (forceFull || text.length <= 140) {
        return `
            <div class="desc-container">
                <p class="descripcion-texto descripcion desc-full" style="display: block !important; white-space: pre-wrap;">${text}</p>
            </div>
        `;
    }

    // Truncar para versión corta
    const shortText = text.substring(0, 140) + '...';
    
    return `
        <div class="desc-container">
            <p class="descripcion-texto descripcion desc-short" style="display: -webkit-box !important;">${shortText}</p>
            <p class="descripcion-texto descripcion desc-full" style="display: none !important; white-space: pre-wrap;">${text}</p>
            <button type="button" onclick="window.toggleDesc(this)" class="btn-ver-mas">Ver más</button>
        </div>
    `;
};

/**
 * Muestra un modal de confirmación premium asíncrono.
 * Retorna una Promesa que resuelve en true (confirmado) o false (cancelado).
 */
window.confirmarAccion = function(titulo = '¿Estás seguro?', mensaje = 'Esta acción no se puede deshacer.') {
    return new Promise((resolve) => {
        // 1. Asegurar que el modal existe en el DOM
        let overlay = document.getElementById('custom-confirm-modal');
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.id = 'custom-confirm-modal';
            overlay.className = 'confirm-modal-overlay';
            overlay.innerHTML = `
                <div class="confirm-modal-content">
                    <div class="confirm-modal-icon">
                        <i class="fas fa-exclamation-triangle"></i>
                    </div>
                    <div class="confirm-modal-title" id="confirm-modal-title"></div>
                    <div class="confirm-modal-message" id="confirm-modal-message"></div>
                    <div class="confirm-modal-actions">
                        <button class="confirm-btn confirm-btn-cancel" id="confirm-btn-cancel">Cancelar</button>
                        <button class="confirm-btn confirm-btn-danger" id="confirm-btn-ok">Eliminar</button>
                    </div>
                </div>
            `;
            document.body.appendChild(overlay);
        }

        // 2. Configurar contenido
        document.getElementById('confirm-modal-title').innerText = titulo;
        document.getElementById('confirm-modal-message').innerText = mensaje;

        const btnOk = document.getElementById('confirm-btn-ok');
        const btnCancel = document.getElementById('confirm-btn-cancel');

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

