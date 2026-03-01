// models/AuditLog.js
const pool = require('../config/database');

class AuditLog {
  // Create audit log
  static async create(table_name, record_id, action, performed_by) {
    const [result] = await pool.execute(
      `INSERT INTO audit_logs (table_name, record_id, action, performed_by)
       VALUES (?, ?, ?, ?)`,
      [table_name, record_id, action, performed_by]
    );
    return result;
  }

  // Get logs by table
  static async findByTable(tableName) {
    const [rows] = await pool.execute(
      `SELECT al.*, s.student_name
       FROM audit_logs al
       LEFT JOIN students s ON al.performed_by = s.student_id
       WHERE al.table_name = ?
       ORDER BY al.timestamp DESC
       LIMIT 100`,
      [tableName]
    );
    return rows;
  }

  // Get logs by user
  static async findByUser(userId) {
    const [rows] = await pool.execute(
      `SELECT * FROM audit_logs
       WHERE performed_by = ?
       ORDER BY timestamp DESC
       LIMIT 100`,
      [userId]
    );
    return rows;
  }

  // Get recent logs
  static async getRecent(limit = 50) {
    const [rows] = await pool.execute(
      `SELECT al.*, s.student_name
       FROM audit_logs al
       LEFT JOIN students s ON al.performed_by = s.student_id
       ORDER BY al.timestamp DESC
       LIMIT ?`,
      [limit]
    );
    return rows;
  }
}

module.exports = AuditLog;