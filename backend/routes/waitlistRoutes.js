// routes/waitlistRoutes.js
const express            = require('express');
const router             = express.Router();
const waitlistController = require('../controllers/waitlistController');
const authMiddleware     = require('../middleware/authMiddleware');
const roleMiddleware     = require('../middleware/roleMiddleware');

router.use(authMiddleware);

// ================================
// POST /api/waitlist/join
// DeviceDetails.js "Request to Borrow" button
// Only borrowers can join
// Body: { device_id, priority_level? }
// Returns: waitlist_id, position, total, device_name
// ================================
router.post('/join', roleMiddleware('borrower'), waitlistController.joinWaitlist);

// ================================
// DELETE /api/waitlist/:id/leave
// DeviceDetails.js "Leave Waitlist" button
// Ownership verified in controller
// If student had active offer, queue auto-advances
// ================================
router.delete('/:id/leave', waitlistController.leaveWaitlist);

// ================================
// GET /api/waitlist/my-waitlist
// BorrowerDashboard "My Waitlists" section
// Returns active waitlists with is_your_turn + hours_remaining flags
// ================================
router.get('/my-waitlist', waitlistController.getMyWaitlist);

// ================================
// GET /api/waitlist/position/:deviceId
// DeviceDetails.js — student's position in queue
// Returns position, total, status, is_your_turn, expires_at
// Frontend uses is_your_turn to show "Borrow Now" button
// ================================
router.get('/position/:deviceId', waitlistController.getWaitlistPosition);

// ================================
// GET /api/waitlist/device/:deviceId
// Generic queue view — no ownership check
// Owner uses /api/owner/devices/:deviceId/waitlist instead
// ================================
router.get('/device/:deviceId', waitlistController.getWaitlistByDevice);

module.exports = router;