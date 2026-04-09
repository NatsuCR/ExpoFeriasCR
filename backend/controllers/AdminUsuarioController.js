const pool = require('../db');
const bcrypt = require('bcryptjs');

class AdminUsuarioController {
  async listar(req, res) {
    try {
      const result = await pool.query('SELECT id, nombre, email, rol, activo, created_at FROM usuarios ORDER BY id');
      res.json(result.rows);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error al listar usuarios' });
    }
  }

  async crear(req, res) {
    const { nombre, email, password, rol = 'admin' } = req.body;
    if (!nombre || !email || !password) {
      return res.status(400).json({ error: 'Nombre, email y contraseña son obligatorios' });
    }
    try {
      // Verificar si el email ya existe
      const existe = await pool.query('SELECT id FROM usuarios WHERE email = $1', [email]);
      if (existe.rows.length > 0) {
        return res.status(400).json({ error: 'El email ya está registrado' });
      }
      const password_hash = bcrypt.hashSync(password, 10);
      const result = await pool.query(
        `INSERT INTO usuarios (nombre, email, password_hash, rol, activo)
         VALUES ($1, $2, $3, $4, true) RETURNING id, nombre, email, rol, activo`,
        [nombre, email, password_hash, rol]
      );
      res.status(201).json(result.rows[0]);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error al crear usuario' });
    }
  }

  async eliminar(req, res) {
    const { id } = req.params;
    // Evitar que el usuario se elimine a sí mismo (opcional)
    if (parseInt(id) === req.user.id) {
      return res.status(400).json({ error: 'No puedes eliminar tu propio usuario' });
    }
    try {
      const result = await pool.query('DELETE FROM usuarios WHERE id = $1 RETURNING id', [id]);
      if (result.rows.length === 0) return res.status(404).json({ error: 'Usuario no encontrado' });
      res.json({ message: 'Usuario eliminado' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error al eliminar usuario' });
    }
  }
}

module.exports = AdminUsuarioController;