// cargarPrecios.js
export async function cargarPrecios(slug) {
    const container = document.getElementById('tablaPrecios');
    try {
        const res = await fetch(`/api/precios/${slug}`);
        const precios = await res.json();
        if (precios.length === 0) {
            container.innerHTML = '<p>No hay precios disponibles.</p>';
            return;
        }
        let html = `<table class="tabla-precios-estilo"><thead><tr><th>Fecha</th><th>Precio normal</th><th>Promoción</th><th>Detalle</th></tr></thead><tbody>`;
        precios.forEach(p => {
            const fecha = window.formatDateCR(p.fecha);
            const valorRaw = String(p.precio_normal || '0');
            const valorLimpio = valorRaw.replace(/[^\d]/g, '');
            const precioNum = parseInt(valorLimpio, 10) || 0;
            const precioFormateado = new Intl.NumberFormat('es-CR', { style: 'currency', currency: 'CRC', minimumFractionDigits: 0 }).format(precioNum);
            const promocion = p.promocion || '—';
            const detalle = p.descripcion_promocion || '—';
            html += `<tr>
                        <td>${fecha}</td>
                        <td>${precioFormateado}</td>
                        <td>${promocion}</td>
                        <td>${detalle}</td>
                    </tr>`;
        });
        html += `</tbody></table>`;
        container.innerHTML = html;
    } catch (err) {
        console.error(err);
        container.innerHTML = '<p>Error al cargar precios.</p>';
    }
}


