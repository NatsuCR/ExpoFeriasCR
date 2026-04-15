// backend/models/PrecioEntrada.js
class PrecioEntrada {
  constructor(id, eventoId, fecha, precioNormal, promocion, descripcionPromocion, createdAt, updatedAt) {
    this.id = id;
    this.eventoId = eventoId;
    this.fecha = fecha;
    this.precioNormal = precioNormal;
    this.promocion = promocion;
    this.descripcionPromocion = descripcionPromocion;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  static fromDatabase(row) {
    return new PrecioEntrada(
      row.id, row.evento_id, row.fecha, row.precio_normal,
      row.promocion, row.descripcion_promocion, row.created_at, row.updated_at
    );
  }
}

module.exports = PrecioEntrada;