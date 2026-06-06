/**
 * main.js - Orquestador principal de la página de inicio
 */

window.provinciaActual = '';
window.busquedaActual = '';

// ──── POPUP DE ANUNCIO (3 seg) ANTES DE VER EVENTO ────
window.mostrarPopupAnuncio = function (targetUrl) {
    // Si el usuario es administrador, saltar el popup y redirigir directamente
    const user = typeof window.getUsuarioStorage === 'function' ? window.getUsuarioStorage() : JSON.parse(localStorage.getItem('usuario') || 'null');
    if (user && user.rol === 'admin') {
        window.location.href = targetUrl;
        return;
    }

    // Evitar duplicados
    const existing = document.getElementById('ad-popup-overlay');
    if (existing) existing.remove();

    const overlay = document.createElement('div');
    overlay.id = 'ad-popup-overlay';

    overlay.innerHTML = `
        <div id="ad-popup-card" style="position: relative;">
            <button id="ad-popup-close" style="display:none; position:absolute; top:10px; right:15px; background:transparent; border:none; font-size:24px; cursor:pointer; font-weight:bold; color:#555;">&times;</button>
            <div id="ad-popup-header">
                <img 
                    src="/assets/images/LogoOficialExpoFeriasCR/LogoExpoFeriasCR1.png" 
                    alt="ExpoFeriasCR" 
                    id="ad-popup-logo"
                >

                <p id="ad-popup-msg">
                    Apoya a <strong>ExpoFeriasCR</strong> viendo este anuncio
                </p>

                <div id="ad-popup-timer">
                    <span id="ad-popup-count">6</span>
                </div>
            </div>

            <!-- BANNER NATIVE / 320x50 -->
            <div id="ad-popup-native-placeholder" style="margin: 15px 0; min-height: 50px; display: flex; justify-content: center; align-items: center; background: transparent;">
                <iframe srcdoc="
                    <!DOCTYPE html><html><body style='margin:0;padding:0;display:flex;justify-content:center;align-items:center;'>
                    <script>
                    atOptions = {
                        'key' : 'db5fab4e621232d201d1e41f58321ace',
                        'format' : 'iframe',
                        'height' : 50,
                        'width' : 320,
                        'params' : {}
                    };
                    </script>
                    <script src='https://www.highperformanceformat.com/db5fab4e621232d201d1e41f58321ace/invoke.js'></script>
                    </body></html>
                " width="320" height="50" frameborder="0" scrolling="no"></iframe>
            </div>

            <div id="ad-popup-ad-bottom" style="display:flex; justify-content:center; overflow:hidden; min-height:90px; margin-top: 10px; margin-bottom: 15px;">
                <div id="adsterra-container-bottom"></div>
            </div>

            <a 
                href="${targetUrl}" 
                target="_blank"
                id="ad-popup-skip" 
                class="ad-popup-btn" 
                style="display:none;"
            >
                Ir al evento ahora &rarr;
            </a>
        </div>
    `;

    document.body.appendChild(overlay);

    // =========================
    // CARGAR SCRIPT DE ADSTERRA Y SOCIAL BAR
    // =========================

    window.atOptions = {
        key: 'd24a04b077cc5a19d8ab72ae7e33176e',
        format: 'iframe',
        height: 90,
        width: 728,
        params: {}
    };

    const adScriptBottom = document.createElement('script');
    adScriptBottom.src = 'https://www.highperformanceformat.com/d24a04b077cc5a19d8ab72ae7e33176e/invoke.js';
    adScriptBottom.async = true;

    const adContainerBottom = document.getElementById('adsterra-container-bottom');
    if (adContainerBottom) {
        adContainerBottom.appendChild(adScriptBottom);
    }

    const socialScript2 = document.createElement('script');
    socialScript2.src = 'https://pl29512242.effectivecpmnetwork.com/2f/ea/c5/2feac537f8e60dd7004660d723aa9672.js';
    document.body.appendChild(socialScript2);

    // Animación de entrada
    setTimeout(() => {
        overlay.classList.add('active');
    }, 10);

    let timeLeft = 6;

    const countEl = document.getElementById('ad-popup-count');
    const skipBtn = document.getElementById('ad-popup-skip');
    const closeBtn = document.getElementById('ad-popup-close');

    const timer = setInterval(() => {
        timeLeft--;

        if (countEl) {
            countEl.textContent = timeLeft;
        }

        if (timeLeft <= 0) {
            clearInterval(timer);

            if (countEl) {
                countEl.closest('#ad-popup-timer').style.display = 'none';
            }

            if (skipBtn) {
                skipBtn.style.display = 'inline-block';
            }
        }
    }, 1000);

    // Ir al evento abre en nueva pestaña y muestra la X
    if (skipBtn) {
        skipBtn.addEventListener('click', (e) => {
            // No prevenimos el default porque queremos que el target="_blank" abra la nueva ventana.
            if (closeBtn) {
                closeBtn.style.display = 'block';
            }
        });
    }

    // Cerrar el popup
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            overlay.classList.remove('active');
            setTimeout(() => {
                overlay.remove();
            }, 300);
        });
    }
}

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

