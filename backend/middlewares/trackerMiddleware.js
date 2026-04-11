// backend/middlewares/trackerMiddleware.js
const pool = require('../db');

const trackerMiddleware = async (req, res, next) => {
    // Lista de rutas que queremos rastrear
    const trackedPaths = ['/', '/evento.html'];
    const requestPath = req.path;

    if (trackedPaths.includes(requestPath)) {
        // Obtener la IP real del visitante (considerando proxies)
        let ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
        if (ip && ip.includes(',')) ip = ip.split(',')[0].trim();

        try {
            // Registrar la visita en la base de datos
            await pool.query(
                'INSERT INTO visitas (ip_address, page_url, visit_date) VALUES (?, ?, NOW())',
                [ip, requestPath]
            );
        } catch (error) {
            // No interrumpimos la navegación si hay un error en el registro
            console.error('Error registrando visita:', error);
        }
    }
    next();
};

module.exports = trackerMiddleware;