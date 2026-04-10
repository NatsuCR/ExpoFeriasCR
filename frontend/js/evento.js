// frontend/js/evento.js
const urlParams = new URLSearchParams(window.location.search);
const slug = urlParams.get('slug');
if (!slug) window.location.href = '/';

// ==================== CARRUSEL RESPONSIVE CON AUTO-SLIDE ====================
function initResponsiveCarousel(containerId, trackId, prevBtnId, nextBtnId, minWidth = 280, autoInterval = 10000) {
    const container = document.getElementById(containerId);
    const track = document.getElementById(trackId);
    let prevBtn = document.getElementById(prevBtnId);
    let nextBtn = document.getElementById(nextBtnId);

    if (!container || !track) return;

    let items = Array.from(track.children);
    if (items.length === 0) return;

    let visibleItems = 1;
    let currentIndex = 0;
    let itemWidth = 0;
    let autoTimer = null;

    function stopAuto() {
        if (autoTimer) clearInterval(autoTimer);
    }

    function startAuto() {
        stopAuto();
        if (items.length > 1) {
            autoTimer = setInterval(() => {
                let newIndex = currentIndex + 1;
                const maxIndex = Math.max(0, items.length - visibleItems);
                if (newIndex > maxIndex) newIndex = 0;
                moveTo(newIndex);
            }, autoInterval);
        }
    }

    function moveTo(index) {
        const maxIndex = Math.max(0, items.length - visibleItems);
        if (index < 0) index = maxIndex;
        if (index > maxIndex) index = 0;

        currentIndex = index;

        const offset = -currentIndex * (itemWidth + 24);
        track.style.transform = `translateX(${offset}px)`;

        if (items.length > 1) {
            stopAuto();
            startAuto();
        }
    }

    function updateCarousel() {
        const containerWidth = container.clientWidth;

        visibleItems = Math.floor(containerWidth / minWidth);
        if (visibleItems < 1) visibleItems = 1;
        if (visibleItems > 3) visibleItems = 3;

        const gap = 24;
        itemWidth = (containerWidth - (visibleItems - 1) * gap) / visibleItems;

        items.forEach(slide => {
            slide.style.flex = `0 0 ${itemWidth}px`;
            slide.style.marginRight = `${gap}px`;
        });

        if (items.length) items[items.length - 1].style.marginRight = '0';

        // 🔥 Mostrar/ocultar botones correctamente
        if (prevBtn && nextBtn) {
            if (items.length <= 1) {
                prevBtn.style.display = 'none';
                nextBtn.style.display = 'none';
                stopAuto();
            } else {
                prevBtn.style.display = 'flex';
                nextBtn.style.display = 'flex';
                startAuto();
            }
        }

        const maxIndex = Math.max(0, items.length - visibleItems);
        if (currentIndex > maxIndex) currentIndex = maxIndex;

        moveTo(currentIndex);
    }

    // 🔥 FIX: Clonar botones correctamente
    if (prevBtn) {
        const newPrev = prevBtn.cloneNode(true);
        prevBtn.parentNode.replaceChild(newPrev, prevBtn);
        prevBtn = newPrev;

        prevBtn.addEventListener('click', () => {
            let newIndex = currentIndex - 1;
            if (newIndex < 0) newIndex = Math.max(0, items.length - visibleItems);
            moveTo(newIndex);
        });
    }

    if (nextBtn) {
        const newNext = nextBtn.cloneNode(true);
        nextBtn.parentNode.replaceChild(newNext, nextBtn);
        nextBtn = newNext;

        nextBtn.addEventListener('click', () => {
            let newIndex = currentIndex + 1;
            const maxIndex = Math.max(0, items.length - visibleItems);
            if (newIndex > maxIndex) newIndex = 0;
            moveTo(newIndex);
        });
    }

    window.addEventListener('resize', () => {
        updateCarousel();
        moveTo(currentIndex);
    });

    updateCarousel();
}

