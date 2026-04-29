/**
 * main.js - Orquestador principal de la página de inicio
 */

window.provinciaActual = '';
window.busquedaActual = '';

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

    // Hacer que toda la tarjeta sea clickable
    card.onclick = (e) => {
        // Si se hace click en el botón de ver detalles, dejar que el <a> haga su trabajo
        // Si se hace click en cualquier otra parte de la card, redirigir
        if (e.target.tagName !== 'A' && !e.target.closest('a')) {
            window.location.href = `evento.html?slug=${evento.slug}`;
        }
    };

    if (isLive) {
        const badge = document.createElement('div');
        badge.className = 'live-badge';
        badge.textContent = '🔴 EN VIVO';
        card.appendChild(badge);
    }

    const imgUrl = evento.imagen_portada || 'assets/images/LogoOficialExpoFeriasCR/LogoExpoFeriasCR1.png';

    // Ubicación resumida (Provincia o Cantón si existe)
    const ubicacionCorta = evento.canton ? `${evento.canton}, ${evento.provincia}` : (evento.provincia || evento.ubicacion);

    card.innerHTML += `
        <div class="card-img-wrap">
            <img src="${imgUrl}" alt="${evento.nombre}" loading="lazy">
            ${evento.tipo_evento ? `<span class="category-badge">${evento.tipo_evento}</span>` : ''}
        </div>
        <div class="card-info">
            <h3>${evento.nombre}</h3>
            <p class="card-date"><i class="fas fa-calendar-alt"></i> ${(() => {
            const fInicio = window.formatDateCR ? window.formatDateCR(evento.fecha_inicio) : evento.fecha_inicio;
            const fFin = window.formatDateCR ? window.formatDateCR(evento.fecha_fin) : evento.fecha_fin;
            if (!evento.fecha_fin || fInicio === fFin) return fInicio;
            return `${fInicio} - ${fFin}`;
        })()}</p>
            <p class="card-location"><i class="fas fa-map-marker-alt"></i> ${ubicacionCorta}</p>
            ${evento.ubicacion && evento.ubicacion !== ubicacionCorta ? `<p class="card-address"><i class="fas fa-compass"></i> ${evento.ubicacion}</p>` : ''}
            <a href="evento.html?slug=${evento.slug}" class="btn-ver">Ver detalles</a>
        </div>
    `;
    return card;
}

