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

      const evento = rows[0];
      const [actividades] = await pool.query('SELECT * FROM actividades WHERE evento_id = ? ORDER BY fecha, hora', [id]);
      const [precios] = await pool.query('SELECT * FROM precios_entrada WHERE evento_id = ? ORDER BY fecha', [id]);
      const [expositores] = await pool.query('SELECT * FROM expositores WHERE evento_id = ? ORDER BY nombre', [id]);
      const [galeria] = await pool.query('SELECT * FROM evento_galeria WHERE evento_id = ? ORDER BY orden', [id]);

      res.json({
        evento,
        actividades,
        precios,
        expositores,
        galeria
      });
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
      color_titulo_h3,
      precios, actividades, expositores, galeria
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
      const eventoId = result.insertId;

      // Guardar tablas relacionadas
      if (precios && Array.isArray(precios) && precios.length > 0) {
        for (const precio of precios) {
          if (precio.fecha && precio.precio_normal !== undefined) {
            await pool.query(
              'INSERT INTO precios_entrada (evento_id, fecha, precio_normal, promocion, descripcion_promocion) VALUES (?, ?, ?, ?, ?)',
              [eventoId, precio.fecha, precio.precio_normal, precio.promocion || '', precio.descripcion_promocion || '']
            );
          }
        }
      }

      if (actividades && Array.isArray(actividades) && actividades.length > 0) {
        for (const actividad of actividades) {
          if (actividad.titulo && actividad.fecha) {
            await pool.query(
              'INSERT INTO actividades (evento_id, titulo, tipo, fecha, hora, lugar, descripcion, imagen, es_gratis, requiere_entrada_online, enlace_venta) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
              [
                eventoId, actividad.titulo, actividad.tipo || '', actividad.fecha, actividad.hora || null,
                actividad.lugar || '', actividad.descripcion || '',
                Array.isArray(actividad.imagen) ? JSON.stringify(actividad.imagen) : actividad.imagen || null,
                actividad.es_gratis ? 1 : 0, actividad.requiere_entrada_online ? 1 : 0, actividad.enlace_venta || ''
              ]
            );
          }
        }
      }

      if (expositores && Array.isArray(expositores) && expositores.length > 0) {
        for (const expositor of expositores) {
          if (expositor.nombre) {
            await pool.query(
              'INSERT INTO expositores (evento_id, nombre, rubro, ubicacion, descripcion, imagen_logo, video_url) VALUES (?, ?, ?, ?, ?, ?, ?)',
              [eventoId, expositor.nombre, expositor.rubro || '', expositor.ubicacion || '', expositor.descripcion || '', expositor.logo || '', expositor.video || '']
            );
          }
        }
      }

      if (galeria && Array.isArray(galeria) && galeria.length > 0) {
        for (const img of galeria) {
          if (img.imagen_url) {
            await pool.query(
              'INSERT INTO evento_galeria (evento_id, imagen_url, orden) VALUES (?, ?, ?)',
              [eventoId, img.imagen_url, img.orden || 0]
            );
          }
        }
      }

      const [newEvent] = await pool.query('SELECT * FROM eventos WHERE id = ?', [eventoId]);
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
      color_titulo_h3,
      precios, actividades, expositores, galeria
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

      // Actualizar tablas relacionadas 
      if (precios && Array.isArray(precios)) {
        await pool.query('DELETE FROM precios_entrada WHERE evento_id = ?', [id]);
        for (const precio of precios) {
          if (precio.fecha && precio.precio_normal !== undefined) {
            await pool.query(
              'INSERT INTO precios_entrada (evento_id, fecha, precio_normal, promocion, descripcion_promocion) VALUES (?, ?, ?, ?, ?)',
              [id, precio.fecha, precio.precio_normal, precio.promocion || null, precio.descripcion_promocion || null]
            );
          }
        }
      }

      if (actividades && Array.isArray(actividades)) {
        await pool.query('DELETE FROM actividades WHERE evento_id = ?', [id]);
        for (const acti of actividades) {
          if (acti.titulo) {
            await pool.query(
              `INSERT INTO actividades (evento_id, titulo, tipo, fecha, hora, lugar, descripcion, imagen, es_gratis, requiere_entrada_online, enlace_venta)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
              [id, acti.titulo, acti.tipo || null, acti.fecha || null, acti.hora || null, acti.lugar || null, acti.descripcion || null, Array.isArray(acti.imagen) ? JSON.stringify(acti.imagen) : acti.imagen || null, acti.es_gratis || 0, acti.requiere_entrada_online || 0, acti.enlace_venta || null]
            );
          }
        }
      }

      if (expositores && Array.isArray(expositores)) {
        await pool.query('DELETE FROM expositores WHERE evento_id = ?', [id]);
        for (const exp of expositores) {
          if (exp.nombre) {
            await pool.query(
              'INSERT INTO expositores (evento_id, nombre, rubro, ubicacion, descripcion, imagen_logo, video_url) VALUES (?, ?, ?, ?, ?, ?, ?)',
              [id, exp.nombre, exp.rubro || null, exp.ubicacion || null, exp.descripcion || null, exp.logo || null, exp.video || null]
            );
          }
        }
      }

      if (galeria && Array.isArray(galeria)) {
        await pool.query('DELETE FROM evento_galeria WHERE evento_id = ?', [id]);
        for (const img of galeria) {
          if (img.imagen_url) {
            await pool.query(
              'INSERT INTO evento_galeria (evento_id, imagen_url, orden) VALUES (?, ?, ?)',
              [id, img.imagen_url, img.orden || 0]
            );
          }
        }
      }

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

    try {
      const [rows] = await pool.query(
        'SELECT * FROM eventos WHERE id = ? AND estado = ?',
        [id, 'edicion_pendiente']
      );

      if (rows.length === 0) {
        return res.status(404).json({ error: 'Evento no encontrado o no está pendiente de edición' });
      }

      const eventoRow = rows[0];
      if (!eventoRow.borrador_cambios) {
        return res.status(400).json({ error: 'No hay cambios en borrador para aplicar' });
      }

      const body = JSON.parse(eventoRow.borrador_cambios);
      const {
        slug, nombre, descripcion, fecha_inicio, fecha_fin, ubicacion, provincia,
        imagen_portada, horario_imagen, mapa_embed, tipo_venta, url_venta_online,
        precios, actividades, expositores, galeria
      } = body;

      // 1. Actualizar tabla principal
      await pool.query(
        `UPDATE eventos SET
          slug = ?, nombre = ?, descripcion = ?, fecha_inicio = ?, fecha_fin = ?, ubicacion = ?, provincia = ?,
          imagen_portada = ?, horario_imagen = ?, mapa_embed = ?, tipo_venta = ?, url_venta_online = ?,
          color_primario = ?, color_secundario = ?, color_fondo = ?, color_texto = ?,
          color_hero_overlay = ?, color_titulo_seccion = ?,
          color_titulo_hero = ?, color_descripcion_hero = ?, color_fondo_fechas = ?, color_texto_fechas = ?,
          color_menu_fondo = ?, color_menu_texto = ?, color_menu_fondo_hover = ?, color_menu_texto_hover = ?,
          color_titulo_h3 = ?,
          color_fondo_contacto = ?, color_texto_contacto = ?, color_enlace_contacto = ?,
          color_fondo_footer = ?, color_texto_footer = ?,
          estado = 'aprobado',
          borrador_cambios = NULL,
          razon_rechazo = NULL,
          updated_at = NOW()
        WHERE id = ?`,
        [
          slug, nombre, descripcion, fecha_inicio, fecha_fin, ubicacion, provincia,
          imagen_portada, horario_imagen, mapa_embed, tipo_venta, url_venta_online,
          body.color_primario || '#8b5a2b', body.color_secundario || '#d4a373', body.color_fondo || '#f4e4c1', body.color_texto || '#2c1a0e',
          body.color_hero_overlay || 'rgba(62,42,31,0.7)', body.color_titulo_seccion || '#2c1a0e',
          body.color_titulo_hero || '#ffffff', body.color_descripcion_hero || '#ffffff', body.color_fondo_fechas || '#d4a373', body.color_texto_fechas || '#8b5a2b',
          body.color_menu_fondo || '#ffffff', body.color_menu_texto || '#ffffff', body.color_menu_fondo_hover || '', body.color_menu_texto_hover || '',
          body.color_titulo_h3 || '#2c1a0e',
          body.color_fondo_contacto || '#f4e4c1', body.color_texto_contacto || '#2c1a0e', body.color_enlace_contacto || '#8b5a2b',
          body.color_fondo_footer || '#8b5a2b', body.color_texto_footer || '#ffffff',
          id
        ]
      );

      // 2. Actualizar tablas relacionadas
      if (precios && Array.isArray(precios)) {
        await pool.query('DELETE FROM precios_entrada WHERE evento_id = ?', [id]);
        for (const p of precios) {
          if (p.fecha && p.precio_normal !== undefined) {
            await pool.query('INSERT INTO precios_entrada (evento_id, fecha, precio_normal, promocion, descripcion_promocion) VALUES (?, ?, ?, ?, ?)',
              [id, p.fecha, p.precio_normal, p.promocion || null, p.descripcion_promocion || null]);
          }
        }
      }

      if (actividades && Array.isArray(actividades)) {
        await pool.query('DELETE FROM actividades WHERE evento_id = ?', [id]);
        for (const act of actividades) {
          if (act.titulo) {
            await pool.query('INSERT INTO actividades (evento_id, titulo, tipo, fecha, hora, lugar, descripcion, imagen, es_gratis, requiere_entrada_online, enlace_venta) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
              [id, act.titulo, act.tipo || null, act.fecha || null, act.hora || null, act.lugar || null, act.descripcion || null, Array.isArray(act.imagen) ? JSON.stringify(act.imagen) : act.imagen || null, act.es_gratis || 0, act.requiere_entrada_online || 0, act.enlace_venta || null]);
          }
        }
      }

      if (expositores && Array.isArray(expositores)) {
        await pool.query('DELETE FROM expositores WHERE evento_id = ?', [id]);
        for (const exp of expositores) {
          if (exp.nombre) {
            await pool.query('INSERT INTO expositores (evento_id, nombre, rubro, ubicacion, descripcion, imagen_logo, video_url) VALUES (?, ?, ?, ?, ?, ?, ?)',
              [id, exp.nombre, exp.rubro || null, exp.ubicacion || null, exp.descripcion || null, exp.logo || null, exp.video || null]);
          }
        }
      }

      if (galeria && Array.isArray(galeria)) {
        await pool.query('DELETE FROM evento_galeria WHERE evento_id = ?', [id]);
        for (const img of galeria) {
          if (img.imagen_url) {
            await pool.query('INSERT INTO evento_galeria (evento_id, imagen_url, orden) VALUES (?, ?, ?)',
              [id, img.imagen_url, img.orden || 0]);
          }
        }
      }

      res.json({
        message: 'Cambios del evento aprobados y aplicados exitosamente',
        evento: { id, estado: 'aprobado' }
      });
    } catch (error) {
      console.error('Error al aprobar cambios de evento:', error);
      res.status(500).json({ error: 'Error al aprobar cambios del evento' });
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
      const [rows] = await pool.query(
        'SELECT * FROM eventos WHERE id = ? AND estado = ?',
        [id, 'edicion_pendiente']
      );

      if (rows.length === 0) {
        return res.status(404).json({ error: 'Evento no encontrado o no está pendiente de edición' });
      }

      if (!razon) {
        return res.status(400).json({ error: 'Debes proporcionar una razón del rechazo' });
      }

      // Cambiar estado a aprobado nuevamente (rechaza cambios, marcando el borrador como nulo)
      await pool.query(
        'UPDATE eventos SET estado = ?, razon_rechazo = ?, borrador_cambios = NULL WHERE id = ?',
        ['aprobado', razon, id]
      );

      res.json({
        message: 'Cambios rechazados. El evento se mantiene en su estado original.',
        evento: { id, estado: 'aprobado', razon_rechazo: razon }
      });
    } catch (error) {
      console.error('Error al rechazar cambios de evento:', error);
      res.status(500).json({ error: 'Error al rechazar cambios del evento' });
    }
  }
}

module.exports = AdminEventoController;