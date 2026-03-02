// routes/borrowerRoutes.js
const express = require('express');
const router = express.Router();
const borrowerController = require('../controllers/borrowerController');
const authMiddleware = require('../middleware/authMiddleware');

// All routes require authentication
router.use(authMiddleware);

// Dashboard
router.get('/dashboard', borrowerController.getDashboard);

// Active borrows
router.get('/active-borrows', borrowerController.getActiveBorrows);

// Borrow history
router.get('/history', borrowerController.getBorrowHistory);

// Recommendations
router.get('/recommendations', borrowerController.getRecommendations);

// Upcoming returns
router.get('/upcoming-returns', borrowerController.getUpcomingReturns);

module.exports = router;