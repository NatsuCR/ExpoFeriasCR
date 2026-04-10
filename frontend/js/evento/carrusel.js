export function initResponsiveCarousel(
    containerId,
    trackId,
    prevBtnId,
    nextBtnId,
    minWidth = 280,
    autoInterval = 10000
) {
    const container = document.getElementById(containerId);
    const track = document.getElementById(trackId);
    let prevBtn = document.getElementById(prevBtnId);
    let nextBtn = document.getElementById(nextBtnId);

    if (!container || !track) return;

    let items = Array.from(track.children);
    if (items.length === 0) return;

    let visibleItems = 1;
    let currentIndex = 0;
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

    // 🔥 AQUÍ ESTÁ LA MAGIA (SOLUCIÓN REAL)
    function moveTo(index) {
        const maxIndex = Math.max(0, items.length - visibleItems);

        if (index < 0) index = maxIndex;
        if (index > maxIndex) index = 0;

        currentIndex = index;

        const offset = items[currentIndex].offsetLeft;

        track.style.transform = `translateX(-${offset}px)`;

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

        const itemWidth = (containerWidth - (visibleItems - 1) * gap) / visibleItems;

        items.forEach(slide => {
            slide.style.flex = `0 0 ${itemWidth}px`;
        });

        // Mostrar/ocultar botones
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

    // 🔥 FIX botones
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
    });

    updateCarousel();
}