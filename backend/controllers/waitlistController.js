// controllers/waitlistController.js
const Waitlist = require('../models/Waitlist');
const pool     = require('../config/database');

// ================================
// POST /api/waitlist/join
// DeviceDetails.js "Request to Borrow" button
// Only shown when device_status = 'Borrowed' or 'Reserved'
// Body: { device_id, priority_level? }
// ================================
exports.joinWaitlist = async (req, res) => {
    try {
        const { device_id, priority_level } = req.body;
        const student_id = req.user.student_id;

        if (!device_id)
            return res.status(400).json({ message: 'device_id is required' });

        // Check device exists and actually needs a waitlist
        const [deviceRows] = await pool.execute(
            `SELECT device_status, device_name FROM devices WHERE device_id = ?`,
            [device_id]
        );
        if (!deviceRows[0])
            return res.status(404).json({ message: 'Device not found' });
        if (deviceRows[0].device_status === 'Available')
            return res.status(400).json({ message: 'Device is available — borrow it directly' });

        // Check not already in queue (waiting or offered)
        const inWaitlist = await Waitlist.isInWaitlist(student_id, device_id);
        if (inWaitlist)
            return res.status(400).json({ message: 'Already in waitlist for this device' });

        const result = await Waitlist.add(device_id, student_id, priority_level || 0);

        // Get position in queue so borrower knows where they stand
        const queue    = await Waitlist.findByDevice(device_id);
        const position = queue.findIndex(w => w.student_id === student_id) + 1;

        res.status(201).json({
            message:     'Added to waitlist successfully',
            waitlist_id: result.insertId,
            position,
            total:       queue.length,
            device_name: deviceRows[0].device_name
        });
    } catch (error) {
        // UNIQUE KEY violation — race condition
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ message: 'Already in waitlist for this device' });
        }
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// ================================
// DELETE /api/waitlist/:id/leave
// DeviceDetails.js "Leave Waitlist" button
// If student was 'offered', advances queue to next person
// ================================
exports.leaveWaitlist = async (req, res) => {
    try {
        const { id }     = req.params;
        const student_id = req.user.student_id;

        // Ownership check — can't delete someone else's entry
        const entry = await Waitlist.findById(id);
        if (!entry)
            return res.status(404).json({ message: 'Waitlist entry not found' });
        if (entry.student_id !== student_id)
            return res.status(403).json({ message: 'Unauthorized' });

        await Waitlist.remove(id);

        // If they were 'offered', device is Reserved for them
        // Advance queue so next person gets their turn
        if (entry.status === 'offered') {
            await pool.execute(`CALL process_waitlist_next(?)`, [entry.device_id]);
        }

        res.json({ message: 'Removed from waitlist successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// ================================
// GET /api/waitlist/my-waitlist
// BorrowerDashboard "My Waitlists" section
// Shows all active waitlists for logged-in student
// 'offered' entries show countdown timer on frontend
// ================================
exports.getMyWaitlist = async (req, res) => {
    try {
        const waitlist = await Waitlist.findByStudent(req.user.student_id);

        // Add a flag the frontend can use to show "Borrow Now" button
        const withFlags = waitlist.map(entry => ({
            ...entry,
            is_your_turn: entry.status === 'offered',
            hours_remaining: entry.expires_at
                ? Math.max(0, Math.round(
                    (new Date(entry.expires_at) - new Date()) / (1000 * 60 * 60)
                  ))
                : null
        }));

        res.json(withFlags);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// ================================
// GET /api/waitlist/position/:deviceId
// DeviceDetails.js — show logged-in student's position
// Frontend uses this to decide which button to show:
//   status = 'waiting' → "You're in queue — position X of Y"
//   status = 'offered' → "Borrow Now" button + countdown
// ================================
exports.getWaitlistPosition = async (req, res) => {
    try {
        const { deviceId } = req.params;
        const student_id   = req.user.student_id;

        // findByDevice includes 'offered' so position is accurate
        const waitlist = await Waitlist.findByDevice(deviceId);
        const index    = waitlist.findIndex(w => w.student_id === student_id);

        if (index === -1)
            return res.status(404).json({ message: 'Not in waitlist for this device' });

        const entry = waitlist[index];

        res.json({
            position:        index + 1,
            total:           waitlist.length,
            status:          entry.status,
            is_your_turn:    entry.status === 'offered',
            offered_at:      entry.offered_at  || null,
            expires_at:      entry.expires_at  || null,
            hours_remaining: entry.expires_at
                ? Math.max(0, Math.round(
                    (new Date(entry.expires_at) - new Date()) / (1000 * 60 * 60)
                  ))
                : null
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// ================================
// GET /api/waitlist/device/:deviceId
// Used internally — public queue view
// Owner uses /api/owner/devices/:deviceId/waitlist instead
// which includes ownership check
// ================================
exports.getWaitlistByDevice = async (req, res) => {
    try {
        const waitlist = await Waitlist.findByDevice(req.params.deviceId);
        res.json(waitlist);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};