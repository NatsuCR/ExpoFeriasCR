const pool = require('../../db');
const PendientesActionController = require('./PendientesActionController');

class AdminEventosPendientesController {
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
        consulta += ` WHERE e.estado IN ('pendiente', 'edicion_pendiente')`;
      }
      consulta += ' ORDER BY e.created_at DESC LIMIT ? OFFSET ?';
      params.push(parseInt(limite), offset);

      const [eventos] = await pool.query(consulta, params);
      let consultaTotal = estado ? 'SELECT COUNT(*) as total FROM eventos WHERE usuario_id IS NOT NULL AND estado = ?' : `SELECT COUNT(*) as total FROM eventos WHERE usuario_id IS NOT NULL AND estado IN ('pendiente', 'edicion_pendiente')`;
      const [countResult] = await pool.query(consultaTotal, estado ? [estado] : []);
      const total = countResult[0].total;

      res.json({
        eventos,
        paginacion: { total, pagina: parseInt(pagina), limite: parseInt(limite), totalPaginas: Math.ceil(total / limite) }
      });
    } catch (error) {
      console.error('Error al listar eventos pendientes:', error);
      res.status(500).json({ error: 'Error al listar eventos' });
    }
  }

  async obtenerPendiente(req, res) {
    const eventoId = req.params.id;
    try {
      const [eventos] = await pool.query('SELECT e.*, u.nombre as usuario_nombre, u.email as usuario_email FROM eventos e JOIN usuarios u ON e.usuario_id = u.id WHERE e.id = ? AND e.usuario_id IS NOT NULL', [eventoId]);
      if (eventos.length === 0) return res.status(404).json({ error: 'Evento no encontrado' });
      let evento = eventos[0];

      const [actividades] = await pool.query('SELECT * FROM actividades WHERE evento_id = ? ORDER BY fecha, hora', [eventoId]);
      const [precios] = await pool.query('SELECT * FROM precios_entrada WHERE evento_id = ? ORDER BY fecha', [eventoId]);
      const [expositores] = await pool.query('SELECT * FROM expositores WHERE evento_id = ? ORDER BY nombre', [eventoId]);
      const [galeria] = await pool.query('SELECT * FROM evento_galeria WHERE evento_id = ? ORDER BY orden', [eventoId]);

      let borradorData = null;
      if (evento.borrador_cambios) {
        try { borradorData = typeof evento.borrador_cambios === 'string' ? JSON.parse(evento.borrador_cambios) : evento.borrador_cambios; } catch (_) { borradorData = null; }
      }

      if (borradorData) {
        const eventoConBorrador = { ...evento };
        Object.keys(borradorData).forEach(key => { if (borradorData[key] !== undefined) eventoConBorrador[key] = borradorData[key]; });
        res.json({
          evento: eventoConBorrador,
          actividades: (borradorData.actividades?.length > 0) ? borradorData.actividades : actividades,
          precios: (borradorData.precios?.length > 0) ? borradorData.precios : precios,
          expositores: (borradorData.expositores?.length > 0) ? borradorData.expositores : expositores,
          galeria: (borradorData.galeria?.length > 0) ? borradorData.galeria : galeria,
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

  // Delegaciones
  async aprobarEvento(req, res) { return PendientesActionController.aprobarEvento(req, res); }
  async rechazarEvento(req, res) { return PendientesActionController.rechazarEvento(req, res); }

  async obtenerEstadisticas(req, res) {
    try {
      const [stats] = await pool.query(`SELECT COUNT(*) as total, SUM(CASE WHEN estado IN ('pendiente', 'edicion_pendiente') THEN 1 ELSE 0 END) as pendientes, SUM(CASE WHEN estado = 'aprobado' THEN 1 ELSE 0 END) as aprobados, SUM(CASE WHEN estado = 'rechazado' THEN 1 ELSE 0 END) as rechazados FROM eventos WHERE usuario_id IS NOT NULL`);
      res.json({ stats: stats[0] });
    } catch (error) {
      console.error('Error al obtener estadísticas:', error);
      res.status(500).json({ error: 'Error al obtener estadísticas' });
    }
  }
}

module.exports = new AdminEventosPendientesController();



