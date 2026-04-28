const pool = require('../db');

/**
 * Middleware para rastrear visitas a las páginas públicas clave
 */
const trackerMiddleware = async (req, res, next) => {
  const url = req.originalUrl || req.url;

  // 🛡️ FILTROS DE SEGURIDAD Y LIMPIEZA
  // 1. Ignorar cualquier previsualización administrativa
  if (url.includes('preview=1')) return next();

  // 2. Ignorar rutas de administración y API administrativa
  if (url.startsWith('/api/admin') || url.includes('/admin/')) return next();

  // 3. LISTA BLANCA: Solo rastrear páginas de interés para el negocio
  const isAllowedPage =
    url === '/' ||
    url === '/index.html' ||
    url.startsWith('/index.html?') ||
    (url.startsWith('/evento.html') && url.includes('slug=')) ||
    url.startsWith('/crear-evento.html') ||
    url.startsWith('/mi-cuenta.html');


  if (!isAllowedPage) return next();

  try {
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;

    // Solo insertar si pasó todos los filtros anteriores
    await pool.query(
      'INSERT INTO visitas (ip_address, page_url, visit_date) VALUES (?, ?, NOW())',
      [ip, url]
    );
  } catch (error) {
    console.error('Error en trackerMiddleware:', error);
  }

  next();
};

module.exports = trackerMiddleware;




