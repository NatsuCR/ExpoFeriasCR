const pool = require('../db');
const emailService = require('../services/emailService');

class AdminEventosPendientesController {
  /**
   * Listar eventos pendientes
   * GET /api/admin/eventos-pendientes
   */
  async listarPendientes(req, res) {
    const { estado = 'pendiente', pagina = 1, limite = 10 } = req.query;

    try {
      const offset = (pagina - 1) * limite;

      let consulta = 'SELECT e.id, e.nombre, e.slug, e.usuario_id, u.nombre as usuario_nombre, u.email as usuario_email, e.estado, e.created_at, e.razon_rechazo FROM eventos e JOIN usuarios u ON e.usuario_id = u.id';
      let params = [];

      if (estado) {
        consulta += ' WHERE e.estado = ?';
        params.push(estado);
      } else {
        consulta += ' WHERE e.estado IN (?, ?, ?)';
        params.push('pendiente', 'aprobado', 'rechazado');
      }

      consulta += ' ORDER BY e.created_at DESC LIMIT ? OFFSET ?';
      params.push(parseInt(limite), offset);

      const [eventos] = await pool.query(consulta, params);

      // Obtener total para paginación
      let consultaTotal = 'SELECT COUNT(*) as total FROM eventos WHERE usuario_id IS NOT NULL';
      if (estado) {
        consultaTotal += ' AND estado = ?';
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

      const evento = eventos[0];

      // Obtener datos relacionados
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

      res.json({
        evento,
        actividades,
        precios,
        expositores,
        galeria
      });
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
      // Obtener evento
      const [eventos] = await pool.query(
        'SELECT * FROM eventos WHERE id = ? AND estado = ? AND usuario_id IS NOT NULL',
        [eventoId, 'pendiente']
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

      // Actualizar estado a aprobado y activo
      await pool.query(
        'UPDATE eventos SET estado = ?, activo = 1, razon_rechazo = NULL WHERE id = ?',
        ['aprobado', eventoId]
      );

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
        evento: {
          id: eventoId,
          estado: 'aprobado'
        }
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

      // Obtener evento
      const [eventos] = await pool.query(
        'SELECT * FROM eventos WHERE id = ? AND estado = ? AND usuario_id IS NOT NULL',
        [eventoId, 'pendiente']
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

      // Actualizar estado a rechazado
      await pool.query(
        'UPDATE eventos SET estado = ?, activo = 0, razon_rechazo = ? WHERE id = ?',
        ['rechazado', razonRechazo, eventoId]
      );

      // Enviar email al usuario
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
          SUM(CASE WHEN estado = 'pendiente' THEN 1 ELSE 0 END) as pendientes,
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
