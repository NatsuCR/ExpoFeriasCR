const pool = require('../db');
const Actividad = require('../models/Actividad');

class ActividadService {
  async obtenerActividadesPorEventoSlug(slug) {
    const query = `
      SELECT a.* 
      FROM actividades a
      JOIN eventos e ON a.evento_id = e.id
      WHERE e.slug = $1
      ORDER BY a.fecha, a.hora
    `;
    const result = await pool.query(query, [slug]);
    return result.rows.map(row => Actividad.fromDatabase(row));
  }
}

module.exports = ActividadService;