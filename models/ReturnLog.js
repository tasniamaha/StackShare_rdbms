// models/ReturnLog.js
const pool = require('../config/database');

class ReturnLog {
  // Create return log
  static async create(borrow_id, device_id, condition_status, remarks) {
    const [result] = await pool.execute(
      `INSERT INTO return_logs (borrow_id, device_id, returned_at, condition_status, remarks)
       VALUES (?, ?, CURDATE(), ?, ?)`,
      [borrow_id, device_id, condition_status, remarks]
    );
    return result;
  }

  // Get return logs by borrow
  static async findByBorrow(borrowId) {
    const [rows] = await pool.execute(
      `SELECT * FROM return_logs WHERE borrow_id = ?`,
      [borrowId]
    );
    return rows;
  }

  // Get return logs by device
  static async findByDevice(deviceId) {
    const [rows] = await pool.execute(
      `SELECT rl.*, br.student_id, s.student_name
       FROM return_logs rl
       JOIN borrow_requests br ON rl.borrow_id = br.borrow_id
       JOIN students s ON br.student_id = s.student_id
       WHERE rl.device_id = ?
       ORDER BY rl.returned_at DESC`,
      [deviceId]
    );
    return rows;
  }
}

module.exports = ReturnLog;