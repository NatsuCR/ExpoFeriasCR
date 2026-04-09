// frontend/js/main.js
let idiomaActual = 'es';

function aplicarIdioma() {
    document.querySelectorAll('[data-es]').forEach(el => {
        const texto = el.getAttribute(`data-${idiomaActual}`);
        if (texto) el.innerText = texto;
    });
    document.querySelectorAll('[data-es-placeholder]').forEach(el => {
        const placeholder = el.getAttribute(`data-${idiomaActual}-placeholder`);
        if (placeholder) el.placeholder = placeholder;
    });
    const btn = document.getElementById('btnIdioma');
    if (btn) btn.innerText = idiomaActual === 'es' ? '🇺🇸 English' : '🇪🇸 Español';
}

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
            container.innerHTML = `<p data-es="No se encontraron eventos." data-en="No events found.">No se encontraron eventos.</p>`;
            aplicarIdioma();
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
                    <a href="evento.html?slug=${e.slug}" class="btn-ver" data-es="Ver más" data-en="See more">Ver más</a>
                </div>
            `;
        });
        container.innerHTML = html;
        aplicarIdioma(); // para traducir los botones "Ver más"
    } catch (error) {
        container.innerHTML = `<p data-es="Error al cargar eventos." data-en="Error loading events.">Error al cargar eventos.</p>`;
        aplicarIdioma();
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
    // Botón de inicio (resetear búsqueda)
    const btnInicio = document.getElementById('btnInicio');
    if (btnInicio) {
        btnInicio.addEventListener('click', (e) => {
            e.preventDefault();
            if (inputPrincipal) inputPrincipal.value = '';
            cargarEventos();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    cargarEventos();
    configurarBuscadores();
    aplicarIdioma();
    const btnIdioma = document.getElementById('btnIdioma');
    if (btnIdioma) {
        btnIdioma.addEventListener('click', () => {
            idiomaActual = idiomaActual === 'es' ? 'en' : 'es';
            aplicarIdioma();
            // Recargar eventos para actualizar los botones "Ver más" (aunque ya se aplica el idioma en el HTML dinámico)
            cargarEventos(document.getElementById('buscador-principal')?.value.trim() || '');
        });
    }
});