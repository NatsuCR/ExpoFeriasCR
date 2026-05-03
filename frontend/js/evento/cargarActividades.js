// cargarActividades.js
import { initResponsiveCarousel } from './carrusel.js';
import { initLightbox, abrirLightbox } from './lightbox.js';

// Usamos window.parseImagenes definida en helpers.js
const parseImagenes = (v) => window.parseImagenes(v);


function buildMiniCarrusel(imagenes, altText) {
    if (imagenes.length === 0) return '';
    if (imagenes.length === 1) {
        return `<img src="${imagenes[0]}" alt="${altText}" class="card-img-principal" loading="lazy">`;
    }
    const slides = imagenes.map((url, i) =>
        `<div class="mini-slide${i === 0 ? ' activa' : ''}">
            <img src="${url}" alt="${altText} ${i + 1}" loading="lazy">
        </div>`
    ).join('');
    return `
        <div class="mini-carrusel">
            <div class="mini-carrusel-track">${slides}</div>
            <button class="mini-btn mini-prev" aria-label="Anterior">&#8249;</button>
            <button class="mini-btn mini-next" aria-label="Siguiente">&#8250;</button>
            <div class="mini-dots">
                ${imagenes.map((_, i) => `<span class="mini-dot${i === 0 ? ' activo' : ''}"></span>`).join('')}
            </div>
        </div>`;
}

function initMiniCarruseles() {
    document.querySelectorAll('.mini-carrusel').forEach(carrusel => {
        const slides = carrusel.querySelectorAll('.mini-slide');
        const dots   = carrusel.querySelectorAll('.mini-dot');
        let idx = 0;

        function ir(n) {
            slides[idx].classList.remove('activa');
            dots[idx].classList.remove('activo');
            idx = (n + slides.length) % slides.length;
            slides[idx].classList.add('activa');
            dots[idx].classList.add('activo');
        }

        carrusel.querySelector('.mini-prev').addEventListener('click', (e) => {
            e.stopPropagation();
            ir(idx - 1);
        });
        carrusel.querySelector('.mini-next').addEventListener('click', (e) => {
            e.stopPropagation();
            ir(idx + 1);
        });
        dots.forEach((dot, i) => dot.addEventListener('click', (e) => {
            e.stopPropagation();
            ir(i);
        }));
    });
}

