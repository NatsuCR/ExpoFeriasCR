const express = require('express');
const PrecioController = require('../controllers/publico/PrecioController');

const router = express.Router();
const precioController = new PrecioController();

router.get('/:slug', precioController.obtenerPorEvento.bind(precioController));

module.exports = router;


