const pool = require('../db');
const Evento = require('../models/Evento');

class EventoService {
  async obtenerEventosActivos() {
    const query = 'SELECT * FROM eventos WHERE activo = true ORDER BY fecha_inicio';
    const result = await pool.query(query);
    return result.rows.map(row => Evento.fromDatabase(row));
  }

  async obtenerEventoPorSlug(slug) {
    const query = 'SELECT * FROM eventos WHERE slug = $1';
    const result = await pool.query(query, [slug]);
    if (result.rows.length === 0) return null;
    return Evento.fromDatabase(result.rows[0]);
  }
}

module.exports = EventoService;