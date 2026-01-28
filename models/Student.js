// models/Student.js
const pool = require('../config/database');

class Student {
  // Create student
  static async create(studentData) {
    const { student_id, student_name, student_email, student_dept, password_hash } = studentData;
    
    const [result] = await pool.execute(
      `INSERT INTO students (student_id, student_name, student_email, student_dept, password_hash)
       VALUES (?, ?, ?, ?, ?)`,
      [student_id, student_name, student_email, student_dept, password_hash]
    );
    return result;
  }

  // Find by ID
  static async findById(studentId) {
    const [rows] = await pool.execute(
      `SELECT student_id, student_name, student_email, student_dept, 
              reputation_score, borrow_status, suspended_until
       FROM students WHERE student_id = ?`,
      [studentId]
    );
    return rows[0] || null;
  }

  // Find by email (for login)
  static async findByEmail(email) {
    const [rows] = await pool.execute(
      `SELECT * FROM students WHERE student_email = ?`,
      [email]
    );
    return rows[0] || null;
  }

  // Update profile
  static async update(studentId, updateData) {
    const { student_name, student_email, student_dept } = updateData;
    
    const [result] = await pool.execute(
      `UPDATE students SET student_name = ?, student_email = ?, student_dept = ? WHERE student_id = ?`,
      [student_name, student_email, student_dept, studentId]
    );
    return result;
  }

  // Update reputation
  static async updateReputation(studentId, newScore) {
    const [result] = await pool.execute(
      `UPDATE students SET reputation_score = ? WHERE student_id = ?`,
      [newScore, studentId]
    );
    return result;
  }

  // Check if suspended
  static async isSuspended(studentId) {
    const [rows] = await pool.execute(
      `SELECT suspended_until FROM students WHERE student_id = ?`,
      [studentId]
    );
    
    if (!rows[0] || !rows[0].suspended_until) return false;
    
    return new Date(rows[0].suspended_until) > new Date();
  }

  // Suspend student
  static async suspend(studentId, untilDate) {
    const [result] = await pool.execute(
      `UPDATE students SET borrow_status = 'Suspended', suspended_until = ? WHERE student_id = ?`,
      [untilDate, studentId]
    );
    return result;
  }

  // Unsuspend student
  static async unsuspend(studentId) {
    const [result] = await pool.execute(
      `UPDATE students SET borrow_status = 'Active', suspended_until = NULL WHERE student_id = ?`,
      [studentId]
    );
    return result;
  }

  // Get all students
  static async findAll() {
    const [rows] = await pool.execute(
      `SELECT student_id, student_name, student_email, student_dept, 
              reputation_score, borrow_status, suspended_until
       FROM students ORDER BY student_name ASC`
    );
    return rows;
  }

  // Check if email exists
  static async emailExists(email) {
    const [rows] = await pool.execute(
      `SELECT student_id FROM students WHERE student_email = ?`,
      [email]
    );
    return rows.length > 0;
  }

  // Check if student ID exists
  static async studentIdExists(studentId) {
    const [rows] = await pool.execute(
      `SELECT student_id FROM students WHERE student_id = ?`,
      [studentId]
    );
    return rows.length > 0;
  }

  // Get student with stats
  static async getWithStats(studentId) {
    const [rows] = await pool.execute(
      `SELECT s.student_id, s.student_name, s.student_email, s.student_dept,
              s.reputation_score, s.borrow_status, s.suspended_until,
              COUNT(CASE WHEN br.borrow_status = 'Borrowed' THEN 1 END) AS active_borrows,
              COUNT(CASE WHEN br.borrow_status = 'Overdue' THEN 1 END) AS overdue_borrows,
              COUNT(CASE WHEN br.borrow_status = 'Returned' THEN 1 END) AS total_returns
       FROM students s
       LEFT JOIN borrow_requests br ON s.student_id = br.student_id
       WHERE s.student_id = ?
       GROUP BY s.student_id`,
      [studentId]
    );
    return rows[0] || null;
  }
}

module.exports = Student;