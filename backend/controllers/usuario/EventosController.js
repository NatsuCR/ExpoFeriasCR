const pool = require('../../db');
const path = require('path');
const RelatedTablesController = require('../RelatedTablesController');

class UsuarioEventsController {
  /**
   * Crear evento (usuario autenticado)
   */
  async crearEvento(req, res) {
    const usuarioId = req.user.id;
    const body = req.body;
    const {
      slug, nombre, fecha_inicio, fecha_fin, ubicacion,
      precios, actividades, expositores, galeria
    } = body;

    try {
      if (!slug || !nombre || !fecha_inicio || !fecha_fin || !ubicacion) {
        return res.status(400).json({ error: 'Faltan campos requeridos' });
      }

      const [existingSlug] = await pool.query('SELECT id FROM eventos WHERE slug = ?', [slug]);
      if (existingSlug.length > 0) return res.status(409).json({ error: 'Slug duplicado' });

      const [result] = await pool.query(
        `INSERT INTO eventos
        (usuario_id, slug, nombre, descripcion, fecha_inicio, fecha_fin, ubicacion, provincia,
         imagen_portada, horario_imagen, mapa_embed, tipo_venta, url_venta_online,
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
         estado, activo)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pendiente', 0)`,
        [
          usuarioId, slug, nombre, body.descripcion, fecha_inicio, fecha_fin, ubicacion, body.provincia,
          body.imagen_portada || null, body.horario_imagen || null, body.mapa_embed || null, body.tipo_venta || 'taquilla', body.url_venta_online || null,
          body.color_primario || '#c8102e', body.color_secundario || '#0033a0', body.color_fondo || '#f4e4c1', body.color_texto || '#2c1a0e', body.color_descripcion_texto || '#2c1a0e',
          body.color_hero_overlay || 'rgba(0,0,0,0.4)', body.color_titulo_seccion || '#c8102e',
          body.color_titulo_hero || '#ffffff', body.color_descripcion_hero || '#ffffff', body.color_fondo_fechas || '#0033a0', body.color_texto_fechas || '#ffffff',
          body.color_menu_fondo || '#ffffff', body.color_menu_texto || '#333333', body.color_menu_fondo_hover || '#c8102e', body.color_menu_texto_hover || '#ffffff',
          body.color_titulo_h3 || '#2c1a0e',
          body.color_fondo_contacto || '#f8f8f8', body.color_texto_contacto || '#333333', body.color_enlace_contacto || '#c8102e',
          body.color_fondo_footer || '#c8102e', body.color_texto_footer || '#ffffff',
          body.color_buscador_expositores || '#ffffff', body.color_borde_buscador_expositores || '#eeeeee',
          body.color_card_fondo || '#ffffff', body.color_card_borde || '#f0f0f0', body.color_rubro_fondo || '#f0f0f0', body.color_rubro_texto || '#000000',
          body.color_buscador_fondo || '#ffffff', body.color_buscador_borde || '#eeeeee', body.color_btn_ver_mas || '#c8102e',
          body.color_fondo_share || '#ffffff', body.color_texto_share || '#2c1a0e'
        ]
      );

      const eventoId = result.insertId;
      await RelatedTablesController.guardarTodo(eventoId, { precios, actividades, expositores, galeria });

      res.status(201).json({ message: 'Enviado a revisión', id: eventoId });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error al crear' });
    }
  }

  async misEventos(req, res) {
    const usuarioId = req.user.id;
    try {
      const [rows] = await pool.query('SELECT * FROM eventos WHERE usuario_id = ? ORDER BY created_at DESC', [usuarioId]);
      res.set('Cache-Control', 'no-store');
      res.json({ eventos: rows });
    } catch (error) { res.status(500).json({ error: 'Error' }); }
  }

