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

// Rutas de usuario autenticado (deben ir antes de :slug)
router.post('/crear', authMiddleware, usuarioEventsController.crearEvento.bind(usuarioEventsController));
router.get('/mis-eventos', authMiddleware, usuarioEventsController.misEventos.bind(usuarioEventsController));
router.get('/mis-eventos/aprobados', authMiddleware, usuarioEventsController.misEventosAprobados.bind(usuarioEventsController));
router.get('/mis-eventos/pendientes', authMiddleware, usuarioEventsController.misEventosPendientes.bind(usuarioEventsController));
router.get('/mis-eventos/rechazados', authMiddleware, usuarioEventsController.misEventosRechazados.bind(usuarioEventsController));
router.get('/mi-evento/:id', authMiddleware, usuarioEventsController.obtenerEvento.bind(usuarioEventsController));
router.put('/actualizar/:id', authMiddleware, usuarioEventsController.actualizarEvento.bind(usuarioEventsController));
router.post('/:id/editar-aprobado', authMiddleware, usuarioEventsController.editarEventoAprobado.bind(usuarioEventsController));
router.get('/estado/:id', authMiddleware, usuarioEventsController.obtenerEstadoEvento.bind(usuarioEventsController));
router.delete('/:id', authMiddleware, usuarioEventsController.eliminarEvento.bind(usuarioEventsController));

// Ruta pública
router.get('/', eventoController.obtenerTodos.bind(eventoController));

// Ruta paramétrica al final
router.get('/:slug', eventoController.obtenerPorSlug.bind(eventoController));

module.exports = router;