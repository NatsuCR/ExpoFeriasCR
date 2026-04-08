const express = require('express');
const authMiddleware = require('../middlewares/auth');
const AdminEventoController = require('../controllers/AdminEventoController');

const router = express.Router();
const adminEvento = new AdminEventoController();
const AdminPrecioController = require('../controllers/AdminPrecioController');
const adminPrecio = new AdminPrecioController();


// Todas las rutas requieren autenticación
router.use(authMiddleware);

// Eventos
router.get('/eventos', adminEvento.listar.bind(adminEvento));
router.post('/eventos', adminEvento.crear.bind(adminEvento));
router.put('/eventos/:id', adminEvento.actualizar.bind(adminEvento));
router.delete('/eventos/:id', adminEvento.eliminar.bind(adminEvento));

// Aquí luego agregaremos rutas para precios, actividades, expositores
router.get('/eventos/:eventoId/precios', adminPrecio.listarPorEvento.bind(adminPrecio));
router.post('/precios', adminPrecio.crear.bind(adminPrecio));
router.put('/precios/:id', adminPrecio.actualizar.bind(adminPrecio));
router.delete('/precios/:id', adminPrecio.eliminar.bind(adminPrecio));
module.exports = router;