// controllers/broadcastController.js
const BroadcastRequest  = require('../models/BroadcastRequest');
const BroadcastResponse = require('../models/BroadcastResponse');
const Notification      = require('../models/Notification');

// ================================
// POST /api/broadcast
// BorrowerDashboard broadcast request form
// Body: { item_type, description, urgency_level }
// ================================
exports.createBroadcast = async (req, res) => {
    try {
        const { item_type, description, urgency_level } = req.body;

        if (!item_type) {
            return res.status(400).json({ message: 'item_type is required' });
        }

        const result = await BroadcastRequest.create({
            requester_id: req.user.student_id,
            item_type,
            description,
            urgency_level
        });

        res.status(201).json({
            message: 'Broadcast request created successfully',
            broadcast_id: result.insertId
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// ================================
// GET /api/broadcast
// Broadcast board — all open requests
// Sorted by urgency then date in model
// ================================
exports.getAllBroadcasts = async (req, res) => {
    try {
        const broadcasts = await BroadcastRequest.getOpenBroadcasts();
        res.json(broadcasts);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// ================================
// GET /api/broadcast/:id
// Broadcast detail — includes all responses
// ================================
exports.getBroadcastById = async (req, res) => {
    try {
        const { id } = req.params;

        const broadcast = await BroadcastRequest.findById(id);
        if (!broadcast) {
            return res.status(404).json({ message: 'Broadcast not found' });
        }

        const responses = await BroadcastResponse.findByBroadcast(id);

        res.json({ ...broadcast, responses });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// ================================
// GET /api/broadcast/my
// BorrowerDashboard — logged-in student's own broadcasts
// ================================
exports.getMyBroadcasts = async (req, res) => {
    try {
        const broadcasts = await BroadcastRequest.findByRequester(req.user.student_id);
        res.json(broadcasts);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// ================================
// POST /api/broadcast/:id/respond
// Owner responds with a device offer
// Body: { device_id }
// ================================
exports.respondToBroadcast = async (req, res) => {
    try {
        const { id }      = req.params;
        const { device_id } = req.body;
        const responder_id  = req.user.student_id;

        const broadcast = await BroadcastRequest.findById(id);
        if (!broadcast) {
            return res.status(404).json({ message: 'Broadcast not found' });
        }

        if (broadcast.status !== 'Open') {
            return res.status(400).json({ message: 'This broadcast is no longer open' });
        }

        // ✅ Object signature matching kept BroadcastResponse model
        const result = await BroadcastResponse.create({
            broadcast_id: parseInt(id),
            responder_id,
            device_id: device_id || null
        });

        // Notify the requester
        await Notification.create({
            user_id:           broadcast.requester_id,
            related_entity:    'broadcast',
            related_id:        parseInt(id),
            title:             'New response to your broadcast',
            message:           `Someone offered a device for your "${broadcast.item_type}" request.`,
            notification_type: 'system'   // ✅ matches ENUM
        });

        res.status(201).json({
            message:     'Response sent successfully',
            response_id: result.insertId
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// ================================
// PUT /api/broadcast/:id/response/:responseId/accept
// Requester accepts a response → broadcast fulfilled
// ================================
exports.acceptResponse = async (req, res) => {
    try {
        const { id, responseId } = req.params;

        // Verify requester owns the broadcast
        const broadcast = await BroadcastRequest.findById(id);
        if (!broadcast) {
            return res.status(404).json({ message: 'Broadcast not found' });
        }
        if (broadcast.requester_id !== req.user.student_id) {
            return res.status(403).json({ message: 'Unauthorized' });
        }

        // Get response to find responder_id for notification
        const responses = await BroadcastResponse.findByBroadcast(id);
        const response  = responses.find(r => r.response_id === parseInt(responseId));
        if (!response) {
            return res.status(404).json({ message: 'Response not found' });
        }

        // Accept this response
        await BroadcastResponse.updateStatus(responseId, 'Accepted');

        // Mark broadcast fulfilled
        await BroadcastRequest.markFulfilled(id);

        // Notify the responder whose offer was accepted
        await Notification.create({
            user_id:           response.responder_id,
            related_entity:    'broadcast',
            related_id:        parseInt(id),
            title:             'Your offer was accepted',
            message:           `Your response to the broadcast for "${broadcast.item_type}" was accepted.`,
            notification_type: 'system'
        });

        res.json({ message: 'Response accepted and broadcast fulfilled' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// ================================
// PUT /api/broadcast/:id/close
// Requester cancels their own broadcast
// ================================
exports.cancelBroadcast = async (req, res) => {
    try {
        const { id } = req.params;

        const broadcast = await BroadcastRequest.findById(id);
        if (!broadcast) {
            return res.status(404).json({ message: 'Broadcast not found' });
        }
        if (broadcast.requester_id !== req.user.student_id) {
            return res.status(403).json({ message: 'Unauthorized' });
        }

        await BroadcastRequest.cancel(id);
        res.json({ message: 'Broadcast cancelled successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};