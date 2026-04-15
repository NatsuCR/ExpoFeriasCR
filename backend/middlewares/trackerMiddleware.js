const pool = require('../db');

/**
 * Middleware para rastrear visitas a las páginas
 */
const trackerMiddleware = async (req, res, next) => {
  // Ignorar peticiones de API que no sean navegaciones (opcional)
  // O rastrear todo. Basado en StatsController, rastreamos visitas generales.
  
  // No rastrear recursos estáticos típicos si es middleware global
  const isStatic = req.url.includes('.') && !req.url.endsWith('.html');
  if (isStatic) return next();

  try {
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    const url = req.originalUrl || req.url;

    // Solo rastrear si no es una ruta de admin (opcional, pero suele ser así)
    if (!url.startsWith('/api/admin') && !url.includes('/admin/')) {
       await pool.query(
         'INSERT INTO visitas (ip_address, page_url, visit_date) VALUES (?, ?, NOW())',
         [ip, url]
       );
    }
  } catch (error) {
    console.error('Error en trackerMiddleware:', error);
  }

  next();
};

module.exports = trackerMiddleware;
