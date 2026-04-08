// backend/routes/actividadRoutes.js
const express = require('express');
const ActividadController = require('../controllers/ActividadController');

const router = express.Router();
const actividadController = new ActividadController();

router.get('/:slug', actividadController.obtenerPorEvento.bind(actividadController));

module.exports = router;