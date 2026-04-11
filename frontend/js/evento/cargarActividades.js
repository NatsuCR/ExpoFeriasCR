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
            // Corregir rutas de imagen (reemplazar \ por /)
            let imagenUrl = a.imagen ? a.imagen.replace(/\\/g, '/') : '';
            const imagen = imagenUrl ? `<img src="${imagenUrl}" alt="${a.titulo}">` : '';

            const fecha = new Date(a.fecha).toLocaleDateString();
            const hora = a.hora ? a.hora.slice(0,5) : '';
            const lugar = a.lugar || 'Campo ferial';
            const descripcion = a.descripcion || '';

            // ✅ Usar camelCase (como viene de la API)
            const requiereOnline = a.requiereEntradaOnline === 1 || a.requiereEntradaOnline === true;
            const enlaceVenta = a.enlaceVenta;
            const esGratis = a.esGratis === 1 || a.esGratis === true;

            let linkHtml = '';
            if (requiereOnline && enlaceVenta) {
                linkHtml = `<p><i class="fas fa-ticket-alt"></i> <a href="${enlaceVenta}" target="_blank">Comprar entrada</a></p>`;
            } else if (requiereOnline && !enlaceVenta) {
                linkHtml = `<p><i class="fas fa-ticket-alt"></i> Entrada online (enlace no disponible)</p>`;
            }

            let gratisHtml = '';
            if (esGratis) {
                gratisHtml = '<p><strong>Evento gratuito</strong></p>';
            }

html += `
    <div class="actividad-card">
        ${imagen}
        <h3>${a.titulo}</h3>
        <p><i class="fas fa-calendar-day"></i> ${fecha} ${hora}</p>
        <p><i class="fas fa-map-pin"></i> ${lugar}</p>
        <p class="descripcion-texto">${descripcion}</p>
        ${descripcion.length > 150 ? `<button class="btn-ver-mas" onclick="this.closest('.actividad-card').classList.toggle('expandida'); this.textContent = this.closest('.actividad-card').classList.contains('expandida') ? 'Ver menos ▲' : 'Ver más ▼'">Ver más ▼</button>` : ''}
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