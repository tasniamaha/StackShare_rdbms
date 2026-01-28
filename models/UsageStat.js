// models/UsageStat.js
const pool = require('../config/database');

class UsageStat {
  // Create or update usage stat
  static async upsert(student_id, device_id, hours_used) {
    const [result] = await pool.execute(
      `INSERT INTO usage_stats (student_id, device_id, hours_used, last_used)
       VALUES (?, ?, ?, NOW())
       ON DUPLICATE KEY UPDATE 
       hours_used = hours_used + ?, last_used = NOW()`,
      [student_id, device_id, hours_used, hours_used]
    );
    return result;
  }

  // Get usage by student
  static async findByStudent(studentId) {
    const [rows] = await pool.execute(
      `SELECT us.*, d.device_name, d.device_category
       FROM usage_stats us
       JOIN devices d ON us.device_id = d.device_id
       WHERE us.student_id = ?
       ORDER BY us.last_used DESC`,
      [studentId]
    );
    return rows;
  }

  // Get usage by device
  static async findByDevice(deviceId) {
    const [rows] = await pool.execute(
      `SELECT us.*, s.student_name
       FROM usage_stats us
       JOIN students s ON us.student_id = s.student_id
       WHERE us.device_id = ?
       ORDER BY us.hours_used DESC`,
      [deviceId]
    );
    return rows;
  }

  // Get total hours by student
  static async getTotalHoursByStudent(studentId) {
    const [rows] = await pool.execute(
      `SELECT SUM(hours_used) AS total_hours FROM usage_stats WHERE student_id = ?`,
      [studentId]
    );
    return rows[0].total_hours || 0;
  }
}

module.exports = UsageStat;