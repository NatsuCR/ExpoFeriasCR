const pool = require('../db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

class AuthController {
  async login(req, res) {
    const { email, password } = req.body;
    try {
      const result = await pool.query('SELECT * FROM usuarios WHERE email = $1', [email]);
      if (result.rows.length === 0) {
        return res.status(401).json({ error: 'Credenciales inválidas' });
      }
      const user = result.rows[0];
      const valid = await bcrypt.compare(password, user.password_hash);
      if (!valid) {
        return res.status(401).json({ error: 'Credenciales inválidas' });
      }
      const token = jwt.sign(
        { id: user.id, email: user.email, rol: user.rol },
        process.env.JWT_SECRET,
        { expiresIn: '8h' }
      );
      res.json({ token, user: { id: user.id, nombre: user.nombre, email: user.email, rol: user.rol } });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error en login' });
    }
  }
}

module.exports = AuthController;