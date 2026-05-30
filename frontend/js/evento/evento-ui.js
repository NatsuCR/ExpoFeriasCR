/**
 * evento-ui.js - Gestión de carruseles y visibilidad
 */

export function initCarouselControls() {
    // Esta función queda vacía ya que los carruseles se inicializan 
    // ahora de forma responsiva en cargarActividades.js y cargarExpositores.js
}

export function initHeroCarousel() {
    const slidesWrap = document.getElementById('heroSlides');
    const prevBtn = document.getElementById('heroPrevBtn');
    const nextBtn = document.getElementById('heroNextBtn');
    
    if (!slidesWrap) return;
    
    let index = 0;
    const slides = slidesWrap.querySelectorAll('.hero-carrusel-slide');
    if (slides.length <= 1) {
        if (prevBtn) prevBtn.style.display = 'none';
        if (nextBtn) nextBtn.style.display = 'none';
        return;
    }

    const showSlide = (newIndex) => {
        slides.forEach((s, i) => {
            s.classList.toggle('activa', i === newIndex);
            s.style.display = (i === newIndex) ? 'block' : 'none';
        });
        index = newIndex;
    };

    if (prevBtn) {
        prevBtn.style.display = 'flex';
        prevBtn.onclick = () => showSlide((index - 1 + slides.length) % slides.length);
    }
    if (nextBtn) {
        nextBtn.style.display = 'flex';
        nextBtn.onclick = () => showSlide((index + 1) % slides.length);
    }

    // Auto-slide cada 8 segundos
    if (slidesWrap.dataset.intervalId) {
        clearInterval(parseInt(slidesWrap.dataset.intervalId));
    }

    let interval = setInterval(() => {
        showSlide((index + 1) % slides.length);
    }, 35000);
    
    slidesWrap.dataset.intervalId = interval;

    // Resetear intervalo al hacer click manual
    const resetInterval = () => {
        clearInterval(interval);
        interval = setInterval(() => showSlide((index + 1) % slides.length), 35000);
        slidesWrap.dataset.intervalId = interval;
    };
    if (prevBtn) prevBtn.addEventListener('click', resetInterval);
    if (nextBtn) nextBtn.addEventListener('click', resetInterval);
}

export function aplicarVisibilidadExpositores(valor) {
    const vTiene = parseInt(valor);
    const section = document.getElementById('expositores');
    const links = document.querySelectorAll('.nav-links a[href="#expositores"]');

    if (section) section.style.display = (vTiene === 1) ? 'block' : 'none';
    links.forEach(link => {
        const li = link.closest('li');
        if (li) li.style.display = (vTiene === 1) ? 'block' : 'none';
    });
}

export function initSocialShare() {
    const url = window.location.href;
    const title = document.title;
    const fb = document.getElementById('shareFacebook');
    if (fb) {
        fb.href = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
        fb.target = '_blank';
        fb.rel = 'noopener noreferrer';
    }
    
    const tw = document.getElementById('shareTwitter');
    if (tw) {
        tw.href = `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`;
        tw.target = '_blank';
        tw.rel = 'noopener noreferrer';
    }
    
    const wa = document.getElementById('shareWhatsapp');
    if (wa) {
        wa.href = `https://api.whatsapp.com/send?text=${encodeURIComponent(title + ' ' + url)}`;
        wa.target = '_blank';
        wa.rel = 'noopener noreferrer';
    }

    const tg = document.getElementById('shareTelegram');
    if (tg) {
        tg.href = `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`;
        tg.target = '_blank';
        tg.rel = 'noopener noreferrer';
    }

    const copy = document.getElementById('shareCopy');
    if (copy) {
        copy.onclick = (e) => {
            e.preventDefault();
            navigator.clipboard.writeText(url).then(() => {
                copy.classList.add('success');
                setTimeout(() => copy.classList.remove('success'), 2000);
            });
        };
    }
}



