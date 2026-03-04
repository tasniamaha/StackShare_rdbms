// models/AuditLog.js
const pool = require("../config/database");

class AuditLog {
  // Create audit log
  static async create(table_name, record_id, action, performed_by) {
    // Validate required parameters
    if (!table_name) {
      throw new Error("table_name is required for audit log");
    }
    if (record_id === null || record_id === undefined || record_id === "") {
      throw new Error("record_id is required for audit log");
    }
    if (!action) {
      throw new Error("action is required for audit log");
    }
    if (!performed_by) {
      throw new Error(
        "performed_by is required for audit log (user must be identified)",
      );
    }

    try {
      const [result] = await pool.execute(
        `INSERT INTO audit_logs (table_name, record_id, action, performed_by)
         VALUES (?, ?, ?, ?)`,
        [table_name, String(record_id), action, performed_by],
      );
      return result;
    } catch (error) {
      throw new Error(`Failed to create audit log: ${error.message}`);
    }
  }

  // Get logs by table
  static async findByTable(tableName) {
    if (!tableName) {
      throw new Error("tableName is required");
    }

    try {
      const [rows] = await pool.execute(
        `SELECT al.*, s.student_name
         FROM audit_logs al
         LEFT JOIN students s ON al.performed_by = s.student_id
         WHERE al.table_name = ?
         ORDER BY al.timestamp DESC
         LIMIT 100`,
        [tableName],
      );
      return rows;
    } catch (error) {
      throw new Error(
        `Failed to fetch audit logs for table ${tableName}: ${error.message}`,
      );
    }
  }

  // Get logs by user
  static async findByUser(userId) {
    if (!userId) {
      throw new Error("userId is required");
    }

    try {
      const [rows] = await pool.execute(
        `SELECT * FROM audit_logs
         WHERE performed_by = ?
         ORDER BY timestamp DESC
         LIMIT 100`,
        [userId],
      );
      return rows;
    } catch (error) {
      throw new Error(
        `Failed to fetch audit logs for user ${userId}: ${error.message}`,
      );
    }
  }

  // Get recent logs
  static async getRecent(limit = 50) {
    if (typeof limit !== "number" || limit < 1) {
      throw new Error("limit must be a positive number");
    }

    try {
      const [rows] = await pool.execute(
        `SELECT al.*, s.student_name
         FROM audit_logs al
         LEFT JOIN students s ON al.performed_by = s.student_id
         ORDER BY al.timestamp DESC
         LIMIT ?`,
        [limit],
      );
      return rows;
    } catch (error) {
      throw new Error(`Failed to fetch recent audit logs: ${error.message}`);
    }
  }
}

module.exports = AuditLog;
