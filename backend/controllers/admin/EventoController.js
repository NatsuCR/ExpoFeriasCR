const pool = require('../../db');
const EventoService = require('../../services/EventoService');
const relatedTables = require('../RelatedTablesController');

class AdminEventoController {
  async listar(req, res) {
    try {
      const [rows] = await pool.query('SELECT * FROM eventos ORDER BY fecha_inicio DESC');
      res.json(rows);
    } catch (error) {
      console.error('[EventoController.listar]', error.stack);
      res.status(500).json({ error: 'Error al listar eventos', detail: error.message });
    }
  }

  async obtenerPorId(req, res) {
    const { id } = req.params;
    try {
      const [rows] = await pool.query('SELECT * FROM eventos WHERE id = ?', [id]);
      if (rows.length === 0) return res.status(404).json({ error: 'Evento no encontrado' });

      let evento = rows[0];

      // SI el evento tiene un borrador pendiente, mezclar los campos del borrador
      // para que el administrador vea los cambios propuestos en la vista previa
      if (evento.borrador_cambios) {
        try {
          const borradorData = typeof evento.borrador_cambios === 'string'
            ? JSON.parse(evento.borrador_cambios)
            : evento.borrador_cambios;
          
          evento = { ...evento, ...borradorData };
        } catch (e) {
          console.error("Error al parsear borrador_cambios:", e);
        }
      }

      const [actividades] = await pool.query('SELECT * FROM actividades WHERE evento_id = ? ORDER BY fecha, hora', [id]);
      const [precios] = await pool.query('SELECT * FROM precios_entrada WHERE evento_id = ? ORDER BY fecha', [id]);
      const [expositores] = await pool.query('SELECT * FROM expositores WHERE evento_id = ? ORDER BY nombre', [id]);
      const [galeria] = await pool.query('SELECT * FROM evento_galeria WHERE evento_id = ?', [id]);

      res.json({ evento, actividades, precios, expositores, galeria });
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
      color_titulo_seccion, provincia,
      color_menu_fondo, color_menu_texto, color_menu_fondo_hover, color_menu_texto_hover,
      color_fondo_contacto, color_texto_contacto, color_enlace_contacto,
      color_fondo_footer, color_texto_footer,
      color_titulo_h3, color_buscador_expositores, color_borde_buscador_expositores,
      color_card_fondo, color_card_borde, color_rubro_fondo, color_rubro_texto,
      color_buscador_fondo, color_buscador_borde, color_btn_ver_mas,
      color_fondo_share, color_texto_share, es_en_vivo, url_en_vivo,
      precios, actividades, expositores, galeria
    } = req.body;

    const values = [
      slug, nombre, descripcion, fecha_inicio, fecha_fin, ubicacion,
      imagen_portada || null, activo === undefined ? 1 : (activo ? 1 : 0),
      horario_imagen || null, mapa_embed || null,
      color_primario || '#8b5a2b', color_secundario || '#d4a373', color_fondo || '#f4e4c1',
      color_texto || '#2c1a0e', color_hero_overlay || '0.7',
      tipo_venta || 'taquilla', url_venta_online || null,
      color_titulo_hero || '#ffffff', color_descripcion_hero || '#ffffff',
      color_fondo_fechas || '#d4a373', color_texto_fechas || '#8b5a2b',
      color_titulo_seccion || '#2c1a0e', provincia || null,
      color_menu_fondo || '#ffffff', color_menu_texto || '#ffffff',
      color_menu_fondo_hover || null, color_menu_texto_hover || null,
      color_fondo_contacto || '#f4e4c1', color_texto_contacto || '#2c1a0e',
      color_enlace_contacto || '#8b5a2b', color_fondo_footer || '#8b5a2b',
      color_texto_footer || '#ffffff', color_titulo_h3 || '#2c1a0e',
      color_buscador_expositores || '#ffffff', color_borde_buscador_expositores || '#eee',
      color_card_fondo || '#ffffff', color_card_borde || '#f0f0f0',
      color_rubro_fondo || '#f0f0f0', color_rubro_texto || '#000000',
      color_buscador_fondo || '#ffffff', color_buscador_borde || '#eeeeee',
      color_btn_ver_mas || '#C8102E', color_fondo_share || '0.5',
      color_texto_share || '#2c1a0e', es_en_vivo || 0, url_en_vivo || null
    ];

    const query = `
      INSERT INTO eventos (
        slug, nombre, descripcion, fecha_inicio, fecha_fin, ubicacion,
        imagen_portada, activo, horario_imagen, mapa_embed,
        color_primario, color_secundario, color_fondo, color_texto, color_hero_overlay,
        tipo_venta, url_venta_online,
        color_titulo_hero, color_descripcion_hero, color_fondo_fechas, color_texto_fechas,
        color_titulo_seccion, provincia,
        color_menu_fondo, color_menu_texto, color_menu_fondo_hover, color_menu_texto_hover,
        color_fondo_contacto, color_texto_contacto, color_enlace_contacto,
        color_fondo_footer, color_texto_footer,
        color_titulo_h3, color_buscador_expositores, color_borde_buscador_expositores,
        color_card_fondo, color_card_borde, color_rubro_fondo, color_rubro_texto,
        color_buscador_fondo, color_buscador_borde, color_btn_ver_mas,
        color_fondo_share, color_texto_share, es_en_vivo, url_en_vivo
      ) VALUES (${values.map(() => '?').join(', ')})
    `;

    try {
      const [result] = await pool.query(query, values);
      const eventoId = result.insertId;

      await relatedTables.guardarTodo(eventoId, { precios, actividades, expositores, galeria });

      const [newEvent] = await pool.query('SELECT * FROM eventos WHERE id = ?', [eventoId]);
      res.status(201).json(newEvent[0]);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error al crear evento' });
    }
  }

