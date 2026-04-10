const pool = require('../db');
const bcrypt = require('bcryptjs');

class AdminUsuarioController {
  async listar(req, res) {
    try {
      const [rows] = await pool.query('SELECT id, nombre, email, rol, activo, created_at FROM usuarios ORDER BY id');
      res.json(rows);
    } catch (error) {
      res.status(500).json({ error: 'Error al listar usuarios' });
    }
  }

  async crear(req, res) {
    const { nombre, email, password, rol = 'admin' } = req.body;
    if (!nombre || !email || !password) {
      return res.status(400).json({ error: 'Nombre, email y contraseña son obligatorios' });
    }
    try {
      const [existe] = await pool.query('SELECT id FROM usuarios WHERE email = ?', [email]);
      if (existe.length > 0) {
        return res.status(400).json({ error: 'El email ya está registrado' });
      }
      const password_hash = bcrypt.hashSync(password, 10);
      const [result] = await pool.query(
        `INSERT INTO usuarios (nombre, email, password_hash, rol, activo) VALUES (?, ?, ?, ?, true)`,
        [nombre, email, password_hash, rol]
      );
      const [newUser] = await pool.query('SELECT id, nombre, email, rol, activo FROM usuarios WHERE id = ?', [result.insertId]);
      res.status(201).json(newUser[0]);
    } catch (error) {
      res.status(500).json({ error: 'Error al crear usuario' });
    }
  }

  async eliminar(req, res) {
    const { id } = req.params;
    if (parseInt(id) === req.user.id) {
      return res.status(400).json({ error: 'No puedes eliminar tu propio usuario' });
    }
    try {
      const [result] = await pool.query('DELETE FROM usuarios WHERE id = ?', [id]);
      if (result.affectedRows === 0) return res.status(404).json({ error: 'Usuario no encontrado' });
      res.json({ message: 'Usuario eliminado' });
    } catch (error) {
      res.status(500).json({ error: 'Error al eliminar usuario' });
    }
  }
}

module.exports = AdminUsuarioController;