// frontend/js/main.js

// Función para formatear fecha legible
function formatearFecha(fechaISO) {
    const fecha = new Date(fechaISO);
    return fecha.toLocaleDateString('es-CR', { weekday: 'long', day: 'numeric', month: 'long' });
}

// Cargar precios desde la API
async function cargarPrecios() {
    const contenedor = document.getElementById('tabla-precios');
    if (!contenedor) return;

    try {
        const respuesta = await fetch('/api/precios/expo-san-carlos-2026');
        if (!respuesta.ok) throw new Error('Error al cargar precios');
        const precios = await respuesta.json();

        if (precios.length === 0) {
            contenedor.innerHTML = '<p>No hay precios disponibles aún.</p>';
            return;
        }

        let html = `
            <table class="tabla-precios-estilo">
                <thead>
                    <tr><th>Fecha</th><th>Precio normal</th><th>Promoción</th><th>Detalle</th></tr>
                </thead>
                <tbody>
        `;
        precios.forEach(p => {
            const fechaStr = formatearFecha(p.fecha);
            // Convertir precioNormal de string a número
            const precioNum = parseFloat(p.precioNormal);
            const precioFormateado = new Intl.NumberFormat('es-CR', { style: 'currency', currency: 'CRC', minimumFractionDigits: 0 }).format(precioNum);
            const promocion = p.promocion || '—';
            const detalle = p.descripcionPromocion || '—';
            
            html += `
                <tr>
                    <td>${fechaStr}</td>
                    <td>${precioFormateado}</td>
                    <td>${promocion}</td>
                    <td>${detalle}</td>
                </tr>
            `;
        });
        html += `</tbody></table>`;
        contenedor.innerHTML = html;
    } catch (error) {
        console.error(error);
        contenedor.innerHTML = '<p style="color: red;">Error al cargar los precios. Intenta más tarde.</p>';
    }
}

// Cargar expositores desde la API
async function cargarExpositores() {
    const contenedor = document.getElementById('expositores-grid');
    if (!contenedor) return;

    try {
        const respuesta = await fetch('/api/expositores/expo-san-carlos-2026');
        if (!respuesta.ok) throw new Error('Error al cargar expositores');
        const expositores = await respuesta.json();

        if (expositores.length === 0) {
            contenedor.innerHTML = '<p>Pronto anunciaremos la lista de expositores.</p>';
            return;
        }

        let html = '';
        expositores.forEach(expo => {
            html += `
                <div class="expositor-card">
                    ${expo.imagenLogo ? `<img src="${expo.imagenLogo}" alt="${expo.nombre}" class="expositor-logo">` : '<div class="expositor-sin-logo"><i class="fas fa-store"></i></div>'}
                    <h3>${expo.nombre}</h3>
                    <p><strong>Rubro:</strong> ${expo.rubro}</p>
                    <p>${expo.descripcion || ''}</p>
                    <p><strong>Ubicación:</strong> ${expo.ubicacion || 'Por definir'}</p>
                    ${expo.sitioWeb ? `<a href="${expo.sitioWeb}" target="_blank">Sitio web</a>` : ''}
                </div>
            `;
        });
        contenedor.innerHTML = html;
    } catch (error) {
        console.error(error);
        contenedor.innerHTML = '<p style="color: red;">Error al cargar los expositores. Intenta más tarde.</p>';
    }
}

// Ejecutar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    cargarPrecios();
    cargarExpositores();
});