const pool = require('../db');

class GaleriaService {
  async obtenerGaleriaPorEventoSlug(slug) {
    const [rows] = await pool.query(`
      SELECT g.imagen_url, g.orden
      FROM evento_galeria g
      JOIN eventos e ON g.evento_id = e.id
      WHERE e.slug = ?
      ORDER BY g.orden ASC
    `, [slug]);
    return rows;
  }
}

module.exports = GaleriaService;