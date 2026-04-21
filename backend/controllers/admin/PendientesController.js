const pool = require('../../db');
const RelatedTablesController = require('../RelatedTablesController');
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
        // Combinar con cuidado para no perder valores falsy como 0
        const eventoConBorrador = { ...evento };
        Object.keys(borradorData).forEach(key => {
          if (borradorData[key] !== undefined) {
            eventoConBorrador[key] = borradorData[key];
          }
        });

        res.json({
          evento: eventoConBorrador,
          actividades: (borradorData.actividades && borradorData.actividades.length > 0) ? borradorData.actividades : actividades,
          precios: (borradorData.precios && borradorData.precios.length > 0) ? borradorData.precios : precios,
          expositores: (borradorData.expositores && borradorData.expositores.length > 0) ? borradorData.expositores : expositores,
          galeria: (borradorData.galeria && borradorData.galeria.length > 0) ? borradorData.galeria : galeria,
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
      if (evento.borrador_cambios) {
        let borrador;
        try {
          borrador = typeof evento.borrador_cambios === 'string'
            ? JSON.parse(evento.borrador_cambios)
            : evento.borrador_cambios;
        } catch (_) { borrador = null; }

        if (borrador) {
          const b = borrador;
          // Actualizar columnas principales del evento con datos del borrador siguiendo el órden MAESTRO de eventos.sql
          await pool.query(
            `UPDATE eventos SET
              estado = 'aprobado', razon_rechazo = NULL, fecha_envio_revision = NULL,
              slug = ?, nombre = ?, descripcion = ?, fecha_inicio = ?, fecha_fin = ?, ubicacion = ?,
              imagen_portada = ?, activo = 1, horario_imagen = ?, mapa_embed = ?, mapa_waze_embed = ?, 
              tipo_venta = ?, url_venta_online = ?, 
              color_primario = ?, color_secundario = ?, color_fondo = ?, color_texto = ?, 
              color_hero_overlay = ?, color_titulo_hero = ?, color_descripcion_hero = ?, color_fondo_fechas = ?, color_texto_fechas = ?,
              color_titulo_seccion = ?, provincia = ?, 
              color_menu_fondo = ?, color_menu_texto = ?, color_menu_fondo_hover = ?, color_menu_texto_hover = ?,
              color_fondo_contacto = ?, color_texto_contacto = ?, color_enlace_contacto = ?,
              color_fondo_footer = ?, color_texto_footer = ?,
              color_titulo_h3 = ?, color_expositor_header = ?, borrador_cambios = NULL,
              color_buscador_expositores = ?, fecha_aprobacion = NOW(), fecha_rechazo = NULL,
              color_borde_buscador_expositores = ?, 
              color_fondo_share = ?, color_texto_share = ?,
              color_descripcion_texto = ?, tiene_expositores = ?
             WHERE id = ?`,
            [
              b.slug || evento.slug, 
              b.nombre || evento.nombre, 
              b.hasOwnProperty('descripcion') ? b.descripcion : evento.descripcion, 
              b.fecha_inicio || evento.fecha_inicio, 
              b.fecha_fin || evento.fecha_fin,
              b.ubicacion || evento.ubicacion, 
              b.hasOwnProperty('imagen_portada') ? b.imagen_portada : evento.imagen_portada, 
              b.hasOwnProperty('horario_imagen') ? b.horario_imagen : evento.horario_imagen, 
              b.hasOwnProperty('mapa_embed') ? b.mapa_embed : evento.mapa_embed, 
              b.hasOwnProperty('mapa_waze_embed') ? b.mapa_waze_embed : evento.mapa_waze_embed, 
              b.hasOwnProperty('tipo_venta') ? b.tipo_venta : evento.tipo_venta, 
              b.hasOwnProperty('url_venta_online') ? b.url_venta_online : evento.url_venta_online,
              b.hasOwnProperty('color_primario') ? b.color_primario : evento.color_primario, 
              b.hasOwnProperty('color_secundario') ? b.color_secundario : evento.color_secundario, 
              b.hasOwnProperty('color_fondo') ? b.color_fondo : evento.color_fondo, 
              b.hasOwnProperty('color_texto') ? b.color_texto : evento.color_texto, 
              b.hasOwnProperty('color_hero_overlay') ? b.color_hero_overlay : evento.color_hero_overlay, 
              b.hasOwnProperty('color_titulo_hero') ? b.color_titulo_hero : evento.color_titulo_hero, 
              b.hasOwnProperty('color_descripcion_hero') ? b.color_descripcion_hero : evento.color_descripcion_hero, 
              b.hasOwnProperty('color_fondo_fechas') ? b.color_fondo_fechas : evento.color_fondo_fechas, 
              b.hasOwnProperty('color_texto_fechas') ? b.color_texto_fechas : evento.color_texto_fechas,
              b.hasOwnProperty('color_titulo_seccion') ? b.color_titulo_seccion : evento.color_titulo_seccion,
              b.hasOwnProperty('provincia') ? b.provincia : evento.provincia,
              b.hasOwnProperty('color_menu_fondo') ? b.color_menu_fondo : evento.color_menu_fondo, 
              b.hasOwnProperty('color_menu_texto') ? b.color_menu_texto : evento.color_menu_texto, 
              b.hasOwnProperty('color_menu_fondo_hover') ? b.color_menu_fondo_hover : evento.color_menu_fondo_hover, 
              b.hasOwnProperty('color_menu_texto_hover') ? b.color_menu_texto_hover : evento.color_menu_texto_hover,
              b.hasOwnProperty('color_fondo_contacto') ? b.color_fondo_contacto : evento.color_fondo_contacto, 
              b.hasOwnProperty('color_texto_contacto') ? b.color_texto_contacto : evento.color_texto_contacto, 
              b.hasOwnProperty('color_enlace_contacto') ? b.color_enlace_contacto : evento.color_enlace_contacto,
              b.hasOwnProperty('color_fondo_footer') ? b.color_fondo_footer : evento.color_fondo_footer, 
              b.hasOwnProperty('color_texto_footer') ? b.color_texto_footer : evento.color_texto_footer,
              b.hasOwnProperty('color_titulo_h3') ? b.color_titulo_h3 : evento.color_titulo_h3,
              b.hasOwnProperty('color_expositor_header') ? b.color_expositor_header : evento.color_expositor_header,
              b.hasOwnProperty('color_buscador_expositores') ? b.color_buscador_expositores : evento.color_buscador_expositores, 
              b.hasOwnProperty('color_borde_buscador_expositores') ? b.color_borde_buscador_expositores : evento.color_borde_buscador_expositores,
              b.hasOwnProperty('color_fondo_share') ? b.color_fondo_share : evento.color_fondo_share, 
              b.hasOwnProperty('color_texto_share') ? b.color_texto_share : evento.color_texto_share,
              b.hasOwnProperty('color_descripcion_texto') ? b.color_descripcion_texto : evento.color_descripcion_texto,
              (b.hasOwnProperty('tiene_expositores')) ? parseInt(b.tiene_expositores) : (evento.tiene_expositores ?? 0),
              eventoId
            ]
          );

          // Promover tablas relacionadas usando el controlador unificado
          await RelatedTablesController.actualizarTodo(eventoId, b);
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

      // Determinar si volvemos a aprobado o marcamos como rechazado
      let nuevoEstado = 'rechazado';
      let activo = 0;
      if (evento.estado === 'edicion_pendiente') {
        nuevoEstado = 'aprobado';
        activo = 1;
      }

      await pool.query(
        `UPDATE eventos 
        SET estado = ?, activo = ?, razon_rechazo = ?, borrador_cambios = NULL 
        WHERE id = ?`,
        [nuevoEstado, activo, razonRechazo, eventoId]
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

module.exports = new AdminEventosPendientesController();
