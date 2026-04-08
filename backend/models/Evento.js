// backend/models/Evento.js
class Evento {
  constructor(id, slug, nombre, descripcion, fechaInicio, fechaFin, ubicacion, latitud, longitud, imagenPortada, activo, createdAt, updatedAt) {
    this.id = id;
    this.slug = slug;
    this.nombre = nombre;
    this.descripcion = descripcion;
    this.fechaInicio = fechaInicio;
    this.fechaFin = fechaFin;
    this.ubicacion = ubicacion;
    this.latitud = latitud;
    this.longitud = longitud;
    this.imagenPortada = imagenPortada;
    this.activo = activo;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  // Método de instancia para saber si el evento está activo y vigente
  estaVigente() {
    const hoy = new Date();
    return this.activo && new Date(this.fechaFin) >= hoy;
  }

  // Método estático para mapear una fila de la BD a una instancia de Evento
  static fromDatabase(row) {
    return new Evento(
      row.id, row.slug, row.nombre, row.descripcion,
      row.fecha_inicio, row.fecha_fin, row.ubicacion,
      row.latitud, row.longitud, row.imagen_portada,
      row.activo, row.created_at, row.updated_at
    );
  }
}

module.exports = Evento;