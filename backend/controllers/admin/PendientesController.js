const pool = require('../../db');
const emailService = require('../../services/emailService');

class AdminEventosPendientesController {
  /**
   * Listar eventos pendientes
   * GET /api/admin/eventos-pendientes
   */
  async listarPendientes(req, res) {
    const { estado, pagina = 1, limite = 10 } = req.query;

    try {
      const offset = (pagina - 1) * limite;

      let consulta = 'SELECT e.id, e.nombre, e.slug, e.usuario_id, u.nombre as usuario_nombre, u.email as usuario_email, e.estado, e.created_at, e.razon_rechazo FROM eventos e JOIN usuarios u ON e.usuario_id = u.id';
      let params = [];

      if (estado) {
        consulta += ' WHERE e.estado = ?';
        params.push(estado);
      } else {
        // Por defecto mostrar pendientes y ediciones pendientes
        consulta += ` WHERE e.estado IN ('pendiente', 'edicion_pendiente')`;
      }

      consulta += ' ORDER BY e.created_at DESC LIMIT ? OFFSET ?';
      params.push(parseInt(limite), offset);

      const [eventos] = await pool.query(consulta, params);

      // Obtener total para paginación
      let consultaTotal = `SELECT COUNT(*) as total FROM eventos WHERE usuario_id IS NOT NULL AND estado IN ('pendiente', 'edicion_pendiente')`;
      if (estado) {
        consultaTotal = 'SELECT COUNT(*) as total FROM eventos WHERE usuario_id IS NOT NULL AND estado = ?';
      }
      const [countResult] = await pool.query(consultaTotal, estado ? [estado] : []);
      const total = countResult[0].total;

      res.json({
        eventos,
        paginacion: {
          total,
          pagina: parseInt(pagina),
          limite: parseInt(limite),
          totalPaginas: Math.ceil(total / limite)
        }
      });
    } catch (error) {
      console.error('Error al listar eventos pendientes:', error);
      res.status(500).json({ error: 'Error al listar eventos' });
    }
  }

