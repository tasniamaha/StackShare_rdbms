// routes/broadcastRoutes.js
const express = require('express');
const router = express.Router();
const broadcastController = require('../controllers/broadcastController');
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware);  // all routes need auth

// ================================
// GET /api/broadcast
// All open broadcasts — any authenticated user
// ================================
router.get('/', broadcastController.getAllBroadcasts);

// ================================
// GET /api/broadcast/my-broadcasts
// Must be before /:id to avoid route conflict
// ================================
router.get('/my-broadcasts', broadcastController.getMyBroadcasts);

// ================================
// POST /api/broadcast
// Create broadcast — borrowers only
// Body: { item_type, description, urgency_level }
// Maps to broadcast_requests table
// ================================
router.post('/', broadcastController.createBroadcast);

// ================================
// GET /api/broadcast/:id
// ================================
router.get('/:id', broadcastController.getBroadcastById);

// ================================
// POST /api/broadcast/:id/respond
// Lender/owner responds with a device
// Body: { device_id }
// Maps to broadcast_responses table
// ================================
router.post('/:id/respond', broadcastController.respondToBroadcast);

// ================================
// PUT /api/broadcast/:id/accept/:responseId
// Borrower accepts a response
// ================================
router.put('/:id/accept/:responseId', broadcastController.acceptResponse);

// ================================
// PUT /api/broadcast/:id/close
// Requester marks their broadcast as closed/cancelled
// Same logic as DELETE — maps to cancelBroadcast controller
// ================================
router.put('/:id/close', broadcastController.cancelBroadcast);

// ================================
// DELETE /api/broadcast/:id
// Only the requester can cancel
// ================================
router.delete('/:id', broadcastController.cancelBroadcast);

module.exports = router;