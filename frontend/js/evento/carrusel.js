// carrusel.js

// Carrusel principal (página de inicio) - recibe items como nodos DOM
export function initCarousel(trackId, items, controlsId, itemsPerView = 4) {
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
            Array.from(track.children).forEach(card => {
                card.style.minWidth = '';
                card.style.maxWidth = '';
                card.style.marginRight = '';
            });

            const firstCard = track.children[0];
            const secondCard = track.children[1];
            if (firstCard && secondCard) {
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

    window.addEventListener('resize', updateDimensions);
    updateDimensions();
}

// Carrusel responsive para actividades/expositores - opera sobre HTML ya renderizado
export function initResponsiveCarousel(wrapperId, trackId, prevBtnId, nextBtnId, cardWidth = 280, autoPlayMs = 0) {
    const wrapper = document.getElementById(wrapperId);
    const track = document.getElementById(trackId);
    const prevBtn = document.getElementById(prevBtnId);
    const nextBtn = document.getElementById(nextBtnId);
    if (!track || !wrapper) return { detener: () => {}, reanudar: () => {} };

    const totalItems = track.children.length;
    if (totalItems === 0) return { detener: () => {}, reanudar: () => {} };

    let currentIndex = 0;
    let itemsVisible = 1;
    let step = 0;
    let maxIndex = 0;
    let intervalo = null;
    const autoPlayEnabled = autoPlayMs > 0;

    function updateDimensions() {
        const viewportWidth = wrapper.clientWidth;
        const isMobile = window.innerWidth <= 768;

        const firstCard = track.children[0];
        const secondCard = track.children[1];

        if (isMobile) {
            itemsVisible = 1;
            // Medición de precisión: distancia real entre el inicio de card 1 y card 2
            if (firstCard && secondCard) {
                step = secondCard.offsetLeft - firstCard.offsetLeft;
            } else if (firstCard) {
                step = firstCard.offsetWidth;
            } else {
                step = viewportWidth;
            }
        } else {
            itemsVisible = Math.max(1, Math.floor(viewportWidth / cardWidth));
            if (firstCard && secondCard) {
                step = secondCard.offsetLeft - firstCard.offsetLeft;
            } else if (firstCard) {
                step = firstCard.offsetWidth;
            }
        }

        maxIndex = Math.max(0, totalItems - itemsVisible);
        if (currentIndex > maxIndex) currentIndex = maxIndex;

        if (prevBtn) prevBtn.style.display = totalItems > itemsVisible ? 'flex' : 'none';
        if (nextBtn) nextBtn.style.display = totalItems > itemsVisible ? 'flex' : 'none';

        updateTransform();
    }

    function updateTransform() {
        track.style.transform = `translateX(${-(currentIndex * step)}px)`;
    }

    function goNext() {
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

    if (prevBtn) prevBtn.addEventListener('click', goPrev);
    if (nextBtn) nextBtn.addEventListener('click', goNext);

    window.addEventListener('resize', updateDimensions);
    
    // Pequeña espera para asegurar que el navegador haya pintado y calculado anchos reales
    requestAnimationFrame(() => {
        updateDimensions();
    });

    function iniciarAutoplay() {
        if (!autoPlayEnabled) return;
        if (intervalo) clearInterval(intervalo);
        intervalo = setInterval(() => {
            if (currentIndex < maxIndex) {
                currentIndex++;
            } else {
                currentIndex = 0;
            }
            updateTransform();
        }, autoPlayMs);
    }

    function detenerAutoplay() {
        if (intervalo) {
            clearInterval(intervalo);
            intervalo = null;
        }
    }

    function reanudarAutoplay() {
        if (!intervalo && autoPlayEnabled) {
            iniciarAutoplay();
        }
    }

    if (autoPlayEnabled) {
        iniciarAutoplay();
    }

    return {
        detener: detenerAutoplay,
        reanudar: reanudarAutoplay
    };
}