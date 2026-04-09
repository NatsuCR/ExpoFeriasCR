const pool = require('../db');

class AdminGaleriaController {
  async listarPorEvento(req, res) {
    const { eventoId } = req.params;
    try {
      const result = await pool.query('SELECT * FROM evento_galeria WHERE evento_id = $1 ORDER BY orden', [eventoId]);
      res.json(result.rows);
    } catch (error) {
      res.status(500).json({ error: 'Error al listar galería' });
    }
  }

  async crear(req, res) {
    const { evento_id, imagen_url, orden } = req.body;
    try {
      const result = await pool.query(
        `INSERT INTO evento_galeria (evento_id, imagen_url, orden) VALUES ($1, $2, $3) RETURNING *`,
        [evento_id, imagen_url, orden || 0]
      );
      res.status(201).json(result.rows[0]);
    } catch (error) {
      res.status(500).json({ error: 'Error al agregar imagen' });
    }
  }

  async actualizar(req, res) {
    const { id } = req.params;
    const { imagen_url, orden } = req.body;
    try {
      const result = await pool.query(
        `UPDATE evento_galeria SET imagen_url=$1, orden=$2 WHERE id=$3 RETURNING *`,
        [imagen_url, orden, id]
      );
      if (result.rows.length === 0) return res.status(404).json({ error: 'Imagen no encontrada' });
      res.json(result.rows[0]);
    } catch (error) {
      res.status(500).json({ error: 'Error al actualizar imagen' });
    }
  }

  async eliminar(req, res) {
    const { id } = req.params;
    try {
      const result = await pool.query('DELETE FROM evento_galeria WHERE id=$1 RETURNING id', [id]);
      if (result.rows.length === 0) return res.status(404).json({ error: 'Imagen no encontrada' });
      res.json({ message: 'Imagen eliminada' });
    } catch (error) {
      res.status(500).json({ error: 'Error al eliminar imagen' });
    }
  }
}

module.exports = AdminGaleriaController;