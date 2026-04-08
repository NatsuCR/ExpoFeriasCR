// backend/services/ExpositorService.js
const pool = require('../db');
const Expositor = require('../models/Expositor');

class ExpositorService {
  async obtenerExpositoresPorEventoSlug(slug) {
    const query = `
      SELECT ex.* 
      FROM expositores ex
      JOIN eventos e ON ex.evento_id = e.id
      WHERE e.slug = $1
      ORDER BY ex.nombre
    `;
    const result = await pool.query(query, [slug]);
    return result.rows.map(row => Expositor.fromDatabase(row));
  }
}

module.exports = ExpositorService;