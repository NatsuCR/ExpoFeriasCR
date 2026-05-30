const pool = require('../db');

/**
 * Controlador auxiliar para gestionar las tablas relacionadas de un evento
 * (Precios, Actividades, Expositores, Galería)
 * 
 * SOLUCIÓN APLICADA:
 * - Se evita el error de duplicados (ER_DUP_ENTRY)
 * - Siempre se eliminan los registros anteriores antes de insertar nuevos
 */
class RelatedTablesController {

  async guardarTodo(eventoId, data) {
    return this.reemplazarTodo(eventoId, data);
  }

  async actualizarTodo(eventoId, data) {
    return this.reemplazarTodo(eventoId, data);
  }

  /**
   * 🔥 MÉTODO CLAVE
   * Elimina TODO lo anterior y vuelve a insertar
   */
  async reemplazarTodo(eventoId, data) {
    const { precios, actividades, expositores, galeria } = data;

    // 🔴 BORRAR TODO LO ANTERIOR
    await pool.query('DELETE FROM precios_entrada WHERE evento_id = ?', [eventoId]);
    await pool.query('DELETE FROM actividades WHERE evento_id = ?', [eventoId]);
    await pool.query('DELETE FROM expositores WHERE evento_id = ?', [eventoId]);
    await pool.query('DELETE FROM evento_galeria WHERE evento_id = ?', [eventoId]);

    // 🟢 INSERTAR NUEVO
    if (precios) await this.guardarPrecios(eventoId, precios);
    if (actividades) await this.guardarActividades(eventoId, actividades);
    if (expositores) await this.guardarExpositores(eventoId, expositores);
    if (galeria) await this.guardarGaleria(eventoId, galeria);
  }

  async guardarPrecios(eventoId, precios) {
    if (!Array.isArray(precios)) return;

    for (const p of precios) {
      // 🛡️ Solo insertamos si hay fecha y precio
      if (p.fecha && p.precio_normal !== undefined) {
        await pool.query(
          'INSERT INTO precios_entrada (evento_id, fecha, precio_normal, promocion, descripcion_promocion) VALUES (?, ?, ?, ?, ?)',
          [
            eventoId,
            p.fecha,
            p.precio_normal,
            p.promocion || null,
            p.descripcion_promocion || null
          ]
        );
      }
    }
  }

  async guardarActividades(eventoId, actividades) {
    if (!Array.isArray(actividades)) return;

    for (const a of actividades) {
      // 🛡️ CRÍTICO: Solo insertamos si hay título Y FECHA (la fecha es NOT NULL en DB)
      if (a.titulo && a.fecha) {
        await pool.query(
          `INSERT INTO actividades (
            evento_id, titulo, tipo, fecha, hora, lugar,
            descripcion, imagen, video_url, es_gratis,
            requiere_entrada_online, enlace_venta, solo_online, en_vivo
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            eventoId,
            a.titulo,
            a.tipo || null,
            a.fecha,
            a.hora || null,
            a.lugar || null,
            a.descripcion || null,
            Array.isArray(a.imagen)
              ? JSON.stringify(a.imagen)
              : a.imagen || null,
            a.video_url || a.video || null,
            a.es_gratis || 0,
            a.requiere_entrada_online || 0,
            a.enlace_venta || null,
            a.solo_online || 0,
            a.en_vivo || 0
          ]
        );
      }
    }
  }

  async guardarExpositores(eventoId, expositores) {
    if (!Array.isArray(expositores)) return;

    for (const e of expositores) {
      if (e.nombre) {
        await pool.query(
          'INSERT INTO expositores (evento_id, nombre, tipo_expositor, ubicacion, descripcion, imagen_logo, video_url) VALUES (?, ?, ?, ?, ?, ?, ?)',
          [
            eventoId,
            e.nombre,
            e.tipo_expositor || e.rubro || 'Administración',
            e.ubicacion || null,
            e.descripcion || null,
            Array.isArray(e.imagen_logo)
              ? JSON.stringify(e.imagen_logo)
              : (Array.isArray(e.logo) ? JSON.stringify(e.logo) : (e.imagen_logo || e.logo || null)),
            e.video_url || e.video || null
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
          'INSERT INTO evento_galeria (evento_id, imagen_url) VALUES (?, ?)',
          [
            eventoId,
            img.imagen_url
          ]
        );
      }
    }
  }
}

module.exports = new RelatedTablesController();


