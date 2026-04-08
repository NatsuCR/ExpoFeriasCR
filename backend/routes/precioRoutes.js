const express = require('express');
const PrecioController = require('../controllers/PrecioController');

const router = express.Router();
const precioController = new PrecioController();

router.get('/:slug', precioController.obtenerPreciosPorEvento.bind(precioController));

module.exports = router;