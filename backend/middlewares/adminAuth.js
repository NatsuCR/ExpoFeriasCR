/**
 * Middleware para restringir el acceso solo a usuarios con rol 'admin'.
 * Debe usarse DESPUÉS del authMiddleware.
 */
const adminOnly = (req, res, next) => {
    try {
        if (!req.user) {
            return res.status(401).json({ error: 'Sesión no iniciada o token inválido.' });
        }

        // Si el rol es nulo o no es admin, denegar acceso
        if (!req.user.rol || req.user.rol !== 'admin') {
            const userEmail = req.user.email || 'Usuario desconocido';
            const userRol = req.user.rol || 'sin rol';
            console.warn(`[SEGURIDAD] Acceso denegado: ${userEmail} (Rol: ${userRol}) intentó acceder a ruta administrativa.`);
            
            return res.status(403).json({ 
                error: 'Acceso prohibido.', 
                message: 'Se requieren permisos de administrador para realizar esta acción.' 
            });
        }

        next();
    } catch (error) {
        console.error('[adminAuth Middleware Error]:', error);
        res.status(500).json({ error: 'Error interno en la validación de permisos.' });
    }
};

module.exports = adminOnly;




