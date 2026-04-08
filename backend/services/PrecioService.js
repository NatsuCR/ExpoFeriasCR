// backend/services/PrecioService.js
const pool = require('../db');
const PrecioEntrada = require('../models/PrecioEntrada');

class PrecioService {
  async obtenerPreciosPorEventoSlug(slug) {
    const query = `
      SELECT p.* 
      FROM precios_entrada p
      JOIN eventos e ON p.evento_id = e.id
      WHERE e.slug = $1
      ORDER BY p.fecha
    `;
    const result = await pool.query(query, [slug]);
    return result.rows.map(row => PrecioEntrada.fromDatabase(row));
  }
}

module.exports = PrecioService;