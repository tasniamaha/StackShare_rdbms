// routes/damageRoutes.js
const express = require('express');
const router = express.Router();
const damageController = require('../controllers/damageController');
const authMiddleware = require('../middleware/authMiddleware');

// All routes require authentication
router.use(authMiddleware);

// Report damage
router.post('/report', damageController.reportDamage);

// Get all damage reports
router.get('/', damageController.getDamageReports);

// Get pending reports
router.get('/pending', damageController.getPendingReports);

// Review report (Admin)
router.put('/:id/review', damageController.reviewReport);

// Resolve report (Admin)
router.put('/:id/resolve', damageController.resolveReport);

module.exports = router;