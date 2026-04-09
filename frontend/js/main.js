// frontend/js/main.js (versión mejorada)

async function cargarEventos(filtro = '') {
    const container = document.getElementById('eventos-grid');
    if (!container) return;
    try {
        const res = await fetch('/api/eventos');
        const eventos = await res.json();
        let eventosFiltrados = eventos;
        if (filtro) {
            eventosFiltrados = eventos.filter(e =>
                e.nombre.toLowerCase().includes(filtro) ||
                e.ubicacion.toLowerCase().includes(filtro)
            );
        }
        if (eventosFiltrados.length === 0) {
            container.innerHTML = '<p>No se encontraron eventos.</p>';
            return;
        }
        let html = '';
        eventosFiltrados.forEach(e => {
            html += `
                <div class="evento-card">
                    <img src="${e.imagenPortada || 'assets/images/default-feria.jpg'}" alt="${e.nombre}">
                    <h3>${e.nombre}</h3>
                    <p>${new Date(e.fechaInicio).toLocaleDateString()} - ${new Date(e.fechaFin).toLocaleDateString()}</p>
                    <p>${e.ubicacion}</p>
                    <a href="evento.html?slug=${e.slug}" class="btn-ver">Ver más</a>
                </div>
            `;
        });
        container.innerHTML = html;
    } catch (error) {
        container.innerHTML = '<p>Error al cargar eventos.</p>';
    }
}

function configurarBuscadores() {
    const inputPrincipal = document.getElementById('buscador-principal');
    const btnPrincipal = document.getElementById('btn-buscar-principal');
    if (inputPrincipal && btnPrincipal) {
        const buscar = () => cargarEventos(inputPrincipal.value.toLowerCase().trim());
        btnPrincipal.addEventListener('click', buscar);
        inputPrincipal.addEventListener('keypress', (e) => { if (e.key === 'Enter') buscar(); });
    }

    // ===== NUEVO: resetear búsqueda al hacer clic en "Inicio" =====
    const btnInicio = document.getElementById('btnInicio');
    if (btnInicio) {
        btnInicio.addEventListener('click', (e) => {
            e.preventDefault(); // Evita el salto al ancla '#inicio'
            // Limpiar el campo de búsqueda
            if (inputPrincipal) inputPrincipal.value = '';
            // Recargar todos los eventos
            cargarEventos();
            // Opcional: scroll suave al inicio
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    cargarEventos();
    configurarBuscadores();
});