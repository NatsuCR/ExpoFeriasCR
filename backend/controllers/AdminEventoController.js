const pool = require('../db');

class AdminEventoController {
  async listar(req, res) {
    try {
      const [rows] = await pool.query('SELECT * FROM eventos ORDER BY fecha_inicio DESC');
      res.json(rows);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error al listar eventos' });
    }
  }

  async obtenerPorId(req, res) {
    const { id } = req.params;
    try {
      const [rows] = await pool.query('SELECT * FROM eventos WHERE id = ?', [id]);
      if (rows.length === 0) return res.status(404).json({ error: 'Evento no encontrado' });
      res.json(rows[0]);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error al obtener evento' });
    }
  }

  async crear(req, res) {
    const {
      slug, nombre, descripcion, fecha_inicio, fecha_fin, ubicacion,
      imagen_portada, activo, horario_imagen, mapa_embed,
      color_primario, color_secundario, color_fondo, color_texto, color_hero_overlay,
      tipo_venta, url_venta_online,
      color_titulo_hero, color_descripcion_hero, color_fondo_fechas, color_texto_fechas,
      color_titulo_seccion, provincia,
      color_menu_fondo, color_menu_texto, color_menu_fondo_hover, color_menu_texto_hover,
      color_fondo_contacto, color_texto_contacto, color_enlace_contacto,
      color_fondo_footer, color_texto_footer,
      color_titulo_h3
    } = req.body;

    const values = [
      slug, nombre, descripcion, fecha_inicio, fecha_fin, ubicacion,
      imagen_portada || null,
      activo === undefined ? 1 : (activo ? 1 : 0),
      horario_imagen || null,
      mapa_embed || null,
      color_primario || '#8b5a2b',
      color_secundario || '#d4a373',
      color_fondo || '#f4e4c1',
      color_texto || '#2c1a0e',
      color_hero_overlay || 'rgba(62,42,31,0.7)',
      tipo_venta || 'taquilla',
      url_venta_online || null,
      color_titulo_hero || '#ffffff',
      color_descripcion_hero || '#ffffff',
      color_fondo_fechas || '#d4a373',
      color_texto_fechas || '#8b5a2b',
      color_titulo_seccion || '#2c1a0e',
      provincia || null,
      color_menu_fondo || '#ffffff',
      color_menu_texto || '#ffffff',
      color_menu_fondo_hover || null,
      color_menu_texto_hover || null,
      color_fondo_contacto || '#f4e4c1',
      color_texto_contacto || '#2c1a0e',
      color_enlace_contacto || '#8b5a2b',
      color_fondo_footer || '#8b5a2b',
      color_texto_footer || '#ffffff',
      color_titulo_h3 || '#2c1a0e'
    ];

    const query = `
      INSERT INTO eventos (
        slug, nombre, descripcion, fecha_inicio, fecha_fin, ubicacion,
        imagen_portada, activo, horario_imagen, mapa_embed,
        color_primario, color_secundario, color_fondo, color_texto, color_hero_overlay,
        tipo_venta, url_venta_online,
        color_titulo_hero, color_descripcion_hero, color_fondo_fechas, color_texto_fechas,
        color_titulo_seccion, provincia,
        color_menu_fondo, color_menu_texto, color_menu_fondo_hover, color_menu_texto_hover,
        color_fondo_contacto, color_texto_contacto, color_enlace_contacto,
        color_fondo_footer, color_texto_footer,
        color_titulo_h3
      ) VALUES (${values.map(() => '?').join(', ')})
    `;

    try {
      const [result] = await pool.query(query, values);
      const [newEvent] = await pool.query('SELECT * FROM eventos WHERE id = ?', [result.insertId]);
      res.status(201).json(newEvent[0]);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error al crear evento' });
    }
  }

