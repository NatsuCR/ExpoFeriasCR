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

        const date = new Date(
            // Si es fecha pura YYYY-MM-DD, añadir mediodía para evitar desfase de zona horaria
            typeof dateStr === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateStr)
                ? dateStr + 'T12:00:00'
                : dateStr
        );
        if (isNaN(date.getTime())) return 'Fecha por confirmar';

        const options = format === 'short'
            ? { day: '2-digit', month: 'short' }
            : { day: '2-digit', month: 'long', year: 'numeric' };

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

    // Escapamos caracteres HTML para evitar inyección XSS y formateamos saltos de línea
    const cleanText = String(text)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
    
    const formattedText = cleanText.replace(/\r\n/g, '<br>').replace(/\n/g, '<br>');

    if (full) {
        return `<p class="descripcion-texto descripcion desc-full" style="text-align: left !important; white-space: pre-wrap !important;">${formattedText}</p>`;
    }

    if (cleanText.length <= limit) {
        return `<p class="descripcion-texto descripcion desc-short" style="text-align: center !important; white-space: pre-wrap !important;">${formattedText}</p>`;
    }

    const shortText = cleanText.substring(0, limit) + '...';
    const formattedShortText = shortText.replace(/\r\n/g, '<br>').replace(/\n/g, '<br>');
    return `
        <div class="desc-container" style="text-align: center !important;">
            <p class="descripcion-texto descripcion desc-short" style="text-align: center !important; white-space: pre-wrap !important;">${formattedShortText}</p>
            <p class="descripcion-texto descripcion desc-full" style="display: none; opacity: 0; transition: opacity 0.3s ease; text-align: center !important; white-space: pre-wrap !important;">${formattedText}</p>
            <button class="btn-ver-mas-simple" onclick="window.toggleDesc(this)" style="display: block !important; margin: 10px auto 0 !important; text-align: center !important;">Ver más</button>
        </div>
    `;
};

// Toggle para el botón "Ver más" con efectos y comunicación
window.toggleDesc = function (btn) {
    const container = btn.closest('.desc-container');
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
        btn.classList.add('btn-ver-menos');
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


// Función para cerrar el sticky ad y activar cooldown
window.cerrarStickyAd = function() {
    const ad = document.getElementById('global-sticky-ad');
    if (ad) ad.remove();
    document.body.style.paddingBottom = '0';
    
    // El cooldown es de 5 minutos en streaming, 2 minutos en las demás
    const isStreaming = window.location.pathname.includes('streaming.html');
    
    let cooldown;
    if (isStreaming) {
        cooldown = 300000; // 5 minutos siempre en streaming.html
    } else {
        cooldown = 120000; // 2 minutos en las demás
    }
    
    // Guardar el momento en que se cerró y el cooldown aplicado
    localStorage.setItem('stickyAdClosedTime', Date.now().toString());
    localStorage.setItem('stickyAdCooldown', cooldown.toString());
    
    // Programar reaparición si el usuario sigue en la misma página
    setTimeout(() => {
        if (window.initStickyAd) window.initStickyAd();
    }, cooldown);
};

// Sticky Ad para todas las pantallas
window.initStickyAd = function (force = false) {
    // No mostrar anuncios en el apartado de administración
    if (window.location.pathname.includes('/admin/')) {
        return;
    }

    // No mostrar anuncios si el usuario logueado es admin
    const user = typeof window.getUsuarioStorage === 'function' ? window.getUsuarioStorage() : JSON.parse(localStorage.getItem('usuario') || 'null');
    if (user && user.rol && String(user.rol).toLowerCase() === 'admin') {
        return;
    }

    // Evitar duplicados
    if (document.getElementById('global-sticky-ad')) {
        if (!force) return;
        document.getElementById('global-sticky-ad').remove(); // Remover para recrear si forzamos
    }

    // Verificar cooldown dinámico solo si no estamos forzando
    if (!force) {
        const closedTime = localStorage.getItem('stickyAdClosedTime');
        const savedCooldown = localStorage.getItem('stickyAdCooldown');
        
        if (closedTime && savedCooldown) {
            const timePassed = Date.now() - parseInt(closedTime);
            
            let currentCooldown = parseInt(savedCooldown);

            if (timePassed < currentCooldown) {
                // Aún en cooldown. Programamos para que aparezca justo cuando termine el tiempo restante
                setTimeout(() => {
                    if (window.initStickyAd) window.initStickyAd();
                }, currentCooldown - timePassed);
                return;
            }
        }
    }

    const isMobile = window.innerWidth <= 768;
    const adWidth = isMobile ? 320 : 728;
    const adHeight = isMobile ? 50 : 90;
    const adKey = isMobile ? 'db5fab4e621232d201d1e41f58321ace' : 'd24a04b077cc5a19d8ab72ae7e33176e';
    const paddingBottom = isMobile ? '60px' : '100px';

    const stickyContainer = document.createElement('div');
    stickyContainer.id = 'global-sticky-ad';
    stickyContainer.innerHTML = `
        <div style="position: relative; width: 100%; display: flex; justify-content: center; align-items: center;">
            <!-- Falsa X (Smartlink) -->
            <a href="https://www.effectivecpmnetwork.com/rsehijzd0?key=f6df995c4e699b6b791f169ea0928288" target="_blank" onclick="window.cerrarStickyAd()" style="position: absolute; top: -16px; right: 5px; background: #ff4444; border: 2px solid #fff; border-radius: 50%; width: 28px; height: 28px; font-size: 18px; font-weight: bold; line-height: 1; cursor: pointer; display: flex; align-items: center; justify-content: center; z-index: 11; color: #fff; text-decoration: none; box-shadow: 0 2px 8px rgba(0,0,0,0.3);">&times;</a>
            <!-- Verdadera X (Pequeña y oculta) -->
            <button onclick="window.cerrarStickyAd()" style="position: absolute; top: -10px; right: 40px; background: transparent; border: none; font-size: 10px; cursor: pointer; display: flex; align-items: center; justify-content: center; z-index: 10; color: #aaa;">cerrar</button>
            <iframe srcdoc="<!DOCTYPE html><html><body style='margin:0;padding:0;display:flex;justify-content:center;align-items:center;'><script>atOptions={'key':'${adKey}','format':'iframe','height':${adHeight},'width':${adWidth},'params':{}};</script><script src='https://www.highperformanceformat.com/${adKey}/invoke.js'></script></body></html>" width="${adWidth}" height="${adHeight}" frameborder="0" scrolling="no"></iframe>
        </div>
    `;
    let targetContainer = document.body;
    const isStreaming = window.location.pathname.includes('streaming.html');
    
    if (isStreaming) {
        const videoWrapper = document.getElementById('video-fullscreen-wrap');
        if (videoWrapper) {
            targetContainer = videoWrapper;
        }
    }
    
    document.body.style.paddingBottom = paddingBottom; // Espacio para el sticky ad
    targetContainer.appendChild(stickyContainer);
};

// Auto-inicializar sticky ad si estamos en frontend
if (typeof window !== 'undefined') {
    document.addEventListener('DOMContentLoaded', () => {
        // Retrasar la carga del sticky ad un poco para no afectar el LCP
        setTimeout(() => {
            if (window.initStickyAd) window.initStickyAd();
        }, 3000);
    });
}
