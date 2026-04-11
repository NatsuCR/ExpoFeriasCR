const express = require('express');
const AuthController = require('../controllers/AuthController');
const rateLimit = require('express-rate-limit');
const loginLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 10 });
const router = express.Router();
const authController = new AuthController();

router.post('/login', loginLimiter, authController.login.bind(authController));

module.exports = router;