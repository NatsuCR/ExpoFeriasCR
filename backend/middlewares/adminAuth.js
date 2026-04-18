/**
 * Middleware para restringir el acceso solo a usuarios con rol 'admin'.
 * Debe usarse DESPUÉS del authMiddleware (que es el que extrae el usuario del token).
 */
const adminOnly = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({ error: 'No autenticado.' });
    }

    if (req.user.rol !== 'admin') {
        console.warn(`[SEGURIDAD] Intento de acceso no autorizado de: ${req.user.email} con rol: ${req.user.rol}`);
        return res.status(403).json({ error: 'Acceso prohibido. Se requieren permisos de administrador.' });
    }

    next();
};

module.exports = adminOnly;
