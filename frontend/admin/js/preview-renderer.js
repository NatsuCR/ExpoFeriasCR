/**
 * preview-renderer.js - Lógica de renderizado en vivo para el iframe de vista previa
 */

export function aplicarCambiosEnVivo(doc) {
    if (!doc?.body) return;
    const get = id => (document.getElementById(id)?.value || '').trim();

    // Textos
    const h1 = doc.getElementById('eventoNombre');
    if (h1) h1.innerText = get('nombre') || 'Sin nombre';
    const desc = doc.getElementById('eventoDescripcion');
    if (desc) desc.innerText = get('descripcion');

    // CSS Variables
    const r = doc.documentElement;
    r.style.setProperty('--evento-primario', get('color_primario') || '#C8102E');
    r.style.setProperty('--evento-secundario', get('color_secundario') || '#0033A0');
    r.style.setProperty('--evento-fondo', get('color_fondo') || '#fdfdfd');
    
    if (get('color_texto')) doc.body.style.color = get('color_texto');
    
    const overlay = doc.querySelector('.hero-overlay');
    if (overlay && get('color_hero_overlay')) overlay.style.backgroundColor = get('color_hero_overlay');

    if (h1 && get('color_titulo_hero')) h1.style.color = get('color_titulo_hero');
}

export function renderizarSecciones(doc, datos) {
    if (!doc?.body) return;
    
    // Actividades
    const actGrid = doc.getElementById('actividadesGrid');
    if (actGrid && datos.actividades.length > 0) {
        actGrid.innerHTML = datos.actividades.map(act => `
            <div class="actividad-card">
                <div class="card-content">
                    <h3>${act.titulo}</h3>
                    <p><strong>Tipo:</strong> ${act.tipo}</p>
                </div>
            </div>
        `).join('');
    }
}



