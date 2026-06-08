/**
 * publico/carousel.js - Lógica de carruseles para la página principal
 */

window.initCarousel = function(trackId, items, controlsId, itemsPerView = 4) {
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
        if (!container) return;
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

        const maxIndex = isMobile ? totalItems - 1 : Math.max(0, totalItems - itemsPerView);
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

    function goPrev() {
        if (currentIndex > 0) {
            currentIndex--;
            updateTransform();
        }
    }

    function goNext() {
        const maxIndex = isMobile ? totalItems - 1 : Math.max(0, totalItems - itemsPerView);
        if (currentIndex < maxIndex) {
            currentIndex++;
            updateTransform();
        }
    }

    const prevBtn = controls?.querySelector('.carousel-prev');
    const nextBtn = controls?.querySelector('.carousel-next');

    if (prevBtn) prevBtn.onclick = goPrev;
    if (nextBtn) nextBtn.onclick = goNext;

    // --- Soporte para arrastrar con el dedo (Swipe) ---
    let startX = 0;
    let endX = 0;

    track.addEventListener('touchstart', e => {
        startX = e.changedTouches[0].screenX;
    }, {passive: true});

    track.addEventListener('touchend', e => {
        endX = e.changedTouches[0].screenX;
        handleSwipe();
    }, {passive: true});

    track.addEventListener('mousedown', e => {
        startX = e.screenX;
    });

    track.addEventListener('mouseup', e => {
        endX = e.screenX;
        handleSwipe();
    });

    function handleSwipe() {
        const diff = startX - endX;
        const threshold = 40; // píxeles mínimos para detectar el swipe
        if (diff > threshold) {
            goNext(); // Arrastró hacia la izquierda
        } else if (diff < -threshold) {
            goPrev(); // Arrastró hacia la derecha
        }
    }

    window.addEventListener('resize', updateDimensions);
    updateDimensions();
};



