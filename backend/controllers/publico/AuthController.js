const pool = require('../../db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

class AuthController {

  async login(req, res) {
    const { email, password } = req.body;

    try {
      if (!email || !password) {
        return res.status(400).json({ error: 'Campos requeridos' });
      }

      const [users] = await pool.query(
        'SELECT * FROM usuarios WHERE email = ?',
        [email]
      );

      if (users.length === 0) {
        return res.status(401).json({ error: 'Credenciales incorrectas' });
      }

      const user = users[0];

      const passwordMatch = await bcrypt.compare(password, user.password_hash);

      if (!passwordMatch) {
        return res.status(401).json({ error: 'Credenciales incorrectas' });
      }

      const token = jwt.sign(
        {
          id: user.id,
          email: user.email,
          rol: user.rol
        },
        process.env.JWT_SECRET,
        { expiresIn: '3h' }
      );

      res.json({
        token,
        user: {
          id: user.id,
          nombre: user.nombre,
          email: user.email,
          rol: user.rol
        }
      });

    } catch (error) {
      console.error('Error en login:', error);
      res.status(500).json({ error: 'Error en el servidor' });
    }
  }

  async registro(req, res) {
    const { nombre, email, password } = req.body;

    try {
      if (!nombre || !email || !password) {
        return res.status(400).json({ error: 'Campos requeridos' });
      }

      const hash = await bcrypt.hash(password, 10);

      await pool.query(
        'INSERT INTO usuarios (nombre, email, password_hash) VALUES (?, ?, ?)',
        [nombre, email, hash]
      );

      res.json({ message: 'Usuario creado' });

    } catch (error) {
      console.error('Error en registro:', error);
      res.status(500).json({ error: 'Error al registrar' });
    }
  }

  async logout(req, res) {
    res.json({ message: 'Logout exitoso' });
  }

  /**
   * Eliminar cuenta del usuario autenticado
   * DELETE /api/auth/eliminar-cuenta
   */
  async eliminarCuenta(req, res) {
    const usuarioId = req.user.id;

    if (!usuarioId) {
      return res.status(401).json({ error: 'No autorizado' });
    }

    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      // 1. Obtener IDs de eventos del usuario
      const [eventos] = await connection.query(
        'SELECT id FROM eventos WHERE usuario_id = ?',
        [usuarioId]
      );

      if (eventos.length > 0) {
        const eventoIds = eventos.map(e => e.id);

        // 2. Eliminar relaciones de esos eventos
        await connection.query('DELETE FROM precios_entrada WHERE evento_id IN (?)', [eventoIds]);
        await connection.query('DELETE FROM actividades WHERE evento_id IN (?)', [eventoIds]);
        await connection.query('DELETE FROM expositores WHERE evento_id IN (?)', [eventoIds]);
        await connection.query('DELETE FROM evento_galeria WHERE evento_id IN (?)', [eventoIds]);
        
        // 3. Eliminar los eventos
        await connection.query('DELETE FROM eventos WHERE usuario_id = ?', [usuarioId]);
      }

      // 4. Eliminar el usuario
      const [result] = await connection.query(
        'DELETE FROM usuarios WHERE id = ?',
        [usuarioId]
      );

      if (result.affectedRows === 0) {
        await connection.rollback();
        return res.status(404).json({ error: 'Usuario no encontrado' });
      }

      await connection.commit();
      res.json({ message: 'Cuenta eliminada exitosamente' });

    } catch (error) {
      if (connection) await connection.rollback();
      console.error('Error al eliminar cuenta:', error);
      res.status(500).json({ error: 'Error al eliminar la cuenta' });
    } finally {
      if (connection) connection.release();
    }
  }
}

module.exports = AuthController;