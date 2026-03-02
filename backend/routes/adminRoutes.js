// routes/adminRoutes.js
const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const authMiddleware = require('../middleware/authMiddleware');

// Admin login (no auth required)
router.post('/login', adminController.login);

// All routes below require authentication
router.use(authMiddleware);

// Get overdue borrows
router.get('/overdue-borrows', adminController.getOverdueBorrows);

// Get pending approvals
router.get('/pending-approvals', adminController.getPendingApprovals);

// Get student stats
router.get('/student-stats', adminController.getStudentStats);

// Get system stats
router.get('/system-stats', adminController.getSystemStats);

// Suspend student
router.put('/students/:id/suspend', adminController.suspendStudent);

// Unsuspend student
router.put('/students/:id/unsuspend', adminController.unsuspendStudent);

module.exports = router;