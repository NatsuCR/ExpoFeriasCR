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
        { expiresIn: '7d' }
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
}

module.exports = AuthController;