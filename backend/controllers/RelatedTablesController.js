const pool = require('../db');

/**
 * Controlador auxiliar para gestionar las tablas relacionadas de un evento
 * (Precios, Actividades, Expositores, Galería)
 * Esto permite mantener los controladores principales por debajo de las 300 líneas.
 */
class RelatedTablesController {
  
  async guardarTodo(eventoId, data) {
    const { precios, actividades, expositores, galeria } = data;

    if (precios) await this.guardarPrecios(eventoId, precios);
    if (actividades) await this.guardarActividades(eventoId, actividades);
    if (expositores) await this.guardarExpositores(eventoId, expositores);
    if (galeria) await this.guardarGaleria(eventoId, galeria);
  }

  async actualizarTodo(eventoId, data) {
    const { precios, actividades, expositores, galeria } = data;

    if (precios) {
      await pool.query('DELETE FROM precios_entrada WHERE evento_id = ?', [eventoId]);
      await this.guardarPrecios(eventoId, precios);
    }
    if (actividades) {
      await pool.query('DELETE FROM actividades WHERE evento_id = ?', [eventoId]);
      await this.guardarActividades(eventoId, actividades);
    }
    if (expositores) {
      await pool.query('DELETE FROM expositores WHERE evento_id = ?', [eventoId]);
      await this.guardarExpositores(eventoId, expositores);
    }
    if (galeria) {
      await pool.query('DELETE FROM evento_galeria WHERE evento_id = ?', [eventoId]);
      await this.guardarGaleria(eventoId, galeria);
    }
  }

  async guardarPrecios(eventoId, precios) {
    if (!Array.isArray(precios)) return;
    for (const p of precios) {
      if (p.fecha && p.precio_normal !== undefined) {
        await pool.query(
          'INSERT INTO precios_entrada (evento_id, fecha, precio_normal, promocion, descripcion_promocion) VALUES (?, ?, ?, ?, ?)',
          [eventoId, p.fecha, p.precio_normal, p.promocion || null, p.descripcion_promocion || null]
        );
      }
    }
  }

  async guardarActividades(eventoId, actividades) {
    if (!Array.isArray(actividades)) return;
    for (const a of actividades) {
      if (a.titulo) {
        await pool.query(
          `INSERT INTO actividades (evento_id, titulo, tipo, fecha, hora, lugar, descripcion, imagen, es_gratis, requiere_entrada_online, enlace_venta) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            eventoId, a.titulo, a.tipo || null, a.fecha || null, a.hora || null, a.lugar || null, a.descripcion || null, 
            Array.isArray(a.imagen) ? JSON.stringify(a.imagen) : a.imagen || null, 
            a.es_gratis || 0, a.requiere_entrada_online || 0, a.enlace_venta || null
          ]
        );
      }
    }
  }

  async guardarExpositores(eventoId, expositores) {
    if (!Array.isArray(expositores)) return;
    for (const e of expositores) {
      if (e.nombre) {
        // ACTUALIZACIÓN REQUERIMIENTO: rubro -> tipo_expositor
        await pool.query(
          'INSERT INTO expositores (evento_id, nombre, tipo_expositor, ubicacion, descripcion, imagen_logo, video_url) VALUES (?, ?, ?, ?, ?, ?, ?)',
          [
            eventoId, e.nombre, e.tipo_expositor || e.rubro || 'Administración', 
            e.ubicacion || null, e.descripcion || null, 
            Array.isArray(e.logo) ? JSON.stringify(e.logo) : e.logo || null, 
            e.video || null
          ]
        );
      }
    }
  }

  async guardarGaleria(eventoId, galeria) {
    if (!Array.isArray(galeria)) return;
    for (const img of galeria) {
      if (img.imagen_url) {
        await pool.query(
          'INSERT INTO evento_galeria (evento_id, imagen_url, orden) VALUES (?, ?, ?)',
          [eventoId, img.imagen_url, img.orden || 0]
        );
      }
    }
  }
}

module.exports = new RelatedTablesController();
