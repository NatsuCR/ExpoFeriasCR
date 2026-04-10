const pool = require('../db');

class AdminEventoController {
  async listar(req, res) {
    try {
      const [rows] = await pool.query('SELECT * FROM eventos ORDER BY fecha_inicio DESC');
      res.json(rows);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error al listar eventos' });
    }
  }

  async obtenerPorId(req, res) {
    const { id } = req.params;
    try {
      const [rows] = await pool.query('SELECT * FROM eventos WHERE id = ?', [id]);
      if (rows.length === 0) return res.status(404).json({ error: 'Evento no encontrado' });
      res.json(rows[0]);
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
    color_titulo_hero, color_descripcion_hero, color_fondo_fechas, color_texto_fechas,
    color_titulo_seccion,
    provincia   // ← AGREGAR
  } = req.body;

  try {
    const [result] = await pool.query(
      `INSERT INTO eventos (
        slug, nombre, descripcion, fecha_inicio, fecha_fin, ubicacion,
        imagen_portada, activo, horario_imagen, mapa_embed,
        color_primario, color_secundario, color_fondo, color_texto, color_hero_overlay,
        tipo_venta, url_venta_online,
        color_titulo_hero, color_descripcion_hero, color_fondo_fechas, color_texto_fechas,
        color_titulo_seccion,
        provincia
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        slug, nombre, descripcion, fecha_inicio, fecha_fin, ubicacion,
        imagen_portada, activo, horario_imagen, mapa_embed,
        color_primario, color_secundario, color_fondo, color_texto, color_hero_overlay,
        tipo_venta, url_venta_online,
        color_titulo_hero, color_descripcion_hero, color_fondo_fechas, color_texto_fechas,
        color_titulo_seccion,
        provincia
      ]
    );
    const [newEvent] = await pool.query('SELECT * FROM eventos WHERE id = ?', [result.insertId]);
    res.status(201).json(newEvent[0]);
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
    color_titulo_hero, color_descripcion_hero, color_fondo_fechas, color_texto_fechas,
    color_titulo_seccion,
    provincia   // ← NUEVO
  } = req.body;

  try {
    const [result] = await pool.query(
      `UPDATE eventos SET
        slug=?, nombre=?, descripcion=?, fecha_inicio=?, fecha_fin=?, ubicacion=?,
        imagen_portada=?, activo=?, horario_imagen=?, mapa_embed=?,
        color_primario=?, color_secundario=?, color_fondo=?, color_texto=?, color_hero_overlay=?,
        tipo_venta=?, url_venta_online=?,
        color_titulo_hero=?, color_descripcion_hero=?, color_fondo_fechas=?, color_texto_fechas=?,
        color_titulo_seccion=?,
        provincia=?,   -- ← NUEVO
        updated_at = NOW()
      WHERE id = ?`,
      [
        slug, nombre, descripcion, fecha_inicio, fecha_fin, ubicacion,
        imagen_portada, activo, horario_imagen, mapa_embed,
        color_primario, color_secundario, color_fondo, color_texto, color_hero_overlay,
        tipo_venta, url_venta_online,
        color_titulo_hero, color_descripcion_hero, color_fondo_fechas, color_texto_fechas,
        color_titulo_seccion,
        provincia,   // ← NUEVO
        id
      ]
    );
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Evento no encontrado' });
    const [updated] = await pool.query('SELECT * FROM eventos WHERE id = ?', [id]);
    res.json(updated[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al actualizar evento' });
  }
}

  async eliminar(req, res) {
    const { id } = req.params;
    try {
      const [result] = await pool.query('DELETE FROM eventos WHERE id = ?', [id]);
      if (result.affectedRows === 0) return res.status(404).json({ error: 'Evento no encontrado' });
      res.json({ message: 'Evento eliminado' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error al eliminar evento' });
    }
  }
}

module.exports = AdminEventoController;