  async actualizar(req, res) {
    const { id } = req.params;
    const {
      slug, nombre, descripcion, fecha_inicio, fecha_fin, ubicacion,
      imagen_portada, activo, horario_imagen, mapa_embed,
      color_primario, color_secundario, color_fondo, color_texto, color_hero_overlay,
      tipo_venta, url_venta_online,
      color_titulo_hero, color_descripcion_hero, color_fondo_fechas, color_texto_fechas,
      color_titulo_seccion, provincia,
      color_menu_fondo, color_menu_texto, color_menu_fondo_hover, color_menu_texto_hover,
      color_fondo_contacto, color_texto_contacto, color_enlace_contacto,
      color_fondo_footer, color_texto_footer,
      color_titulo_h3
    } = req.body;

    try {
      const [result] = await pool.query(
        `UPDATE eventos SET
          slug = ?, nombre = ?, descripcion = ?, fecha_inicio = ?, fecha_fin = ?, ubicacion = ?,
          imagen_portada = ?, activo = ?, horario_imagen = ?, mapa_embed = ?,
          color_primario = ?, color_secundario = ?, color_fondo = ?, color_texto = ?, color_hero_overlay = ?,
          tipo_venta = ?, url_venta_online = ?,
          color_titulo_hero = ?, color_descripcion_hero = ?, color_fondo_fechas = ?, color_texto_fechas = ?,
          color_titulo_seccion = ?, provincia = ?,
          color_menu_fondo = ?, color_menu_texto = ?, color_menu_fondo_hover = ?, color_menu_texto_hover = ?,
          color_fondo_contacto = ?, color_texto_contacto = ?, color_enlace_contacto = ?,
          color_fondo_footer = ?, color_texto_footer = ?,
          color_titulo_h3 = ?,
          updated_at = NOW()
        WHERE id = ?`,
        [
          slug, nombre, descripcion, fecha_inicio, fecha_fin, ubicacion,
          imagen_portada, activo, horario_imagen, mapa_embed,
          color_primario, color_secundario, color_fondo, color_texto, color_hero_overlay,
          tipo_venta, url_venta_online,
          color_titulo_hero, color_descripcion_hero, color_fondo_fechas, color_texto_fechas,
          color_titulo_seccion, provincia,
          color_menu_fondo, color_menu_texto, color_menu_fondo_hover, color_menu_texto_hover,
          color_fondo_contacto, color_texto_contacto, color_enlace_contacto,
          color_fondo_footer, color_texto_footer,
          color_titulo_h3,
          id
        ]
      );
      if (result.affectedRows === 0) return res.status(404).json({ error: 'Evento no encontrado' });
      const [updated] = await pool.query('SELECT * FROM eventos WHERE id = ?', [id]);
      res.json(updated[0]);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error al actualizar evento' });
    }
  }

  async eliminar(req, res) {
    const { id } = req.params;
    try {
      const [result] = await pool.query('DELETE FROM eventos WHERE id = ?', [id]);
      if (result.affectedRows === 0) return res.status(404).json({ error: 'Evento no encontrado' });
      res.json({ message: 'Evento eliminado' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error al eliminar evento' });
    }
  }

  /**
   * Listar eventos aprobados que fueron editados y están esperando re-revisión
   * GET /api/admin/eventos-edicion-pendiente
   */
  async eventosEdicionPendiente(req, res) {
    try {
      const [eventos] = await pool.query(
        `SELECT e.*, u.nombre as usuario_nombre, u.email as usuario_email,
                DATE_FORMAT(e.fecha_envio_revision, '%Y-%m-%d %H:%i') as fecha_envio
         FROM eventos e
         LEFT JOIN usuarios u ON e.usuario_id = u.id
         WHERE e.estado = 'edicion_pendiente'
         ORDER BY e.fecha_envio_revision ASC`
      );
      
      res.json(eventos);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error al obtener eventos pendientes de edición' });
    }
  }

  /**
   * Aprobar cambios de evento editado
   * POST /api/admin/eventos-edicion-pendiente/:id/aprobar
   */
  async aprobarEdicionEvento(req, res) {
    const { id } = req.params;
    const { notas } = req.body || {};

    try {
      const [eventos] = await pool.query(
        'SELECT * FROM eventos WHERE id = ? AND estado = ?',
        [id, 'edicion_pendiente']
      );

      if (eventos.length === 0) {
        return res.status(404).json({ error: 'Evento no encontrado o no está pendiente de edición' });
      }

      // Cambiar estado a aprobado (vuelve a estado anterior)
      await pool.query(
        'UPDATE eventos SET estado = ?, razon_rechazo = NULL WHERE id = ?',
        ['aprobado', id]
      );

      res.json({
        message: 'Cambios del evento aprobados exitosamente',
        evento: { id, estado: 'aprobado' }
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error al aprobar evento' });
    }
  }

  /**
   * Rechazar cambios de evento editado
   * POST /api/admin/eventos-edicion-pendiente/:id/rechazar
   */
  async rechazarEdicionEvento(req, res) {
    const { id } = req.params;
    const { razon } = req.body;

    try {
      const [eventos] = await pool.query(
        'SELECT * FROM eventos WHERE id = ? AND estado = ?',
        [id, 'edicion_pendiente']
      );

      if (eventos.length === 0) {
        return res.status(404).json({ error: 'Evento no encontrado o no está pendiente de edición' });
      }

      if (!razon) {
        return res.status(400).json({ error: 'Debes proporcionar una razón del rechazo' });
      }

      // Cambiar estado a aprobado nuevamente (rechaza cambios, pero el evento ya aprobado se mantiene)
      await pool.query(
        'UPDATE eventos SET estado = ?, razon_rechazo = ? WHERE id = ?',
        ['aprobado', razon, id]
      );

      res.json({
        message: 'Cambios rechazados. El evento se mantiene en su estado anterior.',
        evento: { id, estado: 'aprobado', razon_rechazo: razon }
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error al rechazar evento' });
    }
  }
}

module.exports = AdminEventoController;