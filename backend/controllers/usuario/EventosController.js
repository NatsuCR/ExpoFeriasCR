const pool = require('../../db');
const EventoService = require('../../services/EventoService');
const relatedTables = require('../RelatedTablesController');

class UsuarioEventsController {
  async crearEvento(req, res) {
    const usuarioId = req.user.id;
    const body = req.body;
    const {
      slug, nombre, descripcion, fecha_inicio, fecha_fin, ubicacion, provincia,
      imagen_portada, horario_imagen, mapa_embed, tipo_venta, url_venta_online,
      color_primario, color_secundario, color_fondo, color_texto,
      color_hero_overlay, color_titulo_seccion, color_buscador_expositores,
      color_titulo_hero, color_descripcion_hero, color_fondo_fechas, color_texto_fechas,
      color_menu_fondo, color_menu_texto, color_menu_fondo_hover, color_menu_texto_hover,
      color_titulo_h3, color_fondo_contacto, color_texto_contacto, color_enlace_contacto,
      color_fondo_footer, color_texto_footer,
      precios, actividades, expositores, galeria
    } = body;

    try {
      if (!slug || !nombre || !fecha_inicio || !fecha_fin || !ubicacion) {
        return res.status(400).json({ error: 'Faltan campos requeridos' });
      }

      const [existingSlug] = await pool.query('SELECT id FROM eventos WHERE slug = ?', [slug]);
      if (existingSlug.length > 0) return res.status(409).json({ error: 'Este slug ya existe' });

      const [result] = await pool.query(
        `INSERT INTO eventos (
          usuario_id, slug, nombre, descripcion, fecha_inicio, fecha_fin, ubicacion, provincia,
          imagen_portada, horario_imagen, mapa_embed, tipo_venta, url_venta_online,
          color_primario, color_secundario, color_fondo, color_texto,
          color_hero_overlay, color_titulo_seccion, color_buscador_expositores,
          color_titulo_hero, color_descripcion_hero, color_fondo_fechas, color_texto_fechas,
          color_menu_fondo, color_menu_texto, color_menu_fondo_hover, color_menu_texto_hover,
          color_titulo_h3, color_fondo_contacto, color_texto_contacto, color_enlace_contacto,
          color_fondo_footer, color_texto_footer, estado, activo
        ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,'pendiente',0)`,
        [
          usuarioId, slug, nombre, descripcion, fecha_inicio, fecha_fin, ubicacion, provincia,
          imagen_portada, horario_imagen, mapa_embed, tipo_venta, url_venta_online,
          color_primario || '#8b5a2b', color_secundario || '#d4a373', color_fondo || '#f4e4c1', color_texto || '#2c1a0e',
          color_hero_overlay || 'rgba(62,42,31,0.7)', color_titulo_seccion || '#2c1a0e', color_buscador_expositores || '#ffffff',
          color_titulo_hero || '#ffffff', color_descripcion_hero || '#ffffff', color_fondo_fechas || '#d4a373', color_texto_fechas || '#8b5a2b',
          color_menu_fondo || '#ffffff', color_menu_texto || '#ffffff', color_menu_fondo_hover || '', color_menu_texto_hover || '',
          color_titulo_h3 || '#2c1a0e', color_fondo_contacto || '#f4e4c1', color_texto_contacto || '#2c1a0e', color_enlace_contacto || '#8b5a2b',
          color_fondo_footer || '#8b5a2b', color_texto_footer || '#ffffff'
        ]
      );

      await relatedTables.guardarTodo(result.insertId, { precios, actividades, expositores, galeria });
      res.status(201).json({ id: result.insertId, message: 'Evento enviado a revisión' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error al crear evento' });
    }
  }

  async misEventos(req, res) {
    const usuarioId = req.user.id;
    try {
      const [rows] = await pool.query(`SELECT * FROM eventos WHERE usuario_id = ? ORDER BY created_at DESC`, [usuarioId]);
      res.json({ eventos: rows });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error al obtener eventos' });
    }
  }

  async enviarARevision(req, res) {
    const { id } = req.params;
    const usuarioId = req.user.id;
    const isAdmin = req.user.rol === 'admin';
    const body = req.body;
    try {
      let sql = 'SELECT * FROM eventos WHERE id = ?';
      let params = [id];
      if (!isAdmin) {
        sql += ' AND usuario_id = ?';
        params.push(usuarioId);
      }

      const [evento] = await pool.query(sql, params);
      if (evento.length === 0) return res.status(404).json({ error: 'No tienes permiso o el evento no existe' });

      const ev = evento[0];
      
      if (isAdmin) {
          // Si es admin, aplicar los cambios directamente a las tablas reales y dejarlo como aprobado
          const { precios, actividades, expositores, galeria, ...datosEvento } = body;
          
          // Limpiar datos que no deben ir en el UPDATE directo
          delete datosEvento.id;
          delete datosEvento.usuario_id;
          delete datosEvento.created_at;
          delete datosEvento.updated_at;

          // Asegurar estado aprobado y limpiar borrador
          datosEvento.estado = 'aprobado';
          datosEvento.borrador_cambios = null;
          datosEvento.fecha_aprobacion = new Date();

          await pool.query('UPDATE eventos SET ? WHERE id = ?', [datosEvento, id]);
          await relatedTables.guardarTodo(id, { precios, actividades, expositores, galeria });
          
          return res.json({ message: 'Cambios aplicados y aprobados por el administrador' });
      }

      // Lógica para usuarios normales (enviar a revisión)
      if (ev.estado === 'aprobado' || ev.estado === 'edicion_pendiente') {
        await pool.query('UPDATE eventos SET estado = ?, borrador_cambios = ?, fecha_envio_revision = NOW() WHERE id = ?', ['edicion_pendiente', JSON.stringify(body), id]);
      } else {
        await pool.query('UPDATE eventos SET estado = ?, fecha_envio_revision = NOW() WHERE id = ?', ['pendiente', id]);
      }
      res.json({ message: 'Enviado a revisión' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error al enviar a revisión' });
    }
  }

  async eliminarEvento(req, res) {
    const { id } = req.params;
    const usuarioId = req.user.id;
    const isAdmin = req.user.rol === 'admin';
    try {
      let sql = 'SELECT * FROM eventos WHERE id = ?';
      let params = [id];
      if (!isAdmin) {
        sql += ' AND usuario_id = ?';
        params.push(usuarioId);
      }

      const [evento] = await pool.query(sql, params);
      if (evento.length === 0) return res.status(403).json({ error: 'No autorizado' });

      const eventoService = new EventoService();
      await eventoService.eliminarRecursosFisicos(id);

      await pool.query('DELETE FROM precios_entrada WHERE evento_id = ?', [id]);
      await pool.query('DELETE FROM actividades WHERE evento_id = ?', [id]);
      await pool.query('DELETE FROM expositores WHERE evento_id = ?', [id]);
      await pool.query('DELETE FROM evento_galeria WHERE evento_id = ?', [id]);
      await pool.query('DELETE FROM eventos WHERE id = ?', [id]);

      res.json({ message: 'Evento eliminado' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error al eliminar' });
    }
  }

  async misEventosAprobados(req, res) {
    const usuarioId = req.user.id;
    try {
      const [rows] = await pool.query('SELECT * FROM eventos WHERE usuario_id = ? AND estado = "aprobado" ORDER BY created_at DESC', [usuarioId]);
      res.json({ eventos: rows });
    } catch (error) { res.status(500).json({ error: 'Error' }); }
  }

  async misEventosPendientes(req, res) {
    const usuarioId = req.user.id;
    try {
      const [rows] = await pool.query('SELECT * FROM eventos WHERE usuario_id = ? AND estado = "pendiente" ORDER BY created_at DESC', [usuarioId]);
      res.json({ eventos: rows });
    } catch (error) { res.status(500).json({ error: 'Error' }); }
  }

  async misEventosRechazados(req, res) {
    const usuarioId = req.user.id;
    try {
      const [rows] = await pool.query('SELECT * FROM eventos WHERE usuario_id = ? AND estado = "rechazado" ORDER BY created_at DESC', [usuarioId]);
      res.json({ eventos: rows });
    } catch (error) { res.status(500).json({ error: 'Error' }); }
  }

  async obtenerEvento(req, res) {
    const { id } = req.params;
    const usuarioId = req.user.id;
    const isAdmin = req.user.rol === 'admin';
    try {
      let sql = 'SELECT * FROM eventos WHERE id = ?';
      let params = [id];
      if (!isAdmin) {
        sql += ' AND usuario_id = ?';
        params.push(usuarioId);
      }

      const [evento] = await pool.query(sql, params);
      if (evento.length === 0) return res.status(404).json({ error: 'No encontrado' });

      const [precios] = await pool.query('SELECT * FROM precios_entrada WHERE evento_id = ?', [id]);
      const [actividades] = await pool.query('SELECT * FROM actividades WHERE evento_id = ?', [id]);
      const [expositores] = await pool.query('SELECT * FROM expositores WHERE evento_id = ?', [id]);
      const [galeria] = await pool.query('SELECT * FROM evento_galeria WHERE evento_id = ?', [id]);

      res.json({ ...evento[0], precios, actividades, expositores, galeria });
    } catch (error) { res.status(500).json({ error: 'Error' }); }
  }

  async actualizarEvento(req, res) {
    const { id } = req.params;
    const usuarioId = req.user.id;
    const isAdmin = req.user.rol === 'admin';
    try {
      let sql = 'SELECT * FROM eventos WHERE id = ?';
      let params = [id];
      if (!isAdmin) {
        sql += ' AND usuario_id = ?';
        params.push(usuarioId);
      }

      const [evento] = await pool.query(sql, params);
      if (evento.length === 0) return res.status(404).json({ error: 'No encontrado' });

      const { precios, actividades, expositores, galeria, ...datosEvento } = req.body;
      
      if (isAdmin) {
          datosEvento.estado = 'aprobado';
          datosEvento.borrador_cambios = null;
          datosEvento.fecha_aprobacion = new Date();
      }

      await pool.query('UPDATE eventos SET ? WHERE id = ?', [datosEvento, id]);
      await relatedTables.guardarTodo(id, { precios, actividades, expositores, galeria });
      res.json({ message: isAdmin ? 'Evento actualizado y aprobado directamente' : 'Actualizado correctamente' });
    } catch (error) { res.status(500).json({ error: 'Error' }); }
  }

  async editarEventoAprobado(req, res) {
    return this.enviarARevision(req, res);
  }

  async obtenerEstadoEvento(req, res) {
    const { id } = req.params;
    const usuarioId = req.user.id;
    const isAdmin = req.user.rol === 'admin';
    try {
      let sql = 'SELECT estado, activo FROM eventos WHERE id = ?';
      let params = [id];
      if (!isAdmin) {
        sql += ' AND usuario_id = ?';
        params.push(usuarioId);
      }

      const [evento] = await pool.query(sql, params);
      if (evento.length === 0) return res.status(404).json({ error: 'No encontrado' });
      res.json(evento[0]);
    } catch (error) { res.status(500).json({ error: 'Error' }); }
  }
}

module.exports = UsuarioEventsController;
