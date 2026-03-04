// routes/borrowRoutes.js
const express = require('express');
const router = express.Router();
const borrowController = require('../controllers/borrowController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

router.use(authMiddleware);

// ================================
// GET /api/borrow/pending
// BorrowRequestTable.js: GET /api/borrow/pending
// Admin only — pending approval queue
// ================================
router.get('/pending', roleMiddleware('admin'), borrowController.getPendingRequests);

// ================================
// POST /api/borrow/request
// BorrowRequest.js: POST /borrows/request  ← register as /api/borrows in app.js
// Borrower creates a borrow request
// Body: { device_id, borrow_start_date, borrow_end_date }
// ================================
router.post('/request', roleMiddleware('borrower'), borrowController.createBorrowRequest);

// ================================
// PUT /api/borrow/approve/:id
// BorrowRequestTable.js: PUT /api/borrow/approve/${borrow_id}
// Admin approves a request
// ================================
router.put('/approve/:id', roleMiddleware('admin'), borrowController.approveBorrowRequest);

// ================================
// PUT /api/borrow/reject/:id
// BorrowRequestTable.js: PUT /api/borrow/reject/${borrow_id}
// Admin rejects a request
// ================================
router.put('/reject/:id', roleMiddleware('admin'), borrowController.rejectBorrowRequest);

// ================================
// PUT /api/borrow/return/:id
// BorrowedItemCard.js: PUT /api/borrow/return/${borrow_id}
// Body: { condition_status, remarks }
// Also inserts into return_logs
// ================================
router.put('/return/:id', borrowController.returnDevice);

// ================================
// PUT /api/borrow/extend/:id
// BorrowerDashboard extend borrow period
// ================================
router.put('/extend/:id', borrowController.extendBorrow);

// ================================
// GET /api/borrow/:id
// Get single borrow details
// ================================
router.get('/:id', borrowController.getBorrowDetails);

module.exports = router;