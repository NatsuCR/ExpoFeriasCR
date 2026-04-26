/**
 * crear-evento-sliders.js - Control de sliders de opacidad
 */

export function initOpacitySliders(context) {
    const heroSlider = document.getElementById('opacidad_hero_slider');
    const heroLabel = document.getElementById('opacidad_hero_label');
    const heroInput = document.getElementById('color_hero_overlay');

    const updateHero = (val) => {
      const opacity = parseFloat(val);
      const percent = Math.round(opacity * 100);
      if (heroLabel) heroLabel.textContent = `Oscuridad: ${percent}%`;
      if (heroInput) heroInput.value = `rgba(0, 0, 0, ${opacity})`;
      import('./previewManager.js').then(m => m.programarActualizacion());
    };

    if (heroSlider) {
      heroSlider.addEventListener('input', (e) => updateHero(e.target.value));
    }
}

export function actualizarTodosLosSliders() {
    const heroInput = document.getElementById('color_hero_overlay');
    const heroSlider = document.getElementById('opacidad_hero_slider');
    const heroLabel = document.getElementById('opacidad_hero_label');

    if (heroInput && heroInput.value) {
      const match = heroInput.value.match(/rgba\(0, 0, 0, ([\d.]+)\)/);
      if (match && match[1]) {
        const val = match[1];
        if (heroSlider) heroSlider.value = val;
        if (heroLabel) heroLabel.textContent = `Oscuridad: ${Math.round(val * 100)}%`;
      }
    }
}



