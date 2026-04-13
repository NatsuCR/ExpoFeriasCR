const express = require('express');
const AuthController = require('../controllers/AuthController');
const rateLimit = require('express-rate-limit');
const authMiddleware = require('../middlewares/auth');

const loginLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 10 });
const registroLimiter = rateLimit({ windowMs: 60 * 60 * 1000, max: 5 });
const resetLimiter = rateLimit({ windowMs: 60 * 60 * 1000, max: 5 });

const router = express.Router();
const authController = new AuthController();

// Rutas públicas
router.post('/login', loginLimiter, authController.login.bind(authController));
router.post('/registro', registroLimiter, authController.registro.bind(authController));
router.post('/confirmar-email', authController.confirmarEmail.bind(authController));
router.post('/solicitar-reset-password', resetLimiter, authController.solicitarResetPassword.bind(authController));
router.post('/cambiar-password-con-codigo', resetLimiter, authController.cambiarPasswordConCodigo.bind(authController));

// Rutas protegidas
router.post('/logout', authMiddleware, authController.logout.bind(authController));

module.exports = router;