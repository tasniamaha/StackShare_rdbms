// models/FineReport.js
const pool = require('../config/database');

class FineReport {
  // Create fine
  static async create(fineData) {
    const { borrow_id, student_id, reason, fine_amount, due_date, imposed_by } = fineData;
    
    const [result] = await pool.execute(
      `INSERT INTO fine_reports (borrow_id, student_id, reason, fine_amount, due_date, imposed_by)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [borrow_id, student_id, reason, fine_amount, due_date, imposed_by]
    );
    return result;
  }

  // Get fines by student
  static async findByStudent(studentId) {
    const [rows] = await pool.execute(
      `SELECT * FROM fine_reports
       WHERE student_id = ?
       ORDER BY imposed_date DESC`,
      [studentId]
    );
    return rows;
  }

  // Get overdue fines
  static async getOverdue() {
    const [rows] = await pool.execute(
      `SELECT fr.*, s.student_name
       FROM fine_reports fr
       JOIN students s ON fr.student_id = s.student_id
       WHERE fr.fine_status = 'Overdue'
       ORDER BY fr.due_date ASC`
    );
    return rows;
  }

  // Mark fine as paid
  static async markPaid(fineId) {
    const [result] = await pool.execute(
      `UPDATE fine_reports
       SET fine_status = 'Paid', paid_date = CURDATE()
       WHERE fine_id = ?`,
      [fineId]
    );
    return result;
  }

  // Waive fine
  static async waive(fineId) {
    const [result] = await pool.execute(
      `UPDATE fine_reports SET fine_status = 'Waived' WHERE fine_id = ?`,
      [fineId]
    );
    return result;
  }

  // Get total fines for student
  static async getTotalByStudent(studentId) {
    const [rows] = await pool.execute(
      `SELECT SUM(fine_amount) AS total_fines
       FROM fine_reports
       WHERE student_id = ? AND fine_status IN ('Pending', 'Overdue')`,
      [studentId]
    );
    return rows[0].total_fines || 0;
  }
}

module.exports = FineReport;