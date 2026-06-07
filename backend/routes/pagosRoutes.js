const express = require('express');
const router = express.Router();
const pagosController = require('../controllers/publico/PagosController');
const authMiddleware = require('../middlewares/auth');

// Ruta protegida, el usuario debe estar logueado para capturar el pago
router.post('/capture', authMiddleware, pagosController.captureOrder);

module.exports = router;