  /**
   * Obtener detalle de evento pendiente (con vista previa)
   * GET /api/admin/eventos-pendientes/:id
   */
  async obtenerPendiente(req, res) {
    const eventoId = req.params.id;

    try {
      // Obtener evento
      const [eventos] = await pool.query(
        'SELECT e.*, u.nombre as usuario_nombre, u.email as usuario_email FROM eventos e JOIN usuarios u ON e.usuario_id = u.id WHERE e.id = ? AND e.usuario_id IS NOT NULL',
        [eventoId]
      );

      if (eventos.length === 0) {
        return res.status(404).json({ error: 'Evento no encontrado' });
      }

      let evento = eventos[0];

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

      // Si hay borrador, el admin debe ver los cambios propuestos
      let borradorData = null;
      if (evento.borrador_cambios) {
        try {
          borradorData = typeof evento.borrador_cambios === 'string'
            ? JSON.parse(evento.borrador_cambios)
            : evento.borrador_cambios;
        } catch (_) { borradorData = null; }
      }

      if (borradorData) {
        const eventoConBorrador = { ...evento, ...borradorData };
        res.json({
          evento: eventoConBorrador,
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
      console.error('Error al obtener evento pendiente:', error);
      res.status(500).json({ error: 'Error al obtener evento' });
    }
  }

  /**
   * Aprobar evento
   * PUT /api/admin/eventos-pendientes/:id/aprobar
   */
  async aprobarEvento(req, res) {
    const eventoId = req.params.id;

    try {
      // Obtener evento (pendiente o edicion_pendiente)
      const [eventos] = await pool.query(
        `SELECT * FROM eventos WHERE id = ? AND estado IN ('pendiente', 'edicion_pendiente') AND usuario_id IS NOT NULL`,
        [eventoId]
      );

      if (eventos.length === 0) {
        return res.status(404).json({ error: 'Evento no encontrado o no está pendiente' });
      }

      const evento = eventos[0];

      // Obtener usuario
      const [usuarios] = await pool.query(
        'SELECT * FROM usuarios WHERE id = ?',
        [evento.usuario_id]
      );

      if (usuarios.length === 0) {
        return res.status(404).json({ error: 'Usuario no encontrado' });
      }

      const usuario = usuarios[0];

      // Si tiene borrador, promoverlo a datos live antes de aprobar
      if (evento.estado === 'edicion_pendiente' && evento.borrador_cambios) {
        let borrador;
        try {
          borrador = typeof evento.borrador_cambios === 'string'
            ? JSON.parse(evento.borrador_cambios)
            : evento.borrador_cambios;
        } catch (_) { borrador = null; }

        if (borrador) {
          const b = borrador;
          // Actualizar columnas principales del evento con datos del borrador
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
              estado = 'aprobado', activo = 1, razon_rechazo = NULL, borrador_cambios = NULL
             WHERE id = ?`,
            [
              b.slug || evento.slug, b.nombre || evento.nombre, b.descripcion, b.fecha_inicio, b.fecha_fin,
              b.ubicacion, b.provincia,
              b.imagen_portada, b.horario_imagen, b.mapa_embed, b.tipo_venta, b.url_venta_online,
              b.color_primario || '#8b5a2b', b.color_secundario || '#d4a373', b.color_fondo || '#f4e4c1', b.color_texto || '#2c1a0e',
              b.color_hero_overlay || 'rgba(62,42,31,0.7)', b.color_titulo_seccion || '#2c1a0e',
              b.color_titulo_hero || '#ffffff', b.color_descripcion_hero || '#ffffff', b.color_fondo_fechas || '#d4a373', b.color_texto_fechas || '#8b5a2b',
              b.color_menu_fondo || '#ffffff', b.color_menu_texto || '#ffffff', b.color_menu_fondo_hover || '', b.color_menu_texto_hover || '',
              b.color_titulo_h3 || '#2c1a0e',
              b.color_fondo_contacto || '#f4e4c1', b.color_texto_contacto || '#2c1a0e', b.color_enlace_contacto || '#8b5a2b',
              b.color_fondo_footer || '#8b5a2b', b.color_texto_footer || '#ffffff',
              eventoId
            ]
          );

          // Promover precios
          if (b.precios && Array.isArray(b.precios)) {
            await pool.query('DELETE FROM precios_entrada WHERE evento_id = ?', [eventoId]);
            for (const p of b.precios) {
              if (p.fecha) await pool.query('INSERT INTO precios_entrada (evento_id, fecha, precio_normal, promocion, descripcion_promocion) VALUES (?, ?, ?, ?, ?)',
                [eventoId, p.fecha, p.precio_normal || 0, p.promocion || null, p.descripcion_promocion || null]);
            }
          }
          // Promover actividades
          if (b.actividades && Array.isArray(b.actividades)) {
            await pool.query('DELETE FROM actividades WHERE evento_id = ?', [eventoId]);
            for (const a of b.actividades) {
              if (a.titulo) await pool.query('INSERT INTO actividades (evento_id, titulo, tipo, fecha, hora, lugar, descripcion, imagen, es_gratis, requiere_entrada_online, enlace_venta) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
                [eventoId, a.titulo, a.tipo || null, a.fecha || null, a.hora || null, a.lugar || null, a.descripcion || null,
                  Array.isArray(a.imagen) ? JSON.stringify(a.imagen) : a.imagen || null,
                  a.es_gratis || 0, a.requiere_entrada_online || 0, a.enlace_venta || null]);
            }
          }
          // Promover expositores
          if (b.expositores && Array.isArray(b.expositores)) {
            await pool.query('DELETE FROM expositores WHERE evento_id = ?', [eventoId]);
            for (const e of b.expositores) {
              if (e.nombre) await pool.query('INSERT INTO expositores (evento_id, nombre, rubro, ubicacion, descripcion, imagen_logo, video_url) VALUES (?, ?, ?, ?, ?, ?, ?)',
                [eventoId, e.nombre, e.rubro || null, e.ubicacion || null, e.descripcion || null, e.logo || null, e.video || null]);
            }
          }
          // Promover galería
          if (b.galeria && Array.isArray(b.galeria)) {
            await pool.query('DELETE FROM evento_galeria WHERE evento_id = ?', [eventoId]);
            for (const g of b.galeria) {
              if (g.imagen_url) await pool.query('INSERT INTO evento_galeria (evento_id, imagen_url, orden) VALUES (?, ?, ?)',
                [eventoId, g.imagen_url, g.orden || 0]);
            }
          }
        }
      } else {
        // Aprobación simple (pendiente sin borrador)
        await pool.query(
          'UPDATE eventos SET estado = ?, activo = 1, razon_rechazo = NULL, borrador_cambios = NULL WHERE id = ?',
          ['aprobado', eventoId]
        );
      }

      // Enviar email al usuario
      await emailService.notificarAprobacion(
        usuario.email,
        usuario.nombre,
        evento.nombre,
        eventoId,
        evento.slug
      );

      res.json({
        message: 'Evento aprobado exitosamente',
        evento: { id: eventoId, estado: 'aprobado' }
      });
    } catch (error) {
      console.error('Error al aprobar evento:', error);
      res.status(500).json({ error: 'Error al aprobar evento' });
    }
  }

  /**
   * Rechazar evento
   * PUT /api/admin/eventos-pendientes/:id/rechazar
   */
  async rechazarEvento(req, res) {
    const eventoId = req.params.id;
    const { razonRechazo } = req.body;

    try {
      if (!razonRechazo || razonRechazo.trim() === '') {
        return res.status(400).json({ error: 'La razón del rechazo es requerida' });
      }

      // 🔥 CAMBIO AQUÍ: aceptar pendiente y edicion_pendiente
      const [eventos] = await pool.query(
        `SELECT * FROM eventos 
       WHERE id = ? 
       AND estado IN ('pendiente', 'edicion_pendiente') 
       AND usuario_id IS NOT NULL`,
        [eventoId]
      );

      if (eventos.length === 0) {
        return res.status(404).json({ error: 'Evento no encontrado o no está pendiente' });
      }

      const evento = eventos[0];

      // Obtener usuario
      const [usuarios] = await pool.query(
        'SELECT * FROM usuarios WHERE id = ?',
        [evento.usuario_id]
      );

      if (usuarios.length === 0) {
        return res.status(404).json({ error: 'Usuario no encontrado' });
      }

      const usuario = usuarios[0];

      // 🔥 Si era edición pendiente, limpiar borrador también
      await pool.query(
        `UPDATE eventos 
       SET estado = ?, activo = 0, razon_rechazo = ?, borrador_cambios = NULL 
       WHERE id = ?`,
        ['rechazado', razonRechazo, eventoId]
      );

      // Enviar email
      await emailService.notificarRechazo(
        usuario.email,
        usuario.nombre,
        evento.nombre,
        razonRechazo
      );

      res.json({
        message: 'Evento rechazado exitosamente',
        evento: {
          id: eventoId,
          estado: 'rechazado'
        }
      });

    } catch (error) {
      console.error('Error al rechazar evento:', error);
      res.status(500).json({ error: 'Error al rechazar evento' });
    }
  }

  /**
   * Obtener estadísticas de eventos pendientes
   * GET /api/admin/eventos-pendientes-stats
   */
  async obtenerEstadisticas(req, res) {
    try {
      const [stats] = await pool.query(`
        SELECT
          COUNT(*) as total,
          SUM(CASE WHEN estado IN ('pendiente', 'edicion_pendiente') THEN 1 ELSE 0 END) as pendientes,
          SUM(CASE WHEN estado = 'aprobado' THEN 1 ELSE 0 END) as aprobados,
          SUM(CASE WHEN estado = 'rechazado' THEN 1 ELSE 0 END) as rechazados
        FROM eventos
        WHERE usuario_id IS NOT NULL
      `);

      res.json({ stats: stats[0] });
    } catch (error) {
      console.error('Error al obtener estadísticas:', error);
      res.status(500).json({ error: 'Error al obtener estadísticas' });
    }
  }
}

module.exports = AdminEventosPendientesController;
