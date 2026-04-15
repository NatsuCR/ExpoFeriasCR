const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader) {
            return res.status(401).json({ error: 'No autorizado' });
        }

        const token = authHeader.split(' ')[1];

        // Evitar error 'jwt malformed' si el cliente envía strings inválidos como "null" o "undefined"
        if (!token || token === 'null' || token === 'undefined' || token === '') {
            return res.status(401).json({ error: 'Token inválido o sesión expirada' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        req.user = decoded;

        next();
    } catch (error) {
        // Solo loguear errores que no sean de malformación o expiración para evitar ruido en consola
        if (error.name !== 'JsonWebTokenError' && error.name !== 'TokenExpiredError') {
            console.error('Error crítico en auth middleware:', error);
        }
        return res.status(401).json({ error: 'Token inválido o expirado' });
    }
};