// ==================== CARGAR INFORMACIÓN DEL EVENTO ====================
async function cargarEvento() {
    try {
        const res = await fetch(`/api/eventos/${slug}`);
        const evento = await res.json();

        document.title = evento.nombre;
        document.getElementById('eventoNombre').innerText = evento.nombre;
        document.getElementById('eventoDescripcion').innerText = evento.descripcion;
        document.getElementById('eventoFechas').innerHTML = `${new Date(evento.fechaInicio).toLocaleDateString()} al ${new Date(evento.fechaFin).toLocaleDateString()}`;
        document.getElementById('eventoInfoCompleta').innerHTML = evento.descripcion;
        document.getElementById('infoFechas').innerHTML = `${new Date(evento.fechaInicio).toLocaleDateString()} - ${new Date(evento.fechaFin).toLocaleDateString()}`;
        document.getElementById('infoUbicacion').innerHTML = evento.ubicacion;
        document.getElementById('ubicacionTexto').innerHTML = evento.ubicacion;

        // Horario
        const horarioDiv = document.getElementById('horarioContainer');
        const horarioImgUrl = evento.horarioImagen || evento.horario_imagen;
        if (horarioImgUrl) {
            horarioDiv.innerHTML = `<img src="${horarioImgUrl}" class="horario-img" style="max-width:100%;">`;
        } else {
            horarioDiv.innerHTML = '<p>Horario no disponible</p>';
        }

        // Mapa
        const mapaDiv = document.getElementById('mapaIframe');
        if (evento.mapaEmbed) {
            mapaDiv.innerHTML = evento.mapaEmbed;
        } else {
            mapaDiv.innerHTML = '<p>Mapa no disponible</p>';
        }

        // Información de entradas
        const entradasParrafo = document.getElementById('entradasTexto');
        if (entradasParrafo) {
            let textoEntradas = '';
            switch (evento.tipoVenta) {
                case 'online':
                    textoEntradas = `Entradas en línea: <a href="${evento.urlVentaOnline}" target="_blank">Comprar aquí</a>`;
                    break;
                case 'ambos':
                    textoEntradas = `Entradas en taquilla y en línea: <a href="${evento.urlVentaOnline}" target="_blank">Comprar en línea</a>`;
                    break;
                default:
                    textoEntradas = 'Entradas solo en taquilla del campo ferial';
            }
            entradasParrafo.innerHTML = textoEntradas;
        }

        // Colores generales
        if (evento.colorPrimario) {
            document.documentElement.style.setProperty('--evento-primario', evento.colorPrimario);
        }
        if (evento.colorSecundario) {
            document.documentElement.style.setProperty('--evento-secundario', evento.colorSecundario);
        }
        if (evento.colorFondo) {
            document.body.style.backgroundColor = evento.colorFondo;
        }
        if (evento.colorTexto) {
            document.body.style.color = evento.colorTexto;
        }
        if (evento.colorHeroOverlay) {
            const overlay = document.querySelector('.hero-overlay');
            if (overlay) {
                overlay.style.backgroundColor = evento.colorHeroOverlay;
            }
        }

        // Colores específicos del hero
        const tituloHero = document.getElementById('eventoNombre');
        const descripcionHero = document.getElementById('eventoDescripcion');
        const fechasHero = document.querySelector('.hero-dates');

        if (tituloHero && evento.colorTituloHero) {
            tituloHero.style.color = evento.colorTituloHero;
        }
        if (descripcionHero && evento.colorDescripcionHero) {
            descripcionHero.style.color = evento.colorDescripcionHero;
        }
        if (fechasHero) {
            if (evento.colorFondoFechas) {
                fechasHero.style.backgroundColor = evento.colorFondoFechas;
            }
            if (evento.colorTextoFechas) {
                fechasHero.style.color = evento.colorTextoFechas;
            }
        }

        // Color para títulos h2
        if (evento.colorTituloSeccion) {
            const titulosSeccion = document.querySelectorAll('h2');
            titulosSeccion.forEach(h2 => {
                h2.style.color = evento.colorTituloSeccion;
            });
        }

        // Colores para botones del menú
        if (evento.colorMenuFondo) {
            document.documentElement.style.setProperty('--color-menu-fondo', evento.colorMenuFondo);
        }
        if (evento.colorMenuTexto) {
            document.documentElement.style.setProperty('--color-menu-texto', evento.colorMenuTexto);
        }
        if (evento.colorMenuFondoHover) {
            document.documentElement.style.setProperty('--color-menu-fondo-hover', evento.colorMenuFondoHover);
        }
        if (evento.colorMenuTextoHover) {
            document.documentElement.style.setProperty('--color-menu-texto-hover', evento.colorMenuTextoHover);
        }

    } catch (err) {
        console.error(err);
        document.body.innerHTML = '<h1>Evento no encontrado</h1><a href="/">Volver</a>';
    }
}