export async function cargarActividades(slug) {
    const container = document.getElementById('actividadesGrid');
    if (!container) return;

    try {
        const res = await fetch(`/api/actividades/${slug}`);
        const actividades = await res.json();

        if (actividades.length === 0) {
            container.innerHTML = '<p>No hay actividades registradas.</p>';
            return;
        }

        let html = '';
        actividades.forEach(a => {
            const imagenes = parseImagenes(a.imagen);
            const imagenesLimpias = imagenes.map(u => u.replace(/\\/g, '/'));

            const fecha       = window.formatDateCR(a.fecha);
            const hora        = a.hora ? a.hora.slice(0, 5) : '';
            const lugar       = a.lugar || 'Campo ferial';
            const descripcion = a.descripcion || '';

            const requiereOnline = a.requiereEntradaOnline === 1 || a.requiereEntradaOnline === true;
            const enlaceVenta    = a.enlaceVenta;
            const esGratis       = a.esGratis === 1 || a.esGratis === true;

            let linkHtml = '';
            if (requiereOnline && enlaceVenta) {
                linkHtml = `<a href="${enlaceVenta}" target="_blank" class="btn-ver" style="display: flex !important; align-items: center !important; justify-content: center !important; gap: 8px !important; background: var(--evento-primario, #C8102E) !important; color: white !important; padding: 10px 20px !important; border-radius: 30px !important; text-decoration: none !important; font-weight: bold !important; width: fit-content !important; margin: 15px auto !important; box-shadow: 0 4px 10px rgba(0,0,0,0.15) !important; transition: all 0.3s ease !important;"><i class="fas fa-shopping-cart"></i> Comprar entrada</a>`;
            } else if (requiereOnline && !enlaceVenta) {
                linkHtml = `<p style="text-align: center !important; width: 100% !important; margin-top: 15px !important; margin-left: auto !important; margin-right: auto !important;"><i class="fas fa-ticket-alt"></i> Entrada online (enlace no disponible)</p>`;
            }

            const gratisHtml = esGratis ? '<p><strong>Evento gratuito</strong></p>' : '';

            let videoHtml = '';
            const videoSrc = (a.videoUrl || a.video_url || '').trim();
            if (videoSrc) {
                let mediaContent = '';
                const isLocalVideo = videoSrc.match(/\.(mp4|webm|ogg|mov)(\?.*)?$/i) || videoSrc.startsWith('/assets/uploads/');
                if (isLocalVideo) {
                    mediaContent = `<video src="${videoSrc}" controls style="width:100%; border-radius:12px; aspect-ratio:16/9; background:#000;"></video>`;
                } else {
                    let embedUrl = videoSrc;
                    if (videoSrc.includes('youtube.com/watch?v=')) {
                        embedUrl = videoSrc.replace('watch?v=', 'embed/');
                    } else if (videoSrc.includes('youtu.be/')) {
                        embedUrl = videoSrc.replace('youtu.be/', 'youtube.com/embed/');
                    }
                    mediaContent = `<iframe src="${embedUrl}" frameborder="0" allowfullscreen style="width:100%; border-radius:12px; aspect-ratio:16/9;"></iframe>`;
                }

                videoHtml = `
                    <div class="actividad-video-wrapper" style="margin-top:15px; text-align:center;">
                        <button type="button" class="btn-toggle-video btn-ver-mas">
                            <i class="fas fa-play-circle"></i> Ver video
                        </button>
                        <div class="video-container" style="display:none; margin-top:15px;">
                            ${mediaContent}
                        </div>
                    </div>
                `;
            }

            html += `
    <div class="actividad-card">
        ${buildMiniCarrusel(imagenesLimpias, a.titulo)}
        <h3>${a.titulo}</h3>
        <p><i class="fas fa-calendar-day"></i> ${fecha} ${hora}</p>
        <p><i class="fas fa-map-pin"></i> ${lugar}</p>
        ${typeof window.formatDescription === 'function' ? window.formatDescription(descripcion) : `<p class="descripcion-texto">${descripcion}</p>`}
        ${videoHtml}
        ${linkHtml}
        ${gratisHtml}
    </div>`;
        });

        container.innerHTML = html;
        initLightbox();
        initMiniCarruseles();
        initVideoListeners(container);

        // Clic en imágenes → lightbox
        container.querySelectorAll('.card-img-principal').forEach(img => {
            img.addEventListener('click', (e) => {
                e.stopPropagation();
                abrirLightbox(img.src, img.alt);
            });
        });
        container.querySelectorAll('.mini-carrusel').forEach(carrusel => {
            carrusel.addEventListener('click', (e) => {
                if (e.target.closest('.mini-btn') || e.target.closest('.mini-dots')) return;
                
                const imgNodes = Array.from(carrusel.querySelectorAll('.mini-slide img'));
                const slides = Array.from(carrusel.querySelectorAll('.mini-slide'));
                const activeSlide = carrusel.querySelector('.mini-slide.activa');
                const activeIdx = slides.indexOf(activeSlide);

                if (activeIdx !== -1) {
                    e.stopPropagation();
                    const galleryData = imgNodes.map(img => ({ 
                        src: img.src, 
                        alt: img.alt 
                    }));
                    abrirLightbox(galleryData, activeIdx);
                }
            });
        });

        const carruselControl = initResponsiveCarousel('actividadesWrapper', 'actividadesGrid', 'actividadesPrev', 'actividadesNext', 320, 35000);

        // Escuchar expansión de descripciones para pausar el carrusel
        document.addEventListener('descToggle', (e) => {
            if (e.detail.expanded) {
                carruselControl.detener();
            } else {
                carruselControl.reanudar();
            }
        });
    } catch (err) {
        console.error(err);
        container.innerHTML = '<p>Error al cargar actividades.</p>';
    }
}

function initVideoListeners(container) {
    container.querySelectorAll('.btn-toggle-video').forEach(btn => {
        btn.addEventListener('click', () => {
            const wrapper = btn.closest('.actividad-video-wrapper');
            const videoCont = wrapper.querySelector('.video-container');
            const isHidden = videoCont.style.display === 'none';

            if (isHidden) {
                videoCont.style.display = 'block';
                btn.innerHTML = 'Ocultar video';
                btn.classList.add('btn-ver-menos');
            } else {
                videoCont.style.display = 'none';
                btn.innerHTML = '<i class="fas fa-play-circle"></i> Ver video';
                btn.classList.remove('btn-ver-menos');
                const videoTag = videoCont.querySelector('video');
                if (videoTag) videoTag.pause();
            }
        });
    });
}


