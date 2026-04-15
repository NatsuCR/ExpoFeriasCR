const pool = require('../db');
const Evento = require('../models/Evento');

class EventoService {
  // Obtiene eventos futuros (próximos) - SOLO EVENTOS APROBADOS o con edición pendiente
  async obtenerEventosActivos(provincia = null) {
    let query = `SELECT * FROM eventos WHERE activo = true AND estado IN ('aprobado', 'edicion_pendiente') AND fecha_inicio > CURDATE()`;
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
    let query = `SELECT * FROM eventos WHERE activo = true AND estado IN ('aprobado', 'edicion_pendiente') AND DATE(fecha_inicio) = CURDATE()`;
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
    let query = `SELECT * FROM eventos WHERE activo = true AND estado IN ('aprobado', 'edicion_pendiente') AND fecha_inicio <= CURDATE() AND fecha_fin >= CURDATE()`;
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
    let query = `SELECT * FROM eventos WHERE activo = true AND estado IN ('aprobado', 'edicion_pendiente')`;
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
    let query = `SELECT * FROM eventos WHERE activo = true AND estado IN ('aprobado', 'edicion_pendiente') AND fecha_fin < CURDATE()`;
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

  /**
   * Identifica y elimina todos los archivos físicos (imágenes) asociados a un evento
   * @param {number} eventoId 
   */
  async eliminarRecursosFisicos(eventoId) {
    const FileService = require('./FileService');
    const urlsToEliminate = new Set();

    try {
      // 1. Obtener imagen de portada y horario del evento
      const [eventos] = await pool.query('SELECT imagen_portada, horario_imagen FROM eventos WHERE id = ?', [eventoId]);
      if (eventos.length > 0) {
        if (eventos[0].imagen_portada) urlsToEliminate.add(eventos[0].imagen_portada);
        if (eventos[0].horario_imagen) urlsToEliminate.add(eventos[0].horario_imagen);
      }

      // 2. Obtener imágenes de la galería
      const [galeria] = await pool.query('SELECT imagen_url FROM evento_galeria WHERE evento_id = ?', [eventoId]);
      galeria.forEach(row => { if (row.imagen_url) urlsToEliminate.add(row.imagen_url); });

      // 3. Obtener imágenes de actividades (pueden ser JSON o string)
      const [actividades] = await pool.query('SELECT imagen FROM actividades WHERE evento_id = ?', [eventoId]);
      actividades.forEach(row => {
        if (!row.imagen) return;
        try {
          const imgs = JSON.parse(row.imagen);
          if (Array.isArray(imgs)) imgs.forEach(uri => urlsToEliminate.add(uri));
          else urlsToEliminate.add(row.imagen);
        } catch (_) {
          urlsToEliminate.add(row.imagen);
        }
      });

      // 4. Obtener logos de expositores
      const [expositores] = await pool.query('SELECT imagen_logo FROM expositores WHERE evento_id = ?', [eventoId]);
      expositores.forEach(row => {
        if (!row.imagen_logo) return;
        try {
           // En este sistema los logos de expositores a veces se guardan como JSON de un array
           const logos = JSON.parse(row.imagen_logo);
           if (Array.isArray(logos)) logos.forEach(l => urlsToEliminate.add(l));
           else urlsToEliminate.add(row.imagen_logo);
        } catch (_) {
           urlsToEliminate.add(row.imagen_logo);
        }
      });

      // 5. Eliminar físicamente
      const list = Array.from(urlsToEliminate);
      if (list.length > 0) {
        console.log(`[EventoService] Iniciando eliminación física de ${list.length} recursos para el evento ${eventoId}`);
        await FileService.eliminarMultiples(list);
      }

    } catch (error) {
      console.error('[EventoService] Error al recolectar recursos para eliminación:', error);
    }
  }
}

module.exports = EventoService;