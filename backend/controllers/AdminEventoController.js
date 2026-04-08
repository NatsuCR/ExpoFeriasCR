const pool = require('../db');
const Evento = require('../models/Evento');

class AdminEventoController {
  async listar(req, res) {
    try {
      const result = await pool.query('SELECT * FROM eventos ORDER BY fecha_inicio DESC');
      res.json(result.rows);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error al listar eventos' });
    }
  }

  async crear(req, res) {
    const { slug, nombre, descripcion, fecha_inicio, fecha_fin, ubicacion, latitud, longitud, imagen_portada, activo } = req.body;
    try {
      const result = await pool.query(
        `INSERT INTO eventos (slug, nombre, descripcion, fecha_inicio, fecha_fin, ubicacion, latitud, longitud, imagen_portada, activo)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`,
        [slug, nombre, descripcion, fecha_inicio, fecha_fin, ubicacion, latitud, longitud, imagen_portada, activo]
      );
      res.status(201).json(result.rows[0]);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error al crear evento' });
    }
  }

  async actualizar(req, res) {
    const { id } = req.params;
    const { slug, nombre, descripcion, fecha_inicio, fecha_fin, ubicacion, latitud, longitud, imagen_portada, activo } = req.body;
    try {
      const result = await pool.query(
        `UPDATE eventos SET slug=$1, nombre=$2, descripcion=$3, fecha_inicio=$4, fecha_fin=$5, ubicacion=$6, latitud=$7, longitud=$8, imagen_portada=$9, activo=$10, updated_at=now()
         WHERE id=$11 RETURNING *`,
        [slug, nombre, descripcion, fecha_inicio, fecha_fin, ubicacion, latitud, longitud, imagen_portada, activo, id]
      );
      if (result.rows.length === 0) return res.status(404).json({ error: 'Evento no encontrado' });
      res.json(result.rows[0]);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error al actualizar evento' });
    }
  }

  async eliminar(req, res) {
    const { id } = req.params;
    try {
      const result = await pool.query('DELETE FROM eventos WHERE id=$1 RETURNING id', [id]);
      if (result.rows.length === 0) return res.status(404).json({ error: 'Evento no encontrado' });
      res.json({ message: 'Evento eliminado' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error al eliminar evento' });
    }
  }
}

module.exports = AdminEventoController;