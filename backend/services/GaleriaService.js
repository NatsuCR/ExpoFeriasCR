const pool = require('../db');

class GaleriaService {
  async obtenerGaleriaPorEventoSlug(slug) {
    const query = `
      SELECT g.imagen_url, g.orden
      FROM evento_galeria g
      JOIN eventos e ON g.evento_id = e.id
      WHERE e.slug = $1
      ORDER BY g.orden ASC
    `;
    const result = await pool.query(query, [slug]);
    return result.rows;
  }
}

module.exports = GaleriaService;