class Evento {
  constructor(data = {}) {
    this.id = data.id;
    this.usuario_id = data.usuario_id;
    this.slug = data.slug;
    this.nombre = data.nombre;
    this.descripcion = data.descripcion;
    this.fecha_inicio = data.fecha_inicio;
    this.fecha_fin = data.fecha_fin;
    this.ubicacion = data.ubicacion;
    this.imagen_portada = data.imagen_portada;
    this.activo = data.activo;
    this.horario_imagen = data.horario_imagen;
    this.mapa_embed = data.mapa_embed;
    this.mapa_waze_embed = data.mapa_waze_embed;
    this.tipo_venta = data.tipo_venta;
    this.url_venta_online = data.url_venta_online;
    this.provincia = data.provincia;
    
    // Colores y Personalización
    this.color_primario = data.color_primario || '#8b5a2b';
    this.color_secundario = data.color_secundario || '#d4a373';
    this.color_fondo = data.color_fondo || '#f4e4c1';
    this.color_texto = data.color_texto || '#2c1a0e';
    this.color_descripcion_texto = data.color_descripcion_texto || '#2c1a0e';
    this.color_hero_overlay = data.color_hero_overlay || 'rgba(62,42,31,0.7)';
    this.color_titulo_seccion = data.color_titulo_seccion || '#2c1a0e';
    this.color_titulo_hero = data.color_titulo_hero || '#ffffff';
    this.color_descripcion_hero = data.color_descripcion_hero || '#ffffff';
    this.color_fondo_fechas = data.color_fondo_fechas || '#d4a373';
    this.color_texto_fechas = data.color_texto_fechas || '#8b5a2b';
    this.color_menu_fondo = data.color_menu_fondo || '#ffffff';
    this.color_menu_texto = data.color_menu_texto || '#ffffff';
    this.color_menu_fondo_hover = data.color_menu_fondo_hover || '';
    this.color_menu_texto_hover = data.color_menu_texto_hover || '';
    this.color_titulo_h3 = data.color_titulo_h3 || '#2c1a0e';
    this.color_fondo_contacto = data.color_fondo_contacto || '#f4e4c1';
    this.color_texto_contacto = data.color_texto_contacto || '#2c1a0e';
    this.color_enlace_contacto = data.color_enlace_contacto || '#8b5a2b';
    this.color_fondo_footer = data.color_fondo_footer || '#8b5a2b';
    this.color_texto_footer = data.color_texto_footer || '#ffffff';
    
    // Buscador y Cards
    this.color_buscador_expositores = data.color_buscador_expositores || '#ffffff';
    this.color_borde_buscador_expositores = data.color_borde_buscador_expositores || '#eeeeee';
    this.color_card_fondo = data.color_card_fondo || '#ffffff';
    this.color_card_borde = data.color_card_borde || '#f0f0f0';
    this.color_rubro_fondo = data.color_rubro_fondo || '#f0f0f0';
    this.color_rubro_texto = data.color_rubro_texto || '#000000';
    this.color_buscador_fondo = data.color_buscador_fondo || '#ffffff';
    this.color_buscador_borde = data.color_buscador_borde || '#eeeeee';
    this.color_btn_ver_mas = data.color_btn_ver_mas || '#C8102E';
    this.color_fondo_share = data.color_fondo_share || 'rgba(255, 255, 255, 0.5)';
    this.color_texto_share = data.color_texto_share || '#2c1a0e';
    
    this.tiene_expositores = (data.tiene_expositores !== undefined && data.tiene_expositores !== null) ? parseInt(data.tiene_expositores) : 0;
    this.activo = (data.activo !== undefined && data.activo !== null) ? parseInt(data.activo) : 0;
    this.es_en_vivo = (data.es_en_vivo !== undefined && data.es_en_vivo !== null) ? parseInt(data.es_en_vivo) : 0;

    this.estado = data.estado;
    this.razon_rechazo = data.razon_rechazo;
    this.borrador_cambios = data.borrador_cambios;
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
  }

  static fromDatabase(row) {
    if (!row) return null;
    return new Evento(row);
  }
}

module.exports = Evento;