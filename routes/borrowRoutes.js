// routes/borrowRoutes.js
const express = require('express');
const router = express.Router();
const borrowController = require('../controllers/borrowController');
const authMiddleware = require('../middleware/authMiddleware');

// All routes require authentication
router.use(authMiddleware);

// Create borrow request
router.post('/request', borrowController.createBorrowRequest);

// Approve borrow request
router.put('/:id/approve', borrowController.approveBorrowRequest);

// Reject borrow request
router.put('/:id/reject', borrowController.rejectBorrowRequest);

// Return device
router.put('/:id/return', borrowController.returnDevice);

// Extend borrow period
router.put('/:id/extend', borrowController.extendBorrow);

// Get borrow details
router.get('/:id', borrowController.getBorrowDetails);

module.exports = router;