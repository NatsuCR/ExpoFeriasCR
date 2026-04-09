// backend/server.js
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const eventoRoutes = require('./routes/eventoRoutes');
const precioRoutes = require('./routes/precioRoutes');
const expositorRoutes = require('./routes/expositorRoutes');
const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const actividadRoutes = require('./routes/actividadRoutes');
const galeriaRoutes = require('./routes/galeriaRoutes');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));



// Rutas
app.use('/api/eventos', eventoRoutes);
app.use('/api/precios', precioRoutes);
app.use('/api/expositores', expositorRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/actividades', actividadRoutes);
app.use('/api/galeria', galeriaRoutes);

// Ruta de salud (opcional)
app.get('/api/health', (req, res) => {
  res.json({ message: 'Servidor funcionando correctamente', timestamp: new Date() });
});

const path = require('path');
// ... después de los middlewares, antes de las rutas API:
app.use(express.static(path.join(__dirname, '../frontend')));




// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});