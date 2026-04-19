const pool = require('../db');
const path = require('path');
const RelatedTablesController = require('./RelatedTablesController');

class UsuarioEventsController {
  /**
   * Crear evento (usuario autenticado)
   * POST /api/eventos/crear
   */
  async crearEvento(req, res) {
    const usuarioId = req.user.id;
    const {
      slug, nombre, descripcion, fecha_inicio, fecha_fin, ubicacion, provincia,
      imagen_portada, horario_imagen, mapa_embed, tipo_venta, url_venta_online,
      color_primario, color_secundario, color_fondo, color_texto,
      color_hero_overlay, color_titulo_seccion,
      color_titulo_hero, color_descripcion_hero, color_fondo_fechas, color_texto_fechas,
      color_menu_fondo, color_menu_texto, color_menu_fondo_hover, color_menu_texto_hover,
      color_titulo_h3,
      color_fondo_contacto, color_texto_contacto, color_enlace_contacto,
      color_fondo_footer, color_texto_footer, color_descripcion_texto,
      precios, actividades, expositores, galeria
    } = req.body;

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
          color_primario || '#c8102e', color_secundario || '#0033a0', color_fondo || '#f4e4c1', color_texto || '#2c1a0e', color_descripcion_texto || '#2c1a0e',
          color_hero_overlay || 'rgba(0,0,0,0.4)', color_titulo_seccion || '#c8102e',
          color_titulo_hero || '#ffffff', color_descripcion_hero || '#ffffff', color_fondo_fechas || '#0033a0', color_texto_fechas || '#ffffff',
          color_menu_fondo || '#ffffff', color_menu_texto || '#333333', color_menu_fondo_hover || '#c8102e', color_menu_texto_hover || '#ffffff',
          color_titulo_h3 || '#2c1a0e',
          color_fondo_contacto || '#f8f8f8', color_texto_contacto || '#333333', color_enlace_contacto || '#c8102e',
          color_fondo_footer || '#c8102e', color_texto_footer || '#ffffff',
          color_buscador_expositores || '#ffffff', color_borde_buscador_expositores || '#eeeeee',
          color_card_fondo || '#ffffff', color_card_borde || '#f0f0f0', color_rubro_fondo || '#f0f0f0', color_rubro_texto || '#000000',
          color_buscador_fondo || '#ffffff', color_buscador_borde || '#eeeeee', color_btn_ver_mas || '#c8102e',
          color_fondo_share || '#ffffff', color_texto_share || '#2c1a0e',
          'pendiente', 0
        ]
      );

      const eventoId = result.insertId;

      // 🔥 GUARDAR TABLAS RELACIONADAS (Unificado)
      await RelatedTablesController.guardarTodo(eventoId, { precios, actividades, expositores, galeria });

      res.status(201).json({
        message: 'Evento creado exitosamente. Está siendo revisado por nuestro equipo.',
        evento: { id: eventoId, slug, nombre, estado: 'pendiente' }
      });
    } catch (error) {
      console.error('Error al crear evento:', error);
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
         FROM eventos
         WHERE usuario_id = ?
         ORDER BY created_at DESC`,
        [usuarioId]
      );

      res.set('Cache-Control', 'no-store');
      res.json({ eventos });
    } catch (error) {
      console.error('Error al obtener mis eventos:', error);
      res.status(500).json({ error: 'Error al obtener eventos' });
    }
  }

  /**
   * Obtener un evento específico del usuario
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

      // Si el evento tiene un borrador pendiente, mezclar los campos del borrador
      // para que el formulario del usuario muestre los cambios en revisión
      let borradorData = null;
      if (evento.borrador_cambios) {
        try {
          borradorData = typeof evento.borrador_cambios === 'string'
            ? JSON.parse(evento.borrador_cambios)
            : evento.borrador_cambios;
        } catch (_) { borradorData = null; }
      }

      // Obtener datos relacionados (live)
      const [actividades] = await pool.query(
        'SELECT * FROM actividades WHERE evento_id = ? ORDER BY fecha, hora',
        [eventoId]
      );

      const [precios] = await pool.query(
        'SELECT * FROM precios_entrada WHERE evento_id = ? ORDER BY fecha',
        [eventoId]
      );

      const [expositores] = await pool.query(
        'SELECT * FROM expositores WHERE evento_id = ? ORDER BY nombre',
        [eventoId]
      );

      const [galeria] = await pool.query(
        'SELECT * FROM evento_galeria WHERE evento_id = ? ORDER BY orden',
        [eventoId]
      );

      // Si hay borrador, sobrescribir campos del evento y de las tablas relacionadas con los del borrador
      if (borradorData) {
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
      console.error('Error al obtener evento:', error);
      res.status(500).json({ error: 'Error al obtener evento' });
    }
  }

  /**
   * Actualizar evento (solo usuario propietario, antes de aprobación)
   * PUT /api/eventos/actualizar/:id
   */
  async actualizarEvento(req, res) {
    const usuarioId = req.user.id;
    const eventoId = req.params.id;
    const body = req.body;
    const { 
      nombre, descripcion, fecha_inicio, fecha_fin, ubicacion, provincia,
      imagen_portada, horario_imagen, mapa_embed, tipo_venta, url_venta_online,
      precios, actividades, expositores, galeria
    } = body;

    try {
      // Verificar propiedad y estado
      const [eventos] = await pool.query(
        'SELECT * FROM eventos WHERE id = ? AND usuario_id = ?',
        [eventoId, usuarioId]
      );

      if (eventos.length === 0) {
        return res.status(404).json({ error: 'Evento no encontrado' });
      }

      // Solo permitir edición si estado es pendiente o rechazado (en este endpoint)
      if (['pendiente', 'rechazado'].indexOf(eventos[0].estado) === -1) {
        return res.status(403).json({ error: 'No puedes editar eventos que están en revisión o ya aprobados por este medio.' });
      }

      // Actualizar evento
      await pool.query(
        `UPDATE eventos SET 
          nombre = ?, descripcion = ?, fecha_inicio = ?, fecha_fin = ?, ubicacion = ?, provincia = ?,
          imagen_portada = ?, horario_imagen = ?, mapa_embed = ?, tipo_venta = ?, url_venta_online = ?,
          color_primario = ?, color_secundario = ?, color_fondo = ?, color_texto = ?, color_descripcion_texto = ?,
          color_hero_overlay = ?, color_titulo_seccion = ?,
          color_titulo_hero = ?, color_descripcion_hero = ?, color_fondo_fechas = ?, color_texto_fechas = ?,
          color_menu_fondo = ?, color_menu_texto = ?, color_menu_fondo_hover = ?, color_menu_texto_hover = ?,
          color_titulo_h3 = ?,
          color_fondo_contacto = ?, color_texto_contacto = ?, color_enlace_contacto = ?,
          color_fondo_footer = ?, color_texto_footer = ?,
          color_fondo_share = ?, color_texto_share = ?,
          color_buscador_expositores = ?, color_borde_buscador_expositores = ?,
          color_card_fondo = ?, color_card_borde = ?, color_rubro_fondo = ?, color_rubro_texto = ?,
          color_buscador_fondo = ?, color_buscador_borde = ?, color_btn_ver_mas = ?, borrador_cambios = NULL
         WHERE id = ?`,
        [
          nombre, descripcion, fecha_inicio, fecha_fin, ubicacion, provincia,
          imagen_portada || null, horario_imagen || null, mapa_embed || null, tipo_venta || 'taquilla', url_venta_online || null,
          body.color_primario, body.color_secundario, body.color_fondo, body.color_texto, body.color_descripcion_texto,
          body.color_hero_overlay, body.color_titulo_seccion,
          body.color_titulo_hero, body.color_descripcion_hero, body.color_fondo_fechas, body.color_texto_fechas,
          body.color_menu_fondo, body.color_menu_texto, body.color_menu_fondo_hover, body.color_menu_texto_hover,
          body.color_titulo_h3,
          body.color_fondo_contacto, body.color_texto_contacto, body.color_enlace_contacto,
          body.color_fondo_footer, body.color_texto_footer,
          body.color_fondo_share, body.color_texto_share,
          body.color_buscador_expositores || '#ffffff', body.color_borde_buscador_expositores || '#eeeeee',
          body.color_card_fondo || '#ffffff', body.color_card_borde || '#f0f0f0', body.color_rubro_fondo || '#f0f0f0', body.color_rubro_texto || '#000000',
          body.color_buscador_fondo || '#ffffff', body.color_buscador_borde || '#eeeeee', body.color_btn_ver_mas || '#C8102E',
          eventoId
        ]
      );

      // 🔥 ACTUALIZAR TABLAS RELACIONADAS (Actividades, Expositores, Galería, etc.)
      await RelatedTablesController.actualizarTodo(eventoId, { precios, actividades, expositores, galeria });

      res.json({ message: 'Evento actualizado exitosamente' });
    } catch (error) {
      console.error('Error al actualizar evento:', error);
      res.status(500).json({ error: 'Error al actualizar evento' });
    }
  }

  /**
   * Obtener estado del evento (para verificación rápida)
   * GET /api/eventos/estado/:id
   */
  async obtenerEstadoEvento(req, res) {
    const usuarioId = req.user.id;
    const eventoId = req.params.id;

    try {
      const [eventos] = await pool.query(
        'SELECT id, nombre, estado, razon_rechazo, activo, updated_at FROM eventos WHERE id = ? AND usuario_id = ?',
        [eventoId, usuarioId]
      );

      if (eventos.length === 0) {
        return res.status(404).json({ error: 'Evento no encontrado' });
      }

      res.json({ evento: eventos[0] });
    } catch (error) {
      console.error('Error al obtener estado:', error);
      res.status(500).json({ error: 'Error al obtener estado' });
    }
  }

  /**
   * Eliminar evento (solo si es pendiente)
   * DELETE /api/eventos/:id
   */
  async eliminarEvento(req, res) {
    const usuarioId = req.user.id;
    const eventoId = req.params.id;

    try {
      // Verificar propiedad y estado
      const [eventos] = await pool.query(
        'SELECT * FROM eventos WHERE id = ? AND usuario_id = ?',
        [eventoId, usuarioId]
      );

      if (eventos.length === 0) {
        return res.status(404).json({ error: 'Evento no encontrado' });
      }

      // Solo permitir eliminación si estado es pendiente
      if (eventos[0].estado !== 'pendiente') {
        return res.status(403).json({ error: 'No puedes eliminar eventos aprobados o rechazados' });
      }

      // Eliminar evento (cascade delete de relacionados)
      await pool.query('DELETE FROM eventos WHERE id = ?', [eventoId]);

      res.json({ message: 'Evento eliminado exitosamente' });
    } catch (error) {
      console.error('Error al eliminar evento:', error);
      res.status(500).json({ error: 'Error al eliminar evento' });
    }
  }

  /**
   * Editar evento aprobado (envía a revisión)
   * POST /api/eventos/:id/editar-aprobado
   * Solo eventos en estado "aprobado" → pasan a "edicion_pendiente"
   */
  async editarEventoAprobado(req, res) {
    const usuarioId = req.user.id;
    const eventoId = req.params.id;
    const body = req.body;
    const {
      slug, nombre, descripcion, fecha_inicio, fecha_fin, ubicacion, provincia,
      imagen_portada, horario_imagen, mapa_embed, tipo_venta, url_venta_online,
      precios, actividades, expositores, galeria
    } = body;

    try {
      // Verificar propiedad y estado
      const [eventos] = await pool.query(
        'SELECT * FROM eventos WHERE id = ? AND usuario_id = ?',
        [eventoId, usuarioId]
      );

      if (eventos.length === 0) {
        return res.status(404).json({ error: 'Evento no encontrado' });
      }

      const evento = eventos[0];

      // Permitir edición si estado es pendiente, aprobado, finalizado, rechazado o edicion_pendiente
      if (!['pendiente', 'aprobado', 'finalizado', 'rechazado', 'edicion_pendiente'].includes(evento.estado)) {
        return res.status(403).json({ error: 'No puedes editar este evento en su estado actual: ' + evento.estado });
      }

      // Validar fechas si se proporcionan
      if (fecha_inicio && fecha_fin) {
        const fechaInicio = new Date(fecha_inicio);
        const fechaFin = new Date(fecha_fin);
        if (fechaFin < fechaInicio) {
          return res.status(400).json({ error: 'La fecha final no puede ser anterior a la inicial' });
        }
      }

      const esAprobadoOFinalizado = (evento.estado === 'aprobado' || evento.estado === 'finalizado' || evento.estado === 'edicion_pendiente');

      if (esAprobadoOFinalizado) {
        // ── MODO BORRADOR: guardar cambios en borrador_cambios sin tocar la tabla live ──
        const borrador = JSON.stringify(body);
        await pool.query(
          `UPDATE eventos SET borrador_cambios = ?, estado = 'edicion_pendiente', fecha_envio_revision = NOW() WHERE id = ?`,
          [borrador, eventoId]
        );

        return res.status(200).json({
          message: 'Tus cambios han sido enviados a revisión. Tu evento seguirá visible mientras son aprobados.',
          evento: { id: eventoId, estado: 'edicion_pendiente' }
        });
      } else {
        // ── MODO DIRECTO: evento pendiente o rechazado → actualizar directamente ──
        await pool.query(
          `UPDATE eventos SET
            slug = ?, nombre = ?, descripcion = ?, fecha_inicio = ?, fecha_fin = ?, ubicacion = ?, provincia = ?,
            imagen_portada = ?, horario_imagen = ?, mapa_embed = ?, tipo_venta = ?, url_venta_online = ?,
            color_primario = ?, color_secundario = ?, color_fondo = ?, color_texto = ?, color_descripcion_texto = ?,
            color_hero_overlay = ?, color_titulo_seccion = ?,
            color_titulo_hero = ?, color_descripcion_hero = ?, color_fondo_fechas = ?, color_texto_fechas = ?,
            color_menu_fondo = ?, color_menu_texto = ?, color_menu_fondo_hover = ?, color_menu_texto_hover = ?,
            color_titulo_h3 = ?,
            color_fondo_contacto = ?, color_texto_contacto = ?, color_enlace_contacto = ?,
            color_fondo_footer = ?, color_texto_footer = ?,
            color_fondo_share = ?, color_texto_share = ?,
            color_buscador_expositores = ?, color_borde_buscador_expositores = ?,
            color_card_fondo = ?, color_card_borde = ?, color_rubro_fondo = ?, color_rubro_texto = ?,
            color_buscador_fondo = ?, color_buscador_borde = ?, color_btn_ver_mas = ?, borrador_cambios = NULL,
            estado = 'pendiente'
           WHERE id = ?`,
          [
            slug, nombre, descripcion, fecha_inicio, fecha_fin, ubicacion, provincia,
            imagen_portada || null, horario_imagen || null, mapa_embed || null, tipo_venta || 'taquilla', url_venta_online || null,
            body.color_primario || '#8b5a2b', body.color_secundario || '#d4a373', body.color_fondo || '#f4e4c1', body.color_texto || '#2c1a0e', body.color_descripcion_texto || '#2c1a0e',
            body.color_hero_overlay || 'rgba(62,42,31,0.7)', body.color_titulo_seccion || '#2c1a0e',
            body.color_titulo_hero || '#ffffff', body.color_descripcion_hero || '#ffffff', body.color_fondo_fechas || '#d4a373', body.color_texto_fechas || '#8b5a2b',
            body.color_menu_fondo || '#ffffff', body.color_menu_texto || '#ffffff', body.color_menu_fondo_hover || '', body.color_menu_texto_hover || '',
            body.color_titulo_h3 || '#2c1a0e',
            body.color_fondo_contacto || '#f4e4c1', body.color_texto_contacto || '#2c1a0e', body.color_enlace_contacto || '#8b5a2b',
            body.color_fondo_footer || '#8b5a2b', body.color_texto_footer || '#ffffff',
            body.color_fondo_share || 'rgba(255, 255, 255, 0.5)', body.color_texto_share || '#2c1a0e',
            body.color_buscador_expositores || '#ffffff', body.color_borde_buscador_expositores || '#eeeeee',
            body.color_card_fondo || '#ffffff', body.color_card_borde || '#f0f0f0', body.color_rubro_fondo || '#f0f0f0', body.color_rubro_texto || '#000000',
            body.color_buscador_fondo || '#ffffff', body.color_buscador_borde || '#eeeeee', body.color_btn_ver_mas || '#C8102E',
            eventoId
          ]
        );

        // 🔥 ACTUALIZAR TABLAS RELACIONADAS
        await RelatedTablesController.actualizarTodo(eventoId, { precios, actividades, expositores, galeria });

        return res.status(200).json({
          message: 'Evento actualizado. Está en revisión.',
          evento: { id: eventoId, estado: 'pendiente' }
        });
      }
    } catch (error) {
      console.error('Error al editar evento aprobado:', error);
      res.status(500).json({ error: 'Error al editar evento' });
    }
  }

  /**
   * Obtener eventos aprobados del usuario (para mostrar el botón "Editar")
   * GET /api/eventos/mis-eventos/aprobados
   */
  async misEventosAprobados(req, res) {
    const usuarioId = req.user.id;

    try {
      const [eventos] = await pool.query(
        `SELECT id, slug, nombre, fecha_inicio, fecha_fin, estado, created_at
         FROM eventos
         WHERE usuario_id = ? AND estado = 'aprobado'
         ORDER BY created_at DESC`,
        [usuarioId]
      );

      res.json({ eventos });
    } catch (error) {
      console.error('Error al obtener eventos aprobados:', error);
      res.status(500).json({ error: 'Error al obtener eventos' });
    }
  }

  /**
   * Obtener eventos pendientes de aprobación del usuario
   * GET /api/eventos/mis-eventos/pendientes
   */
  async misEventosPendientes(req, res) {
    const usuarioId = req.user.id;

    try {
      const [eventos] = await pool.query(
        `SELECT id, slug, nombre, fecha_inicio, fecha_fin, estado, razon_rechazo, created_at, fecha_envio_revision
         FROM eventos
         WHERE usuario_id = ? AND estado IN ('pendiente', 'edicion_pendiente')
         ORDER BY fecha_envio_revision DESC, created_at DESC`,
        [usuarioId]
      );

      res.json({ eventos });
    } catch (error) {
      console.error('Error al obtener eventos pendientes:', error);
      res.status(500).json({ error: 'Error al obtener eventos pendientes' });
    }
  }

  /**
   * Obtener eventos rechazados del usuario
   * GET /api/eventos/mis-eventos/rechazados
   */
  async misEventosRechazados(req, res) {
    const usuarioId = req.user.id;

    try {
      const [eventos] = await pool.query(
        `SELECT id, slug, nombre, fecha_inicio, fecha_fin, estado, razon_rechazo, created_at
         FROM eventos
         WHERE usuario_id = ? AND estado = 'rechazado'
         ORDER BY created_at DESC`,
        [usuarioId]
      );

      res.json({ eventos });
    } catch (error) {
      console.error('Error al obtener eventos rechazados:', error);
      res.status(500).json({ error: 'Error a del servidor al eliminar evento' });
    }
  }
}

module.exports = UsuarioEventsController;
