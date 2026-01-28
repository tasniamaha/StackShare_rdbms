// models/BorrowRequest.js
const pool = require('../config/database');

class BorrowRequest {
  // Create a new borrow request
  static async create(borrowData) {
    const { student_id, device_id } = borrowData;
    
    const query = `
      INSERT INTO borrow_requests (student_id, device_id, request_date)
      VALUES (?, ?, CURDATE())
    `;
    
    const [result] = await pool.execute(query, [student_id, device_id]);
    return result;
  }

  // Find borrow request by ID
  static async findById(borrowId) {
    const query = `
      SELECT br.*, s.student_name, d.device_name, d.location
      FROM borrow_requests br
      JOIN students s ON br.student_id = s.student_id
      JOIN devices d ON br.device_id = d.device_id
      WHERE br.borrow_id = ?
    `;
    
    const [rows] = await pool.execute(query, [borrowId]);
    return rows[0] || null;
  }

  // Get active borrows for a student
  static async getActiveBorrows(studentId) {
    const query = `
      SELECT br.*, d.device_name, d.location
      FROM borrow_requests br
      JOIN devices d ON br.device_id = d.device_id
      WHERE br.student_id = ? AND br.borrow_status IN ('Borrowed', 'Overdue')
      ORDER BY br.borrow_end_date ASC
    `;
    
    const [rows] = await pool.execute(query, [studentId]);
    return rows;
  }

  // Get pending requests for owner
  static async getPendingApprovals(ownerId) {
    const query = `
      SELECT br.*, s.student_name, s.reputation_score, d.device_name
      FROM borrow_requests br
      JOIN students s ON br.student_id = s.student_id
      JOIN devices d ON br.device_id = d.device_id
      JOIN device_owners do ON d.device_id = do.device_id
      WHERE do.owner_id = ? AND br.approval_status = 'Pending'
      ORDER BY br.request_date ASC
    `;
    
    const [rows] = await pool.execute(query, [ownerId]);
    return rows;
  }

  // Get active lends for owner
  static async getActiveLends(ownerId) {
    const query = `
      SELECT br.*, s.student_name, d.device_name
      FROM borrow_requests br
      JOIN students s ON br.student_id = s.student_id
      JOIN devices d ON br.device_id = d.device_id
      JOIN device_owners do ON d.device_id = do.device_id
      WHERE do.owner_id = ? AND br.borrow_status IN ('Borrowed', 'Overdue')
      ORDER BY br.borrow_end_date ASC
    `;
    
    const [rows] = await pool.execute(query, [ownerId]);
    return rows;
  }

  // Get borrow history
  static async getBorrowHistory(studentId) {
    const query = `
      SELECT br.*, d.device_name
      FROM borrow_requests br
      JOIN devices d ON br.device_id = d.device_id
      WHERE br.student_id = ? AND br.borrow_status = 'Returned'
      ORDER BY br.return_date DESC
      LIMIT 20
    `;
    
    const [rows] = await pool.execute(query, [studentId]);
    return rows;
  }

  // Approve request
  static async approve(borrowId, approverId) {
    const query = `
      UPDATE borrow_requests
      SET approval_status = 'Approved', approved_by = ?, approved_at = NOW()
      WHERE borrow_id = ?
    `;
    
    const [result] = await pool.execute(query, [approverId, borrowId]);
    return result;
  }

  // Reject request
  static async reject(borrowId, approverId) {
    const query = `
      UPDATE borrow_requests
      SET approval_status = 'Rejected', approved_by = ?, approved_at = NOW()
      WHERE borrow_id = ?
    `;
    
    const [result] = await pool.execute(query, [approverId, borrowId]);
    return result;
  }

  // Update status
  static async updateStatus(borrowId, status) {
    const query = `UPDATE borrow_requests SET borrow_status = ? WHERE borrow_id = ?`;
    const [result] = await pool.execute(query, [status, borrowId]);
    return result;
  }

  // Check if already borrowed or pending
  static async hasActiveOrPending(studentId, deviceId) {
    const query = `
      SELECT borrow_id FROM borrow_requests
      WHERE student_id = ? AND device_id = ?
        AND (borrow_status IN ('Borrowed', 'Overdue') OR approval_status = 'Pending')
    `;
    
    const [rows] = await pool.execute(query, [studentId, deviceId]);
    return rows.length > 0;
  }

  // Get overdue borrows (for admin)
  static async getOverdueBorrows() {
    const [rows] = await pool.execute(
      `SELECT br.*, s.student_name, s.student_email, s.student_dept, d.device_name, d.device_category
       FROM borrow_requests br
       JOIN students s ON br.student_id = s.student_id
       JOIN devices d ON br.device_id = d.device_id
       WHERE br.borrow_status = 'Overdue'
       ORDER BY br.borrow_end_date ASC`
    );
    return rows;
  }

  // Get all pending requests (for admin)
  static async getPendingRequests() {
    const [rows] = await pool.execute(
      `SELECT br.*, s.student_name, s.student_email, s.student_dept, s.reputation_score, d.device_name, d.device_category
       FROM borrow_requests br
       JOIN students s ON br.student_id = s.student_id
       JOIN devices d ON br.device_id = d.device_id
       WHERE br.approval_status = 'Pending'
       ORDER BY br.request_date ASC`
    );
    return rows;
  }
}

module.exports = BorrowRequest;