window.cargarSeccion = async function (endpoint, trackId, controlsId, isLive, filtros = {}) {
    const sectionElement = document.getElementById(trackId)?.closest('.section-carousel');
    if (!sectionElement) return;

    const { provincia, canton, distrito, categoria, termino } = filtros;

    let url = endpoint;
    if (provincia) url += `?provincia=${encodeURIComponent(provincia)}`;
    let eventos = await fetchData(url);

    // Filtrado en el cliente (Frontend)
    if (canton) {
        eventos = eventos.filter(e => e.canton === canton);
    }
    if (distrito) {
        eventos = eventos.filter(e => e.distrito === distrito);
    }
    if (categoria) {
        eventos = eventos.filter(e => e.tipo_evento === categoria);
    }
    if (termino) {
        const termLower = termino.toLowerCase();
        eventos = eventos.filter(e => {
            const enNombre = e.nombre.toLowerCase().includes(termLower);
            const enUbicacion = (e.ubicacion || '').toLowerCase().includes(termLower);
            const enCanton = (e.canton || '').toLowerCase().includes(termLower);
            const enDistrito = (e.distrito || '').toLowerCase().includes(termLower);
            const enProvincia = (e.provincia || '').toLowerCase().includes(termLower);
            return enNombre || enUbicacion || enCanton || enDistrito || enProvincia;
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

    if (window.initCarousel) {
        window.initCarousel(trackId, cards, controlsId, 4);
    } else {
        track.innerHTML = '';
        cards.forEach(c => track.appendChild(c));
    }
}

window.cargarProximos = async function (filtros = {}) {
    const container = document.getElementById('categorias-proximos-container');
    const noResultsMsg = document.getElementById('no-results-msg');
    if (!container) return;

    const { provincia, canton, distrito, categoria, termino } = filtros;

    let url = '/api/eventos';
    if (provincia) url += `?provincia=${encodeURIComponent(provincia)}`;
    let eventos = await fetchData(url);

    let eventosFiltrados = eventos;
    if (canton) eventosFiltrados = eventosFiltrados.filter(e => e.canton === canton);
    if (distrito) eventosFiltrados = eventosFiltrados.filter(e => e.distrito === distrito);
    if (categoria) eventosFiltrados = eventosFiltrados.filter(e => e.tipo_evento === categoria);

    if (termino) {
        const termLower = termino.toLowerCase();
        eventosFiltrados = eventosFiltrados.filter(e => {
            const enNombre = e.nombre.toLowerCase().includes(termLower);
            const enUbicacion = (e.ubicacion || '').toLowerCase().includes(termLower);
            const enCanton = (e.canton || '').toLowerCase().includes(termLower);
            const enDistrito = (e.distrito || '').toLowerCase().includes(termLower);
            const enProvincia = (e.provincia || '').toLowerCase().includes(termLower);
            return enNombre || enUbicacion || enCanton || enDistrito || enProvincia;
        });
    }

    if (noResultsMsg) noResultsMsg.style.display = 'none';

    // Si no hay resultados de búsqueda, mostramos todos los eventos próximos (para no dejar el sitio vacío)
    const aMostrar = (eventosFiltrados.length === 0 && termino !== '') ? eventos : eventosFiltrados;

    // Agrupar por tipo_evento
    const grupos = {};
    aMostrar.forEach(e => {
        const tipo = e.tipo_evento || 'Otros Eventos';
        if (!grupos[tipo]) grupos[tipo] = [];
        grupos[tipo].push(e);
    });

    container.innerHTML = '';

    // Definir orden de importancia
    const ORDEN_PRIORIDAD = [
        'Feria',
        'Concierto',
        'Arte y Cultura',
        'Tour',
        'Fiesta Típica',
        'Gastronomía',
        'Exposición',
        'Talleres y Charlas',
        'Deporte',
        'Recreativa',
        'Gobierno / Cívico',
        'Religioso',
        'Otro'
    ];

    // Obtener los tipos presentes y ordenarlos según la prioridad, luego alfabéticamente
    let tiposPresentes = Object.keys(grupos);
    let tiposOrdenados = tiposPresentes.sort((a, b) => {
        let indexA = ORDEN_PRIORIDAD.indexOf(a);
        let indexB = ORDEN_PRIORIDAD.indexOf(b);
        
        // Forzar que Gobierno, Religioso y Otro sean los últimos (prioridad 1000+)
        if (a === 'Gobierno / Cívico') indexA = 1000;
        if (a === 'Religioso') indexA = 1001;
        if (a === 'Otro') indexA = 1002;
        if (b === 'Gobierno / Cívico') indexB = 1000;
        if (b === 'Religioso') indexB = 1001;
        if (b === 'Otro') indexB = 1002;

        // Cualquier otra categoría no listada (como Fiesta Regional) queda en medio (500)
        if (indexA === -1) indexA = 500;
        if (indexB === -1) indexB = 500;
        
        if (indexA !== indexB) return indexA - indexB;
        return a.localeCompare(b);
    });

    // Si hay una búsqueda activa, ponemos la categoría del primer resultado de primero
    if (termino && eventosFiltrados.length > 0) {
        const tipoDestacado = eventosFiltrados[0].tipo_evento || 'Otros Eventos';
        tiposOrdenados = [tipoDestacado, ...tiposOrdenados.filter(t => t !== tipoDestacado)];
    }

    tiposOrdenados.forEach((tipo, index) => {
        const sectionId = `category-${index}`;
        const trackId = `track-${sectionId}`;
        const controlsId = `controls-${sectionId}`;

        const sectionHtml = `
            <section class="section-carousel reveal active" id="${sectionId}">
                <div class="container">
                    <div class="section-header">
                        <h2>📅 ${tipo}</h2>
                        <div class="carousel-controls" id="${controlsId}" style="display: none;">
                            <button class="carousel-prev"><i class="fas fa-chevron-left"></i></button>
                            <button class="carousel-next"><i class="fas fa-chevron-right"></i></button>
                        </div>
                    </div>
                    <div class="carousel-container">
                        <div class="carousel-track" id="${trackId}"></div>
                    </div>
                </div>
            </section>
        `;
        container.insertAdjacentHTML('beforeend', sectionHtml);

        const track = document.getElementById(trackId);
        const cards = grupos[tipo].map(e => createEventoCard(e, false));

        if (window.initCarousel) {
            window.initCarousel(trackId, cards, controlsId, 4);
        } else {
            cards.forEach(c => track.appendChild(c));
        }
    });
}

window.cargarFinalizados = async function (filtros = {}) {
    await window.cargarSeccion('/api/eventos/finalizados', 'carousel-finalizados-track', 'controls-finalizados', false, filtros);
}

function initPatchNotes() {
    const btn = document.getElementById('patch-notes-btn');
    const overlay = document.getElementById('patch-notes-overlay');
    const closeBtn = document.getElementById('patch-close-btn');
    const understoodBtn = document.getElementById('btn-entendido-patch');

    if (!btn || !overlay) return;
    btn.onclick = () => overlay.classList.add('active');
    if (closeBtn) closeBtn.onclick = () => overlay.classList.remove('active');
    if (understoodBtn) understoodBtn.onclick = () => overlay.classList.remove('active');
    overlay.onclick = (e) => { if (e.target === overlay) overlay.classList.remove('active'); };
}

function initMobileMenu() {
    const toggle = document.getElementById('menu-toggle');
    const menu = document.getElementById('nav-menu-wrapper');
    const links = document.querySelectorAll('.nav-links a');

    if (!toggle || !menu) return;

    toggle.addEventListener('click', (e) => {
        e.stopPropagation();
        menu.classList.toggle('active');
        toggle.querySelector('i').classList.toggle('fa-bars');
        toggle.querySelector('i').classList.toggle('fa-times');
    });

    // Cerrar al hacer click fuera
    document.addEventListener('click', (e) => {
        if (menu.classList.contains('active') && !menu.contains(e.target) && e.target !== toggle) {
            menu.classList.remove('active');
            toggle.querySelector('i').classList.add('fa-bars');
            toggle.querySelector('i').classList.remove('fa-times');
        }
    });

    // Cerrar al clickear un link
    links.forEach(l => {
        l.addEventListener('click', () => {
            menu.classList.remove('active');
            toggle.querySelector('i').classList.add('fa-bars');
            toggle.querySelector('i').classList.remove('fa-times');
        });
    });
}

function initRevealAnimations() {
    const reveals = document.querySelectorAll('.reveal');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) entry.target.classList.add('active');
        });
    }, { threshold: 0.1 });
    reveals.forEach(reveal => observer.observe(reveal));
}

document.addEventListener('DOMContentLoaded', () => {
    const filtrosVacios = { provincia: '', canton: '', distrito: '', categoria: '', termino: '' };
    window.cargarSeccion('/api/eventos/hoy', 'carousel-hoy-track', 'controls-hoy', false, filtrosVacios);
    window.cargarSeccion('/api/eventos/en-progreso', 'carousel-vivo-track', 'controls-vivo', true, filtrosVacios);
    window.cargarProximos(filtrosVacios);
    window.cargarFinalizados(filtrosVacios);

    if (window.configurarBuscadores) window.configurarBuscadores();

    initRevealAnimations();
    initPatchNotes();
    initMobileMenu();
});


