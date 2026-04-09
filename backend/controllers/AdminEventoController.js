const pool = require('../db');

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

  async obtenerPorId(req, res) {
    const { id } = req.params;
    try {
      const result = await pool.query('SELECT * FROM eventos WHERE id = $1', [id]);
      if (result.rows.length === 0) return res.status(404).json({ error: 'Evento no encontrado' });
      res.json(result.rows[0]);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error al obtener evento' });
    }
  }

  async crear(req, res) {
    const { 
      slug, nombre, descripcion, fecha_inicio, fecha_fin, ubicacion,
      imagen_portada, activo, horario_imagen, mapa_embed,
      color_primario, color_secundario, color_fondo, color_texto, color_hero_overlay,
      tipo_venta, url_venta_online,
      color_titulo_hero, color_descripcion_hero, color_fondo_fechas, color_texto_fechas
    } = req.body;

    try {
      const result = await pool.query(
        `INSERT INTO eventos (
          slug, nombre, descripcion, fecha_inicio, fecha_fin, ubicacion,
          imagen_portada, activo, horario_imagen, mapa_embed,
          color_primario, color_secundario, color_fondo, color_texto, color_hero_overlay,
          tipo_venta, url_venta_online,
          color_titulo_hero, color_descripcion_hero, color_fondo_fechas, color_texto_fechas
        ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21) RETURNING *`,
        [
          slug, nombre, descripcion, fecha_inicio, fecha_fin, ubicacion,
          imagen_portada, activo, horario_imagen, mapa_embed,
          color_primario, color_secundario, color_fondo, color_texto, color_hero_overlay,
          tipo_venta, url_venta_online,
          color_titulo_hero, color_descripcion_hero, color_fondo_fechas, color_texto_fechas
        ]
      );
      res.status(201).json(result.rows[0]);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error al crear evento' });
    }
  }

  async actualizar(req, res) {
    const { id } = req.params;
    const { 
      slug, nombre, descripcion, fecha_inicio, fecha_fin, ubicacion,
      imagen_portada, activo, horario_imagen, mapa_embed,
      color_primario, color_secundario, color_fondo, color_texto, color_hero_overlay,
      tipo_venta, url_venta_online,
      color_titulo_hero, color_descripcion_hero, color_fondo_fechas, color_texto_fechas
    } = req.body;

    try {
      const result = await pool.query(
        `UPDATE eventos SET
          slug=$1, nombre=$2, descripcion=$3, fecha_inicio=$4, fecha_fin=$5, ubicacion=$6,
          imagen_portada=$7, activo=$8, horario_imagen=$9, mapa_embed=$10,
          color_primario=$11, color_secundario=$12, color_fondo=$13, color_texto=$14, color_hero_overlay=$15,
          tipo_venta=$16, url_venta_online=$17,
          color_titulo_hero=$18, color_descripcion_hero=$19, color_fondo_fechas=$20, color_texto_fechas=$21,
          updated_at = now()
        WHERE id = $22 RETURNING *`,
        [
          slug, nombre, descripcion, fecha_inicio, fecha_fin, ubicacion,
          imagen_portada, activo, horario_imagen, mapa_embed,
          color_primario, color_secundario, color_fondo, color_texto, color_hero_overlay,
          tipo_venta, url_venta_online,
          color_titulo_hero, color_descripcion_hero, color_fondo_fechas, color_texto_fechas,
          id
        ]
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