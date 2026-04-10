// cargarExpositores.js
import { initResponsiveCarousel } from './carrusel.js';

export async function cargarExpositores(slug) {
    const container = document.getElementById('expositoresGrid');
    if (!container) return;

    try {
        const res = await fetch(`/api/expositores/${slug}`);
        const expositores = await res.json();

        if (expositores.length === 0) {
            container.innerHTML = '<p>No hay expositores registrados.</p>';
            return;
        }

        let html = '';
        expositores.forEach(e => {
            const imagenHtml = e.imagenLogo ? `<img src="${e.imagenLogo}" alt="${e.nombre}">` : '';
            const videoHtml = e.videoUrl ? `<video controls src="${e.videoUrl}" style="width:100%; max-height:200px; margin-top:1rem;"></video>` : '';
            html += `
                <div class="expositor-card">
                    ${imagenHtml}
                    <h3>${e.nombre}</h3>
                    <p><strong>Rubro:</strong> ${e.rubro}</p>
                    <p>${e.descripcion || ''}</p>
                    <p><strong>Ubicación:</strong> ${e.ubicacion || 'Por definir'}</p>
                    ${videoHtml}
                </div>
            `;
        });
        container.innerHTML = html;

        initResponsiveCarousel('expositoresWrapper', 'expositoresGrid', 'expositoresPrev', 'expositoresNext', 280, 10000);
    } catch (err) {
        console.error(err);
        container.innerHTML = '<p>Error al cargar expositores.</p>';
    }
}