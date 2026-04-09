const pool = require('../db');

class AdminExpositorController {
  async listarPorEvento(req, res) {
    const { eventoId } = req.params;
    try {
      const result = await pool.query('SELECT * FROM expositores WHERE evento_id = $1 ORDER BY nombre', [eventoId]);
      res.json(result.rows);
    } catch (error) {
      res.status(500).json({ error: 'Error al listar expositores' });
    }
  }

  async crear(req, res) {
    const { evento_id, nombre, rubro, descripcion, ubicacion, es_pagado, imagen_logo, sitio_web, video_url } = req.body;
    try {
      const result = await pool.query(
        `INSERT INTO expositores (evento_id, nombre, rubro, descripcion, ubicacion, es_pagado, imagen_logo, sitio_web, video_url)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
        [evento_id, nombre, rubro, descripcion, ubicacion, es_pagado, imagen_logo, sitio_web, video_url]
      );
      res.status(201).json(result.rows[0]);
    } catch (error) {
      res.status(500).json({ error: 'Error al crear expositor' });
    }
  }

  async actualizar(req, res) {
    const { id } = req.params;
    const { nombre, rubro, descripcion, ubicacion, es_pagado, imagen_logo, sitio_web, video_url } = req.body;
    try {
      const result = await pool.query(
        `UPDATE expositores SET nombre=$1, rubro=$2, descripcion=$3, ubicacion=$4, es_pagado=$5, imagen_logo=$6, sitio_web=$7, video_url=$8, updated_at=now()
         WHERE id=$9 RETURNING *`,
        [nombre, rubro, descripcion, ubicacion, es_pagado, imagen_logo, sitio_web, video_url, id]
      );
      if (result.rows.length === 0) return res.status(404).json({ error: 'Expositor no encontrado' });
      res.json(result.rows[0]);
    } catch (error) {
      res.status(500).json({ error: 'Error al actualizar expositor' });
    }
  }

  async eliminar(req, res) {
    const { id } = req.params;
    try {
      const result = await pool.query('DELETE FROM expositores WHERE id=$1 RETURNING id', [id]);
      if (result.rows.length === 0) return res.status(404).json({ error: 'Expositor no encontrado' });
      res.json({ message: 'Expositor eliminado' });
    } catch (error) {
      res.status(500).json({ error: 'Error al eliminar expositor' });
    }
  }
}

module.exports = AdminExpositorController;