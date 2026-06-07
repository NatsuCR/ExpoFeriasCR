// carruselFondo.js
export function cargarCarruselFondo(slug) {
    const slidesContainer = document.getElementById('heroSlides');
    if (!slidesContainer) return;

    let imagenesFondo = [];
    let indiceFondo = 0;
    let intervaloFondo;

    fetch(`/api/galeria/${slug}`)
        .then(res => res.json())
        .then(imagenes => {
            imagenesFondo = imagenes;
            if (imagenesFondo.length === 0) {
                slidesContainer.innerHTML = `<div class="hero-carrusel-slide" style="background-image: url('assets/images/IconoOficialExpoFeriasCR/expoferiascrLogoOficial.png');"></div>`;
                return;
            }
            slidesContainer.innerHTML = '';
            imagenesFondo.forEach((img, idx) => {
                const slide = document.createElement('div');
                slide.className = 'hero-carrusel-slide';
                // Usamos una etiqueta img real para SEO (Google Imágenes)
                const image = document.createElement('img');
                image.src = img.imagen_url;
                image.alt = `Galería ${idx + 1} - ${document.title}`;
                if (idx > 0) image.setAttribute('loading', 'lazy');
                image.style.width = '100%';
                image.style.height = '100%';
                image.style.objectFit = 'cover';
                slide.appendChild(image);
                slidesContainer.appendChild(slide);
            });
            mostrarSlideFondo(0);
            iniciarAutoSlideFondo();
            window.addEventListener('resize', () => mostrarSlideFondo(indiceFondo));
        })
        .catch(err => {
            console.error('Error cargando galería:', err);
            slidesContainer.innerHTML = `<div class="hero-carrusel-slide" style="background-image: url('assets/images/IconoOficialExpoFeriasCR/expoferiascrLogoOficial.png');"></div>`;
        });

    function mostrarSlideFondo(index) {
        if (imagenesFondo.length === 0) return;
        indiceFondo = (index + imagenesFondo.length) % imagenesFondo.length;
        slidesContainer.style.transform = `translateX(-${indiceFondo * 100}%)`;
    }

    function siguienteSlideFondo() { mostrarSlideFondo(indiceFondo + 1); reiniciarAutoSlideFondo(); }
    function anteriorSlideFondo() { mostrarSlideFondo(indiceFondo - 1); reiniciarAutoSlideFondo(); }
    function iniciarAutoSlideFondo() { if (intervaloFondo) clearInterval(intervaloFondo); intervaloFondo = setInterval(() => siguienteSlideFondo(), 10000); }
    function reiniciarAutoSlideFondo() { if (intervaloFondo) clearInterval(intervaloFondo); iniciarAutoSlideFondo(); }

    const prev = document.getElementById('heroPrevBtn');
    const next = document.getElementById('heroNextBtn');
    if (prev && next) {
        prev.addEventListener('click', anteriorSlideFondo);
        next.addEventListener('click', siguienteSlideFondo);
    }
}


