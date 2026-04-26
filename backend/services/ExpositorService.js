const pool = require('../db');
const Expositor = require('../models/Expositor');

class ExpositorService {
  async obtenerExpositoresPorEventoSlug(slug) {
    const [rows] = await pool.query(`
      SELECT ex.* 
      FROM expositores ex
      JOIN eventos e ON ex.evento_id = e.id
      WHERE e.slug = ?
      ORDER BY ex.nombre
    `, [slug]);
    return rows.map(row => Expositor.fromDatabase(row));
  }
}

module.exports = ExpositorService;


