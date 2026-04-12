const pool = require('../db');
const Evento = require('../models/Evento');

class EventoService {
  // Obtiene eventos futuros (próximos)
  async obtenerEventosActivos(provincia = null) {
    let query = `SELECT * FROM eventos WHERE activo = true AND fecha_inicio > CURDATE()`;
    const params = [];
    if (provincia) {
      query += ` AND provincia = ?`;
      params.push(provincia);
    }
    query += ` ORDER BY fecha_inicio`;
    const [rows] = await pool.query(query, params);
    return rows.map(row => Evento.fromDatabase(row));
  }

  // Obtiene eventos que comienzan hoy
  async obtenerEventosHoy(provincia = null) {
    let query = `SELECT * FROM eventos WHERE activo = true AND DATE(fecha_inicio) = CURDATE()`;
    const params = [];
    if (provincia) {
      query += ` AND provincia = ?`;
      params.push(provincia);
    }
    query += ` ORDER BY fecha_inicio`;
    const [rows] = await pool.query(query, params);
    return rows.map(row => Evento.fromDatabase(row));
  }

  // Obtiene eventos en progreso (vivo)
  async obtenerEventosEnProgreso(provincia = null) {
    let query = `SELECT * FROM eventos WHERE activo = true AND fecha_inicio <= CURDATE() AND fecha_fin >= CURDATE()`;
    const params = [];
    if (provincia) {
      query += ` AND provincia = ?`;
      params.push(provincia);
    }
    query += ` ORDER BY fecha_inicio`;
    const [rows] = await pool.query(query, params);
    return rows.map(row => Evento.fromDatabase(row));
  }

  // Obtiene TODOS los eventos activos (sin filtrar por fecha) – para búsqueda
  async obtenerTodosActivos(provincia = null) {
    let query = `SELECT * FROM eventos WHERE activo = true`;
    const params = [];
    if (provincia) {
      query += ` AND provincia = ?`;
      params.push(provincia);
    }
    query += ` ORDER BY fecha_inicio`;
    const [rows] = await pool.query(query, params);
    return rows.map(row => Evento.fromDatabase(row));
  }

  // Obtiene eventos finalizados (fecha_fin anterior a hoy)
  async obtenerEventosFinalizados(provincia = null) {
    let query = `SELECT * FROM eventos WHERE activo = true AND fecha_fin < CURDATE()`;
    const params = [];
    if (provincia) {
      query += ` AND provincia = ?`;
      params.push(provincia);
    }
    query += ` ORDER BY fecha_fin DESC`;
    const [rows] = await pool.query(query, params);
    return rows.map(row => Evento.fromDatabase(row));
  }

  async obtenerEventoPorSlug(slug) {
    const [rows] = await pool.query('SELECT * FROM eventos WHERE slug = ?', [slug]);
    if (rows.length === 0) return null;
    return Evento.fromDatabase(rows[0]);
  }
}

module.exports = EventoService;