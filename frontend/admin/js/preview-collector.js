/**
 * preview-collector.js - Recolección de datos del formulario admin para la vista previa
 */

export function construirDatosPreview() {
    const get = id => (document.getElementById(id)?.value || '').trim();

    const datos = {
        nombre: get('nombre'),
        descripcion: get('descripcion'),
        fecha_inicio: get('fecha_inicio'),
        fecha_fin: get('fecha_fin'),
        ubicacion: get('ubicacion'),
        provincia: get('provincia'),
        imagen_portada: get('imagen_portada'),
        horario_imagen: get('horario_imagen'),
        mapa_embed: get('mapa_embed'),
        mapa_waze_embed: get('mapa_waze_embed'),
        tiene_expositores: parseInt(get('tiene_expositores')) || 0,
        tipo_venta: get('tipo_venta'),
        url_venta_online: get('url_venta_online'),
        color_primario: get('color_primario') || '#C8102E',
        color_secundario: get('color_secundario') || '#0033A0',
        color_fondo: get('color_fondo') || '#fdfdfd',
        color_texto: get('color_texto') || '#1a1a1a',
        color_hero_overlay: get('color_hero_overlay') || 'rgba(62,42,31,0.7)',
        color_titulo_seccion: get('color_titulo_seccion') || '#1a1a1a',
        color_titulo_hero: get('color_titulo_hero') || '#ffffff',
        color_descripcion_hero: get('color_descripcion_hero') || '#ffffff',
        color_fondo_fechas: get('color_fondo_fechas') || '#0033a0',
        color_texto_fechas: get('color_texto_fechas') || '#c8102e',
        color_menu_fondo: get('color_menu_fondo') || '#ffffff',
        color_menu_texto: get('color_menu_texto') || '#ffffff',
        color_menu_fondo_hover: get('color_menu_fondo_hover') || '',
        color_menu_texto_hover: get('color_menu_texto_hover') || '',
        color_titulo_h3: get('color_titulo_h3') || '#1a1a1a',
        color_fondo_contacto: get('color_fondo_contacto') || '#fdfdfd',
        color_texto_contacto: get('color_texto_contacto') || '#1a1a1a',
        color_enlace_contacto: get('color_enlace_contacto') || '#c8102e',
        color_fondo_footer: get('color_fondo_footer') || '#c8102e',
        color_texto_footer: get('color_texto_footer') || '#ffffff'
    };

    datos.precios = extraerTabla('tbodyPrecios', '.btn-editar-precio', 'precio');
    datos.actividades = extraerTabla('tbodyActividades', '.btn-editar-actividad', 'actividad');
    datos.expositores = extraerTabla('tbodyExpositores', '.btn-editar-expositor', 'expositor');
    datos.galeria = Array.from(document.querySelectorAll('#tbodyGaleria tr'))
        .map(row => {
            const btn = row.querySelector('.btn-editar-galeria');
            return btn ? { imagen_url: btn.dataset.url || '', orden: parseInt(btn.dataset.orden) || 0 } : null;
        }).filter(g => g?.imagen_url);

    return datos;
}

function extraerTabla(tbodyId, btnSelector, dataKey) {
    return Array.from(document.querySelectorAll(`#${tbodyId} tr`))
        .map(row => {
            const btn = row.querySelector(btnSelector);
            if (btn && btn.dataset[dataKey]) {
                try { return JSON.parse(btn.dataset[dataKey]); } catch (_) { }
            }
            return null;
        }).filter(Boolean);
}



