const pool = require('../db');

class GaleriaService {
  async obtenerGaleriaPorEventoSlug(slug) {
    const [rows] = await pool.query(`
      SELECT g.imagen_url
      FROM evento_galeria g
      JOIN eventos e ON g.evento_id = e.id
      WHERE e.slug = ?
    `, [slug]);
    return rows;
  }
}

module.exports = GaleriaService;