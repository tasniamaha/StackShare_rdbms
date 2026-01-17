// models/BroadcastResponse.js
const pool = require('../config/database');

class BroadcastResponse {
  // Create response
  static async create(broadcast_id, responder_id, device_id) {
    const [result] = await pool.execute(
      `INSERT INTO broadcast_responses (broadcast_id, responder_id, device_id) VALUES (?, ?, ?)`,
      [broadcast_id, responder_id, device_id]
    );
    return result;
  }

  // Get responses for a broadcast
  static async findByBroadcast(broadcastId) {
    const [rows] = await pool.execute(
      `SELECT bresp.*, s.student_name, d.device_name
       FROM broadcast_responses bresp
       JOIN students s ON bresp.responder_id = s.student_id
       LEFT JOIN devices d ON bresp.device_id = d.device_id
       WHERE bresp.broadcast_id = ?`,
      [broadcastId]
    );
    return rows;
  }

  // Update response status
  static async updateStatus(responseId, status) {
    const [result] = await pool.execute(
      `UPDATE broadcast_responses SET status = ? WHERE response_id = ?`,
      [status, responseId]
    );
    return result;
  }
}

module.exports = BroadcastResponse;