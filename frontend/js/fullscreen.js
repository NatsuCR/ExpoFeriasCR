// Función para poner en Fullscreen un elemento específico (ej: video-wrapper)
window.toggleFullScreen = function() {
    const elem = document.getElementById("video-fullscreen-wrap");
    if (!elem) return;

    if (!document.fullscreenElement && !document.mozFullScreenElement &&
        !document.webkitFullscreenElement && !document.msFullscreenElement) {
        if (elem.requestFullscreen) {
            elem.requestFullscreen().then(() => { if(window.initStickyAd) window.initStickyAd(true); });
        } else if (elem.msRequestFullscreen) {
            elem.msRequestFullscreen();
            if(window.initStickyAd) window.initStickyAd(true);
        } else if (elem.mozRequestFullScreen) {
            elem.mozRequestFullScreen();
            if(window.initStickyAd) window.initStickyAd(true);
        } else if (elem.webkitRequestFullscreen) {
            elem.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT);
            if(window.initStickyAd) window.initStickyAd(true);
        }
        
        // Cambiar icono a contraer
        const btnIcon = document.querySelector("#custom-fullscreen-btn i");
        if(btnIcon) {
            btnIcon.classList.remove('fa-expand');
            btnIcon.classList.add('fa-compress');
        }
    } else {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        } else if (document.msExitFullscreen) {
            document.msExitFullscreen();
        } else if (document.mozCancelFullScreen) {
            document.mozCancelFullScreen();
        } else if (document.webkitExitFullscreen) {
            document.webkitExitFullscreen();
        }
        
        // Cambiar icono a expandir
        const btnIcon = document.querySelector("#custom-fullscreen-btn i");
        if(btnIcon) {
            btnIcon.classList.remove('fa-compress');
            btnIcon.classList.add('fa-expand');
        }
    }
};

// Escuchar cambios de fullscreen para actualizar el icono si se sale con la tecla ESC
document.addEventListener('fullscreenchange', window.exitHandler);
document.addEventListener('webkitfullscreenchange', window.exitHandler);
document.addEventListener('mozfullscreenchange', window.exitHandler);
document.addEventListener('MSFullscreenChange', window.exitHandler);

window.exitHandler = function() {
    if (!document.fullscreenElement && !document.webkitIsFullScreen && !document.mozFullScreen && !document.msFullscreenElement) {
        // Exited fullscreen
        const btnIcon = document.querySelector("#custom-fullscreen-btn i");
        if(btnIcon) {
            btnIcon.classList.remove('fa-compress');
            btnIcon.classList.add('fa-expand');
        }
    }
}
