const express = require('express');
const GaleriaController = require('../controllers/publico/GaleriaController');

const router = express.Router();
const galeriaController = new GaleriaController();

router.get('/:slug', galeriaController.obtenerPorEvento.bind(galeriaController));

module.exports = router;


