// routes/borrowRoutes.js
const express        = require('express');
const router         = express.Router();
const borrowController = require('../controllers/borrowController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

router.use(authMiddleware);

// Admin routes
router.get('/pending',      roleMiddleware('owner'),    borrowController.getPendingRequests);
router.put('/approve/:id',  roleMiddleware('owner'),    borrowController.approveBorrowRequest);
router.put('/reject/:id',   roleMiddleware('owner'),    borrowController.rejectBorrowRequest);

// Borrower routes
router.post('/request',     roleMiddleware('borrower'), borrowController.createBorrowRequest);
router.put('/return/:id',   roleMiddleware('borrower'), borrowController.returnDevice);
router.put('/extend/:id',   roleMiddleware('borrower'), borrowController.extendBorrow);  // ✅ added roleMiddleware
router.put('/:id/review',   roleMiddleware('borrower'), borrowController.submitReview);  // ✅ new route

// General
router.get('/:id', borrowController.getBorrowDetails);

module.exports = router;