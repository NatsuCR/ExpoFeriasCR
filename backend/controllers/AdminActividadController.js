const pool = require('../db');

class AdminActividadController {
  async listarPorEvento(req, res) {
    const { eventoId } = req.params;
    try {
      const [rows] = await pool.query('SELECT * FROM actividades WHERE evento_id = ? ORDER BY fecha, hora', [eventoId]);
      res.json(rows);
    } catch (error) {
      res.status(500).json({ error: 'Error al listar actividades' });
    }
  }

  async crear(req, res) {
    const { evento_id, titulo, tipo, descripcion, fecha, hora, lugar, precio_extra, requiere_entrada_online, enlace_venta, es_gratis, imagen } = req.body;
    try {
      const [result] = await pool.query(
        `INSERT INTO actividades (evento_id, titulo, tipo, descripcion, fecha, hora, lugar, precio_extra, requiere_entrada_online, enlace_venta, es_gratis, imagen)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [evento_id, titulo, tipo, descripcion, fecha, hora, lugar, precio_extra, requiere_entrada_online, enlace_venta, es_gratis, imagen]
      );
      const [newAct] = await pool.query('SELECT * FROM actividades WHERE id = ?', [result.insertId]);
      res.status(201).json(newAct[0]);
    } catch (error) {
      res.status(500).json({ error: 'Error al crear actividad' });
    }
  }

  async actualizar(req, res) {
    const { id } = req.params;
    const { titulo, tipo, descripcion, fecha, hora, lugar, precio_extra, requiere_entrada_online, enlace_venta, es_gratis, imagen } = req.body;
    try {
      const [result] = await pool.query(
        `UPDATE actividades SET titulo=?, tipo=?, descripcion=?, fecha=?, hora=?, lugar=?, precio_extra=?, requiere_entrada_online=?, enlace_venta=?, es_gratis=?, imagen=?, updated_at=NOW()
         WHERE id = ?`,
        [titulo, tipo, descripcion, fecha, hora, lugar, precio_extra, requiere_entrada_online, enlace_venta, es_gratis, imagen, id]
      );
      if (result.affectedRows === 0) return res.status(404).json({ error: 'Actividad no encontrada' });
      const [updated] = await pool.query('SELECT * FROM actividades WHERE id = ?', [id]);
      res.json(updated[0]);
    } catch (error) {
      res.status(500).json({ error: 'Error al actualizar actividad' });
    }
  }

  async eliminar(req, res) {
    const { id } = req.params;
    try {
      const [result] = await pool.query('DELETE FROM actividades WHERE id = ?', [id]);
      if (result.affectedRows === 0) return res.status(404).json({ error: 'Actividad no encontrada' });
      res.json({ message: 'Actividad eliminada' });
    } catch (error) {
      res.status(500).json({ error: 'Error al eliminar actividad' });
    }
  }
}

module.exports = AdminActividadController;