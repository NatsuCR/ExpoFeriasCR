const pool = require('../../db');

class AdminPrecioController {
  async listarPorEvento(req, res) {
    const { eventoId } = req.params;
    try {
      const [rows] = await pool.query('SELECT * FROM precios_entrada WHERE evento_id = ? ORDER BY fecha', [eventoId]);
      res.json(rows);
    } catch (error) {
      res.status(500).json({ error: 'Error al listar precios' });
    }
  }

  async crear(req, res) {
    const { evento_id, fecha, precio_normal, promocion, descripcion_promocion } = req.body;
    try {
      const [result] = await pool.query(
        `INSERT INTO precios_entrada (evento_id, fecha, precio_normal, promocion, descripcion_promocion)
         VALUES (?, ?, ?, ?, ?)`,
        [evento_id, fecha, precio_normal, promocion, descripcion_promocion]
      );
      const [newPrecio] = await pool.query('SELECT * FROM precios_entrada WHERE id = ?', [result.insertId]);
      res.status(201).json(newPrecio[0]);
    } catch (error) {
      res.status(500).json({ error: 'Error al crear precio' });
    }
  }

  async actualizar(req, res) {
    const { id } = req.params;
    const { fecha, precio_normal, promocion, descripcion_promocion } = req.body;
    try {
      const [result] = await pool.query(
        `UPDATE precios_entrada SET fecha=?, precio_normal=?, promocion=?, descripcion_promocion=?, updated_at=NOW()
         WHERE id = ?`,
        [fecha, precio_normal, promocion, descripcion_promocion, id]
      );
      if (result.affectedRows === 0) return res.status(404).json({ error: 'Precio no encontrado' });
      const [updated] = await pool.query('SELECT * FROM precios_entrada WHERE id = ?', [id]);
      res.json(updated[0]);
    } catch (error) {
      res.status(500).json({ error: 'Error al actualizar precio' });
    }
  }

  async eliminar(req, res) {
    const { id } = req.params;
    try {
      const [result] = await pool.query('DELETE FROM precios_entrada WHERE id = ?', [id]);
      if (result.affectedRows === 0) return res.status(404).json({ error: 'Precio no encontrado' });
      res.json({ message: 'Precio eliminado' });
    } catch (error) {
      res.status(500).json({ error: 'Error al eliminar precio' });
    }
  }
}

module.exports = new AdminPrecioController();