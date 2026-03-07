// routes/waitlistRoutes.js
const express = require('express');
const router = express.Router();
const waitlistController = require('../controllers/waitlistController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

// All routes require authentication
router.use(authMiddleware);

// ================================
// POST /api/waitlist/join
// DeviceDetails.js "Join Waitlist" button
// Only borrowers can join waitlist
// Body: { device_id }
// Inserts into waitlist, checks for duplicate via UNIQUE constraint
// ================================
router.post('/join', roleMiddleware('borrower'), waitlistController.joinWaitlist);

// ================================
// DELETE /api/waitlist/:id/leave
// DeviceDetails.js "Leave Waitlist" button
// Removes student from waitlist
// ================================
router.delete('/:id/leave', waitlistController.leaveWaitlist);

// ================================
// GET /api/waitlist/device/:deviceId
// DeviceDetails.js — show waitlist queue for a device
// Shows position, student names, priority
// ================================
router.get('/device/:deviceId', waitlistController.getWaitlistByDevice);

// ================================
// GET /api/waitlist/my-waitlist
// BorrowerDashboard — all waitlists the student is in
// student_id from JWT token
// ================================
router.get('/my-waitlist', waitlistController.getMyWaitlist);

// ================================
// GET /api/waitlist/position/:deviceId
// DeviceDetails.js — show logged-in student's position
// in the waitlist for a specific device
// ================================
router.get('/position/:deviceId', waitlistController.getWaitlistPosition);

module.exports = router;