  /**
   * REEMPLAZO DE LÓGICA: Toda edición a borrador_cambios
   */
  async actualizarEvento(req, res) {
    const usuarioId = req.user.id;
    const { id } = req.params;
    const body = req.body;

    try {
      const [eventos] = await pool.query('SELECT estado FROM eventos WHERE id = ? AND usuario_id = ?', [id, usuarioId]);
      if (eventos.length === 0) return res.status(404).json({ error: 'No encontrado' });

      const estadoActual = eventos[0].estado;
      let nuevoEstado = 'pendiente';
      
      // Si ya estaba aprobado o en edición, marcamos como edicion_pendiente
      if (['aprobado', 'edicion_pendiente', 'finalizado'].includes(estadoActual)) {
        nuevoEstado = 'edicion_pendiente';
      }

      await pool.query(
        'UPDATE eventos SET borrador_cambios = ?, estado = ?, fecha_envio_revision = NOW() WHERE id = ?',
        [JSON.stringify(body), nuevoEstado, id]
      );

      res.json({ message: 'Cambios guardados para revisión.' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error al actualizar' });
    }
  }

  async obtenerEvento(req, res) {
    const usuarioId = req.user.id;
    const { id } = req.params;
    try {
      const [eventos] = await pool.query('SELECT * FROM eventos WHERE id = ? AND usuario_id = ?', [id, usuarioId]);
      if (eventos.length === 0) return res.status(404).json({ error: 'No encontrado' });

      let evento = eventos[0];
      let borradorData = null;
      if (evento.borrador_cambios) {
        try { borradorData = JSON.parse(evento.borrador_cambios); } catch(e){}
      }

      const [act] = await pool.query('SELECT * FROM actividades WHERE evento_id = ?', [id]);
      const [pre] = await pool.query('SELECT * FROM precios_entrada WHERE evento_id = ?', [id]);
      const [exp] = await pool.query('SELECT * FROM expositores WHERE evento_id = ?', [id]);
      const [gal] = await pool.query('SELECT * FROM evento_galeria WHERE evento_id = ?', [id]);

      if (borradorData) {
        evento = { ...evento, ...borradorData };
        res.json({
          evento,
          actividades: borradorData.actividades || act,
          precios: borradorData.precios || pre,
          expositores: borradorData.expositores || exp,
          galeria: borradorData.galeria || gal,
          tiene_borrador: true
        });
      } else {
        res.json({ evento, actividades: act, precios: pre, expositores: exp, galeria: gal });
      }
    } catch (error) { res.status(500).json({ error: 'Error' }); }
  }

  async obtenerEstadoEvento(req, res) {
    const usuarioId = req.user.id;
    try {
      const [rows] = await pool.query('SELECT estado, activo FROM eventos WHERE id = ? AND usuario_id = ?', [req.params.id, usuarioId]);
      if (rows.length === 0) return res.status(404).json({ error: 'No encontrado' });
      res.json(rows[0]);
    } catch (error) { res.status(500).json({ error: 'Error' }); }
  }

  async eliminarEvento(req, res) {
    console.log('[eliminarEvento] ENTRÓ - usuarioId:', req.user?.id, '| eventoId:', req.params.id);
    const usuarioId = req.user.id;
    const eventoId = req.params.id;

    try {
      const [eventos] = await pool.query(
        'SELECT id, usuario_id FROM eventos WHERE id = ?',
        [eventoId]
      );

      console.log('[eliminarEvento] encontrado:', eventos);

      if (eventos.length === 0) {
        return res.status(404).json({ error: 'Evento no encontrado' });
      }

      if (String(eventos[0].usuario_id) !== String(usuarioId)) {
        console.log('[eliminarEvento] ❌ usuario_id no coincide:', eventos[0].usuario_id, '!==', usuarioId);
        return res.status(403).json({ error: 'No autorizado' });
      }

      await pool.query('DELETE FROM eventos WHERE id = ?', [eventoId]);
      res.json({ message: 'Evento eliminado exitosamente' });

    } catch (error) {
      console.error('[eliminarEvento] Error:', error);
      res.status(500).json({ error: 'Error al eliminar el evento' });
    }
  }

  async editarEventoAprobado(req, res) { return this.actualizarEvento(req, res); }

  async misEventosAprobados(req, res) {
    try {
      const [rows] = await pool.query('SELECT * FROM eventos WHERE usuario_id = ? AND estado = "aprobado"', [req.user.id]);
      res.json({ eventos: rows });
    } catch (error) { res.status(500).json({ error: 'Error' }); }
  }

  async misEventosPendientes(req, res) {
    try {
      const [rows] = await pool.query('SELECT * FROM eventos WHERE usuario_id = ? AND estado IN ("pendiente", "edicion_pendiente")', [req.user.id]);
      res.json({ eventos: rows });
    } catch (error) { res.status(500).json({ error: 'Error' }); }
  }

  async misEventosRechazados(req, res) {
    try {
      const [rows] = await pool.query('SELECT * FROM eventos WHERE usuario_id = ? AND estado = "rechazado"', [req.user.id]);
      res.json({ eventos: rows });
    } catch (error) { res.status(500).json({ error: 'Error' }); }
  }
}

module.exports = UsuarioEventsController;
