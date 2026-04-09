const pool = require('../db');

class AdminActividadController {
  async listarPorEvento(req, res) {
    const { eventoId } = req.params;
    try {
      const result = await pool.query('SELECT * FROM actividades WHERE evento_id = $1 ORDER BY fecha, hora', [eventoId]);
      res.json(result.rows);
    } catch (error) {
      res.status(500).json({ error: 'Error al listar actividades' });
    }
  }

  async crear(req, res) {
    const { evento_id, titulo, tipo, descripcion, fecha, hora, lugar, precio_extra, requiere_entrada_online, enlace_venta, es_gratis, imagen } = req.body;
    try {
      const result = await pool.query(
        `INSERT INTO actividades (evento_id, titulo, tipo, descripcion, fecha, hora, lugar, precio_extra, requiere_entrada_online, enlace_venta, es_gratis, imagen)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING *`,
        [evento_id, titulo, tipo, descripcion, fecha, hora, lugar, precio_extra, requiere_entrada_online, enlace_venta, es_gratis, imagen]
      );
      res.status(201).json(result.rows[0]);
    } catch (error) {
      res.status(500).json({ error: 'Error al crear actividad' });
    }
  }

  async actualizar(req, res) {
    const { id } = req.params;
    const { titulo, tipo, descripcion, fecha, hora, lugar, precio_extra, requiere_entrada_online, enlace_venta, es_gratis, imagen } = req.body;
    try {
      const result = await pool.query(
        `UPDATE actividades SET titulo=$1, tipo=$2, descripcion=$3, fecha=$4, hora=$5, lugar=$6, precio_extra=$7, requiere_entrada_online=$8, enlace_venta=$9, es_gratis=$10, imagen=$11, updated_at=now()
         WHERE id=$12 RETURNING *`,
        [titulo, tipo, descripcion, fecha, hora, lugar, precio_extra, requiere_entrada_online, enlace_venta, es_gratis, imagen, id]
      );
      if (result.rows.length === 0) return res.status(404).json({ error: 'Actividad no encontrada' });
      res.json(result.rows[0]);
    } catch (error) {
      res.status(500).json({ error: 'Error al actualizar actividad' });
    }
  }

  async eliminar(req, res) {
    const { id } = req.params;
    try {
      const result = await pool.query('DELETE FROM actividades WHERE id=$1 RETURNING id', [id]);
      if (result.rows.length === 0) return res.status(404).json({ error: 'Actividad no encontrada' });
      res.json({ message: 'Actividad eliminada' });
    } catch (error) {
      res.status(500).json({ error: 'Error al eliminar actividad' });
    }
  }
}

module.exports = AdminActividadController;