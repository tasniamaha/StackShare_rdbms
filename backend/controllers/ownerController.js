// controllers/ownerController.js
const Device = require("../models/Device");
const DeviceOwner = require("../models/DeviceOwner");
const BorrowRequest = require("../models/BorrowRequest");

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
      pendingApprovals,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get owned devices
exports.getOwnedDevices = async (req, res) => {
  try {
    const devices = await DeviceOwner.getDevicesByOwner(req.user.student_id);
    res.json(devices);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Add device
exports.addDevice = async (req, res) => {
  try {
    const {
      device_name,
      device_category,
      device_description,
      condition_status,
      location,
    } = req.body;
    const owner_id = req.user.student_id;

    // Create device
    const result = await Device.create({
      device_name,
      device_category,
      device_description,
      condition_status,
      location,
    });

    // Link owner to device
    await DeviceOwner.addOwner(owner_id, result.insertId);

    res.status(201).json({
      message: "Device added successfully",
      device_id: result.insertId,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
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
      return res.status(403).json({ message: "Unauthorized" });
    }

    await Device.update(id, req.body);

    res.json({ message: "Device updated successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
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
      return res.status(403).json({ message: "Unauthorized" });
    }

    await Device.delete(id);

    res.json({ message: "Device deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get active lends
exports.getActiveLends = async (req, res) => {
  try {
    const lends = await BorrowRequest.getActiveLends(req.user.student_id);
    res.json(lends);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get lend history
exports.getLendHistory = async (req, res) => {
  try {
    const history = await BorrowRequest.getLendHistoryByOwner(
      req.user.student_id,
    );
    res.json(history);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ================================================================
// ADD THESE TO controllers/ownerController.js
// ================================================================
// At the top with other requires, add:
// const Waitlist = require('../models/Waitlist');
// ================================================================

// ================================
// GET /api/owner/devices/:deviceId/waitlist
// OwnerDashboard — see who is queued for a specific device
// Only the device owner can see this
// Shows full queue with position, name, contact, time waiting
// ================================
exports.getDeviceWaitlist = async (req, res) => {
    try {
        const { deviceId } = req.params;
        const owner_id     = req.user.student_id;

        // Verify this student actually owns the device
        const [ownerCheck] = await pool.execute(
            `SELECT owner_id FROM device_owners
             WHERE device_id = ? AND owner_id = ?`,
            [deviceId, owner_id]
        );
        if (ownerCheck.length === 0)
            return res.status(403).json({ message: 'You do not own this device' });

        // Get device info
        const [deviceRows] = await pool.execute(
            `SELECT device_name, device_status FROM devices WHERE device_id = ?`,
            [deviceId]
        );
        if (!deviceRows[0])
            return res.status(404).json({ message: 'Device not found' });

        const waitlist = await Waitlist.findByDevice(deviceId);

        // Add position number and time-in-queue to each entry
        const queue = waitlist.map((entry, index) => ({
            position:       index + 1,
            waitlist_id:    entry.waitlist_id,
            student_id:     entry.student_id,
            student_name:   entry.student_name,
            student_email:  entry.student_email,
            whatsapp_number: entry.whatsapp_number,
            status:         entry.status,           // 'waiting' or 'offered'
            priority_level: entry.priority_level,
            request_time:   entry.request_time,
            offered_at:     entry.offered_at || null,
            expires_at:     entry.expires_at || null,
            // How long they have been waiting in hours
            hours_waiting:  Math.round(
                (new Date() - new Date(entry.request_time)) / (1000 * 60 * 60)
            )
        }));

        res.json({
            device_id:     parseInt(deviceId),
            device_name:   deviceRows[0].device_name,
            device_status: deviceRows[0].device_status,
            total:         queue.length,
            queue
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
