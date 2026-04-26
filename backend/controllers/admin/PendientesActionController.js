const pool = require('../../db');
const RelatedTablesController = require('../RelatedTablesController');
const emailService = require('../../services/emailService');

class PendientesActionController {
  async aprobarEvento(req, res) {
    const eventoId = req.params.id;
    try {
      const [eventos] = await pool.query(
        `SELECT * FROM eventos WHERE id = ? AND estado IN ('pendiente', 'edicion_pendiente') AND usuario_id IS NOT NULL`,
        [eventoId]
      );
      if (eventos.length === 0) return res.status(404).json({ error: 'Evento no encontrado' });
      const evento = eventos[0];
      const [usuarios] = await pool.query('SELECT * FROM usuarios WHERE id = ?', [evento.usuario_id]);
      if (usuarios.length === 0) return res.status(404).json({ error: 'Usuario no encontrado' });
      const usuario = usuarios[0];

      if (evento.borrador_cambios) {
        const b = typeof evento.borrador_cambios === 'string' ? JSON.parse(evento.borrador_cambios) : evento.borrador_cambios;
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
            color_titulo_h3 = ?, borrador_cambios = NULL,
            color_buscador_expositores = ?, fecha_aprobacion = NOW(), fecha_rechazo = NULL,
            color_borde_buscador_expositores = ?, 
            color_fondo_share = ?, color_texto_share = ?,
            color_descripcion_texto = ?, color_iconos = ?, tiene_expositores = ?,
            tipo_evento = ?, canton = ?, distrito = ?
           WHERE id = ?`,
          [
            b.slug || evento.slug, b.nombre || evento.nombre, b.descripcion ?? evento.descripcion, b.fecha_inicio || evento.fecha_inicio, b.fecha_fin || evento.fecha_fin,
            b.ubicacion || evento.ubicacion, b.imagen_portada ?? evento.imagen_portada, b.horario_imagen ?? evento.horario_imagen, b.mapa_embed ?? evento.mapa_embed, 
            b.mapa_waze_embed ?? evento.mapa_waze_embed, b.tipo_venta ?? evento.tipo_venta, b.url_venta_online ?? evento.url_venta_online,
            b.color_primario ?? evento.color_primario, b.color_secundario ?? evento.color_secundario, b.color_fondo ?? evento.color_fondo, b.color_texto ?? evento.color_texto, 
            b.color_hero_overlay ?? evento.color_hero_overlay, b.color_titulo_hero ?? evento.color_titulo_hero, b.color_descripcion_hero ?? evento.color_descripcion_hero, 
            b.color_fondo_fechas ?? evento.color_fondo_fechas, b.color_texto_fechas ?? evento.color_texto_fechas, b.color_titulo_seccion ?? evento.color_titulo_seccion,
            b.provincia ?? evento.provincia, b.color_menu_fondo ?? evento.color_menu_fondo, b.color_menu_texto ?? evento.color_menu_texto, b.color_menu_fondo_hover ?? evento.color_menu_fondo_hover, 
            b.color_menu_texto_hover ?? evento.color_menu_texto_hover, b.color_fondo_contacto ?? evento.color_fondo_contacto, b.color_texto_contacto ?? evento.color_texto_contacto, 
            b.color_enlace_contacto ?? evento.color_enlace_contacto, b.color_fondo_footer ?? evento.color_fondo_footer, b.color_texto_footer ?? evento.color_texto_footer,
            b.color_titulo_h3 ?? evento.color_titulo_h3, b.color_buscador_expositores ?? evento.color_buscador_expositores, 
            b.color_borde_buscador_expositores ?? evento.color_borde_buscador_expositores, b.color_fondo_share ?? evento.color_fondo_share, b.color_texto_share ?? evento.color_texto_share,
            b.color_descripcion_texto ?? evento.color_descripcion_texto, 
            b.color_iconos ?? evento.color_iconos,
            b.tiene_expositores ?? evento.tiene_expositores,
            b.tipo_evento ?? evento.tipo_evento,
            b.canton ?? evento.canton,
            b.distrito ?? evento.distrito,
            eventoId
          ]
        );
        await RelatedTablesController.actualizarTodo(eventoId, b);
      } else {
        await pool.query('UPDATE eventos SET estado = ?, activo = 1, razon_rechazo = NULL, borrador_cambios = NULL WHERE id = ?', ['aprobado', eventoId]);
      }

      await emailService.notificarAprobacion(usuario.email, usuario.nombre, evento.nombre, eventoId, evento.slug);
      res.json({ message: 'Evento aprobado exitosamente', evento: { id: eventoId, estado: 'aprobado' } });
    } catch (error) {
      console.error('Error al aprobar evento:', error);
      res.status(500).json({ error: 'Error al aprobar evento' });
    }
  }

  async rechazarEvento(req, res) {
    const eventoId = req.params.id;
    const { razonRechazo } = req.body;
    try {
      if (!razonRechazo?.trim()) return res.status(400).json({ error: 'La razón del rechazo es requerida' });
      const [eventos] = await pool.query(`SELECT * FROM eventos WHERE id = ? AND estado IN ('pendiente', 'edicion_pendiente') AND usuario_id IS NOT NULL`, [eventoId]);
      if (eventos.length === 0) return res.status(404).json({ error: 'Evento no encontrado' });
      const evento = eventos[0];
      const [usuarios] = await pool.query('SELECT * FROM usuarios WHERE id = ?', [evento.usuario_id]);
      if (usuarios.length === 0) return res.status(404).json({ error: 'Usuario no encontrado' });
      const usuario = usuarios[0];

      const nuevoEstado = evento.estado === 'edicion_pendiente' ? 'aprobado' : 'rechazado';
      const activo = evento.estado === 'edicion_pendiente' ? 1 : 0;

      await pool.query(`UPDATE eventos SET estado = ?, activo = ?, razon_rechazo = ?, borrador_cambios = NULL WHERE id = ?`, [nuevoEstado, activo, razonRechazo, eventoId]);
      await emailService.notificarRechazo(usuario.email, usuario.nombre, evento.nombre, razonRechazo);
      res.json({ message: 'Evento rechazado exitosamente', evento: { id: eventoId, estado: nuevoEstado } });
    } catch (error) {
      console.error('Error al rechazar evento:', error);
      res.status(500).json({ error: 'Error al rechazar evento' });
    }
  }
}

module.exports = new PendientesActionController();



