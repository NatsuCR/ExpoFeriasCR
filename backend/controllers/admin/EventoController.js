const pool = require('../../db');
const EventoService = require('../../services/EventoService');
const relatedTables = require('../RelatedTablesController');
const AdminEventoUpdateController = require('./AdminEventoUpdateController');

class AdminEventoController {
  async listar(req, res) {
    try {
      const [rows] = await pool.query('SELECT * FROM eventos ORDER BY fecha_inicio DESC');
      res.json(rows);
    } catch (error) {
      console.error('[EventoController.listar]', error.stack);
      res.status(500).json({ error: 'Error al listar eventos', detail: error.message });
    }
  }

  async obtenerPorId(req, res) {
    const { id } = req.params;
    try {
      const [rows] = await pool.query('SELECT * FROM eventos WHERE id = ?', [id]);
      if (rows.length === 0) return res.status(404).json({ error: 'Evento no encontrado' });
      let evento = rows[0];
      let borradorData = null;
      if (evento.borrador_cambios) {
        try {
          borradorData = typeof evento.borrador_cambios === 'string' ? JSON.parse(evento.borrador_cambios) : evento.borrador_cambios;
          if (borradorData) Object.keys(borradorData).forEach(key => { if (borradorData[key] !== undefined) evento[key] = borradorData[key]; });
        } catch (e) { console.error("Error al parsear borrador_cambios:", e); }
      }
      const [actividades] = await pool.query('SELECT * FROM actividades WHERE evento_id = ? ORDER BY fecha, hora', [id]);
      const [precios] = await pool.query('SELECT * FROM precios_entrada WHERE evento_id = ? ORDER BY fecha', [id]);
      const [expositores] = await pool.query('SELECT * FROM expositores WHERE evento_id = ? ORDER BY nombre', [id]);
      const [galeria] = await pool.query('SELECT * FROM evento_galeria WHERE evento_id = ?', [id]);
      res.json({
        evento,
        actividades: (borradorData?.actividades?.length > 0) ? borradorData.actividades : actividades,
        precios: (borradorData?.precios?.length > 0) ? borradorData.precios : precios,
        expositores: (borradorData?.expositores?.length > 0) ? borradorData.expositores : expositores,
        galeria: (borradorData?.galeria?.length > 0) ? borradorData.galeria : galeria
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error al obtener evento' });
    }
  }

  async crear(req, res) {
    const data = req.body;
    const values = [
      data.slug, data.nombre, data.descripcion, data.fecha_inicio, data.fecha_fin, data.ubicacion,
      data.imagen_portada || null, data.activo === undefined ? 1 : (data.activo ? 1 : 0),
      data.horario_imagen || null, data.mapa_embed || null, data.mapa_waze_embed || null,
      data.color_primario || '#c8102e', data.color_secundario || '#0033a0', data.color_fondo || '#fdfdfd',
      data.color_texto || '#1a1a1a', data.color_hero_overlay || '0.7',
      data.tipo_venta || 'taquilla', data.url_venta_online || null,
      data.color_titulo_hero || '#ffffff', data.color_descripcion_hero || '#ffffff',
      data.color_fondo_fechas || '#0033a0', data.color_texto_fechas || '#c8102e',
      data.color_titulo_seccion || '#1a1a1a', data.provincia || null,
      data.color_menu_fondo || '#ffffff', data.color_menu_texto || '#ffffff',
      data.color_menu_fondo_hover || null, data.color_menu_texto_hover || null,
      data.color_fondo_contacto || '#fdfdfd', data.color_texto_contacto || '#1a1a1a',
      data.color_enlace_contacto || '#c8102e', data.color_fondo_footer || '#c8102e',
      data.color_texto_footer || '#ffffff', data.color_titulo_h3 || '#1a1a1a',
      data.color_buscador_expositores || '#ffffff', data.color_borde_buscador_expositores || '#eee',
      data.color_fondo_share || '0.5', data.color_texto_share || '#1a1a1a', data.color_descripcion_texto || '#1a1a1a',
      data.color_iconos || '#c8102e',
      data.tiene_expositores !== undefined ? data.tiene_expositores : 1,
      'aprobado',
      data.tipo_evento || null,
      data.canton || null,
      data.distrito || null
    ];
    const query = `INSERT INTO eventos (slug, nombre, descripcion, fecha_inicio, fecha_fin, ubicacion, imagen_portada, activo, horario_imagen, mapa_embed, mapa_waze_embed, color_primario, color_secundario, color_fondo, color_texto, color_hero_overlay, tipo_venta, url_venta_online, color_titulo_hero, color_descripcion_hero, color_fondo_fechas, color_texto_fechas, color_titulo_seccion, provincia, color_menu_fondo, color_menu_texto, color_menu_fondo_hover, color_menu_texto_hover, color_fondo_contacto, color_texto_contacto, color_enlace_contacto, color_fondo_footer, color_texto_footer, color_titulo_h3, color_buscador_expositores, color_borde_buscador_expositores, color_fondo_share, color_texto_share, color_descripcion_texto, color_iconos, tiene_expositores, estado, tipo_evento, canton, distrito) VALUES (${values.map(() => '?').join(', ')})`;
    try {
      const [result] = await pool.query(query, values);
      await relatedTables.guardarTodo(result.insertId, data);
      const [newEvent] = await pool.query('SELECT * FROM eventos WHERE id = ?', [result.insertId]);
      res.status(201).json(newEvent[0]);
    } catch (error) {
      console.error('❌ ERROR AL CREAR EVENTO:', error);
      res.status(500).json({ 
        error: 'Error interno del servidor',
        sqlMessage: error.sqlMessage || error.message,
        stack: error.stack
      });
    }
  }

  async eliminar(req, res) {
    const { id } = req.params;
    try {
      const eventoService = new EventoService();
      await eventoService.eliminarRecursosFisicos(id);
      await pool.query('DELETE FROM precios_entrada WHERE evento_id = ?', [id]);
      await pool.query('DELETE FROM actividades WHERE evento_id = ?', [id]);
      await pool.query('DELETE FROM expositores WHERE evento_id = ?', [id]);
      await pool.query('DELETE FROM evento_galeria WHERE evento_id = ?', [id]);
      const [result] = await pool.query('DELETE FROM eventos WHERE id = ?', [id]);
      if (result.affectedRows === 0) return res.status(404).json({ error: 'Evento no encontrado' });
      res.json({ message: 'Evento eliminado exitosamente' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error al eliminar evento' });
    }
  }

  async eventosEdicionPendiente(req, res) {
    try {
      const [eventos] = await pool.query(`SELECT e.*, u.nombre as usuario_nombre, u.email as usuario_email, DATE_FORMAT(e.fecha_envio_revision, '%Y-%m-%d %H:%i') as fecha_envio FROM eventos e LEFT JOIN usuarios u ON e.usuario_id = u.id WHERE e.estado = 'edicion_pendiente' ORDER BY e.fecha_envio_revision ASC`);
      res.json(eventos);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error al obtener eventos' });
    }
  }

  // Delegaciones
  async actualizar(req, res) { return AdminEventoUpdateController.actualizar(req, res); }
  async aprobarEdicionEvento(req, res) { return AdminEventoUpdateController.aprobarEdicionEvento(req, res); }
  async rechazarEdicionEvento(req, res) { return AdminEventoUpdateController.rechazarEdicionEvento(req, res); }
}

module.exports = new AdminEventoController();