  async actualizar(req, res) {
    const { id } = req.params;
    const data = req.body;
    const {
      slug, nombre, descripcion, fecha_inicio, fecha_fin, ubicacion,
      imagen_portada, activo, horario_imagen, mapa_embed,
      color_primario, color_secundario, color_fondo, color_texto, color_hero_overlay,
      tipo_venta, url_venta_online,
      color_titulo_hero, color_descripcion_hero, color_fondo_fechas, color_texto_fechas,
      color_titulo_seccion, provincia,
      color_menu_fondo, color_menu_texto, color_menu_fondo_hover, color_menu_texto_hover,
      color_fondo_contacto, color_texto_contacto, color_enlace_contacto,
      color_fondo_footer, color_texto_footer,
      color_titulo_h3, color_buscador_expositores, color_borde_buscador_expositores,
      color_card_fondo, color_card_borde, color_rubro_fondo, color_rubro_texto,
      color_buscador_fondo, color_buscador_borde, color_btn_ver_mas,
      color_fondo_share, color_texto_share, es_en_vivo, url_en_vivo
    } = data;

    try {
      const [result] = await pool.query(
        `UPDATE eventos SET
          slug=?, nombre=?, descripcion=?, fecha_inicio=?, fecha_fin=?, ubicacion=?,
          imagen_portada=?, activo=?, horario_imagen=?, mapa_embed=?,
          color_primario=?, color_secundario=?, color_fondo=?, color_texto=?, color_hero_overlay=?,
          tipo_venta=?, url_venta_online=?,
          color_titulo_hero=?, color_descripcion_hero=?, color_fondo_fechas=?, color_texto_fechas=?,
          color_titulo_seccion=?, provincia=?,
          color_menu_fondo=?, color_menu_texto=?, color_menu_fondo_hover=?, color_menu_texto_hover=?,
          color_fondo_contacto=?, color_texto_contacto=?, color_enlace_contacto=?,
          color_fondo_footer=?, color_texto_footer=?,
          color_titulo_h3=?, color_buscador_expositores=?, color_borde_buscador_expositores=?,
          color_card_fondo=?, color_card_borde=?, color_rubro_fondo=?, color_rubro_texto=?,
          color_buscador_fondo=?, color_buscador_borde=?, color_btn_ver_mas=?,
          color_fondo_share=?, color_texto_share=?, es_en_vivo=?, url_en_vivo=?,
          estado='aprobado', borrador_cambios=NULL, updated_at=NOW()
        WHERE id = ?`,
        [
          slug, nombre, descripcion, fecha_inicio, fecha_fin, ubicacion,
          imagen_portada, activo, horario_imagen, mapa_embed,
          color_primario, color_secundario, color_fondo, color_texto, color_hero_overlay,
          tipo_venta, url_venta_online,
          color_titulo_hero, color_descripcion_hero, color_fondo_fechas, color_texto_fechas,
          color_titulo_seccion, provincia,
          color_menu_fondo, color_menu_texto, color_menu_fondo_hover, color_menu_texto_hover,
          color_fondo_contacto, color_texto_contacto, color_enlace_contacto,
          color_fondo_footer, color_texto_footer,
          color_titulo_h3, color_buscador_expositores, color_borde_buscador_expositores,
          color_card_fondo, color_card_borde, color_rubro_fondo, color_rubro_texto,
          color_buscador_fondo, color_buscador_borde, color_btn_ver_mas,
          color_fondo_share, color_texto_share, es_en_vivo, url_en_vivo,
          id
        ]
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

  async eliminar(req, res) {
    const { id } = req.params;
    try {
      const eventoService = new EventoService();
      await eventoService.eliminarRecursosFisicos(id);

      await pool.query('DELETE FROM precios_entrada WHERE evento_id = ?', [id]);
      await pool.query('DELETE FROM actividades WHERE evento_id = ?', [id]);
      await pool.query('DELETE FROM expositores WHERE evento_id = ?', [id]);
      await pool.query('DELETE FROM evento_galeria WHERE evento_id = ?', [id]);

      const [result] = await pool.query('DELETE FROM eventos WHERE id = ?', [id]);
      if (result.affectedRows === 0) return res.status(404).json({ error: 'Evento no encontrado' });
      res.json({ message: 'Evento y sus recursos físicos eliminados exitosamente' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error al eliminar evento' });
    }
  }

  async eventosEdicionPendiente(req, res) {
    try {
      const [eventos] = await pool.query(
        `SELECT e.*, u.nombre as usuario_nombre, u.email as usuario_email, DATE_FORMAT(e.fecha_envio_revision, '%Y-%m-%d %H:%i') as fecha_envio
         FROM eventos e LEFT JOIN usuarios u ON e.usuario_id = u.id
         WHERE e.estado = 'edicion_pendiente' ORDER BY e.fecha_envio_revision ASC`
      );
      res.json(eventos);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error al obtener eventos' });
    }
  }

  async aprobarEdicionEvento(req, res) {
    const { id } = req.params;
    try {
      const [rows] = await pool.query('SELECT * FROM eventos WHERE id=? AND estado=?', [id, 'edicion_pendiente']);
      if (rows.length === 0) return res.status(404).json({ error: 'Evento no encontrado' });
      
      const body = JSON.parse(rows[0].borrador_cambios);
      await pool.query(
        `UPDATE eventos SET
          slug=?, nombre=?, descripcion=?, fecha_inicio=?, fecha_fin=?, ubicacion=?, provincia=?,
          imagen_portada=?, horario_imagen=?, mapa_embed=?, tipo_venta=?, url_venta_online=?,
          color_primario=?, color_secundario=?, color_fondo=?, color_texto=?,
          color_hero_overlay=?, color_titulo_seccion=?,
          color_titulo_hero=?, color_descripcion_hero=?, color_fondo_fechas=?, color_texto_fechas=?,
          color_menu_fondo=?, color_menu_texto=?, color_menu_fondo_hover=?, color_menu_texto_hover=?,
          color_titulo_h3=?, color_buscador_expositores=?, color_borde_buscador_expositores=?,
          color_fondo_contacto=?, color_texto_contacto=?, color_enlace_contacto=?,
          color_fondo_footer=?, color_texto_footer=?,
          color_card_fondo=?, color_card_borde=?, color_rubro_fondo=?, color_rubro_texto=?,
          color_buscador_fondo=?, color_buscador_borde=?, color_btn_ver_mas=?,
          color_fondo_share=?, color_texto_share=?, es_en_vivo=?, url_en_vivo=?,
          estado='aprobado', borrador_cambios=NULL, razon_rechazo=NULL, updated_at=NOW()
        WHERE id=?`,
        [
          body.slug, body.nombre, body.descripcion, body.fecha_inicio, body.fecha_fin, body.ubicacion, body.provincia,
          body.imagen_portada, body.horario_imagen, body.mapa_embed, body.tipo_venta, body.url_venta_online,
          body.color_primario || '#8b5a2b', body.color_secundario || '#d4a373', body.color_fondo || '#f4e4c1', body.color_texto || '#2c1a0e',
          body.color_hero_overlay || 'rgba(62,42,31,0.7)', body.color_titulo_seccion || '#2c1a0e',
          body.color_titulo_hero || '#ffffff', body.color_descripcion_hero || '#ffffff', body.color_fondo_fechas || '#d4a373', body.color_texto_fechas || '#8b5a2b',
          body.color_menu_fondo || '#ffffff', body.color_menu_texto || '#ffffff', body.color_menu_fondo_hover || '', body.color_menu_texto_hover || '',
          body.color_titulo_h3 || '#2c1a0e', body.color_buscador_expositores || '#ffffff', body.color_borde_buscador_expositores || '#eeeeee',
          body.color_fondo_contacto || '#f4e4c1', body.color_texto_contacto || '#2c1a0e', body.color_enlace_contacto || '#8b5a2b',
          body.color_fondo_footer || '#8b5a2b', body.color_texto_footer || '#ffffff',
          body.color_card_fondo || '#ffffff', body.color_card_borde || '#f0f0f0',
          body.color_rubro_fondo || '#f0f0f0', body.color_rubro_texto || '#000000',
          body.color_buscador_fondo || '#ffffff', body.color_buscador_borde || '#eeeeee',
          body.color_btn_ver_mas || '#C8102E', body.color_fondo_share || 'rgba(255, 255, 255, 0.5)',
          body.color_texto_share || '#2c1a0e', body.es_en_vivo || 0, body.url_en_vivo || null,
          id
        ]
      );
      await relatedTables.actualizarTodo(id, body);
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

module.exports = AdminEventoController;