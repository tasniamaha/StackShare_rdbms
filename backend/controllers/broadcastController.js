// controllers/broadcastController.js
const BroadcastRequest = require('../models/BroadcastRequest');
const BroadcastResponse = require('../models/BroadcastResponse');
const Notification = require('../models/Notification');

// Create broadcast request
exports.createBroadcast = async (req, res) => {
  try {
    const { item_type, description, urgency_level } = req.body;
    const requester_id = req.user.student_id;

    const result = await BroadcastRequest.create({
      requester_id,
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

// Get all open broadcasts
exports.getAllBroadcasts = async (req, res) => {
  try {
    const broadcasts = await BroadcastRequest.getOpenBroadcasts();
    res.json(broadcasts);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get broadcast by ID
exports.getBroadcastById = async (req, res) => {
  try {
    const { id } = req.params;
    const broadcast = await BroadcastRequest.findById(id);

    if (!broadcast) {
      return res.status(404).json({ message: 'Broadcast not found' });
    }

    // Get responses
    const responses = await BroadcastResponse.findByBroadcast(id);

    res.json({ ...broadcast, responses });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get user's broadcasts
exports.getMyBroadcasts = async (req, res) => {
  try {
    const broadcasts = await BroadcastRequest.findByRequester(req.user.student_id);
    res.json(broadcasts);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Respond to broadcast
exports.respondToBroadcast = async (req, res) => {
  try {
    const { id } = req.params;
    const { device_id } = req.body;
    const responder_id = req.user.student_id;

    const result = await BroadcastResponse.create(id, responder_id, device_id);

    // Notify requester
    const broadcast = await BroadcastRequest.findById(id);
    await Notification.create({
      user_id: broadcast.requester_id,
      related_entity: 'broadcast',
      related_id: id,
      message: 'Someone responded to your broadcast request!',
      notification_type: 'Info'
    });

    res.status(201).json({
      message: 'Response sent successfully',
      response_id: result.insertId
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Accept a response
exports.acceptResponse = async (req, res) => {
  try {
    const { id, responseId } = req.params;

    // Update response status
    await BroadcastResponse.updateStatus(responseId, 'Accepted');

    // Mark broadcast as fulfilled
    await BroadcastRequest.markFulfilled(id);

    res.json({ message: 'Response accepted and broadcast fulfilled' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Cancel broadcast
exports.cancelBroadcast = async (req, res) => {
  try {
    const { id } = req.params;
    const broadcast = await BroadcastRequest.findById(id);

    if (!broadcast || broadcast.requester_id !== req.user.student_id) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    await BroadcastRequest.cancel(id);

    res.json({ message: 'Broadcast cancelled successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};