// routes/broadcastRoutes.js
const express = require('express');
const router = express.Router();
const broadcastController = require('../controllers/broadcastController');
const authMiddleware = require('../middleware/authMiddleware');

// All routes require authentication
router.use(authMiddleware);

// Create broadcast
router.post('/', broadcastController.createBroadcast);

// Get all open broadcasts
router.get('/', broadcastController.getAllBroadcasts);

// Get my broadcasts
router.get('/my-broadcasts', broadcastController.getMyBroadcasts);

// Get broadcast by ID
router.get('/:id', broadcastController.getBroadcastById);

// Respond to broadcast
router.post('/:id/respond', broadcastController.respondToBroadcast);

// Accept response
router.put('/:id/accept/:responseId', broadcastController.acceptResponse);

// Cancel broadcast
router.delete('/:id', broadcastController.cancelBroadcast);

module.exports = router;