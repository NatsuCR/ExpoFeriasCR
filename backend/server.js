require('dotenv').config();

const express = require('express');
const path = require('path');
const trackerMiddleware = require('./middlewares/trackerMiddleware');

const app = express();

// =======================
// 🔧 MIDDLEWARES
// =======================
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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

app.use('/api/auth', authRoutes);
app.use('/api/eventos', eventoRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/actividades', actividadRoutes);
app.use('/api/precios', precioRoutes);
app.use('/api/expositores', expositorRoutes);
app.use('/api/galeria', galeriaRoutes);

// =======================
// 📁 ARCHIVOS ESTÁTICOS
// =======================

// 🔥 Esto arregla tu problema de uploads
app.use('/assets', express.static(path.join(process.cwd(), 'frontend', 'assets')));

// 🔥 Servir frontend completo
app.use(express.static(path.join(process.cwd(), 'frontend')));

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
// 🚀 SERVIDOR
// =======================
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});