// controllers/waitlistController.js
const Waitlist = require('../models/Waitlist');
const Notification = require('../models/Notification');

// Join waitlist
exports.joinWaitlist = async (req, res) => {
  try {
    const { device_id, priority_level } = req.body;
    const student_id = req.user.student_id;

    // Check if already in waitlist
    const inWaitlist = await Waitlist.isInWaitlist(student_id, device_id);
    if (inWaitlist) {
      return res.status(400).json({ message: 'Already in waitlist for this device' });
    }

    const result = await Waitlist.add(device_id, student_id, priority_level || 0);

    res.status(201).json({
      message: 'Added to waitlist successfully',
      waitlist_id: result.insertId
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Leave waitlist
exports.leaveWaitlist = async (req, res) => {
  try {
    const { id } = req.params;
    await Waitlist.remove(id);
    res.json({ message: 'Removed from waitlist' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get waitlist for device
exports.getWaitlistByDevice = async (req, res) => {
  try {
    const { deviceId } = req.params;
    const waitlist = await Waitlist.findByDevice(deviceId);
    res.json(waitlist);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get user's waitlist
exports.getMyWaitlist = async (req, res) => {
  try {
    const waitlist = await Waitlist.findByStudent(req.user.student_id);
    res.json(waitlist);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get position in waitlist
exports.getWaitlistPosition = async (req, res) => {
  try {
    const { deviceId } = req.params;
    const student_id = req.user.student_id;

    const waitlist = await Waitlist.findByDevice(deviceId);
    const position = waitlist.findIndex(w => w.student_id === student_id) + 1;

    if (position === 0) {
      return res.status(404).json({ message: 'Not in waitlist' });
    }

    res.json({ position, total: waitlist.length });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};