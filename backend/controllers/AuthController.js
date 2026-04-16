const pool = require('../db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const emailService = require('../services/emailService');

class AuthController {
  /**
   * Login - Autenticación de usuario existente
   */
  async login(req, res) {
    const { email, password } = req.body;
    try {
      if (!email || !password) {
        return res.status(400).json({ error: 'Email y contraseña requeridos' });
      }

      const [rows] = await pool.query('SELECT * FROM usuarios WHERE email = ?', [email]);
      if (rows.length === 0) {
        return res.status(401).json({ error: 'Credenciales inválidas' });
      }

      const user = rows[0];

      // Verificar contraseña
      const valid = await bcrypt.compare(password, user.password_hash);
      if (!valid) {
        return res.status(401).json({ error: 'Credenciales inválidas' });
      }

      // Crear JWT
      const token = jwt.sign(
        { id: user.id, email: user.email, rol: user.rol },
        process.env.JWT_SECRET,
        { expiresIn: '3h' }
      );

      res.json({
        token,
        user: {
          id: user.id,
          nombre: user.nombre,
          email: user.email,
          rol: user.rol,
          email_verificado: user.email_verificado
        }
      });
    } catch (error) {
      console.error('Error en login:', error);
      res.status(500).json({ error: 'Error en login' });
    }
  }

  /**
   * Registro - Crear nuevo usuario
   */
  async registro(req, res) {
    const { nombre, email, password, passwordConfirm } = req.body;

    try {
      // Validaciones
      if (!nombre || !email || !password) {
        return res.status(400).json({ error: 'Todos los campos son requeridos' });
      }

      if (password !== passwordConfirm) {
        return res.status(400).json({ error: 'Las contraseñas no coinciden' });
      }

      if (password.length < 6) {
        return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres' });
      }

      // Validar email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ error: 'Correo no válido' });
      }

      // Verificar si email ya existe
      const [existing] = await pool.query('SELECT id FROM usuarios WHERE email = ?', [email]);
      if (existing.length > 0) {
        return res.status(409).json({ error: 'Este email ya está registrado' });
      }

      // Hash contraseña
      const hashedPassword = await bcrypt.hash(password, 10);

      // Generar token de verificación
      const tokenVerificacion = jwt.sign(
        { email },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );

      // Insertar usuario
      const [result] = await pool.query(
        'INSERT INTO usuarios (nombre, email, password_hash, rol, activo, token_verificacion, email_verificado) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [nombre, email, hashedPassword, 'user', 1, tokenVerificacion, 0]
      );

      const usuarioId = result.insertId;

      // Enviar email de confirmación
      const linkConfirmacion = `${process.env.APP_URL || 'http://localhost:3000'}/confirmar-email.html?token=${tokenVerificacion}`;
      await emailService.enviarConfirmacionEmail(email, nombre, linkConfirmacion);

      // Auto-login (aunque no esté verificado)
      const token = jwt.sign(
        { id: usuarioId, email, rol: 'user' },
        process.env.JWT_SECRET,
        { expiresIn: '3h' }
      );

      res.status(201).json({
        message: 'Cuenta creada exitosamente. Te hemos enviado un email de confirmación.',
        token,
        user: {
          id: usuarioId,
          nombre,
          email,
          rol: 'user',
          email_verificado: false
        }
      });
    } catch (error) {
      console.error('Error en registro:', error);
      res.status(500).json({ error: 'Error al crear la cuenta' });
    }
  }

  /**
   * Confirmar email - Verificar token de confirmación
   */
  async confirmarEmail(req, res) {
    const { token } = req.body;

    try {
      if (!token) {
        return res.status(400).json({ error: 'Token requerido' });
      }

      // Verificar token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Buscar usuario por email
      const [rows] = await pool.query('SELECT * FROM usuarios WHERE email = ?', [decoded.email]);
      if (rows.length === 0) {
        return res.status(404).json({ error: 'Usuario no encontrado' });
      }

      const user = rows[0];

      // Actualizar email_verificado
      await pool.query('UPDATE usuarios SET email_verificado = 1, token_verificacion = NULL WHERE id = ?', [user.id]);

      res.json({
        message: 'Email confirmado exitosamente',
        user: {
          id: user.id,
          nombre: user.nombre,
          email: user.email,
          rol: user.rol
        }
      });
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({ error: 'El token de confirmación ha expirado' });
      }
      console.error('Error en confirmarEmail:', error);
      res.status(500).json({ error: 'Error al confirmar email' });
    }
  }

  /**
   * Solicitar reset de contraseña - Genera código y lo envía por email
   */
  async solicitarResetPassword(req, res) {
    const { email } = req.body;

    try {
      if (!email) {
        return res.status(400).json({ error: 'Email requerido' });
      }

      // Buscar usuario
      const [rows] = await pool.query('SELECT * FROM usuarios WHERE email = ?', [email]);
      if (rows.length === 0) {
        // No revelamos si el usuario existe por seguridad
        return res.json({ message: 'Si la cuenta existe, recibirás un email con instrucciones' });
      }

      const user = rows[0];

      // Generar código 6 dígitos
      const codigo = Math.floor(100000 + Math.random() * 900000).toString();

      // Fecha de expiración: 30 minutos
      const expiraEn = new Date(Date.now() + 30 * 60 * 1000);

      // Guardar código en DB
      await pool.query(
        'INSERT INTO password_resets (usuario_id, codigo_reset, expira_en) VALUES (?, ?, ?)',
        [user.id, codigo, expiraEn]
      );

      // Enviar email
      await emailService.enviarCodigoReset(email, user.nombre, codigo);

      res.json({ message: 'Te hemos enviado un código de recuperación al email' });
    } catch (error) {
      console.error('Error en solicitarResetPassword:', error);
      res.status(500).json({ error: 'Error al solicitar reset de contraseña' });
    }
  }

  /**
   * Verificar código de reset y cambiar contraseña
   */
  async cambiarPasswordConCodigo(req, res) {
    const { email, codigo, passwordNueva, passwordConfirm } = req.body;

    try {
      // Validaciones
      if (!email || !codigo || !passwordNueva) {
        return res.status(400).json({ error: 'Email, código y contraseña son requeridos' });
      }

      if (passwordNueva !== passwordConfirm) {
        return res.status(400).json({ error: 'Las contraseñas no coinciden' });
      }

      if (passwordNueva.length < 6) {
        return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres' });
      }

      // Buscar usuario
      const [userRows] = await pool.query('SELECT * FROM usuarios WHERE email = ?', [email]);
      if (userRows.length === 0) {
        return res.status(404).json({ error: 'Usuario no encontrado' });
      }

      const user = userRows[0];

      // Buscar código válido (no usado y no expirado)
      const [resetRows] = await pool.query(
        'SELECT * FROM password_resets WHERE usuario_id = ? AND codigo_reset = ? AND usado = 0 AND expira_en > NOW() ORDER BY created_at DESC LIMIT 1',
        [user.id, codigo]
      );

      if (resetRows.length === 0) {
        return res.status(401).json({ error: 'Código inválido o expirado' });
      }

      const resetRecord = resetRows[0];

      // Hash nueva contraseña
      const hashedPassword = await bcrypt.hash(passwordNueva, 10);

      // Actualizar contraseña
      await pool.query('UPDATE usuarios SET password_hash = ? WHERE id = ?', [hashedPassword, user.id]);

      // Marcar código como usado
      await pool.query('UPDATE password_resets SET usado = 1 WHERE id = ?', [resetRecord.id]);

      res.json({ message: 'Contraseña actualizada exitosamente' });
    } catch (error) {
      console.error('Error en cambiarPasswordConCodigo:', error);
      res.status(500).json({ error: 'Error al cambiar contraseña' });
    }
  }

  /**
   * Logout - Simplemente devuelve un estado OK (el frontend elimina el token)
   */
  async logout(req, res) {
    res.json({ message: 'Sesión cerrada' });
  }
}

module.exports = AuthController;
