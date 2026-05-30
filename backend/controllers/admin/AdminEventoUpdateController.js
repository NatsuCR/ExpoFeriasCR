const pool = require('../../db');
const relatedTables = require('../RelatedTablesController');

class AdminEventoUpdateController {
  async actualizar(req, res) {
    const { id } = req.params;
    const data = req.body;
    const {
      slug, nombre, descripcion, fecha_inicio, fecha_fin, ubicacion, provincia,
      imagen_portada, activo, horario_imagen, mapa_embed, mapa_waze_embed, tipo_venta, url_venta_online,
      color_primario, color_secundario, color_fondo, color_texto, color_descripcion_texto,
      color_hero_overlay, color_titulo_seccion,
      color_titulo_hero, color_descripcion_hero, color_fondo_fechas, color_texto_fechas,
      color_menu_fondo, color_menu_texto, color_menu_fondo_hover, color_menu_texto_hover,
      color_titulo_h3, color_fondo_contacto, color_texto_contacto, color_enlace_contacto,
      color_fondo_footer, color_texto_footer, color_buscador_expositores, color_borde_buscador_expositores,
      color_fondo_share, color_texto_share, tiene_expositores,
      color_iconos,
      tipo_evento, canton, distrito
    } = data;

    try {
      console.log('[AdminEventoUpdateController] Body Actividades:', JSON.stringify(data.actividades, null, 2));
      const values = [
        slug, nombre, descripcion, fecha_inicio, fecha_fin, ubicacion, provincia,
        imagen_portada || null, activo === undefined ? 1 : (activo ? 1 : 0), horario_imagen || null,
        mapa_embed || null, mapa_waze_embed || null, tipo_venta || 'taquilla', url_venta_online || null,
        color_primario || '#c8102e', color_secundario || '#0033a0', color_fondo || '#fdfdfd', color_texto || '#1a1a1a', color_descripcion_texto || '#1a1a1a',
        color_hero_overlay || 'rgba(0,0,0,0.4)', color_titulo_seccion || '#1a1a1a',
        color_titulo_hero || '#ffffff', color_descripcion_hero || '#ffffff', color_fondo_fechas || '#0033a0', color_texto_fechas || '#c8102e',
        color_menu_fondo || '#ffffff', color_menu_texto || '#ffffff', color_menu_fondo_hover || '#ffffff', color_menu_texto_hover || '#000000',
        color_titulo_h3 || '#1a1a1a', color_fondo_contacto || '#fdfdfd', color_texto_contacto || '#1a1a1a', color_enlace_contacto || '#c8102e',
        color_fondo_footer || '#c8102e', color_texto_footer || '#ffffff',
        color_buscador_expositores || '#ffffff', color_borde_buscador_expositores || '#eeeeee',
        color_fondo_share || '0.5', color_texto_share || '#1a1a1a',
        color_iconos || '#c8102e',
        (tiene_expositores !== undefined && tiene_expositores !== null) ? parseInt(tiene_expositores) : 0,
        tipo_evento || null,
        canton || null,
        distrito || null,
        id
      ];

      const [result] = await pool.query(
        `UPDATE eventos SET
          slug=?, nombre=?, descripcion=?, fecha_inicio=?, fecha_fin=?, ubicacion=?, provincia=?,
          imagen_portada=?, activo=?, horario_imagen=?, mapa_embed=?, mapa_waze_embed=?, tipo_venta=?, url_venta_online=?,
          color_primario=?, color_secundario=?, color_fondo=?, color_texto=?, color_descripcion_texto=?,
          color_hero_overlay=?, color_titulo_seccion=?,
          color_titulo_hero=?, color_descripcion_hero=?, color_fondo_fechas=?, color_texto_fechas=?,
          color_menu_fondo=?, color_menu_texto=?, color_menu_fondo_hover=?, color_menu_texto_hover=?,
          color_titulo_h3=?, color_fondo_contacto=?, color_texto_contacto=?, color_enlace_contacto=?,
          color_fondo_footer=?, color_texto_footer=?,
          color_buscador_expositores=?, color_borde_buscador_expositores=?,
          color_fondo_share=?, color_texto_share=?,
          color_iconos=?,
          tiene_expositores=?, tipo_evento=?, canton=?, distrito=?, updated_at=NOW()
        WHERE id = ?`,
        values
      );
      if (result.affectedRows === 0) return res.status(404).json({ error: 'Evento no encontrado' });

      await relatedTables.actualizarTodo(id, data);
      const [updated] = await pool.query('SELECT * FROM eventos WHERE id = ?', [id]);
      res.json(updated[0]);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error al actualizar evento' });
    }
  }

