// routes/fineRoutes.js
const express = require('express');
const router = express.Router();
const fineController = require('../controllers/fineController');
const authMiddleware = require('../middleware/authMiddleware');

// All routes require authentication
router.use(authMiddleware);

// Get my fines
router.get('/my-fines', fineController.getMyFines);

// Get fines by student
router.get('/student/:studentId', fineController.getFinesByStudent);

// Apply fine (Admin)
router.post('/', fineController.applyFine);

// Pay fine
router.put('/:id/pay', fineController.payFine);

// Waive fine (Admin)
router.put('/:id/waive', fineController.waiveFine);

// Get overdue fines (Admin)
router.get('/overdue', fineController.getOverdueFines);

module.exports = router;