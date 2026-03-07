// models/UsageStat.js
const pool = require('../config/database');

// ================================
// SCHEMA REQUIREMENT
// Add this constraint to stackshare_schema.sql before using this model:
//
// ALTER TABLE usage_stats
// ADD CONSTRAINT uq_usage_student_device
// UNIQUE (student_id, device_id);
//
// Without this, ON DUPLICATE KEY UPDATE won't work correctly.
// ================================

class UsageStat {

    // ================================
    // Create or update usage stat
    // Called by: borrowController.returnDevice (on return)
    // Requires UNIQUE(student_id, device_id) constraint on usage_stats
    // ================================
    static async upsert(student_id, device_id, hours_used) {
        const [result] = await pool.execute(
            `INSERT INTO usage_stats (student_id, device_id, hours_used, last_used)
             VALUES (?, ?, ?, NOW())
             ON DUPLICATE KEY UPDATE
                 hours_used = hours_used + ?,
                 last_used  = NOW()`,
            [student_id, device_id, hours_used, hours_used]
        );
        return result;
    }

    // ================================
    // Get usage stats by student
    // Called by: studentController.getWithStats
    // BorrowerDashboard usage breakdown
    // ================================
    static async findByStudent(studentId) {
        const [rows] = await pool.execute(
            `SELECT us.*,
                    d.device_name,
                    d.device_category
             FROM usage_stats us
             JOIN devices d ON us.device_id = d.device_id
             WHERE us.student_id = ?
             ORDER BY us.last_used DESC`,
            [studentId]
        );
        return rows;
    }

    // ================================
    // Get usage stats by device
    // Called by: deviceController.getDeviceById
    // DeviceDetails.js usage breakdown
    // ================================
    static async findByDevice(deviceId) {
        const [rows] = await pool.execute(
            `SELECT us.*,
                    s.student_name,
                    s.student_dept
             FROM usage_stats us
             JOIN students s ON us.student_id = s.student_id
             WHERE us.device_id = ?
             ORDER BY us.hours_used DESC`,
            [deviceId]
        );
        return rows;
    }

    // ================================
    // Get total hours used by student
    // Called by: borrowerController.getDashboard
    // BorrowerDashboard stats card
    // ================================
    static async getTotalHoursByStudent(studentId) {
        const [rows] = await pool.execute(
            `SELECT IFNULL(SUM(hours_used), 0) AS total_hours
             FROM usage_stats
             WHERE student_id = ?`,
            [studentId]
        );
        return rows[0].total_hours;
    }
}

module.exports = UsageStat;