  async aprobarEdicionEvento(req, res) {
    const { id } = req.params;
    try {
      const [rows] = await pool.query('SELECT * FROM eventos WHERE id=? AND estado=?', [id, 'edicion_pendiente']);
      if (rows.length === 0) return res.status(404).json({ error: 'Evento no encontrado' });

      const b = JSON.parse(rows[0].borrador_cambios);
      await pool.query(
        `UPDATE eventos SET 
          estado = 'aprobado', razon_rechazo = NULL, fecha_envio_revision = NULL,
          slug = ?, nombre = ?, descripcion = ?, fecha_inicio = ?, fecha_fin = ?, ubicacion = ?,
          imagen_portada = ?, activo = 1, horario_imagen = ?, mapa_embed = ?, mapa_waze_embed = ?, 
          tipo_venta = ?, url_venta_online = ?, 
          color_primario = ?, color_secundario = ?, color_fondo = ?, color_texto = ?, 
          color_hero_overlay = ?, color_titulo_hero = ?, color_descripcion_hero = ?, color_fondo_fechas = ?, color_texto_fechas = ?,
          color_titulo_seccion = ?, provincia = ?, 
          color_menu_fondo = ?, color_menu_texto = ?, color_menu_fondo_hover = ?, color_menu_texto_hover = ?,
          color_fondo_contacto = ?, color_texto_contacto = ?, color_enlace_contacto = ?,
          color_fondo_footer = ?, color_texto_footer = ?,
          color_titulo_h3 = ?, color_expositor_header = ?, borrador_cambios = NULL,
          color_buscador_expositores = ?, fecha_aprobacion = NOW(), fecha_rechazo = NULL,
          color_borde_buscador_expositores = ?, 
          color_fondo_share = ?, color_texto_share = ?,
          color_descripcion_texto = ?, color_iconos = ?, tiene_expositores = ?,
          tipo_evento = ?, canton = ?, distrito = ?
        WHERE id = ?`,
        [
          b.slug, b.nombre, b.descripcion ?? rows[0].descripcion, b.fecha_inicio, b.fecha_fin, b.ubicacion,
          b.imagen_portada ?? rows[0].imagen_portada, b.horario_imagen ?? rows[0].horario_imagen, b.mapa_embed ?? rows[0].mapa_embed, b.mapa_waze_embed ?? rows[0].mapa_waze_embed,
          b.tipo_venta ?? rows[0].tipo_venta, b.url_venta_online ?? rows[0].url_venta_online,
          b.color_primario ?? rows[0].color_primario, b.color_secundario ?? rows[0].color_secundario, b.color_fondo ?? rows[0].color_fondo, b.color_texto ?? rows[0].color_texto,
          b.color_hero_overlay ?? rows[0].color_hero_overlay, b.color_titulo_hero ?? rows[0].color_titulo_hero, b.color_descripcion_hero ?? rows[0].color_descripcion_hero, b.color_fondo_fechas ?? rows[0].color_fondo_fechas, b.color_texto_fechas ?? rows[0].color_texto_fechas,
          b.color_titulo_seccion ?? rows[0].color_titulo_seccion, b.provincia ?? rows[0].provincia,
          b.color_menu_fondo ?? rows[0].color_menu_fondo, b.color_menu_texto ?? rows[0].color_menu_texto, b.color_menu_fondo_hover ?? rows[0].color_menu_fondo_hover, b.color_menu_texto_hover ?? rows[0].color_menu_texto_hover,
          b.color_fondo_contacto ?? rows[0].color_fondo_contacto, b.color_texto_contacto ?? rows[0].color_texto_contacto, b.color_enlace_contacto ?? rows[0].color_enlace_contacto,
          b.color_fondo_footer ?? rows[0].color_fondo_footer, b.color_texto_footer ?? rows[0].color_texto_footer,
          b.color_titulo_h3 ?? rows[0].color_titulo_h3, b.color_expositor_header ?? rows[0].color_expositor_header,
          b.color_buscador_expositores ?? rows[0].color_buscador_expositores,
          b.color_borde_buscador_expositores ?? rows[0].color_borde_buscador_expositores,
          b.color_fondo_share ?? rows[0].color_fondo_share, b.color_texto_share ?? rows[0].color_texto_share,
          b.color_descripcion_texto ?? rows[0].color_descripcion_texto,
          b.color_iconos ?? rows[0].color_iconos,
          (b.tiene_expositores !== undefined && b.tiene_expositores !== null) ? parseInt(b.tiene_expositores) : (rows[0].tiene_expositores ?? 0),
          b.tipo_evento ?? rows[0].tipo_evento,
          b.canton ?? rows[0].canton,
          b.distrito ?? rows[0].distrito,
          id
        ]
      );
      await relatedTables.actualizarTodo(id, b);
      res.json({ message: 'Cambios aprobados' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error al aprobar' });
    }
  }

  async rechazarEdicionEvento(req, res) {
    const { id } = req.params;
    const { razon } = req.body;
    try {
      await pool.query('UPDATE eventos SET estado=?, razon_rechazo=?, borrador_cambios=NULL WHERE id=?', ['aprobado', razon, id]);
      res.json({ message: 'Cambios rechazados' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error al rechazar' });
    }
  }
}

module.exports = new AdminEventoUpdateController();