function createAdCard() {
    const card = document.createElement('div');
    card.className = 'evento-card carousel-slide ad-card';
    card.innerHTML = `
        <div style="display:flex; justify-content:center; align-items:center; height:100%; background:#f8f9fa; border-radius:12px; padding:20px; flex-direction:column; text-align:center;">
            <p style="font-size:12px; color:#999; margin-bottom:10px;">Publicidad</p>
            <iframe srcdoc="<!DOCTYPE html><html><body style='margin:0;padding:0;display:flex;justify-content:center;align-items:center;'><script>atOptions={'key':'db5fab4e621232d201d1e41f58321ace','format':'iframe','height':50,'width':320,'params':{}};</script><script src='https://www.highperformanceformat.com/db5fab4e621232d201d1e41f58321ace/invoke.js'></script></body></html>" width="320" height="50" frameborder="0" scrolling="no"></iframe>
        </div>
    `;
    return card;
}

function createEventoCard(evento, isLive = false) {
    const card = document.createElement('div');
    card.className = 'evento-card carousel-slide';

    // Hacer que toda la tarjeta sea clickable (con popup de anuncio)
    card.onclick = (e) => {
        if (e.target.tagName !== 'A' && !e.target.closest('a')) {
            e.preventDefault();
            window.mostrarPopupAnuncio(`evento.html?slug=${evento.slug}`);
        }
    };
    // Bloquear click de rueda (botón del medio) para forzar el popup
    card.onauxclick = (e) => {
        if (e.button === 1) {
            e.preventDefault();
            window.mostrarPopupAnuncio(`evento.html?slug=${evento.slug}`);
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
            <a href="evento.html?slug=${evento.slug}" class="btn-ver" onclick="event.preventDefault(); window.mostrarPopupAnuncio('evento.html?slug=${evento.slug}');" onauxclick="if(event.button === 1) { event.preventDefault(); event.stopPropagation(); window.mostrarPopupAnuncio('evento.html?slug=${evento.slug}'); }">Ver detalles</a>
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
    
    // Inject in-feed ads
    const cardsWithAds = [];
    const isAd = (() => {
        try {
            const u = JSON.parse(localStorage.getItem('usuario') || 'null');
            return u && u.rol && String(u.rol).toLowerCase() === 'admin';
        } catch(e) { return false; }
    })();

    cards.forEach((c, index) => {
        cardsWithAds.push(c);
        if (!isAd && (index + 1) % 4 === 0) {
            cardsWithAds.push(createAdCard());
        }
    });

    if (window.initCarousel) {
        window.initCarousel(trackId, cardsWithAds, controlsId, 4);
    } else {
        track.innerHTML = '';
        cardsWithAds.forEach(c => track.appendChild(c));
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
        'Deporte',
        'Feria',
        'Concierto',
        'Arte y Cultura',
        'Tour',
        'Fiesta Típica',
        'Gastronomía',
        'Exposición',
        'Talleres y Charlas',
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

        const isAd = (() => {
            try {
                const u = JSON.parse(localStorage.getItem('usuario') || 'null');
                return u && u.rol && String(u.rol).toLowerCase() === 'admin';
            } catch(e) { return false; }
        })();

        const adHtml = isAd ? '' : `
            <div style="text-align: center; margin: 20px 0;">
                <img border="0" alt="" src="https://cdn.storageimagedisplay.com/cti/6f/8f/ef/6f8fefa6447554571085566ee4c3443e/1779116078.jpg" width="728" height="90" style="max-width: 100%; height: auto;">
            </div>
        `;

        const sectionHtml = `
            ${adHtml}
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
        
        // Inject in-feed ads
        const cardsWithAds = [];
        cards.forEach((c, index) => {
            cardsWithAds.push(c);
            if ((index + 1) % 4 === 0) {
                cardsWithAds.push(createAdCard());
            }
        });

        if (window.initCarousel) {
            window.initCarousel(trackId, cardsWithAds, controlsId, 4);
        } else {
            cardsWithAds.forEach(c => track.appendChild(c));
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


