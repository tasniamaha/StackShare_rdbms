// routes/fineRoutes.js
const express = require('express');
const router = express.Router();
const fineController = require('../controllers/fineController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

// log in parts
router.use(authMiddleware);

// ================================
// GET /api/fines/my-fines
// BorrowerDashboard fines modal
// Student sees their own fines only (student_id from JWT token)
// ================================
router.get('/my-fines', fineController.getMyFines);

// ================================
// GET /api/fines/overdue
// AdminDashboard overdue fines panel
// Admin only — all overdue fines across all students
// ================================
router.get('/overdue', roleMiddleware('admin'), fineController.getOverdueFines);

// ================================
// GET /api/fines/student/:studentId
// AdminDashboard — view fines for a specific student
// Admin only
// ================================
router.get('/student/:studentId', roleMiddleware('admin'), fineController.getFinesByStudent);

// ================================
// POST /api/fines
// AdminDashboard — manually apply a fine
// Admin only — calls apply_fine stored procedure
// Body: { borrow_id, student_id, reason, fine_amount, due_date }
// ================================
router.post('/', roleMiddleware('admin'), fineController.applyFine);

// ================================
// PUT /api/fines/:id/pay
// BorrowerDashboard — student pays a fine
// Any authenticated user (student pays their own)
// ================================
router.put('/:id/pay', fineController.payFine);

// ================================
// PUT /api/fines/:id/waive
// AdminDashboard — admin waives a fine
// Admin only
// ================================
router.put('/:id/waive', roleMiddleware('admin'), fineController.waiveFine);

module.exports = router;
