require('dotenv').config();

const express = require('express');
const path = require('path');
const helmet = require('helmet'); // 🛡️ Protección de cabeceras
const rateLimit = require('express-rate-limit'); // 🛡️ Límite de peticiones (Legacy/Fixed Window)
const tokenBucketLimiter = require('./middlewares/tokenBucketLimiter'); // 🛡️ Token Bucket
const trackerMiddleware = require('./middlewares/trackerMiddleware');

const app = express();

// =======================
// 🌐 ARCHIVOS CRÍTICOS (SEO/ADS)
// =======================
// Servir antes de Helmet y otros middlewares para asegurar máxima compatibilidad con bots
app.get('/ads.txt', (req, res) => {
  res.sendFile(path.join(process.cwd(), 'frontend', 'ads.txt'));
});

app.get('/robots.txt', (req, res) => {
  res.sendFile(path.join(process.cwd(), 'frontend', 'robots.txt'));
});

// =======================
// 🛡️ SEGURIDAD GLOBAL
// =======================
app.use(helmet({
  contentSecurityPolicy: false,    // Desactivado para permitir scripts externos (CDNs)
  crossOriginEmbedderPolicy: false, // Necesario para que el iframe del preview cargue recursos
  crossOriginOpenerPolicy: false,   // Permite comunicación entre iframe y ventana padre
  crossOriginResourcePolicy: false, // Permite cargar recursos cross-origin en el iframe
  frameguard: false,                // Permite embeber evento.html en el iframe del preview
}));

// Límite de velocidad para login y registro (Evitar fuerza bruta)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 15, // 15 intentos por IP
  message: { error: 'Demasiados intentos desde esta IP, por favor intenta en 15 minutos.' }
});

app.use('/api/auth/login', authLimiter);
app.use('/api/auth/registro', authLimiter);

// 🛡️ Aplicar Token Bucket a TODAS las rutas de la API para protección global
app.use('/api', tokenBucketLimiter({ capacity: 30, refillRate: 5 })); 

// =======================
// 🔧 MIDDLEWARES
// =======================

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.set('trust proxy', 1);

// Registrar tiempo de inicio del servidor para forzar re-login al reiniciar
const SERVER_BOOT_TIME = Date.now().toString();

// Rastreador de visitas (Estadísticas)
app.use(trackerMiddleware);

