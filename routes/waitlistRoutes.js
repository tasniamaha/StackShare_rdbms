// routes/waitlistRoutes.js
const express = require('express');
const router = express.Router();
const waitlistController = require('../controllers/waitlistController');
const authMiddleware = require('../middleware/authMiddleware');

// All routes require authentication
router.use(authMiddleware);

// Join waitlist
router.post('/join', waitlistController.joinWaitlist);

// Leave waitlist
router.delete('/:id/leave', waitlistController.leaveWaitlist);

// Get waitlist by device
router.get('/device/:deviceId', waitlistController.getWaitlistByDevice);

// Get my waitlist
router.get('/my-waitlist', waitlistController.getMyWaitlist);

// Get position
router.get('/position/:deviceId', waitlistController.getWaitlistPosition);

module.exports = router;