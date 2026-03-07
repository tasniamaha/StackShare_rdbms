// routes/borrowerRoutes.js
const express = require("express");
const router = express.Router();
const borrowerController = require("../controllers/borrowerController");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

router.use(authMiddleware);
router.use(roleMiddleware("borrower")); // ✅ requires can_borrow permission (flag set on student)

router.get('/dashboard', borrowerController.getDashboard);

// ================================
// GET /api/borrower/active-borrows
// BorrowerDashboard active borrow cards
// Uses view_active_borrows filtered by student_id
// ================================
router.get("/active-borrows", borrowerController.getActiveBorrows);

// ================================
// GET /api/borrower/history
// BorrowHistory.js — full borrow history
// Calls: get_student_borrow_history stored procedure
// ================================
router.get("/history", borrowerController.getBorrowHistory);

// ================================
// GET /api/borrower/upcoming-returns
// BorrowerDashboard upcoming return reminders
// WHERE borrow_end_date BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 3 DAY)
// ================================
router.get("/upcoming-returns", borrowerController.getUpcomingReturns);

// ================================
// GET /api/borrower/recommendations
// Recommendations.js — devices not yet borrowed by this student
// ================================
router.get("/recommendations", borrowerController.getRecommendations);

// ================================
// GET /api/borrower/fines
// BorrowerDashboard fines modal
// Uses view_overdue_fines filtered by student_id
// ================================
router.get("/fines", borrowerController.getFines);

module.exports = router;
