// models/BroadcastRequest.js
const pool = require('../config/database');

class BroadcastRequest {
  // Create a new broadcast request
  static async create(broadcastData) {
    const { requester_id, item_type, description, urgency_level } = broadcastData;
    
    const query = `
      INSERT INTO broadcast_requests (requester_id, item_type, description, urgency_level)
      VALUES (?, ?, ?, ?)
    `;
    
    const [result] = await pool.execute(query, [
      requester_id,
      item_type,
      description || null,
      urgency_level || 'Low'
    ]);
    
    return result;
  }

  // Find broadcast by ID
  static async findById(broadcastId) {
    const query = `
      SELECT br.*,
             s.student_name, s.student_email, s.student_dept
      FROM broadcast_requests br
      JOIN students s ON br.requester_id = s.student_id
      WHERE br.broadcast_id = ?
    `;
    
    const [rows] = await pool.execute(query, [broadcastId]);
    return rows[0] || null;
  }

  // Get all open broadcasts
  static async getOpenBroadcasts() {
    const query = `
      SELECT br.*,
             s.student_name, s.student_email
      FROM broadcast_requests br
      JOIN students s ON br.requester_id = s.student_id
      WHERE br.status = 'Open'
      ORDER BY 
        CASE br.urgency_level
          WHEN 'High' THEN 1
          WHEN 'Medium' THEN 2
          WHEN 'Low' THEN 3
        END,
        br.created_at DESC
    `;
    
    const [rows] = await pool.execute(query);
    return rows;
  }

  // Get broadcasts by requester
  static async findByRequester(requesterId) {
    const query = `
      SELECT * FROM broadcast_requests
      WHERE requester_id = ?
      ORDER BY created_at DESC
    `;
    
    const [rows] = await pool.execute(query, [requesterId]);
    return rows;
  }

  // Update broadcast status
  static async updateStatus(broadcastId, newStatus) {
    const query = `
      UPDATE broadcast_requests
      SET status = ?
      WHERE broadcast_id = ?
    `;
    
    const [result] = await pool.execute(query, [newStatus, broadcastId]);
    return result;
  }

  // Cancel broadcast
  static async cancel(broadcastId) {
    return await this.updateStatus(broadcastId, 'Cancelled');
  }

  // Mark as fulfilled
  static async markFulfilled(broadcastId) {
    return await this.updateStatus(broadcastId, 'Fulfilled');
  }

  // Delete broadcast
  static async delete(broadcastId) {
    const query = `
      DELETE FROM broadcast_requests WHERE broadcast_id = ?
    `;
    
    const [result] = await pool.execute(query, [broadcastId]);
    return result;
  }

  // Get broadcasts with response count
  static async getWithResponseCount() {
    const query = `
      SELECT br.*,
             s.student_name,
             COUNT(bresp.response_id) AS response_count
      FROM broadcast_requests br
      JOIN students s ON br.requester_id = s.student_id
      LEFT JOIN broadcast_responses bresp ON br.broadcast_id = bresp.broadcast_id
      WHERE br.status = 'Open'
      GROUP BY br.broadcast_id
      ORDER BY br.created_at DESC
    `;
    
    const [rows] = await pool.execute(query);
    return rows;
  }
}

module.exports = BroadcastRequest;