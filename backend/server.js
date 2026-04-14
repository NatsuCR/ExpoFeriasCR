const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

const eventoRoutes = require('./routes/eventoRoutes');
const precioRoutes = require('./routes/precioRoutes');
const expositorRoutes = require('./routes/expositorRoutes');
const actividadRoutes = require('./routes/actividadRoutes');
const galeriaRoutes = require('./routes/galeriaRoutes');
const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const trackerMiddleware = require('./middlewares/trackerMiddleware');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Registrar tiempo de inicio del servidor para forzar re-login al reiniciar
const SERVER_BOOT_TIME = Date.now().toString();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// IMPORTANTE: El middleware de tracking debe ir ANTES de servir archivos estáticos
app.use(trackerMiddleware);

// Servir archivos estáticos del frontend (solo una vez)
app.use(express.static(path.join(__dirname, '../frontend')));

// Rutas API
app.use('/api/eventos', eventoRoutes);
app.use('/api/precios', precioRoutes);
app.use('/api/expositores', expositorRoutes);
app.use('/api/actividades', actividadRoutes);
app.use('/api/galeria', galeriaRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);

app.get('/api/health', (req, res) => {
  res.json({ 
    message: 'Servidor funcionando correctamente', 
    timestamp: new Date(),
    bootTime: SERVER_BOOT_TIME
  });
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});