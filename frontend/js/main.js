// frontend/js/main.js

let provinciaActual = '';
let busquedaActual = '';

async function fetchData(url) {
    try {
        const res = await fetch(url);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return await res.json();
    } catch (error) {
        console.error(`Error fetching ${url}:`, error);
        return [];
    }
}

function createEventoCard(evento, isLive = false) {
    const card = document.createElement('div');
    card.className = 'evento-card carousel-slide';
    if (isLive) {
        const badge = document.createElement('div');
        badge.className = 'live-badge';
        badge.textContent = '🔴 EN VIVO';
        card.appendChild(badge);
    }
    card.innerHTML += `
        <img src="${evento.imagenPortada || 'assets/images/default-feria.jpg'}" alt="${evento.nombre}">
        <h3>${evento.nombre}</h3>
        <p>${new Date(evento.fechaInicio).toLocaleDateString()} - ${new Date(evento.fechaFin).toLocaleDateString()}</p>
        <p>${evento.ubicacion}</p>
        <a href="evento.html?slug=${evento.slug}" class="btn-ver">Ver más</a>
    `;
    return card;
}

function initCarousel(trackId, items, controlsId, itemsPerView = 4) {
    const track = document.getElementById(trackId);
    const controls = document.getElementById(controlsId);
    if (!track) return;

    track.innerHTML = '';
    items.forEach(item => track.appendChild(item));

    const totalItems = items.length;
    if (totalItems <= itemsPerView) {
        if (controls) controls.style.display = 'none';
        track.style.transform = 'translateX(0)';
        return;
    }
    if (controls) controls.style.display = 'flex';

    let currentIndex = 0;
    const getSlideWidth = () => (track.children[0]?.offsetWidth || 0) + 24;
    let slideWidth = getSlideWidth();
    const maxIndex = Math.max(0, totalItems - itemsPerView);

    const prevBtn = controls.querySelector('.carousel-prev');
    const nextBtn = controls.querySelector('.carousel-next');

    const updateCarousel = () => {
        track.style.transform = `translateX(-${currentIndex * slideWidth}px)`;
    };
    const goNext = () => {
        if (currentIndex < maxIndex) { currentIndex++; updateCarousel(); }
    };
    const goPrev = () => {
        if (currentIndex > 0) { currentIndex--; updateCarousel(); }
    };

    const newPrev = prevBtn.cloneNode(true);
    const newNext = nextBtn.cloneNode(true);
    prevBtn.parentNode.replaceChild(newPrev, prevBtn);
    nextBtn.parentNode.replaceChild(newNext, nextBtn);
    newPrev.addEventListener('click', goPrev);
    newNext.addEventListener('click', goNext);

    window.addEventListener('resize', () => {
        slideWidth = getSlideWidth();
        updateCarousel();
    });
    updateCarousel();
}

async function cargarSeccion(endpoint, trackId, controlsId, isLive, provincia, termino = '') {
    const sectionElement = document.getElementById(trackId)?.closest('.section-carousel');
    if (!sectionElement) return;

    let url = endpoint;
    if (provincia) url += `?provincia=${encodeURIComponent(provincia)}`;
    let eventos = await fetchData(url);

    if (termino) {
        const termLower = termino.toLowerCase();
        eventos = eventos.filter(e => {
            const enNombre = e.nombre.toLowerCase().includes(termLower);
            const enUbicacion = e.ubicacion.toLowerCase().includes(termLower);
            const anioInicio = new Date(e.fechaInicio).getFullYear().toString();
            const enAnio = anioInicio.includes(termLower);
            return enNombre || enUbicacion || enAnio;
        });
    }

    const track = document.getElementById(trackId);
    if (!track) return;

    if (eventos.length === 0) {
        sectionElement.style.display = 'none';
        return;
    }
    sectionElement.style.display = 'block';
    const cards = eventos.map(e => createEventoCard(e, isLive));
    initCarousel(trackId, cards, controlsId, 4);
}

