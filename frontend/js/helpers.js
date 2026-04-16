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
