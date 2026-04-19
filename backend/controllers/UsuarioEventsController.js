const pool = require('../db');
const path = require('path');
const RelatedTablesController = require('./RelatedTablesController');

class UsuarioEventsController {
  /**
   * Crear evento (usuario autenticado)
   * POST /api/eventos/crear
   * El evento se guarda directamente en tablas finales como 'pendiente'
   */
  async crearEvento(req, res) {
    const usuarioId = req.user.id;
    const body = req.body;
    const {
      slug, nombre, descripcion, fecha_inicio, fecha_fin, ubicacion, provincia,
      imagen_portada, horario_imagen, mapa_embed, tipo_venta, url_venta_online,
      precios, actividades, expositores, galeria
    } = body;

    try {
      if (!slug || !nombre || !fecha_inicio || !fecha_fin || !ubicacion) {
        return res.status(400).json({ error: 'Faltan campos requeridos' });
      }

      const [existingSlug] = await pool.query('SELECT id FROM eventos WHERE slug = ?', [slug]);
      if (existingSlug.length > 0) {
        return res.status(409).json({ error: 'Este slug ya existe' });
      }

      const fechaInicio = new Date(fecha_inicio);
      const fechaFin = new Date(fecha_fin);
      if (fechaFin < fechaInicio) {
        return res.status(400).json({ error: 'La fecha final no puede ser anterior a la inicial' });
      }

      const [result] = await pool.query(
        `INSERT INTO eventos
        (usuario_id, slug, nombre, descripcion, fecha_inicio, fecha_fin, ubicacion, provincia,
         imagen_portada, horario_imagen, mapa_embed, tipo_venta, url_venta_online,
         color_primario, color_secundario, color_fondo, color_texto, color_descripcion_texto,
         color_hero_overlay, color_titulo_seccion,
         color_titulo_hero, color_descripcion_hero, color_fondo_fechas, color_texto_fechas,
         color_menu_fondo, color_menu_texto, color_menu_fondo_hover, color_menu_texto_hover,
         color_titulo_h3,
         color_fondo_contacto, color_texto_contacto, color_enlace_contacto,
         color_fondo_footer, color_texto_footer,
         color_buscador_expositores, color_borde_buscador_expositores,
         color_card_fondo, color_card_borde, color_rubro_fondo, color_rubro_texto,
         color_buscador_fondo, color_buscador_borde, color_btn_ver_mas,
         color_fondo_share, color_texto_share,
         estado, activo)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          usuarioId, slug, nombre, descripcion, fecha_inicio, fecha_fin, ubicacion, provincia,
          imagen_portada || null, horario_imagen || null, mapa_embed || null, tipo_venta || 'taquilla', url_venta_online || null,
          body.color_primario || '#c8102e', body.color_secundario || '#0033a0', body.color_fondo || '#f4e4c1', body.color_texto || '#2c1a0e', body.color_descripcion_texto || '#2c1a0e',
          body.color_hero_overlay || 'rgba(0,0,0,0.4)', body.color_titulo_seccion || '#c8102e',
          body.color_titulo_hero || '#ffffff', body.color_descripcion_hero || '#ffffff', body.color_fondo_fechas || '#0033a0', body.color_texto_fechas || '#ffffff',
          body.color_menu_fondo || '#ffffff', body.color_menu_texto || '#333333', body.color_menu_fondo_hover || '#c8102e', body.color_menu_texto_hover || '#ffffff',
          body.color_titulo_h3 || '#2c1a0e',
          body.color_fondo_contacto || '#f8f8f8', body.color_texto_contacto || '#333333', body.color_enlace_contacto || '#c8102e',
          body.color_fondo_footer || '#c8102e', body.color_texto_footer || '#ffffff',
          body.color_buscador_expositores || '#ffffff', body.color_borde_buscador_expositores || '#eeeeee',
          body.color_card_fondo || '#ffffff', body.color_card_borde || '#f0f0f0', body.color_rubro_fondo || '#f0f0f0', body.color_rubro_texto || '#000000',
          body.color_buscador_fondo || '#ffffff', body.color_buscador_borde || '#eeeeee', body.color_btn_ver_mas || '#c8102e',
          body.color_fondo_share || '#ffffff', body.color_texto_share || '#2c1a0e',
          'pendiente', 0
        ]
      );

      const eventoId = result.insertId;
      await RelatedTablesController.guardarTodo(eventoId, { precios, actividades, expositores, galeria });

      res.status(201).json({
        message: 'Evento creado exitosamente. Está siendo revisado por nuestro equipo.',
        evento: { id: eventoId, slug, nombre, estado: 'pendiente' }
      });
    } catch (error) {
      console.error('[UsuarioEventsController.crearEvento] Error:', error);
      res.status(500).json({ error: 'Error al crear evento' });
    }
  }

  /**
   * Obtener todos los eventos del usuario autenticado
   * GET /api/eventos/mis-eventos
   */
  async misEventos(req, res) {
    const usuarioId = req.user.id;
    try {
      const [eventos] = await pool.query(
        `SELECT id, slug, nombre, descripcion, ubicacion, fecha_inicio, fecha_fin, estado, activo, created_at, razon_rechazo
         FROM eventos WHERE usuario_id = ? ORDER BY created_at DESC`,
        [usuarioId]
      );
      res.set('Cache-Control', 'no-store');
      res.json({ eventos });
    } catch (error) {
      console.error('[UsuarioEventsController.misEventos] Error:', error);
      res.status(500).json({ error: 'Error al obtener tus eventos' });
    }
  }

  /**
   * Obtener un evento específico del usuario (Mezclando borrador si existe)
   * GET /api/eventos/mi-evento/:id
   */
  async obtenerEvento(req, res) {
    const usuarioId = req.user.id;
    const eventoId = req.params.id;

    try {
      const [eventos] = await pool.query(
        'SELECT * FROM eventos WHERE id = ? AND usuario_id = ?',
        [eventoId, usuarioId]
      );

      if (eventos.length === 0) {
        return res.status(404).json({ error: 'Evento no encontrado' });
      }

      let evento = eventos[0];
      let borradorData = null;
      if (evento.borrador_cambios) {
        try {
          borradorData = typeof evento.borrador_cambios === 'string'
            ? JSON.parse(evento.borrador_cambios)
            : evento.borrador_cambios;
        } catch (_) { borradorData = null; }
      }

      // Obtener datos "live"
      const [actividades] = await pool.query('SELECT * FROM actividades WHERE evento_id = ? ORDER BY fecha, hora', [eventoId]);
      const [precios] = await pool.query('SELECT * FROM precios_entrada WHERE evento_id = ? ORDER BY fecha', [eventoId]);
      const [expositores] = await pool.query('SELECT * FROM expositores WHERE evento_id = ? ORDER BY nombre', [eventoId]);
      const [galeria] = await pool.query('SELECT * FROM evento_galeria WHERE evento_id = ? ORDER BY orden', [eventoId]);

      if (borradorData) {
        // Combinar borrador sobre live
        evento = { ...evento, ...borradorData };
        res.json({
          evento,
          actividades: borradorData.actividades || actividades,
          precios: borradorData.precios || precios,
          expositores: borradorData.expositores || expositores,
          galeria: borradorData.galeria || galeria,
          tiene_borrador: true
        });
      } else {
        res.json({ evento, actividades, precios, expositores, galeria });
      }
    } catch (error) {
      console.error('[UsuarioEventsController.obtenerEvento] Error:', error);
      res.status(500).json({ error: 'Error al obtener detalles del evento' });
    }
  }

  /**
   * UNIFICADO: Cualquier actualización de evento existente se guarda como BORRADOR
   * PUT /api/eventos/actualizar/:id
   */
  async actualizarEvento(req, res) {
    const usuarioId = req.user.id;
    const eventoId = req.params.id;
    const body = req.body;

    try {
      const [eventos] = await pool.query(
        'SELECT id, estado FROM eventos WHERE id = ? AND usuario_id = ?',
        [eventoId, usuarioId]
      );

      if (eventos.length === 0) {
        return res.status(404).json({ error: 'Evento no encontrado' });
      }

      // Permitir edición si estado es manejable
      const estadoActual = eventos[0].estado;
      if (!['pendiente', 'aprobado', 'finalizado', 'rechazado', 'edicion_pendiente'].includes(estadoActual)) {
        return res.status(403).json({ error: 'No puedes editar este evento en su estado actual.' });
      }

      await this._guardarComoBorrador(eventoId, body);
      res.json({ message: 'Sus cambios han sido enviados a revisión. El administrador los verificará pronto.' });
    } catch (error) {
      console.error('[UsuarioEventsController.actualizarEvento] Error:', error);
      res.status(500).json({ error: 'Error al procesar la actualización' });
    }
  }

  /**
   * Método interno para guardar cambios como borrador pendiente de revisión
   */
  async _guardarComoBorrador(eventoId, body) {
    const borrador = JSON.stringify(body);
    await pool.query(
      `UPDATE eventos SET borrador_cambios = ?, estado = 'edicion_pendiente', fecha_envio_revision = NOW() WHERE id = ?`,
      [borrador, eventoId]
    );
  }

  /**
   * Obtener estado del evento
   * GET /api/eventos/estado/:id
   */
  async obtenerEstadoEvento(req, res) {
    const usuarioId = req.user.id;
    const eventoId = req.params.id;
    try {
      const [rows] = await pool.query(
        'SELECT id, nombre, estado, razon_rechazo, activo, updated_at FROM eventos WHERE id = ? AND usuario_id = ?',
        [eventoId, usuarioId]
      );

      if (rows.length === 0) return res.status(404).json({ error: 'Evento no encontrado' });
      res.json({ evento: rows[0] });
    } catch (error) {
      console.error('[UsuarioEventsController.obtenerEstadoEvento] Error:', error);
      res.status(500).json({ error: 'Error al obtener estado' });
    }
  }

  /**
   * Eliminar evento
   * DELETE /api/eventos/:id
   */
  async eliminarEvento(req, res) {
    console.log('[eliminarEvento] ENTRÓ - usuarioId:', req.user?.id, '| eventoId:', req.params.id);
    const usuarioId = req.user.id;
    const eventoId = req.params.id;

    console.log('[eliminarEvento] usuarioId:', usuarioId, '| eventoId:', eventoId);

    try {
      const [eventos] = await pool.query(
        'SELECT id, usuario_id FROM eventos WHERE id = ?',
        [eventoId]
      );

      console.log('[eliminarEvento] encontrado:', eventos);

      if (eventos.length === 0) {
        return res.status(404).json({ error: 'Evento no encontrado' });
      }

      if (String(eventos[0].usuario_id) !== String(usuarioId)) {
        console.log('[eliminarEvento] ❌ usuario_id no coincide:', eventos[0].usuario_id, '!==', usuarioId);
        return res.status(403).json({ error: 'No autorizado' });
      }

      await pool.query('DELETE FROM eventos WHERE id = ?', [eventoId]);
      res.json({ message: 'Evento eliminado exitosamente' });

    } catch (error) {
      console.error('[eliminarEvento] Error:', error);
      res.status(500).json({ error: 'Error al eliminar el evento' });
    }
  }
  /**
   * Alias de actualizarEvento para compatibilidad
   * POST /api/eventos/:id/editar-aprobado
   */
  async editarEventoAprobado(req, res) {
    return this.actualizarEvento(req, res);
  }

  /**
   * Obtener listas filtradas por estado para el usuario
   */
  async misEventosAprobados(req, res) {
    const usuarioId = req.user.id;
    try {
      const [eventos] = await pool.query(
        "SELECT id, slug, nombre, fecha_inicio, fecha_fin, estado FROM eventos WHERE usuario_id = ? AND estado = 'aprobado' ORDER BY created_at DESC",
        [usuarioId]
      );
      res.json({ eventos });
    } catch (error) {
      res.status(500).json({ error: 'Error al obtener eventos aprobados' });
    }
  }

  async misEventosPendientes(req, res) {
    const usuarioId = req.user.id;
    try {
      const [eventos] = await pool.query(
        "SELECT id, slug, nombre, fecha_inicio, fecha_fin, estado, fecha_envio_revision FROM eventos WHERE usuario_id = ? AND estado IN ('pendiente', 'edicion_pendiente') ORDER BY created_at DESC",
        [usuarioId]
      );
      res.json({ eventos });
    } catch (error) {
      res.status(500).json({ error: 'Error al obtener eventos pendientes' });
    }
  }

  async misEventosRechazados(req, res) {
    const usuarioId = req.user.id;
    try {
      const [eventos] = await pool.query(
        "SELECT id, slug, nombre, fecha_inicio, fecha_fin, estado, razon_rechazo FROM eventos WHERE usuario_id = ? AND estado = 'rechazado' ORDER BY created_at DESC",
        [usuarioId]
      );
      res.json({ eventos });
    } catch (error) {
      res.status(500).json({ error: 'Error al obtener eventos rechazados' });
    }
  }
}

module.exports = UsuarioEventsController;