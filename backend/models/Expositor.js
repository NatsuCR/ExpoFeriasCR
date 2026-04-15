class Expositor {
  constructor(id, eventoId, nombre, tipo_expositor, descripcion, ubicacion, esPagado, imagenLogo, sitioWeb, videoUrl, createdAt, updatedAt) {
    this.id = id;
    this.eventoId = eventoId;
    this.nombre = nombre;
    this.tipo_expositor = tipo_expositor;
    this.rubro = tipo_expositor; // Mantener rubro para compatibilidad legacy
    this.descripcion = descripcion;
    this.ubicacion = ubicacion;
    this.esPagado = esPagado;
    this.imagenLogo = imagenLogo;
    this.sitioWeb = sitioWeb;
    this.videoUrl = videoUrl;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  static fromDatabase(row) {
    return new Expositor(
      row.id, row.evento_id, row.nombre, row.tipo_expositor || row.rubro, row.descripcion,
      row.ubicacion, row.es_pagado, row.imagen_logo, row.sitio_web,
      row.video_url, row.created_at, row.updated_at
    );
  }
}

module.exports = Expositor;