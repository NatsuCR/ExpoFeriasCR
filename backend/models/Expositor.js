// backend/models/Expositor.js
class Expositor {
  constructor(id, eventoId, nombre, rubro, descripcion, ubicacion, esPagado, imagenLogo, sitioWeb, createdAt, updatedAt) {
    this.id = id;
    this.eventoId = eventoId;
    this.nombre = nombre;
    this.rubro = rubro;
    this.descripcion = descripcion;
    this.ubicacion = ubicacion;
    this.esPagado = esPagado;
    this.imagenLogo = imagenLogo;
    this.sitioWeb = sitioWeb;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  static fromDatabase(row) {
    return new Expositor(
      row.id, row.evento_id, row.nombre, row.rubro, row.descripcion,
      row.ubicacion, row.es_pagado, row.imagen_logo, row.sitio_web,
      row.created_at, row.updated_at
    );
  }
}

module.exports = Expositor;