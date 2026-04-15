const pool = require('../db');

/**
 * Middleware para rastrear visitas a páginas públicas
 */
module.exports = async (req, res, next) => {
    // Solo rastrear peticiones GET
    if (req.method !== 'GET') return next();

    const url = req.originalUrl.split('?')[0]; // Ignorar query params para agrupar mejor

    // 1. Filtrar extensiones y rutas de sistema que NO queremos contar como visitas
    // Ignoramos: API, Assets (imágenes, css, js), health check, etc.
    const ignoredExtensions = ['.js', '.css', '.png', '.jpg', '.jpeg', '.gif', '.svg', '.woff', '.woff2', '.map', '.ico'];
    const ignoredPaths = ['/api/', '/assets/', '/favicon.ico', '/health'];

    const isIgnoredPath = ignoredPaths.some(path => url.startsWith(path));
    const isIgnoredExt = ignoredExtensions.some(ext => url.endsWith(ext));

    if (isIgnoredPath || isIgnoredExt) {
        return next();
    }

    // 2. Grabar la visita
    try {
        const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';
        
        // Ejecutar en segundo plano para no demorar la respuesta al usuario
        pool.query(
            'INSERT INTO visitas (ip_address, page_url, visit_date) VALUES (?, ?, NOW())',
            [ip, url]
        ).catch(err => {
            console.error('[Tracker] Error al insertar visita:', err.message);
        });
    } catch (error) {
        console.error('[Tracker] Error:', error.message);
    }

    next();
};