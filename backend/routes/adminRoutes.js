const express = require('express');
const authMiddleware = require('../middlewares/auth');
const AdminEventoController = require('../controllers/AdminEventoController');
const AdminPrecioController = require('../controllers/AdminPrecioController');
const AdminActividadController = require('../controllers/AdminActividadController');
const AdminExpositorController = require('../controllers/AdminExpositorController');
const AdminGaleriaController = require('../controllers/AdminGaleriaController');
const AdminUsuarioController = require('../controllers/AdminUsuarioController');

const router = express.Router();
const adminEvento = new AdminEventoController();
const adminPrecio = new AdminPrecioController();
const adminActividad = new AdminActividadController();
const adminExpositor = new AdminExpositorController();
const adminGaleria = new AdminGaleriaController();
const adminUsuario = new AdminUsuarioController();

router.use(authMiddleware);

// Eventos
router.get('/eventos', adminEvento.listar.bind(adminEvento));
router.get('/eventos/:id', adminEvento.obtenerPorId.bind(adminEvento));
router.post('/eventos', adminEvento.crear.bind(adminEvento));
router.put('/eventos/:id', adminEvento.actualizar.bind(adminEvento));
router.delete('/eventos/:id', adminEvento.eliminar.bind(adminEvento));

// Precios
router.get('/eventos/:eventoId/precios', adminPrecio.listarPorEvento.bind(adminPrecio));
router.post('/precios', adminPrecio.crear.bind(adminPrecio));
router.put('/precios/:id', adminPrecio.actualizar.bind(adminPrecio));
router.delete('/precios/:id', adminPrecio.eliminar.bind(adminPrecio));

// Actividades
router.get('/eventos/:eventoId/actividades', adminActividad.listarPorEvento.bind(adminActividad));
router.post('/actividades', adminActividad.crear.bind(adminActividad));
router.put('/actividades/:id', adminActividad.actualizar.bind(adminActividad));
router.delete('/actividades/:id', adminActividad.eliminar.bind(adminActividad));

// Expositores
router.get('/eventos/:eventoId/expositores', adminExpositor.listarPorEvento.bind(adminExpositor));
router.post('/expositores', adminExpositor.crear.bind(adminExpositor));
router.put('/expositores/:id', adminExpositor.actualizar.bind(adminExpositor));
router.delete('/expositores/:id', adminExpositor.eliminar.bind(adminExpositor));

// Galería
router.get('/eventos/:eventoId/galeria', adminGaleria.listarPorEvento.bind(adminGaleria));
router.post('/galeria', adminGaleria.crear.bind(adminGaleria));
router.put('/galeria/:id', adminGaleria.actualizar.bind(adminGaleria));
router.delete('/galeria/:id', adminGaleria.eliminar.bind(adminGaleria));

// Usuarios
router.get('/usuarios', adminUsuario.listar.bind(adminUsuario));
router.post('/usuarios', adminUsuario.crear.bind(adminUsuario));
router.delete('/usuarios/:id', adminUsuario.eliminar.bind(adminUsuario));

module.exports = router;