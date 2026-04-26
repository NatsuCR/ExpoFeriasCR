const express = require('express');
const ExpositorController = require('../controllers/publico/ExpositorController');

const router = express.Router();
const expositorController = new ExpositorController();

router.get('/:slug', expositorController.obtenerPorEvento.bind(expositorController));

module.exports = router;


