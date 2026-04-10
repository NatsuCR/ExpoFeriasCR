const pool = require('../db');

class AdminGaleriaController {
  async listarPorEvento(req, res) {
    const { eventoId } = req.params;
    try {
      const [rows] = await pool.query('SELECT * FROM evento_galeria WHERE evento_id = ? ORDER BY orden', [eventoId]);
      res.json(rows);
    } catch (error) {
      res.status(500).json({ error: 'Error al listar galería' });
    }
  }

  async crear(req, res) {
    const { evento_id, imagen_url, orden } = req.body;
    try {
      const [result] = await pool.query(
        `INSERT INTO evento_galeria (evento_id, imagen_url, orden) VALUES (?, ?, ?)`,
        [evento_id, imagen_url, orden || 0]
      );
      const [newImg] = await pool.query('SELECT * FROM evento_galeria WHERE id = ?', [result.insertId]);
      res.status(201).json(newImg[0]);
    } catch (error) {
      res.status(500).json({ error: 'Error al agregar imagen' });
    }
  }

  async actualizar(req, res) {
    const { id } = req.params;
    const { imagen_url, orden } = req.body;
    try {
      const [result] = await pool.query(
        `UPDATE evento_galeria SET imagen_url=?, orden=? WHERE id = ?`,
        [imagen_url, orden, id]
      );
      if (result.affectedRows === 0) return res.status(404).json({ error: 'Imagen no encontrada' });
      const [updated] = await pool.query('SELECT * FROM evento_galeria WHERE id = ?', [id]);
      res.json(updated[0]);
    } catch (error) {
      res.status(500).json({ error: 'Error al actualizar imagen' });
    }
  }

  async eliminar(req, res) {
    const { id } = req.params;
    try {
      const [result] = await pool.query('DELETE FROM evento_galeria WHERE id = ?', [id]);
      if (result.affectedRows === 0) return res.status(404).json({ error: 'Imagen no encontrada' });
      res.json({ message: 'Imagen eliminada' });
    } catch (error) {
      res.status(500).json({ error: 'Error al eliminar imagen' });
    }
  }
}

module.exports = AdminGaleriaController;