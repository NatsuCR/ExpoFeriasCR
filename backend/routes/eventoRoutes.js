// backend/routes/eventoRoutes.js
const express = require('express');
const EventoController = require('../controllers/EventoController');

const router = express.Router();
const eventoController = new EventoController();

router.get('/', eventoController.obtenerTodos.bind(eventoController));
router.get('/:slug', eventoController.obtenerPorSlug.bind(eventoController));

module.exports = router;