// frontend/js/evento/cargarEvento.js
export async function cargarEvento(slug) {
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

        // Entradas
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
            document.documentElement.style.setProperty('--evento-fondo', evento.colorFondo);
        }
        if (evento.colorTexto) {
            document.body.style.color = evento.colorTexto;
        }
        if (evento.colorHeroOverlay) {
            const overlay = document.querySelector('.hero-overlay');
            if (overlay) overlay.style.backgroundColor = evento.colorHeroOverlay;
        }

        // Colores específicos del hero
        const tituloHero = document.getElementById('eventoNombre');
        const descripcionHero = document.getElementById('eventoDescripcion');
        const fechasHero = document.querySelector('.hero-dates');

        if (tituloHero && evento.colorTituloHero) tituloHero.style.color = evento.colorTituloHero;
        if (descripcionHero && evento.colorDescripcionHero) descripcionHero.style.color = evento.colorDescripcionHero;
        if (fechasHero) {
            if (evento.colorFondoFechas) fechasHero.style.backgroundColor = evento.colorFondoFechas;
            if (evento.colorTextoFechas) fechasHero.style.color = evento.colorTextoFechas;
        }

        // Color para títulos h2
        if (evento.colorTituloSeccion) {
            document.querySelectorAll('h2').forEach(h2 => h2.style.color = evento.colorTituloSeccion);
        }

        // Colores para botones del menú
        if (evento.colorMenuFondo) document.documentElement.style.setProperty('--color-menu-fondo', evento.colorMenuFondo);
        if (evento.colorMenuTexto) document.documentElement.style.setProperty('--color-menu-texto', evento.colorMenuTexto);
        if (evento.colorMenuFondoHover) document.documentElement.style.setProperty('--color-menu-fondo-hover', evento.colorMenuFondoHover);
        if (evento.colorMenuTextoHover) document.documentElement.style.setProperty('--color-menu-texto-hover', evento.colorMenuTextoHover);

        // ========== NUEVOS COLORES PARA CONTACTO Y FOOTER ==========
        // Sección contacto
        const contactoSection = document.querySelector('.contacto');
        if (contactoSection) {
            if (evento.colorFondoContacto) contactoSection.style.backgroundColor = evento.colorFondoContacto;
            if (evento.colorTextoContacto) contactoSection.style.color = evento.colorTextoContacto;
        }
        if (evento.colorEnlaceContacto) {
            document.querySelectorAll('.contacto a').forEach(enlace => {
                enlace.style.color = evento.colorEnlaceContacto;
            });
        }

        // Footer
        const footer = document.querySelector('footer');
        if (footer) {
            if (evento.colorFondoFooter) footer.style.backgroundColor = evento.colorFondoFooter;
            if (evento.colorTextoFooter) {
                footer.style.color = evento.colorTextoFooter;
                footer.querySelectorAll('p').forEach(p => p.style.color = evento.colorTextoFooter);
            }
        }

    } catch (err) {
        console.error(err);
        document.body.innerHTML = '<h1>Evento no encontrado</h1><a href="/">Volver</a>';
    }
}