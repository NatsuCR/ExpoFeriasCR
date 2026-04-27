/**
 * helpers.js - Funciones de utilidad global para ExpoFeriasCR
 */

// Formatear fecha al estilo de Costa Rica
window.formatDateCR = function (dateStr, format = 'full') {
    if (!dateStr || dateStr === 'Invalid Date' || dateStr === 'null') return 'Fecha por confirmar';
    try {
        // Manejar formato DD-MMM o strings no-fecha que deben pasar tal cual
        if (typeof dateStr === 'string' && dateStr.includes('-') && isNaN(new Date(dateStr).getTime())) {
            return dateStr;
        }

        const date = new Date(dateStr);
        if (isNaN(date.getTime())) return 'Fecha por confirmar';

        const options = format === 'short'
            ? { day: '2-digit', month: 'short' }
            : { day: '2-digit', month: 'long', year: 'numeric' };

        // Forzar UTC si es necesario para evitar desfases de zona horaria en fechas puras
        return date.toLocaleDateString('es-CR', options);
    } catch (e) {
        return 'Fecha por confirmar';
    }
};

// Utilidad global para parsear imágenes (maneja arrays, strings JSON y strings corruptos)
window.parseImagenes = function (valor) {
    if (!valor) return [];

    // Si ya es un array, procesamos cada elemento de forma recursiva
    if (Array.isArray(valor)) {
        let result = [];
        valor.forEach(item => {
            const parsed = window.parseImagenes(item);
            if (Array.isArray(parsed)) result = result.concat(parsed);
            else if (parsed) result.push(parsed);
        });
        return result.filter(Boolean);
    }

    if (typeof valor !== 'string') return [];

    let trimmed = valor.trim();
    if (!trimmed || trimmed === 'null' || trimmed === '[]' || trimmed === '""') return [];

    // Intentar JSON.parse
    if (trimmed.startsWith('[') || trimmed.startsWith('"[')) {
        try {
            // Manejar caso de string con comillas extra: "[...]"
            if (trimmed.startsWith('"') && trimmed.endsWith('"')) {
                trimmed = trimmed.substring(1, trimmed.length - 1);
            }
            const parsed = JSON.parse(trimmed);
            return window.parseImagenes(parsed);
        } catch (_) {
            // Si falla, removemos corchetes manualmente y seguimos
            trimmed = trimmed.replace(/^\[+/, '').replace(/\]+$/, '');
        }
    }

    // Split por coma y limpieza agresiva
    return trimmed.split(',')
        .map(s => {
            let item = s.trim();
            // Limpiar comillas de todo tipo
            item = item.replace(/^["']+/, '').replace(/["']+$/, '');
            // Limpiar barras invertidas (escapes de DB)
            item = item.replace(/\\/g, '/');
            // Si el item resultante sigue pareciendo JSON, es basura o requiere más limpieza
            if (item.startsWith('[') || item.includes('["')) return null;
            return item;
        })
        .filter(s => s && s.length > 3); // Filtramos strings demasiado cortos (basura)
};


// Formatear descripción con "Ver más" decorado
window.formatDescription = function (text, full = false) {
    if (!text) return '';
    const limit = 100; // Un poco más corto para tarjetas

    if (full) {
        return `<p class="descripcion-texto descripcion desc-full">${text}</p>`;
    }

    if (text.length <= limit) {
        return `<p class="descripcion-texto descripcion desc-short">${text}</p>`;
    }

    const shortText = text.substring(0, limit) + '...';
    return `
        <div class="desc-container">
            <p class="descripcion-texto descripcion desc-short">${shortText}</p>
            <p class="descripcion-texto descripcion desc-full" style="display: none; opacity: 0; transition: opacity 0.3s ease;">${text}</p>
            <button class="btn-ver-mas-simple" onclick="window.toggleDesc(this)">Ver más</button>
        </div>
    `;
};

// Toggle para el botón "Ver más" con efectos y comunicación
window.toggleDesc = function (btn) {
    const container = btn.parentElement;
    if (!container) return;
    const shortText = container.querySelector('.desc-short');
    const fullText = container.querySelector('.desc-full');
    if (!fullText || !shortText) return;

    const isExpanded = fullText.style.display === 'block';

    if (!isExpanded) {
        // Expandir
        fullText.style.display = 'block';
        setTimeout(() => {
            fullText.style.opacity = '1';
        }, 10);
        shortText.style.display = 'none';
        btn.innerText = 'Ver menos';
        btn.classList.add('active');
        btn.classList.add('btn-ver-menos'); // Sincronizar clases
        btn.classList.remove('btn-ver-mas-simple');
    } else {
        // Contraer
        fullText.style.opacity = '0';
        setTimeout(() => {
            fullText.style.display = 'none';
            shortText.style.display = 'block';
            shortText.style.opacity = '1';
        }, 300);
        btn.innerText = 'Ver más';
        btn.classList.remove('active');
        btn.classList.remove('btn-ver-menos');
        btn.classList.add('btn-ver-mas-simple');
    }

    // Notificar al sistema (útil para detener carruseles)
    document.dispatchEvent(new CustomEvent('descToggle', {
        detail: { expanded: !isExpanded, element: container }
    }));
};

// Alerta Premium (Wrapper para SweetAlert2 o alert nativo)
window.mostrarAlertaPremium = function (config, text = '', confirmText = 'Entendido', icon = 'fas fa-check-circle') {
    // Normalizar argumentos
    let title = '¡Listo!';
    let message = '';
    let btnText = 'Aceptar';
    let iconClass = 'fas fa-check-circle';

    if (typeof config === 'object' && config !== null) {
        title = config.title || '¡Hecho!';
        message = config.text || '';
        btnText = config.confirmButtonText || 'Entendido';
        iconClass = config.icon || 'fas fa-check-circle';
        // Mapeo si pasan iconos simples de Swal
        if (iconClass === 'success') iconClass = 'fas fa-check-circle';
        if (iconClass === 'error') iconClass = 'fas fa-times-circle';
        if (iconClass === 'warning') iconClass = 'fas fa-exclamation-triangle';
    } else {
        title = config;
        message = text;
        btnText = confirmText;
        iconClass = icon;
    }

    // Remover alerta previa si existe
    const oldAlert = document.getElementById('premium-alert-overlay');
    if (oldAlert) oldAlert.remove();

    // Crear Estructura
    const overlay = document.createElement('div');
    overlay.id = 'premium-alert-overlay';
    overlay.className = 'premium-alert-overlay';

    overlay.innerHTML = `
        <div class="premium-alert-card">
            <div class="premium-alert-icon">
                <i class="${iconClass}"></i>
            </div>
            <h3 class="premium-alert-title">${title}</h3>
            <p class="premium-alert-text">${message}</p>
            <button class="premium-alert-btn" id="premium-alert-close">${btnText}</button>
        </div>
    `;

    document.body.appendChild(overlay);

    // Animación de entrada
    setTimeout(() => overlay.classList.add('active'), 10);

    // Evento de cierre
    const closeBtn = overlay.querySelector('#premium-alert-close');
    const close = () => {
        overlay.classList.remove('active');
        setTimeout(() => overlay.remove(), 400);
    };

    closeBtn.onclick = close;
    overlay.onclick = (e) => { if (e.target === overlay) close(); };
};

// Obtener datos del usuario desde localStorage
window.getUsuarioStorage = function () {
    try {
        return JSON.parse(localStorage.getItem('usuario') || 'null');
    } catch (e) {
        return null;
    }
};

// Modal de confirmación universal (Promise)
window.confirmarAccion = function (titulo, mensaje, tipo = 'danger') {
    return new Promise((resolve) => {
        // Remover si existe uno previo
        const old = document.getElementById('confirm-modal-overlay');
        if (old) old.remove();

        const overlay = document.createElement('div');
        overlay.id = 'confirm-modal-overlay';
        overlay.className = 'confirm-modal-overlay';

        const btnClass = tipo === 'danger' ? 'confirm-btn-danger' : 'confirm-btn-success';
        const icon = tipo === 'danger' ? '⚠️' : '❓';

        overlay.innerHTML = `
            <div class="confirm-modal-content">
                <div class="confirm-modal-icon">${icon}</div>
                <h3 class="confirm-modal-title">${titulo}</h3>
                <p class="confirm-modal-message">${mensaje}</p>
                <div class="confirm-modal-actions">
                    <button class="confirm-btn confirm-btn-cancel">Cancelar</button>
                    <button class="confirm-btn ${btnClass}">Confirmar</button>
                </div>
            </div>
        `;
        document.body.appendChild(overlay);

        // Animación de entrada
        setTimeout(() => overlay.classList.add('active'), 10);

        const cerrar = (resultado) => {
            overlay.classList.remove('active');
            setTimeout(() => {
                overlay.remove();
                resolve(resultado);
            }, 400);
        };

        overlay.querySelector('.confirm-btn-cancel').onclick = () => cerrar(false);
        overlay.querySelector(`.${btnClass}`).onclick = () => cerrar(true);

        // Cerrar al hacer clic fuera del card
        overlay.onclick = (e) => {
            if (e.target === overlay) cerrar(false);
        };
    });
};