// =======================
// 📡 RUTAS API
// =======================
const authRoutes = require('./routes/authRoutes');
const eventoRoutes = require('./routes/eventoRoutes');
const adminRoutes = require('./routes/adminRoutes');
const actividadRoutes = require('./routes/actividadRoutes');
const precioRoutes = require('./routes/precioRoutes');
const expositorRoutes = require('./routes/expositorRoutes');
const galeriaRoutes = require('./routes/galeriaRoutes');
const pagosRoutes = require('./routes/pagosRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/eventos', eventoRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/actividades', actividadRoutes);
app.use('/api/precios', precioRoutes);
app.use('/api/expositores', expositorRoutes);
app.use('/api/galeria', galeriaRoutes);
app.use('/api/pagos', pagosRoutes);

// =======================
// 📁 ARCHIVOS ESTÁTICOS
// =======================

const fs = require('fs');
const seoService = require('./services/seoService');
const EventoService = require('./services/EventoService');
const eventoService = new EventoService();

// Ruta dinámica para inyectar SEO en eventos
app.get('/evento.html', async (req, res) => {
  const { slug, preview } = req.query;
  const filePath = path.join(process.cwd(), 'frontend', 'evento.html');

  try {
    let html = fs.readFileSync(filePath, 'utf8');

    // Modo preview para el administrador (ignorar SEO y enviar 200)
    if (preview === '1') {
      html = seoService.inyectarMetadatos(html, null);
      return res.send(html);
    }

    // Si no hay slug, no tiene sentido estar en evento.html, redirigir al inicio
    if (!slug) {
      return res.redirect(301, '/');
    }

    // Buscar el evento en la BD
    const evento = await eventoService.obtenerEventoPorSlug(slug);

    // Si hay slug pero el evento no existe, retornar status 404 (evita "Soft 404" en Google)
    if (!evento) {
      html = seoService.inyectarMetadatos(html, null);
      return res.status(404).send(html);
    }

    // Inyectar metadatos
    html = seoService.inyectarMetadatos(html, evento);

    res.send(html);
  } catch (error) {
    console.error('[SEO] Error inyectando metadatos:', error);
    res.status(500).sendFile(filePath);
  }
});

// Ruta para el Sitemap dinámico
app.get('/sitemap.xml', async (req, res) => {
  try {
    const eventos = await eventoService.obtenerTodosActivos();
    const slugs = eventos.map(e => e.slug);
    const xml = seoService.generarSitemapXML(slugs);

    res.header('Content-Type', 'application/xml');
    res.send(xml);
  } catch (error) {
    console.error('[SEO] Error generando sitemap:', error);
    res.status(500).end();
  }
});

// 🔥 Esto arregla tu problema de uploads
app.use('/assets', express.static(path.join(process.cwd(), 'frontend', 'assets')));

// 🔤 Forzar charset=utf-8 en todos los archivos de texto estáticos
// Esto evita que el navegador interprete las tildes y ñ como Latin-1
app.use((req, res, next) => {
  res.on('headers', () => {
    const ct = res.getHeader('Content-Type');
    if (ct && typeof ct === 'string' && ct.startsWith('text/') && !ct.includes('charset')) {
      res.setHeader('Content-Type', ct + '; charset=utf-8');
    }
  });
  next();
});

// 🔥 Servir frontend completo
app.use(express.static(path.join(process.cwd(), 'frontend'), {
  setHeaders(res, filePath) {
    const ext = path.extname(filePath).toLowerCase();

    // Tipos de texto con charset
    const textTypes = {
      '.html': 'text/html; charset=utf-8',
      '.js':   'text/javascript; charset=utf-8',
      '.mjs':  'text/javascript; charset=utf-8',
      '.css':  'text/css; charset=utf-8',
      '.json': 'application/json; charset=utf-8',
      '.txt':  'text/plain; charset=utf-8',
      '.xml':  'application/xml; charset=utf-8',
    };
    if (textTypes[ext]) {
      res.setHeader('Content-Type', textTypes[ext]);
    }

    // 🚫 JS, CSS y HTML: siempre verificar con el servidor (no-cache)
    // Esto soluciona que el navegador use versiones viejas después de un deploy
    if (['.js', '.mjs', '.css', '.html'].includes(ext)) {
      res.setHeader('Cache-Control', 'no-cache, must-revalidate');
    }
    // 🖼️ Imágenes y fuentes: cachear 7 días (cambian poco)
    else if (['.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg', '.ico', '.woff', '.woff2', '.ttf'].includes(ext)) {
      res.setHeader('Cache-Control', 'public, max-age=604800');
    }
  }
}));

// =======================
// 🧪 HEALTH CHECK
// =======================
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    bootTime: SERVER_BOOT_TIME
  });
});

// =======================
// 🛡️ MANEJADOR DE ERRORES GLOBAL
// =======================
app.use((err, req, res, next) => {
  console.error('❌ [SERVER ERROR]:', err.stack);
  res.status(500).json({ 
    error: 'Error interno del servidor', 
    message: err.message,
    path: req.path
  });
});

// =======================
// 🧹 TAREAS EN SEGUNDO PLANO
// =======================
const pool = require('./db');

const limpiarVisitasEventosBorrados = async () => {
  try {
    const query = `
      DELETE v FROM visitas v
      LEFT JOIN eventos e ON v.page_url = CONCAT('/evento.html?slug=', e.slug)
      WHERE v.page_url LIKE '/evento.html?slug=%' AND e.id IS NULL;
    `;
    const [result] = await pool.query(query);
    if (result.affectedRows > 0) {
      console.log(`🧹 Limpieza de estadísticas: ${result.affectedRows} visitas de eventos eliminados fueron borradas.`);
    }
  } catch (error) {
    console.error('❌ Error en tarea de limpieza de estadísticas:', error);
  }
};

// Ejecutar limpieza al iniciar el servidor
limpiarVisitasEventosBorrados();
// Y luego cada 24 horas (24 * 60 * 60 * 1000 ms)
setInterval(limpiarVisitasEventosBorrados, 24 * 60 * 60 * 1000);

// =======================
// 🚀 SERVIDOR
// =======================
const PORT = process.env.PORT || 3005;

const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Servidor listo en:`);
  console.log(`- Local:   http://localhost:${PORT}`);
  console.log(`- Red:     http://192.168.1.18:${PORT} (Si es tu IP local)`);
});

// Inicializar WebSockets para el Chat en Vivo
require('./chatSocket')(server);

server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`❌ El puerto ${PORT} ya está siendo usado por otro programa.`);
  } else {
    console.error('❌ Error inesperado en el servidor:', error);
  }
});


