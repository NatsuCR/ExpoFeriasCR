const express = require('express');
const EventoController = require('../controllers/publico/EventoController');
const UsuarioEventsController = require('../controllers/usuario/EventosController');
const authMiddleware = require('../middlewares/auth');

const router = express.Router();
const eventoController = new EventoController();
const usuarioEventsController = new UsuarioEventsController();

// Rutas fijas primero
router.get('/todos', eventoController.obtenerTodosActivos.bind(eventoController));
router.get('/hoy', eventoController.obtenerHoy.bind(eventoController));
router.get('/en-progreso', eventoController.obtenerEnProgreso.bind(eventoController));
router.get('/finalizados', eventoController.obtenerFinalizados.bind(eventoController));

// Rutas de usuario autenticado
router.post('/crear', authMiddleware, (req, res) => usuarioEventsController.crearEvento(req, res));
router.get('/mis-eventos', authMiddleware, (req, res) => usuarioEventsController.misEventos(req, res));
router.get('/mis-eventos/aprobados', authMiddleware, (req, res) => usuarioEventsController.misEventosAprobados(req, res));
router.get('/mis-eventos/pendientes', authMiddleware, (req, res) => usuarioEventsController.misEventosPendientes(req, res));
router.get('/mis-eventos/rechazados', authMiddleware, (req, res) => usuarioEventsController.misEventosRechazados(req, res));
router.get('/mi-evento/:id', authMiddleware, (req, res) => usuarioEventsController.obtenerEvento(req, res));
router.put('/actualizar/:id', authMiddleware, (req, res) => usuarioEventsController.actualizarEvento(req, res));
router.post('/:id/editar-aprobado', authMiddleware, (req, res) => usuarioEventsController.editarEventoAprobado(req, res));
router.get('/estado/:id', authMiddleware, (req, res) => usuarioEventsController.obtenerEstadoEvento(req, res));

router.delete('/:id', authMiddleware, (req, res) => usuarioEventsController.eliminarEvento(req, res));



// Ruta pública
router.get('/', eventoController.obtenerTodos.bind(eventoController));

// Ruta pública para Aviso Stream
const StreamAvisoController = require('../controllers/admin/StreamAvisoController');
router.get('/stream-aviso/estado', StreamAvisoController.getPublicStatus);

// Ruta paramétrica al final
router.get('/:slug', eventoController.obtenerPorSlug.bind(eventoController));

module.exports = router;



