// cargarActividades.js
import { initResponsiveCarousel } from './carrusel.js';

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
            const imagen = a.imagen ? `<img src="${a.imagen}" alt="${a.titulo}">` : '';
            const fecha = new Date(a.fecha).toLocaleDateString();
            const hora = a.hora ? a.hora.slice(0,5) : '';
            const lugar = a.lugar || 'Campo ferial';
            const descripcion = a.descripcion || '';
            const requiereOnline = a.requiere_entrada_online;
            const enlaceVenta = a.enlace_venta;
            const esGratis = a.es_gratis;

            let linkHtml = '';
            if (requiereOnline && enlaceVenta) {
                linkHtml = `<p><i class="fas fa-ticket-alt"></i> <a href="${enlaceVenta}" target="_blank">Comprar entrada</a></p>`;
            }
            let gratisHtml = esGratis ? '<p><strong>Evento gratuito</strong></p>' : '';

            html += `
                <div class="actividad-card">
                    ${imagen}
                    <h3>${a.titulo}</h3>
                    <p><i class="fas fa-calendar-day"></i> ${fecha} ${hora}</p>
                    <p><i class="fas fa-map-pin"></i> ${lugar}</p>
                    <p>${descripcion}</p>
                    ${linkHtml}
                    ${gratisHtml}
                </div>
            `;
        });
        container.innerHTML = html;

        initResponsiveCarousel('actividadesWrapper', 'actividadesGrid', 'actividadesPrev', 'actividadesNext', 280, 10000);
    } catch (err) {
        console.error(err);
        container.innerHTML = '<p>Error al cargar actividades.</p>';
    }
}