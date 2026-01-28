// models/Waitlist.js
const pool = require('../config/database');

class Waitlist {
  // Add to waitlist
  static async add(device_id, student_id, priority_level = 0) {
    const [result] = await pool.execute(
      `INSERT INTO waitlist (device_id, student_id, priority_level)
       VALUES (?, ?, ?)`,
      [device_id, student_id, priority_level]
    );
    return result;
  }

  // Remove from waitlist
  static async remove(waitlistId) {
    const [result] = await pool.execute(
      `DELETE FROM waitlist WHERE waitlist_id = ?`,
      [waitlistId]
    );
    return result;
  }

  // Get waitlist by device
  static async findByDevice(deviceId) {
    const [rows] = await pool.execute(
      `SELECT w.*, s.student_name, s.student_email
       FROM waitlist w
       JOIN students s ON w.student_id = s.student_id
       WHERE w.device_id = ? AND w.status = 'waiting'
       ORDER BY w.priority_level DESC, w.request_time ASC`,
      [deviceId]
    );
    return rows;
  }

  // Get waitlist by student
  static async findByStudent(studentId) {
    const [rows] = await pool.execute(
      `SELECT w.*, d.device_name, d.device_category
       FROM waitlist w
       JOIN devices d ON w.device_id = d.device_id
       WHERE w.student_id = ?
       ORDER BY w.request_time DESC`,
      [studentId]
    );
    return rows;
  }

  // Update status
  static async updateStatus(waitlistId, status) {
    const [result] = await pool.execute(
      `UPDATE waitlist SET status = ? WHERE waitlist_id = ?`,
      [status, waitlistId]
    );
    return result;
  }

  // Check if student is in waitlist
  static async isInWaitlist(student_id, device_id) {
    const [rows] = await pool.execute(
      `SELECT waitlist_id FROM waitlist 
       WHERE student_id = ? AND device_id = ? AND status = 'waiting'`,
      [student_id, device_id]
    );
    return rows.length > 0;
  }
}

module.exports = Waitlist;