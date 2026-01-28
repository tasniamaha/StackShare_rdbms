// routes/authRoutes.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { validateRegister, validateLogin } = require('../middleware/validationMiddleware');
const { authLimiter } = require('../middleware/rateLimiter');
const authMiddleware = require('../middleware/authMiddleware');

// Public routes
router.post('/register', authLimiter, validateRegister, authController.register);
router.post('/login', authLimiter, validateLogin, authController.login);

// Protected routes
router.get('/profile', authMiddleware, authController.getProfile);
router.put('/profile', authMiddleware, authController.updateProfile);
router.post('/logout', authMiddleware, authController.logout);

module.exports = router;