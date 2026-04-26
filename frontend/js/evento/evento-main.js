/**
 * evento-main.js - Punto de entrada para la página de evento
 */

import { cargarEvento } from './cargarEvento.js';
import { cargarActividades } from './cargarActividades.js';
import { cargarPrecios } from './cargarPrecios.js';
import { cargarExpositores } from './cargarExpositores.js';
import { cargarCarruselFondo } from './carruselFondo.js';
import { initLightbox } from './lightbox.js';

import { cargarEventoDesdePreview } from './evento-preview.js';
import * as ui from './evento-ui.js';

// Exponer a window para que previewManager pueda llamar esta función desde el padre
window.cargarEventoDesdePreview = cargarEventoDesdePreview;
window.initHeroCarousel = ui.initHeroCarousel;
window.initCarouselControls = ui.initCarouselControls;

const urlParams = new URLSearchParams(window.location.search);
const slug = urlParams.get('slug');
const isPreview = urlParams.get('preview') === '1';
const dataKey = urlParams.get('dataKey');

document.addEventListener('DOMContentLoaded', async () => {
    initLightbox();
    initMobileMenu();

    if (isPreview && dataKey) {
        const previewDataStr = localStorage.getItem(dataKey);
        if (previewDataStr) {
            try {
                const previewData = JSON.parse(previewDataStr);
                cargarEventoDesdePreview(previewData);
                setTimeout(() => {
                    ui.initCarouselControls();
                    ui.initHeroCarousel();
                }, 150);
            } catch (e) {
                console.error('Error parsing preview data:', e);
            }
        }
    } else {
        if (!slug) {
            window.location.href = '/';
            return;
        }
        
        try {
            const evento = await cargarEvento(slug);
            if (!evento) return;

            cargarActividades(slug);
            if (evento.tipo_venta !== 'gratis') {
                cargarPrecios(slug);
            }

            const tieneExp = parseInt(evento.tiene_expositores ?? 1);
            ui.aplicarVisibilidadExpositores(tieneExp);
            if (tieneExp === 1) {
                cargarExpositores(slug);
            }

            cargarCarruselFondo(slug);
            ui.initSocialShare();
        } catch (err) {
            console.error('Error en inicialización de evento:', err);
        }
    }
});

function initMobileMenu() {
    const menuToggle = document.getElementById('menu-toggle');
    const navMenu = document.getElementById('nav-menu-wrapper');
    
    if (!menuToggle || !navMenu) return;

    menuToggle.addEventListener('click', (e) => {
        e.stopPropagation();
        navMenu.classList.toggle('active');
        const icon = menuToggle.querySelector('i');
        if (navMenu.classList.contains('active')) {
            icon.classList.remove('fa-bars');
            icon.classList.add('fa-times');
        } else {
            icon.classList.remove('fa-times');
            icon.classList.add('fa-bars');
        }
    });

    // Cerrar al hacer click fuera
    document.addEventListener('click', (e) => {
        if (!navMenu.contains(e.target) && !menuToggle.contains(e.target)) {
            navMenu.classList.remove('active');
            const icon = menuToggle.querySelector('i');
            icon.classList.remove('fa-times');
            icon.classList.add('fa-bars');
        }
    });

    // Cerrar al hacer click en un enlace
    navMenu.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            navMenu.classList.remove('active');
            const icon = menuToggle.querySelector('i');
            icon.classList.remove('fa-times');
            icon.classList.add('fa-bars');
        });
    });
}


