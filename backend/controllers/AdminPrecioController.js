const pool = require('../db');

class AdminPrecioController {
  async listarPorEvento(req, res) {
    const { eventoId } = req.params;
    try {
      const result = await pool.query('SELECT * FROM precios_entrada WHERE evento_id = $1 ORDER BY fecha', [eventoId]);
      res.json(result.rows);
    } catch (error) {
      res.status(500).json({ error: 'Error al listar precios' });
    }
  }

  async crear(req, res) {
    const { evento_id, fecha, precio_normal, promocion, descripcion_promocion } = req.body;
    try {
      const result = await pool.query(
        `INSERT INTO precios_entrada (evento_id, fecha, precio_normal, promocion, descripcion_promocion)
         VALUES ($1, $2, $3, $4, $5) RETURNING *`,
        [evento_id, fecha, precio_normal, promocion, descripcion_promocion]
      );
      res.status(201).json(result.rows[0]);
    } catch (error) {
      res.status(500).json({ error: 'Error al crear precio' });
    }
  }

  async actualizar(req, res) {
    const { id } = req.params;
    const { fecha, precio_normal, promocion, descripcion_promocion } = req.body;
    try {
      const result = await pool.query(
        `UPDATE precios_entrada SET fecha=$1, precio_normal=$2, promocion=$3, descripcion_promocion=$4, updated_at=now()
         WHERE id=$5 RETURNING *`,
        [fecha, precio_normal, promocion, descripcion_promocion, id]
      );
      if (result.rows.length === 0) return res.status(404).json({ error: 'Precio no encontrado' });
      res.json(result.rows[0]);
    } catch (error) {
      res.status(500).json({ error: 'Error al actualizar precio' });
    }
  }

  async eliminar(req, res) {
    const { id } = req.params;
    try {
      const result = await pool.query('DELETE FROM precios_entrada WHERE id=$1 RETURNING id', [id]);
      if (result.rows.length === 0) return res.status(404).json({ error: 'Precio no encontrado' });
      res.json({ message: 'Precio eliminado' });
    } catch (error) {
      res.status(500).json({ error: 'Error al eliminar precio' });
    }
  }
}

module.exports = AdminPrecioController;