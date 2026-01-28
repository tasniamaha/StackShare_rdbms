// models/DamageReport.js
const pool = require('../config/database');

class DamageReport {
  // Create damage report
  static async create(reportData) {
    const { borrow_id, device_id, reported_by, reported_by_role, accused_student, damage_description } = reportData;
    
    const [result] = await pool.execute(
      `INSERT INTO damage_reports (borrow_id, device_id, reported_by, reported_by_role, accused_student, damage_description)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [borrow_id, device_id, reported_by, reported_by_role, accused_student, damage_description]
    );
    return result;
  }

  // Find by ID
  static async findById(reportId) {
    const [rows] = await pool.execute(
      `SELECT dr.*, 
              s1.student_name AS reported_by_name, 
              s2.student_name AS accused_name, 
              d.device_name
       FROM damage_reports dr
       JOIN students s1 ON dr.reported_by = s1.student_id
       JOIN students s2 ON dr.accused_student = s2.student_id
       JOIN devices d ON dr.device_id = d.device_id
       WHERE dr.report_id = ?`,
      [reportId]
    );
    return rows[0] || null;
  }

  // Get all reports
  static async findAll() {
    const [rows] = await pool.execute(
      `SELECT dr.*, 
              s1.student_name AS reported_by_name, 
              s2.student_name AS accused_name, 
              d.device_name
       FROM damage_reports dr
       JOIN students s1 ON dr.reported_by = s1.student_id
       JOIN students s2 ON dr.accused_student = s2.student_id
       JOIN devices d ON dr.device_id = d.device_id
       ORDER BY dr.report_date DESC`
    );
    return rows;
  }

  // Get pending reports
  static async getPending() {
    const [rows] = await pool.execute(
      `SELECT dr.*, 
              s1.student_name AS reported_by_name, 
              s2.student_name AS accused_name, 
              d.device_name
       FROM damage_reports dr
       JOIN students s1 ON dr.reported_by = s1.student_id
       JOIN students s2 ON dr.accused_student = s2.student_id
       JOIN devices d ON dr.device_id = d.device_id
       WHERE dr.status IN ('Reported', 'Under_Review')
       ORDER BY dr.report_date ASC`
    );
    return rows;
  }

  // Update status
  static async updateStatus(reportId, status) {
    const [result] = await pool.execute(
      `UPDATE damage_reports SET status = ? WHERE report_id = ?`,
      [status, reportId]
    );
    return result;
  }

  // Get reports by student (accused)
  static async findByStudent(studentId) {
    const [rows] = await pool.execute(
      `SELECT dr.*, 
              s1.student_name AS reported_by_name, 
              d.device_name
       FROM damage_reports dr
       JOIN students s1 ON dr.reported_by = s1.student_id
       JOIN devices d ON dr.device_id = d.device_id
       WHERE dr.accused_student = ?
       ORDER BY dr.report_date DESC`,
      [studentId]
    );
    return rows;
  }

  // Get reports by device
  static async findByDevice(deviceId) {
    const [rows] = await pool.execute(
      `SELECT dr.*, 
              s1.student_name AS reported_by_name, 
              s2.student_name AS accused_name
       FROM damage_reports dr
       JOIN students s1 ON dr.reported_by = s1.student_id
       JOIN students s2 ON dr.accused_student = s2.student_id
       WHERE dr.device_id = ?
       ORDER BY dr.report_date DESC`,
      [deviceId]
    );
    return rows;
  }
}

module.exports = DamageReport;