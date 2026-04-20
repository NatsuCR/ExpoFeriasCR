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
        <img src="${evento.imagen_portada || 'assets/images/LogoOficialExpoFeriasCR/LogoExpoFeriasCR1.png'}" alt="${evento.nombre}">
        <h3>${evento.nombre}</h3>
        <p>${window.formatDateCR(evento.fecha_inicio)} - ${window.formatDateCR(evento.fecha_fin)}</p>
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
    if (totalItems === 0) return;

    let isMobile = window.innerWidth <= 768;
    const showButtons = isMobile ? totalItems > 1 : totalItems > itemsPerView;

    if (controls) {
        controls.style.display = showButtons ? 'flex' : 'none';
    }

    if (!showButtons) {
        track.style.transform = 'translateX(0)';
        return;
    }

    let currentIndex = 0;
    let maxOffset = 0;
    let step = 0;
    let containerWidth = 0;

    function updateDimensions() {
        isMobile = window.innerWidth <= 768;
        const container = track.parentElement;
        containerWidth = container.clientWidth;

        if (isMobile) {
            step = containerWidth;

            Array.from(track.children).forEach(card => {
                card.style.minWidth = `${containerWidth}px`;
                card.style.maxWidth = `${containerWidth}px`;
                card.style.marginRight = '0px';
            });

            maxOffset = -(totalItems - 1) * step;

        } else {
            // Limpiar estilos inline del modo móvil
            Array.from(track.children).forEach(card => {
                card.style.minWidth = '';
                card.style.maxWidth = '';
                card.style.marginRight = '';
            });

            const firstCard = track.children[0];
            const secondCard = track.children[1];

            if (firstCard && secondCard) {
                // offsetLeft es fiable porque width:100% en el track
                // hace que el % de las cards se calcule correctamente
                step = secondCard.offsetLeft - firstCard.offsetLeft;
            } else if (firstCard) {
                step = firstCard.offsetWidth;
            }

            const trackWidth = track.scrollWidth;
            maxOffset = Math.min(0, containerWidth - trackWidth);
        }

        const maxIndex = isMobile
            ? totalItems - 1
            : Math.max(0, totalItems - itemsPerView);

        if (currentIndex > maxIndex) currentIndex = maxIndex;

        updateTransform();
    }

    function updateTransform() {
        if (isMobile) {
            track.style.transform = `translateX(${-(currentIndex * step)}px)`;
        } else {
            let finalOffset = Math.max(-(currentIndex * step), maxOffset);
            finalOffset = Math.min(finalOffset, 0);
            track.style.transform = `translateX(${finalOffset}px)`;
        }
    }

    function goNext() {
        const maxIndex = isMobile
            ? totalItems - 1
            : Math.max(0, totalItems - itemsPerView);
        if (currentIndex < maxIndex) {
            currentIndex++;
            updateTransform();
        }
    }

    function goPrev() {
        if (currentIndex > 0) {
            currentIndex--;
            updateTransform();
        }
    }

    const prevBtn = controls?.querySelector('.carousel-prev');
    const nextBtn = controls?.querySelector('.carousel-next');

    if (prevBtn) {
        const newPrev = prevBtn.cloneNode(true);
        prevBtn.parentNode.replaceChild(newPrev, prevBtn);
        newPrev.addEventListener('click', goPrev);
    }

    if (nextBtn) {
        const newNext = nextBtn.cloneNode(true);
        nextBtn.parentNode.replaceChild(newNext, nextBtn);
        newNext.addEventListener('click', goNext);
    }

    window.addEventListener('resize', () => {
        updateDimensions();
    });

    updateDimensions();
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
            const anioInicio = new Date(e.fecha_inicio).getFullYear().toString();
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
            const anioInicio = new Date(e.fecha_inicio).getFullYear().toString();
            const enAnio = anioInicio.includes(termLower);
            return enNombre || enUbicacion || enAnio;
        });
    }

    const track = document.getElementById('carousel-proximos-track');
    const sectionProximos = document.getElementById('eventos-proximos') || document.getElementById('eventos');
    if (!track) return;

    if (eventos.length === 0) {
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

async function cargarFinalizados(provincia = '', termino = '') {
    let url = '/api/eventos/finalizados';
    if (provincia) url += `?provincia=${encodeURIComponent(provincia)}`;
    let eventos = await fetchData(url);

    if (termino) {
        const termLower = termino.toLowerCase();
        eventos = eventos.filter(e => {
            const enNombre    = e.nombre.toLowerCase().includes(termLower);
            const enUbicacion = e.ubicacion.toLowerCase().includes(termLower);
            const anioInicio  = new Date(e.fecha_inicio).getFullYear().toString();
            const enAnio      = anioInicio.includes(termLower);
            return enNombre || enUbicacion || enAnio;
        });
    }

    const track          = document.getElementById('carousel-finalizados-track');
    const sectionElement = document.getElementById('eventos-finalizados');
    if (!track) return;

    if (eventos.length === 0) {
        if (sectionElement) sectionElement.style.display = 'none';
        return;
    }
    if (sectionElement) sectionElement.style.display = 'block';
    const cards = eventos.map(e => createEventoCard(e, false));
    initCarousel('carousel-finalizados-track', cards, 'controls-finalizados', 4);
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
    await cargarFinalizados(provincia, termino);
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
        cargarFinalizados('', '');
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
                cargarFinalizados(provincia, '');
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
    cargarFinalizados('', '');
    configurarBuscadores();
});