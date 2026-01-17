// controllers/borrowController.js
const BorrowRequest = require('../models/BorrowRequest');
const Device = require('../models/Device');
const Notification = require('../models/Notification');
const pool = require('../config/database');

// Create borrow request
exports.createBorrowRequest = async (req, res) => {
  try {
    const { device_id } = req.body;
    const student_id = req.user.student_id;

    // Check if device is available
    const device = await Device.findById(device_id);
    if (!device || device.device_status !== 'Available') {
      return res.status(400).json({ message: 'Device not available' });
    }

    // Check if already borrowed or pending
    const hasActive = await BorrowRequest.hasActiveOrPending(student_id, device_id);
    if (hasActive) {
      return res.status(400).json({ message: 'You already have an active or pending request for this device' });
    }

    // Create request
    const result = await BorrowRequest.create({ student_id, device_id });

    res.status(201).json({ 
      message: 'Borrow request created successfully',
      borrow_id: result.insertId 
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Approve borrow request (Owner/Admin)
exports.approveBorrowRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const approver_id = req.user.student_id;

    // Call stored procedure
    await pool.execute('CALL approve_borrow_request(?, ?)', [id, approver_id]);

    res.json({ message: 'Borrow request approved successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Reject borrow request
exports.rejectBorrowRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const approver_id = req.user.student_id;

    await BorrowRequest.reject(id, approver_id);

    // Notify student
    const borrow = await BorrowRequest.findById(id);
    await Notification.create({
      user_id: borrow.student_id,
      related_entity: 'borrow_request',
      related_id: id,
      message: 'Your borrow request has been rejected',
      notification_type: 'Info'
    });

    res.json({ message: 'Borrow request rejected' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Return device
exports.returnDevice = async (req, res) => {
  try {
    const { id } = req.params;
    const { condition, remarks } = req.body;

    // Call stored procedure
    await pool.execute('CALL return_device(?, ?, ?)', [id, condition, remarks || null]);

    res.json({ message: 'Device returned successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Extend borrow period
exports.extendBorrow = async (req, res) => {
  try {
    const { id } = req.params;
    const { new_end_date } = req.body;

    const borrow = await BorrowRequest.findById(id);
    if (!borrow || borrow.student_id !== req.user.student_id) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    await pool.execute(
      `UPDATE borrow_requests SET borrow_end_date = ? WHERE borrow_id = ?`,
      [new_end_date, id]
    );

    res.json({ message: 'Borrow period extended successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get borrow details
exports.getBorrowDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const borrow = await BorrowRequest.findById(id);

    if (!borrow) {
      return res.status(404).json({ message: 'Borrow request not found' });
    }

    res.json(borrow);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};