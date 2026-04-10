class Evento {
  constructor(
    id, slug, nombre, descripcion, fechaInicio, fechaFin, ubicacion,
    imagenPortada, activo, horarioImagen, mapaEmbed,
    colorPrimario, colorSecundario, colorFondo, colorTexto, colorHeroOverlay,
    tipoVenta, urlVentaOnline,
    colorTituloHero, colorDescripcionHero, colorFondoFechas, colorTextoFechas,
    colorTituloSeccion, provincia,  // ← NUEVO
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
    this.colorTituloSeccion = colorTituloSeccion;  // ← NUEVO
    this.provincia = provincia;  // ← NUEVO
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
      row.color_titulo_seccion, row.provincia,  // ← NUEVO
      row.created_at, row.updated_at
    );
  }
}

module.exports = Evento;