async function cargarProximos(provincia = '', termino = '') {
    let url = '/api/eventos';
    if (provincia) url += `?provincia=${encodeURIComponent(provincia)}`;
    let eventos = await fetchData(url);

    if (termino) {
        const termLower = termino.toLowerCase();
        eventos = eventos.filter(e => {
            const enNombre = e.nombre.toLowerCase().includes(termLower);
            const enUbicacion = e.ubicacion.toLowerCase().includes(termLower);
            const anioInicio = new Date(e.fechaInicio).getFullYear().toString();
            const enAnio = anioInicio.includes(termLower);
            return enNombre || enUbicacion || enAnio;
        });
    }

    const track = document.getElementById('carousel-proximos-track');
    const sectionProximos = document.getElementById('eventos-proximos') || document.getElementById('eventos');
    if (!track) return;

    if (eventos.length === 0) {
        // Mostrar mensaje de no resultados dentro de la sección (sin ocultarla)
        track.innerHTML = '';
        const emptyMsg = document.createElement('div');
        emptyMsg.className = 'carousel-slide';
        emptyMsg.style.flex = '0 0 100%';
        emptyMsg.style.textAlign = 'center';
        emptyMsg.style.padding = '2rem';
        emptyMsg.innerHTML = '<p>No se encontraron eventos disponibles.</p>';
        track.appendChild(emptyMsg);
        const controls = document.getElementById('controls-proximos');
        if (controls) controls.style.display = 'none';
        track.style.transform = 'translateX(0)';
        if (sectionProximos) sectionProximos.style.display = 'block';
        return;
    }
    if (sectionProximos) sectionProximos.style.display = 'block';
    const cards = eventos.map(e => createEventoCard(e, false));
    initCarousel('carousel-proximos-track', cards, 'controls-proximos', 4);
}

async function realizarBusqueda() {
    const select = document.getElementById('provincia-select');
    const input = document.getElementById('buscador-principal');
    const provincia = select ? select.value : '';
    const termino = input ? input.value.trim() : '';

    provinciaActual = provincia;
    busquedaActual = termino;

    await cargarSeccion('/api/eventos/hoy', 'carousel-hoy-track', 'controls-hoy', false, provincia, termino);
    await cargarSeccion('/api/eventos/en-progreso', 'carousel-vivo-track', 'controls-vivo', true, provincia, termino);
    await cargarProximos(provincia, termino);
}

function configurarBuscadores() {
    const input = document.getElementById('buscador-principal');
    const btn = document.getElementById('btn-buscar-principal');
    const select = document.getElementById('provincia-select');
    const btnInicio = document.getElementById('btnInicio');

    const ejecutarBusqueda = () => realizarBusqueda();

    const resetear = () => {
        if (select) select.value = '';
        if (input) input.value = '';
        provinciaActual = '';
        busquedaActual = '';
        cargarSeccion('/api/eventos/hoy', 'carousel-hoy-track', 'controls-hoy', false, '', '');
        cargarSeccion('/api/eventos/en-progreso', 'carousel-vivo-track', 'controls-vivo', true, '', '');
        cargarProximos('', '');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    if (btn && input) {
        btn.addEventListener('click', ejecutarBusqueda);
        input.addEventListener('keypress', (e) => { if (e.key === 'Enter') ejecutarBusqueda(); });
    }
    if (select) {
        select.addEventListener('change', () => {
            if (busquedaActual !== '') {
                realizarBusqueda();
            } else {
                const provincia = select.value;
                cargarSeccion('/api/eventos/hoy', 'carousel-hoy-track', 'controls-hoy', false, provincia, '');
                cargarSeccion('/api/eventos/en-progreso', 'carousel-vivo-track', 'controls-vivo', true, provincia, '');
                cargarProximos(provincia, '');
            }
        });
    }
    if (btnInicio) {
        btnInicio.addEventListener('click', (e) => {
            e.preventDefault();
            resetear();
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    cargarSeccion('/api/eventos/hoy', 'carousel-hoy-track', 'controls-hoy', false, '', '');
    cargarSeccion('/api/eventos/en-progreso', 'carousel-vivo-track', 'controls-vivo', true, '', '');
    cargarProximos('', '');
    configurarBuscadores();
});