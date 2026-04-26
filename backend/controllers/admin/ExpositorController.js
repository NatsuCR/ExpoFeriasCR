const pool = require('../../db');

class AdminExpositorController {
  async listarPorEvento(req, res) {
    const { eventoId } = req.params;
    try {
      const [rows] = await pool.query('SELECT * FROM expositores WHERE evento_id = ? ORDER BY nombre', [eventoId]);
      res.json(rows);
    } catch (error) {
      res.status(500).json({ error: 'Error al listar expositores' });
    }
  }

  async crear(req, res) {
    const { evento_id, nombre, tipo_expositor, rubro, descripcion, ubicacion, es_pagado, imagen_logo, sitio_web, video_url } = req.body;
    try {
      const [result] = await pool.query(
        `INSERT INTO expositores (evento_id, nombre, tipo_expositor, descripcion, ubicacion, es_pagado, imagen_logo, sitio_web, video_url)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [evento_id, nombre, tipo_expositor || rubro || 'Administración', descripcion, ubicacion, es_pagado, imagen_logo || req.body.logo, sitio_web, video_url || req.body.video]
      );
      const [newExpo] = await pool.query('SELECT * FROM expositores WHERE id = ?', [result.insertId]);
      res.status(201).json(newExpo[0]);
    } catch (error) {
      res.status(500).json({ error: 'Error al crear expositor' });
    }
  }

  async actualizar(req, res) {
    const { id } = req.params;
    const { nombre, tipo_expositor, rubro, descripcion, ubicacion, es_pagado, imagen_logo, sitio_web, video_url } = req.body;
    try {
      const [result] = await pool.query(
        `UPDATE expositores SET nombre=?, tipo_expositor=?, descripcion=?, ubicacion=?, es_pagado=?, imagen_logo=?, sitio_web=?, video_url=?, updated_at=NOW()
         WHERE id = ?`,
        [nombre, tipo_expositor || rubro || 'Administración', descripcion, ubicacion, es_pagado, imagen_logo || req.body.logo, sitio_web, video_url || req.body.video, id]
      );
      if (result.affectedRows === 0) return res.status(404).json({ error: 'Expositor no encontrado' });
      const [updated] = await pool.query('SELECT * FROM expositores WHERE id = ?', [id]);
      res.json(updated[0]);
    } catch (error) {
      res.status(500).json({ error: 'Error al actualizar expositor' });
    }
  }

  async eliminar(req, res) {
    const { id } = req.params;
    try {
      const [result] = await pool.query('DELETE FROM expositores WHERE id = ?', [id]);
      if (result.affectedRows === 0) return res.status(404).json({ error: 'Expositor no encontrado' });
      res.json({ message: 'Expositor eliminado' });
    } catch (error) {
      res.status(500).json({ error: 'Error al eliminar expositor' });
    }
  }
}

module.exports = new AdminExpositorController();


