// models/BroadcastResponse.js
const pool = require('../config/database');

class BroadcastResponse {
  // Create a new response
  static async create(responseData) {
    const { broadcast_id, responder_id, device_id } = responseData;
    
    const query = `
      INSERT INTO broadcast_responses (broadcast_id, responder_id, device_id)
      VALUES (?, ?, ?)
    `;
    
    const [result] = await pool.execute(query, [broadcast_id, responder_id, device_id]);
    return result;
  }

  // Get all responses for a broadcast
  static async findByBroadcast(broadcastId) {
    const query = `
      SELECT bresp.*, 
             s.student_name, s.student_email,
             d.device_name, d.device_category
      FROM broadcast_responses bresp
      JOIN students s ON bresp.responder_id = s.student_id
      LEFT JOIN devices d ON bresp.device_id = d.device_id
      WHERE bresp.broadcast_id = ?
      ORDER BY bresp.response_time DESC
    `;
    
    const [rows] = await pool.execute(query, [broadcastId]);
    return rows;
  }

  // Get responses by responder
  static async findByResponder(responderId) {
    const query = `
      SELECT bresp.*, br.item_type, br.description
      FROM broadcast_responses bresp
      JOIN broadcast_requests br ON bresp.broadcast_id = br.broadcast_id
      WHERE bresp.responder_id = ?
      ORDER BY bresp.response_time DESC
    `;
    
    const [rows] = await pool.execute(query, [responderId]);
    return rows;
  }

  // Accept a response
  static async accept(responseId) {
    const query = `
      UPDATE broadcast_responses
      SET status = 'Accepted'
      WHERE response_id = ?
    `;
    
    const [result] = await pool.execute(query, [responseId]);
    return result;
  }

  // Reject a response
  static async reject(responseId) {
    const query = `
      UPDATE broadcast_responses
      SET status = 'Rejected'
      WHERE response_id = ?
    `;
    
    const [result] = await pool.execute(query, [responseId]);
    return result;
  }

  // Delete response
  static async delete(responseId) {
    const query = `DELETE FROM broadcast_responses WHERE response_id = ?`;
    const [result] = await pool.execute(query, [responseId]);
    return result;
  }
}

module.exports = BroadcastResponse;