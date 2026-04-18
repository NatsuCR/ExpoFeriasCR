const express = require('express');
const authMiddleware = require('../middlewares/auth');
const AdminEventoController = require('../controllers/admin/EventoController');
const AdminEventosPendientesController = require('../controllers/admin/PendientesController');
const AdminPrecioController = require('../controllers/admin/PrecioController');
const AdminActividadController = require('../controllers/admin/ActividadController');
const AdminExpositorController = require('../controllers/admin/ExpositorController');
const AdminGaleriaController = require('../controllers/admin/GaleriaController');
const AdminUsuarioController = require('../controllers/admin/UsuarioController');
const StatsController = require('../controllers/admin/StatsController');
const UploadController = require('../controllers/admin/UploadController');



const router = express.Router();
const uploadController = UploadController;
const adminEvento = AdminEventoController;
const adminEventosPendientes = AdminEventosPendientesController;
const adminPrecio = AdminPrecioController;
const adminActividad = AdminActividadController;
const adminExpositor = AdminExpositorController;
const adminGaleria = AdminGaleriaController;
const adminUsuario = AdminUsuarioController;
const statsController = StatsController;

// Todas las rutas requieren autenticación
router.use(authMiddleware);

router.post('/upload', uploadController.uploadFile.bind(uploadController));



// ========== Rutas para Eventos ==========
router.get('/eventos', adminEvento.listar.bind(adminEvento));
router.get('/eventos/:id', adminEvento.obtenerPorId.bind(adminEvento));
router.post('/eventos', adminEvento.crear.bind(adminEvento));
router.put('/eventos/:id', adminEvento.actualizar.bind(adminEvento));
router.delete('/eventos/:id', adminEvento.eliminar.bind(adminEvento));

// ========== Rutas para Eventos Pendientes (de Usuarios) ==========
router.get('/eventos-pendientes-stats', adminEventosPendientes.obtenerEstadisticas.bind(adminEventosPendientes));
router.get('/eventos-pendientes', adminEventosPendientes.listarPendientes.bind(adminEventosPendientes));
router.get('/eventos-pendientes/:id', adminEventosPendientes.obtenerPendiente.bind(adminEventosPendientes));
router.put('/eventos-pendientes/:id/aprobar', adminEventosPendientes.aprobarEvento.bind(adminEventosPendientes));
router.put('/eventos-pendientes/:id/rechazar', adminEventosPendientes.rechazarEvento.bind(adminEventosPendientes));

// ========== Rutas para Eventos Pendientes de Edición (Re-revisión) ==========
router.get('/eventos-edicion-pendiente', adminEvento.eventosEdicionPendiente.bind(adminEvento));
router.post('/eventos-edicion-pendiente/:id/aprobar', adminEvento.aprobarEdicionEvento.bind(adminEvento));
router.post('/eventos-edicion-pendiente/:id/rechazar', adminEvento.rechazarEdicionEvento.bind(adminEvento));

// ========== Rutas para Precios ==========
router.get('/eventos/:eventoId/precios', adminPrecio.listarPorEvento.bind(adminPrecio));
router.post('/precios', adminPrecio.crear.bind(adminPrecio));
router.put('/precios/:id', adminPrecio.actualizar.bind(adminPrecio));
router.delete('/precios/:id', adminPrecio.eliminar.bind(adminPrecio));

// ========== Rutas para Actividades ==========
router.get('/eventos/:eventoId/actividades', adminActividad.listarPorEvento.bind(adminActividad));
router.post('/actividades', adminActividad.crear.bind(adminActividad));
router.put('/actividades/:id', adminActividad.actualizar.bind(adminActividad));
router.delete('/actividades/:id', adminActividad.eliminar.bind(adminActividad));

// ========== Rutas para Expositores ==========
router.get('/eventos/:eventoId/expositores', adminExpositor.listarPorEvento.bind(adminExpositor));
router.post('/expositores', adminExpositor.crear.bind(adminExpositor));
router.put('/expositores/:id', adminExpositor.actualizar.bind(adminExpositor));
router.delete('/expositores/:id', adminExpositor.eliminar.bind(adminExpositor));

// ========== Rutas para Galería ==========
router.get('/eventos/:eventoId/galeria', adminGaleria.listarPorEvento.bind(adminGaleria));
router.post('/galeria', adminGaleria.crear.bind(adminGaleria));
router.put('/galeria/:id', adminGaleria.actualizar.bind(adminGaleria));
router.delete('/galeria/:id', adminGaleria.eliminar.bind(adminGaleria));

// ========== Rutas para Usuarios ==========
router.get('/usuarios', adminUsuario.listar.bind(adminUsuario));
router.post('/usuarios', adminUsuario.crear.bind(adminUsuario));
router.post('/usuarios/bulk-delete', adminUsuario.eliminarVarios.bind(adminUsuario));
router.delete('/usuarios/:id', adminUsuario.eliminar.bind(adminUsuario));

// ========== Rutas para Estadísticas ==========
router.get('/stats', statsController.getStats.bind(statsController));
router.get('/stats/export', statsController.exportVisits.bind(statsController));
router.get('/stats/summary', statsController.exportSummary.bind(statsController));
router.get('/stats/zip', statsController.exportZip.bind(statsController));

module.exports = router;