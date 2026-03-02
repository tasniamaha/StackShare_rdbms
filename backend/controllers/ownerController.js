// controllers/ownerController.js
const Device = require('../models/Device');
const DeviceOwner = require('../models/DeviceOwner');
const BorrowRequest = require('../models/BorrowRequest');
const pool = require('../config/database');

// Get owner dashboard
exports.getDashboard = async (req, res) => {
  try {
    const owner_id = req.user.student_id;

    // Get owned devices
    const ownedDevices = await DeviceOwner.getDevicesByOwner(owner_id);

    // Get active lends
    const activeLends = await BorrowRequest.getActiveLends(owner_id);

    // Get pending approvals
    const pendingApprovals = await BorrowRequest.getPendingApprovals(owner_id);

    res.json({
      ownedDevices,
      activeLends,
      pendingApprovals
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get owned devices
exports.getOwnedDevices = async (req, res) => {
  try {
    const devices = await DeviceOwner.getDevicesByOwner(req.user.student_id);
    res.json(devices);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Add device
exports.addDevice = async (req, res) => {
  try {
    const { device_name, device_category, device_description, condition_status, location } = req.body;
    const owner_id = req.user.student_id;

    // Create device
    const result = await Device.create({
      device_name,
      device_category,
      device_description,
      condition_status,
      location
    });

    // Link owner to device
    await DeviceOwner.addOwner(owner_id, result.insertId);

    res.status(201).json({
      message: 'Device added successfully',
      device_id: result.insertId
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update device
exports.updateDevice = async (req, res) => {
  try {
    const { id } = req.params;
    const owner_id = req.user.student_id;

    // Check ownership
    const isOwner = await DeviceOwner.isOwner(owner_id, id);
    if (!isOwner) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    await Device.update(id, req.body);

    res.json({ message: 'Device updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Delete device
exports.deleteDevice = async (req, res) => {
  try {
    const { id } = req.params;
    const owner_id = req.user.student_id;

    // Check ownership
    const isOwner = await DeviceOwner.isOwner(owner_id, id);
    if (!isOwner) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    await Device.delete(id);

    res.json({ message: 'Device deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get active lends
exports.getActiveLends = async (req, res) => {
  try {
    const lends = await BorrowRequest.getActiveLends(req.user.student_id);
    res.json(lends);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get lend history
exports.getLendHistory = async (req, res) => {
  try {
    const [history] = await pool.execute(
      `SELECT br.*, s.student_name, d.device_name
       FROM borrow_requests br
       JOIN students s ON br.student_id = s.student_id
       JOIN devices d ON br.device_id = d.device_id
       JOIN device_owners do ON d.device_id = do.device_id
       WHERE do.owner_id = ? AND br.borrow_status = 'Returned'
       ORDER BY br.return_date DESC
       LIMIT 20`,
      [req.user.student_id]
    );
    
    res.json(history);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};