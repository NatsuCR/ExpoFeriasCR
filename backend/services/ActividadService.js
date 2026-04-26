const pool = require('../db');
const Actividad = require('../models/Actividad');

class ActividadService {
  async obtenerActividadesPorEventoSlug(slug) {
    const [rows] = await pool.query(`
      SELECT a.* 
      FROM actividades a
      JOIN eventos e ON a.evento_id = e.id
      WHERE e.slug = ?
      ORDER BY a.fecha, a.hora
    `, [slug]);
    return rows.map(row => Actividad.fromDatabase(row));
  }
}

module.exports = ActividadService;


