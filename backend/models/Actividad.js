class Actividad {
  constructor(id, eventoId, titulo, tipo, descripcion, fecha, hora, lugar, precioExtra, requiereEntradaOnline, enlaceVenta, esGratis, imagen, videoUrl, createdAt, updatedAt) {
    this.id = id;
    this.eventoId = eventoId;
    this.titulo = titulo;
    this.tipo = tipo;
    this.descripcion = descripcion;
    this.fecha = fecha;
    this.hora = hora;
    this.lugar = lugar;
    this.precioExtra = precioExtra;
    this.requiereEntradaOnline = requiereEntradaOnline;
    this.enlaceVenta = enlaceVenta;
    this.esGratis = esGratis;
    this.imagen = imagen;
    this.videoUrl = videoUrl;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  static fromDatabase(row) {
    return new Actividad(
      row.id, row.evento_id, row.titulo, row.tipo, row.descripcion,
      row.fecha, row.hora, row.lugar, row.precio_extra,
      row.requiere_entrada_online, row.enlace_venta, row.es_gratis,
      row.imagen, row.video_url, row.created_at, row.updated_at
    );
  }
}

module.exports = Actividad;


