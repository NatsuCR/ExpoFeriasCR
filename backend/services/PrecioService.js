const pool = require('../db');
const PrecioEntrada = require('../models/PrecioEntrada');

class PrecioService {
  async obtenerPreciosPorEventoSlug(slug) {
    const [rows] = await pool.query(`
      SELECT p.* 
      FROM precios_entrada p
      JOIN eventos e ON p.evento_id = e.id
      WHERE e.slug = ?
      ORDER BY p.fecha
    `, [slug]);
    return rows; // sin modelo, devolvemos filas directamente
  }
}

module.exports = PrecioService;