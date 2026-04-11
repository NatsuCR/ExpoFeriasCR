class Evento {
  constructor(
    id, slug, nombre, descripcion, fechaInicio, fechaFin, ubicacion,
    imagenPortada, activo, horarioImagen, mapaEmbed,
    colorPrimario, colorSecundario, colorFondo, colorTexto, colorHeroOverlay,
    tipoVenta, urlVentaOnline,
    colorTituloHero, colorDescripcionHero, colorFondoFechas, colorTextoFechas,
    colorTituloSeccion, provincia,
    colorMenuFondo, colorMenuTexto, colorMenuFondoHover, colorMenuTextoHover,
    colorFondoContacto, colorTextoContacto, colorEnlaceContacto,
    colorFondoFooter, colorTextoFooter,
    colorTituloH3,
    createdAt, updatedAt
  ) {
    this.id = id;
    this.slug = slug;
    this.nombre = nombre;
    this.descripcion = descripcion;
    this.fechaInicio = fechaInicio;
    this.fechaFin = fechaFin;
    this.ubicacion = ubicacion;
    this.imagenPortada = imagenPortada;
    this.activo = activo;
    this.horarioImagen = horarioImagen;
    this.mapaEmbed = mapaEmbed;
    this.colorPrimario = colorPrimario;
    this.colorSecundario = colorSecundario;
    this.colorFondo = colorFondo;
    this.colorTexto = colorTexto;
    this.colorHeroOverlay = colorHeroOverlay;
    this.tipoVenta = tipoVenta;
    this.urlVentaOnline = urlVentaOnline;
    this.colorTituloHero = colorTituloHero;
    this.colorDescripcionHero = colorDescripcionHero;
    this.colorFondoFechas = colorFondoFechas;
    this.colorTextoFechas = colorTextoFechas;
    this.colorTituloSeccion = colorTituloSeccion;
    this.provincia = provincia;
    this.colorMenuFondo = colorMenuFondo;
    this.colorMenuTexto = colorMenuTexto;
    this.colorMenuFondoHover = colorMenuFondoHover;
    this.colorMenuTextoHover = colorMenuTextoHover;
    this.colorFondoContacto = colorFondoContacto;
    this.colorTextoContacto = colorTextoContacto;
    this.colorEnlaceContacto = colorEnlaceContacto;
    this.colorFondoFooter = colorFondoFooter;
    this.colorTextoFooter = colorTextoFooter;
    this.colorTituloH3 = colorTituloH3;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  static fromDatabase(row) {
    return new Evento(
      row.id, row.slug, row.nombre, row.descripcion,
      row.fecha_inicio, row.fecha_fin, row.ubicacion,
      row.imagen_portada, row.activo, row.horario_imagen,
      row.mapa_embed,
      row.color_primario, row.color_secundario, row.color_fondo,
      row.color_texto, row.color_hero_overlay,
      row.tipo_venta, row.url_venta_online,
      row.color_titulo_hero, row.color_descripcion_hero,
      row.color_fondo_fechas, row.color_texto_fechas,
      row.color_titulo_seccion, row.provincia,
      row.color_menu_fondo, row.color_menu_texto,
      row.color_menu_fondo_hover, row.color_menu_texto_hover,
      row.color_fondo_contacto, row.color_texto_contacto, row.color_enlace_contacto,
      row.color_fondo_footer, row.color_texto_footer,
      row.color_titulo_h3,
      row.created_at, row.updated_at
    );
  }
}

module.exports = Evento;