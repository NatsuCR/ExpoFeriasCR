const pool = require('../db');
const Evento = require('../models/Evento');

class EventoService {
  // Obtiene eventos futuros (próximos) - SOLO EVENTOS APROBADOS
  async obtenerEventosActivos(provincia = null) {
    let query = `SELECT * FROM eventos WHERE activo = true AND estado = 'aprobado' AND fecha_inicio > CURDATE()`;
    const params = [];
    if (provincia) {
      query += ` AND provincia = ?`;
      params.push(provincia);
    }
    query += ` ORDER BY fecha_inicio`;
    const [rows] = await pool.query(query, params);
    return rows.map(row => Evento.fromDatabase(row));
  }

  // Obtiene eventos que comienzan hoy - SOLO EVENTOS APROBADOS
  async obtenerEventosHoy(provincia = null) {
    let query = `SELECT * FROM eventos WHERE activo = true AND estado = 'aprobado' AND DATE(fecha_inicio) = CURDATE()`;
    const params = [];
    if (provincia) {
      query += ` AND provincia = ?`;
      params.push(provincia);
    }
    query += ` ORDER BY fecha_inicio`;
    const [rows] = await pool.query(query, params);
    return rows.map(row => Evento.fromDatabase(row));
  }

  // Obtiene eventos en progreso (vivo) - SOLO EVENTOS APROBADOS
  async obtenerEventosEnProgreso(provincia = null) {
    let query = `SELECT * FROM eventos WHERE activo = true AND estado = 'aprobado' AND fecha_inicio <= CURDATE() AND fecha_fin >= CURDATE()`;
    const params = [];
    if (provincia) {
      query += ` AND provincia = ?`;
      params.push(provincia);
    }
    query += ` ORDER BY fecha_inicio`;
    const [rows] = await pool.query(query, params);
    return rows.map(row => Evento.fromDatabase(row));
  }

  // Obtiene TODOS los eventos activos (sin filtrar por fecha) – para búsqueda - SOLO EVENTOS APROBADOS
  async obtenerTodosActivos(provincia = null) {
    let query = `SELECT * FROM eventos WHERE activo = true AND estado = 'aprobado'`;
    const params = [];
    if (provincia) {
      query += ` AND provincia = ?`;
      params.push(provincia);
    }
    query += ` ORDER BY fecha_inicio`;
    const [rows] = await pool.query(query, params);
    return rows.map(row => Evento.fromDatabase(row));
  }

  // Obtiene eventos finalizados (fecha_fin anterior a hoy) - SOLO EVENTOS APROBADOS
  async obtenerEventosFinalizados(provincia = null) {
    let query = `SELECT * FROM eventos WHERE activo = true AND estado = 'aprobado' AND fecha_fin < CURDATE()`;
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