const express = require('express');
const EventoController = require('../controllers/EventoController');

const router = express.Router();
const eventoController = new EventoController();

// Rutas fijas primero
router.get('/todos', eventoController.obtenerTodosActivos.bind(eventoController));
router.get('/hoy', eventoController.obtenerHoy.bind(eventoController));
router.get('/en-progreso', eventoController.obtenerEnProgreso.bind(eventoController));
router.get('/finalizados', eventoController.obtenerFinalizados.bind(eventoController));
router.get('/', eventoController.obtenerTodos.bind(eventoController));
// Ruta paramétrica al final
router.get('/:slug', eventoController.obtenerPorSlug.bind(eventoController));

module.exports = router;