// ==================== ACTIVIDADES ====================
async function cargarActividades() {
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

// ==================== PRECIOS ====================
async function cargarPrecios() {
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
            const fecha = new Date(p.fecha).toLocaleDateString('es-CR', { weekday: 'long', day: 'numeric', month: 'long' });
            const precioNum = parseFloat(p.precio_normal);
            const precioFormateado = isNaN(precioNum) ? '₡0' : new Intl.NumberFormat('es-CR', { style: 'currency', currency: 'CRC', minimumFractionDigits: 0 }).format(precioNum);
            const promocion = p.promocion || '—';
            const detalle = p.descripcion_promocion || '—';
            html += `<td>
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

// ==================== EXPOSITORES ====================
async function cargarExpositores() {
    const container = document.getElementById('expositoresGrid');
    if (!container) return;

    try {
        const res = await fetch(`/api/expositores/${slug}`);
        const expositores = await res.json();

        if (expositores.length === 0) {
            container.innerHTML = '<p>No hay expositores registrados.</p>';
            return;
        }

        let html = '';
        expositores.forEach(e => {
            const imagenHtml = e.imagenLogo ? `<img src="${e.imagenLogo}" alt="${e.nombre}">` : '';
            const videoHtml = e.videoUrl ? `<video controls src="${e.videoUrl}" style="width:100%; max-height:200px; margin-top:1rem;"></video>` : '';
            html += `
                <div class="expositor-card">
                    ${imagenHtml}
                    <h3>${e.nombre}</h3>
                    <p><strong>Rubro:</strong> ${e.rubro}</p>
                    <p>${e.descripcion || ''}</p>
                    <p><strong>Ubicación:</strong> ${e.ubicacion || 'Por definir'}</p>
                    ${videoHtml}
                </div>
            `;
        });
        container.innerHTML = html;

        initResponsiveCarousel('expositoresWrapper', 'expositoresGrid', 'expositoresPrev', 'expositoresNext', 280, 10000);
    } catch (err) {
        console.error(err);
        container.innerHTML = '<p>Error al cargar expositores.</p>';
    }
}

// ==================== CARRUSEL DE FONDO ====================
let imagenesFondo = [];
let indiceFondo = 0;
let intervaloFondo;

function cargarCarruselFondo() {
    const slidesContainer = document.getElementById('heroSlides');
    if (!slidesContainer) return;
    fetch(`/api/galeria/${slug}`)
        .then(res => res.json())
        .then(imagenes => {
            imagenesFondo = imagenes;
            if (imagenesFondo.length === 0) {
                slidesContainer.innerHTML = `<div class="hero-carrusel-slide" style="background-image: url('assets/images/ExpoSanCarlos2026/campo-ferial.jpg');"></div>`;
                return;
            }
            slidesContainer.innerHTML = '';
            imagenesFondo.forEach(img => {
                const slide = document.createElement('div');
                slide.className = 'hero-carrusel-slide';
                slide.style.backgroundImage = `url('${img.imagen_url}')`;
                slidesContainer.appendChild(slide);
            });
            mostrarSlideFondo(0);
            iniciarAutoSlideFondo();
            window.addEventListener('resize', () => mostrarSlideFondo(indiceFondo));
        })
        .catch(err => {
            console.error('Error cargando galería:', err);
            slidesContainer.innerHTML = `<div class="hero-carrusel-slide" style="background-image: url('assets/images/ExpoSanCarlos2026/campo-ferial.jpg');"></div>`;
        });
}

function mostrarSlideFondo(index) {
    if (imagenesFondo.length === 0) return;
    indiceFondo = (index + imagenesFondo.length) % imagenesFondo.length;
    const slidesContainer = document.getElementById('heroSlides');
    if (slidesContainer) slidesContainer.style.transform = `translateX(-${indiceFondo * 100}%)`;
}

function siguienteSlideFondo() { mostrarSlideFondo(indiceFondo + 1); reiniciarAutoSlideFondo(); }
function anteriorSlideFondo() { mostrarSlideFondo(indiceFondo - 1); reiniciarAutoSlideFondo(); }
function iniciarAutoSlideFondo() { if (intervaloFondo) clearInterval(intervaloFondo); intervaloFondo = setInterval(() => siguienteSlideFondo(), 10000); }
function reiniciarAutoSlideFondo() { if (intervaloFondo) clearInterval(intervaloFondo); iniciarAutoSlideFondo(); }
function configurarBotonesCarrusel() {
    const prev = document.getElementById('heroPrevBtn');
    const next = document.getElementById('heroNextBtn');
    if (prev && next) {
        prev.addEventListener('click', anteriorSlideFondo);
        next.addEventListener('click', siguienteSlideFondo);
    }
}

// ==================== INICIALIZACIÓN ====================
document.addEventListener('DOMContentLoaded', () => {
    cargarEvento();
    cargarActividades();
    cargarPrecios();
    cargarExpositores();
    cargarCarruselFondo();
    configurarBotonesCarrusel();
});