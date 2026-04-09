const urlParams = new URLSearchParams(window.location.search);
const slug = urlParams.get('slug');
if (!slug) window.location.href = '/';

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

        // Colores generales (body, variables CSS, overlay)
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

        // ========== COLORES ESPECÍFICOS DEL HERO (para legibilidad sobre el carrusel) ==========
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

    } catch (err) {
        console.error(err);
        document.body.innerHTML = '<h1>Evento no encontrado</h1><a href="/">Volver</a>';
    }
}

async function cargarActividades() {
    const container = document.getElementById('actividadesGrid');
    try {
        const res = await fetch(`/api/actividades/${slug}`);
        const actividades = await res.json();
        if (actividades.length === 0) {
            container.innerHTML = '<p>No hay actividades registradas.</p>';
            return;
        }
        let html = '';
        actividades.forEach(a => {
            html += `
                <div class="actividad-card">
                    ${a.imagen ? `<img src="${a.imagen}" alt="${a.titulo}">` : ''}
                    <h3>${a.titulo}</h3>
                    <p><i class="fas fa-calendar-day"></i> ${new Date(a.fecha).toLocaleDateString()} ${a.hora ? a.hora.slice(0,5) : ''}</p>
                    <p><i class="fas fa-map-pin"></i> ${a.lugar || 'Campo ferial'}</p>
                    <p>${a.descripcion || ''}</p>
                    ${a.requiereEntradaOnline ? `<p><i class="fas fa-ticket-alt"></i> <a href="${a.enlaceVenta}" target="_blank">Comprar entrada</a></p>` : ''}
                    ${a.esGratis ? '<p><strong>Evento gratuito</strong></p>' : ''}
                </div>
            `;
        });
        container.innerHTML = html;
    } catch (err) {
        container.innerHTML = '<p>Error al cargar actividades.</p>';
    }
}

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
            const precioFormateado = new Intl.NumberFormat('es-CR', { style: 'currency', currency: 'CRC', minimumFractionDigits: 0 }).format(p.precioNormal);
            html += `<tr>
                        <td>${fecha}</td>
                        <td>${precioFormateado}</td>
                        <td>${p.promocion || '—'}</td>
                        <td>${p.descripcionPromocion || '—'}</td>
                    </tr>`;
        });
        html += `</tbody></tr>`;
        container.innerHTML = html;
    } catch (err) {
        container.innerHTML = '<p>Error al cargar precios.</p>';
    }
}

async function cargarExpositores() {
    const container = document.getElementById('expositoresGrid');
    try {
        const res = await fetch(`/api/expositores/${slug}`);
        const expositores = await res.json();
        if (expositores.length === 0) {
            container.innerHTML = '<p>No hay expositores registrados.</p>';
            return;
        }
        let html = '';
        expositores.forEach(e => {
            html += `
                <div class="expositor-card">
                    ${e.imagenLogo ? `<img src="${e.imagenLogo}" alt="${e.nombre}">` : ''}
                    <h3>${e.nombre}</h3>
                    <p><strong>Rubro:</strong> ${e.rubro}</p>
                    <p>${e.descripcion || ''}</p>
                    <p><strong>Ubicación:</strong> ${e.ubicacion || 'Por definir'}</p>
                    ${e.videoUrl ? `<video controls src="${e.videoUrl}" style="width:100%; max-height:200px; margin-top:1rem;"></video>` : ''}
                </div>
            `;
        });
        container.innerHTML = html;
    } catch (err) {
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

document.addEventListener('DOMContentLoaded', () => {
    cargarEvento();
    cargarActividades();
    cargarPrecios();
    cargarExpositores();
    cargarCarruselFondo();
    configurarBotonesCarrusel();
});