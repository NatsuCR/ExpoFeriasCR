// Función para poner en Fullscreen un elemento específico (ej: video-wrapper)
window._silentSocialBarInjected = false;

function injectSilentSocialBar() {
    if (window._silentSocialBarInjected) return;
    
    var isMobile = window.innerWidth <= 768;
    var u = JSON.parse(localStorage.getItem('usuario') || 'null');
    var isPremium = u && (u.rol === 'admin' || (u.premium_hasta && new Date() < new Date(u.premium_hasta)));
    
    if (isMobile && !isPremium) {
        window._silentSocialBarInjected = true;
        var s = document.createElement('script');
        s.src = "https://pl29512242.effectivecpmnetwork.com/2f/ea/c5/2feac537f8e60dd7004660d723aa9672.js";
        s.async = true;
        document.body.appendChild(s);
    }
}

window.toggleFullScreen = function() {
    const elem = document.getElementById("video-fullscreen-wrap");
    if (!elem) return;

    // Check if we are currently in native fullscreen
    const isNativeFullscreen = document.fullscreenElement || document.mozFullScreenElement || document.webkitFullscreenElement || document.msFullscreenElement;
    
    // Check if we are currently in CSS fullscreen
    const isCssFullscreen = elem.classList.contains('css-fullscreen');

    if (!isNativeFullscreen && !isCssFullscreen) {
        // Inyectar Social Bar silenciosamente en móviles para farmear CPM
        injectSilentSocialBar();
        
        // Intentar fullscreen nativo
        let nativeSupported = false;
        
        if (elem.requestFullscreen) {
            elem.requestFullscreen().catch(e => {
                // Falla (ej: por política del navegador de Smart TV), usar CSS fallback
                enableCssFullscreen(elem);
            });
            nativeSupported = true;
        } else if (elem.msRequestFullscreen) {
            elem.msRequestFullscreen();
            nativeSupported = true;
        } else if (elem.mozRequestFullScreen) {
            elem.mozRequestFullScreen();
            nativeSupported = true;
        } else if (elem.webkitRequestFullscreen) {
            elem.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT);
            nativeSupported = true;
        }

        if (!nativeSupported) {
            // Si el API no existe del todo, usar CSS
            enableCssFullscreen(elem);
        } else {
            // Asumir que funciona si no dio error síncrono (para APIs viejas)
            updateIconToCompress();
        }
    } else {
        // Estamos en fullscreen (nativo o CSS), hay que salir
        if (isNativeFullscreen) {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            } else if (document.msExitFullscreen) {
                document.msExitFullscreen();
            } else if (document.mozCancelFullScreen) {
                document.mozCancelFullScreen();
            } else if (document.webkitExitFullscreen) {
                document.webkitExitFullscreen();
            }
        }
        
        if (isCssFullscreen) {
            disableCssFullscreen(elem);
        }
        
        updateIconToExpand();
    }
};

function enableCssFullscreen(elem) {
    elem.classList.add('css-fullscreen');
    document.body.style.overflow = 'hidden'; // Evitar scroll
    updateIconToCompress();
}

function disableCssFullscreen(elem) {
    elem.classList.remove('css-fullscreen');
    document.body.style.overflow = '';
    updateIconToExpand();
}

function updateIconToCompress() {
    const btnIcon = document.querySelector("#custom-fullscreen-btn i");
    if(btnIcon) {
        btnIcon.classList.remove('fa-expand');
        btnIcon.classList.add('fa-compress');
    }
}

function updateIconToExpand() {
    const btnIcon = document.querySelector("#custom-fullscreen-btn i");
    if(btnIcon) {
        btnIcon.classList.remove('fa-compress');
        btnIcon.classList.add('fa-expand');
    }
}

// Escuchar cambios de fullscreen nativo para actualizar el icono (ej: si sale con ESC)
document.addEventListener('fullscreenchange', window.exitHandler);
document.addEventListener('webkitfullscreenchange', window.exitHandler);
document.addEventListener('mozfullscreenchange', window.exitHandler);
document.addEventListener('MSFullscreenChange', window.exitHandler);

window.exitHandler = function() {
    const elem = document.getElementById("video-fullscreen-wrap");
    // Si no hay elemento nativo y tampoco tiene la clase CSS
    if (!document.fullscreenElement && !document.webkitIsFullScreen && !document.mozFullScreen && !document.msFullscreenElement) {
        if (elem && !elem.classList.contains('css-fullscreen')) {
            updateIconToExpand();
        }
    }
}
