// models/Waitlist.js
const pool = require('../config/database');

class Waitlist {

    // ================================
    // Find single entry by ID
    // Used by leaveWaitlist ownership check
    // ================================
    static async findById(waitlistId) {
        const [rows] = await pool.execute(
            `SELECT w.*, d.device_name, d.device_status
             FROM waitlist w
             JOIN devices d ON w.device_id = d.device_id
             WHERE w.waitlist_id = ?`,
            [waitlistId]
        );
        return rows[0] || null;
    }

    // ================================
    // Add student to waitlist
    // UNIQUE KEY uk_device_student prevents duplicates at DB level
    // ================================
    static async add(device_id, student_id) {
        const [result] = await pool.execute(
            `INSERT INTO waitlist (device_id, student_id)
             VALUES (?, ?)`,
            [device_id, student_id]
        );
        return result;
    }

    // ================================
    // Remove from waitlist
    // ================================
    static async remove(waitlistId) {
        const [result] = await pool.execute(
            `DELETE FROM waitlist WHERE waitlist_id = ?`,
            [waitlistId]
        );
        return result;
    }

    // ================================
    // Get active queue for a device
    // Includes 'offered' so position calc is accurate
    // ================================
    static async findByDevice(deviceId) {
        const [rows] = await pool.execute(
            `SELECT w.waitlist_id, w.student_id, w.status,
                    w.request_time,
                    w.offered_at, w.expires_at,
                    s.student_name, s.student_email,
                    s.whatsapp_number
             FROM waitlist w
             JOIN students s ON w.student_id = s.student_id
             WHERE w.device_id = ?
               AND w.status IN ('waiting', 'offered')
             ORDER BY w.request_time ASC`,
            [deviceId]
        );
        return rows;
    }

    // ================================
    // Get all active waitlists for a student
    // Only waiting/offered — no expired/fulfilled clutter
    // BorrowerDashboard "My Waitlists" section
    // ================================
    static async findByStudent(studentId) {
        const [rows] = await pool.execute(
            `SELECT w.waitlist_id, w.device_id, w.status,
                    w.request_time,
                    w.offered_at, w.expires_at,
                    d.device_name, d.device_category,
                    d.device_status, d.image_url,
                    d.location, d.price_per_day
             FROM waitlist w
             JOIN devices d ON w.device_id = d.device_id
             WHERE w.student_id = ?
               AND w.status IN ('waiting', 'offered')
             ORDER BY w.request_time DESC`,
            [studentId]
        );
        return rows;
    }

    // ================================
    // Update status
    // Used by borrowController when offer is claimed
    // ================================
    static async updateStatus(waitlistId, status) {
        const [result] = await pool.execute(
            `UPDATE waitlist SET status = ? WHERE waitlist_id = ?`,
            [status, waitlistId]
        );
        return result;
    }

    // ================================
    // Mark waitlist entry as fulfilled
    // Called after borrower claims their offer
    // ================================
    static async markFulfilled(device_id, student_id) {
        const [result] = await pool.execute(
            `UPDATE waitlist
             SET status = 'fulfilled'
             WHERE device_id  = ?
               AND student_id = ?
               AND status     = 'offered'`,
            [device_id, student_id]
        );
        return result;
    }

    // ================================
    // Check if student already in active waitlist
    // Includes 'offered' — prevents rejoining mid-offer
    // ================================
    static async isInWaitlist(student_id, device_id) {
        const [rows] = await pool.execute(
            `SELECT waitlist_id FROM waitlist
             WHERE student_id = ?
               AND device_id  = ?
               AND status IN ('waiting', 'offered')`,
            [student_id, device_id]
        );
        return rows.length > 0;
    }

    // ================================
    // Check if student has an active offer for a device
    // Used by borrowController before creating request
    // ================================
    static async hasActiveOffer(student_id, device_id) {
        const [rows] = await pool.execute(
            `SELECT waitlist_id, expires_at FROM waitlist
             WHERE student_id = ?
               AND device_id  = ?
               AND status     = 'offered'
               AND expires_at > NOW()`,
            [student_id, device_id]
        );
        return rows.length > 0;
    }
}

module.exports = Waitlist;