const express = require('express');
const AuthController = require('../controllers/publico/AuthController');
const rateLimit = require('express-rate-limit');
const authMiddleware = require('../middlewares/auth');

const loginLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 10 });
const registroLimiter = rateLimit({ windowMs: 60 * 60 * 1000, max: 5 });

const router = express.Router();
const authController = new AuthController();

// 🔓 Rutas públicas
router.post('/login', loginLimiter, authController.login.bind(authController));
router.get('/me', authMiddleware, (req, res) => authController.obtenerPerfil(req, res));
router.post('/registro', registroLimiter, authController.registro.bind(authController));

// 🔐 Ruta protegida
router.post('/logout', authMiddleware, authController.logout.bind(authController));
router.delete('/eliminar-cuenta', authMiddleware, authController.eliminarCuenta.bind(authController));

module.exports = router;