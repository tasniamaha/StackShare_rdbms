// routes/fineRoutes.js
const express = require('express');
const router = express.Router();
const fineController = require('../controllers/fineController');
const authMiddleware = require('../middleware/authMiddleware');

// log in parts
router.use(authMiddleware);


router.get('/my-fines', fineController.getMyFines);

router.get('/student/:studentId', fineController.getFinesByStudent);
//admin
router.post('/', fineController.applyFine);

router.put('/:id/pay', fineController.payFine);

// Waive fine (Admin)
router.put('/:id/waive', fineController.waiveFine);

// get override admin
router.get('/overdue', fineController.getOverdueFines);

module.exports = router;
