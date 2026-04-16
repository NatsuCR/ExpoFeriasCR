const jwt = require('jsonwebtoken');

/**
 * Middleware para autenticar usuarios mediante JWT
 */
const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Acceso denegado. No se proporcionó un token.' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    req.user = verified;

    // Renovación deslizante: si quedan menos de 2 horas, enviamos un nuevo token de 3h
    const now = Math.floor(Date.now() / 1000);
    if (verified.exp && (verified.exp - now) < (2 * 60 * 60)) {
      const newToken = jwt.sign(
        { id: verified.id, email: verified.email, rol: verified.rol },
        process.env.JWT_SECRET,
        { expiresIn: '3h' }
      );
      res.setHeader('X-New-Token', newToken);
      res.setHeader('Access-Control-Expose-Headers', 'X-New-Token');
    }

    next();
  } catch (error) {
    res.status(401).json({ error: 'Token no válido o expirado.' });
  }
};

module.exports = authMiddleware;
