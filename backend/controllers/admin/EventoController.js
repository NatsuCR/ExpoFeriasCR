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
      let borradorData = null;
      if (evento.borrador_cambios) {
        try {
          borradorData = typeof evento.borrador_cambios === 'string'
            ? JSON.parse(evento.borrador_cambios)
            : evento.borrador_cambios;

          if (borradorData) {
            // Mezcla cuidadosa para no perder campos snake_case
            Object.keys(borradorData).forEach(key => {
              if (borradorData[key] !== undefined) {
                evento[key] = borradorData[key];
              }
            });
          }
        } catch (e) {
          console.error("Error al parsear borrador_cambios:", e);
        }
      }

      const [actividades] = await pool.query('SELECT * FROM actividades WHERE evento_id = ? ORDER BY fecha, hora', [id]);
      const [precios] = await pool.query('SELECT * FROM precios_entrada WHERE evento_id = ? ORDER BY fecha', [id]);
      const [expositores] = await pool.query('SELECT * FROM expositores WHERE evento_id = ? ORDER BY nombre', [id]);
      const [galeria] = await pool.query('SELECT * FROM evento_galeria WHERE evento_id = ?', [id]);

      // Si hay borrador, devolver las tablas del borrador si existen
      res.json({
        evento,
        actividades: (borradorData?.actividades?.length > 0) ? borradorData.actividades : actividades,
        precios: (borradorData?.precios?.length > 0) ? borradorData.precios : precios,
        expositores: (borradorData?.expositores?.length > 0) ? borradorData.expositores : expositores,
        galeria: (borradorData?.galeria?.length > 0) ? borradorData.galeria : galeria
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error al obtener evento' });
    }
  }

  async crear(req, res) {
    const {
      imagen_portada, activo, horario_imagen, mapa_embed, mapa_waze_embed,
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
      color_fondo_share, color_texto_share, color_descripcion_texto, es_en_vivo, url_en_vivo,
      tiene_expositores,
      precios, actividades, expositores, galeria
    } = req.body;

    const values = [
      slug, nombre, descripcion, fecha_inicio, fecha_fin, ubicacion,
      imagen_portada || null, activo === undefined ? 1 : (activo ? 1 : 0),
      horario_imagen || null, mapa_embed || null, mapa_waze_embed || null,
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
      color_texto_share || '#2c1a0e', color_descripcion_texto || '#2c1a0e',
      tiene_expositores !== undefined ? tiene_expositores : 1,
      'aprobado'
    ];

    const query = `
      INSERT INTO eventos (
        slug, nombre, descripcion, fecha_inicio, fecha_fin, ubicacion,
        imagen_portada, activo, horario_imagen, mapa_embed, mapa_waze_embed,
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
        color_fondo_share, color_texto_share, color_descripcion_texto, 
        tiene_expositores,
        estado
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
      slug, nombre, descripcion, fecha_inicio, fecha_fin, ubicacion, provincia,
      imagen_portada, activo, horario_imagen, mapa_embed, mapa_waze_embed, tipo_venta, url_venta_online,
      color_primario, color_secundario, color_fondo, color_texto, color_descripcion_texto,
      color_hero_overlay, color_titulo_seccion,
      color_titulo_hero, color_descripcion_hero, color_fondo_fechas, color_texto_fechas,
      color_menu_fondo, color_menu_texto, color_menu_fondo_hover, color_menu_texto_hover,
      color_titulo_h3,
      color_fondo_contacto, color_texto_contacto, color_enlace_contacto,
      color_fondo_footer, color_texto_footer,
      color_buscador_expositores, color_borde_buscador_expositores,
      color_card_fondo, color_card_borde, color_rubro_fondo, color_rubro_texto,
      color_buscador_fondo, color_buscador_borde, color_btn_ver_mas,
      color_fondo_share, color_texto_share,
      es_en_vivo, url_en_vivo, tiene_expositores
    } = data;

    try {
      const values = [
        slug, nombre, descripcion, fecha_inicio, fecha_fin, ubicacion, provincia,
        imagen_portada || null, activo === undefined ? 1 : (activo ? 1 : 0), horario_imagen || null, 
        mapa_embed || null, mapa_waze_embed || null, tipo_venta || 'taquilla', url_venta_online || null,
        color_primario || '#c8102e', color_secundario || '#0033a0', color_fondo || '#f4e4c1', color_texto || '#2c1a0e', color_descripcion_texto || '#2c1a0e',
        color_hero_overlay || 'rgba(0,0,0,0.4)', color_titulo_seccion || '#2c1a0e',
        color_titulo_hero || '#ffffff', color_descripcion_hero || '#ffffff', color_fondo_fechas || '#d4a373', color_texto_fechas || '#8b5a2b',
        color_menu_fondo || '#ffffff', color_menu_texto || '#ffffff', color_menu_fondo_hover || '#ffffff', color_menu_texto_hover || '#000000',
        color_titulo_h3 || '#2c1a0e',
        color_fondo_contacto || '#f4e4c1', color_texto_contacto || '#2c1a0e', color_enlace_contacto || '#8b5a2b',
        color_fondo_footer || '#8b5a2b', color_texto_footer || '#ffffff',
        color_buscador_expositores || '#ffffff', color_borde_buscador_expositores || '#eeeeee',
        color_card_fondo || '#ffffff', color_card_borde || '#f0f0f0', color_rubro_fondo || '#f0f0f0', color_rubro_texto || '#000000',
        color_buscador_fondo || '#ffffff', color_buscador_borde || '#eeeeee', color_btn_ver_mas || '#C8102E',
        es_en_vivo || 0, url_en_vivo || null,
        (tiene_expositores !== undefined && tiene_expositores !== null) ? parseInt(tiene_expositores) : 0,
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
          color_titulo_h3=?,
          color_fondo_contacto=?, color_texto_contacto=?, color_enlace_contacto=?,
          color_fondo_footer=?, color_texto_footer=?,
          color_buscador_expositores=?, color_borde_buscador_expositores=?,
          color_card_fondo=?, color_card_borde=?, color_rubro_fondo=?, color_rubro_texto=?,
          color_buscador_fondo=?, color_buscador_borde=?, color_btn_ver_mas=?,
          color_fondo_share=?, color_texto_share=?,
          es_en_vivo=?, url_en_vivo=?, tiene_expositores=?, updated_at=NOW()
        WHERE id = ?`,
        values
      );
      if (result.affectedRows === 0) return res.status(404).json({ error: 'Evento no encontrado' });

      // 🔥 ACTUALIZAR TABLAS RELACIONADAS (Actividades, Expositores, Galería, etc.)
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
      const b = body; // Alias para brevedad
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
          color_borde_buscador_expositores = ?, color_card_fondo = ?, color_card_borde = ?, 
          color_rubro_fondo = ?, color_rubro_texto = ?,
          color_buscador_fondo = ?, color_buscador_borde = ?, color_btn_ver_mas = ?,
          color_fondo_share = ?, color_texto_share = ?,
          es_en_vivo = ?, url_en_vivo = ?, color_descripcion_texto = ?, tiene_expositores = ?
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
          b.color_card_fondo ?? rows[0].color_card_fondo, b.color_card_borde ?? rows[0].color_card_borde,
          b.color_rubro_fondo ?? rows[0].color_rubro_fondo, b.color_rubro_texto ?? rows[0].color_rubro_texto,
          b.color_buscador_fondo ?? rows[0].color_buscador_fondo, b.color_buscador_borde ?? rows[0].color_buscador_borde,
          b.color_btn_ver_mas ?? rows[0].color_btn_ver_mas,
          b.color_fondo_share ?? rows[0].color_fondo_share, b.color_texto_share ?? rows[0].color_texto_share,
          b.es_en_vivo ?? rows[0].es_en_vivo ?? 0, b.url_en_vivo ?? rows[0].url_en_vivo ?? null,
          b.color_descripcion_texto ?? rows[0].color_descripcion_texto,
          (b.tiene_expositores !== undefined && b.tiene_expositores !== null) ? parseInt(b.tiene_expositores) : (rows[0].tiene_expositores ?? 0),
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

module.exports = new AdminEventoController();