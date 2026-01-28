// controllers/damageController.js
const pool = require('../config/database');
const Notification = require('../models/Notification');

// Report damage
exports.reportDamage = async (req, res) => {
  try {
    const { borrow_id, device_id, accused_student, damage_description } = req.body;
    const reported_by = req.user.student_id;
    const reported_by_role = req.body.reported_by_role || 'OWNER';

    const [result] = await pool.execute(
      `INSERT INTO damage_reports 
       (borrow_id, device_id, reported_by, reported_by_role, accused_student, damage_description)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [borrow_id, device_id, reported_by, reported_by_role, accused_student, damage_description]
    );

    // Notify accused student
    await Notification.create({
      user_id: accused_student,
      related_entity: 'damage_report',
      related_id: result.insertId,
      message: 'A damage report has been filed against you',
      notification_type: 'Alert'
    });

    res.status(201).json({
      message: 'Damage report submitted successfully',
      report_id: result.insertId
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get all damage reports
exports.getDamageReports = async (req, res) => {
  try {
    const [reports] = await pool.execute(
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
    
    res.json(reports);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get pending damage reports
exports.getPendingReports = async (req, res) => {
  try {
    const [reports] = await pool.execute(
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
    
    res.json(reports);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Review damage report (Admin)
exports.reviewReport = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    await pool.execute(
      `UPDATE damage_reports SET status = ? WHERE report_id = ?`,
      [status, id]
    );

    res.json({ message: 'Damage report status updated' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Resolve damage report (Admin)
exports.resolveReport = async (req, res) => {
  try {
    const { id } = req.params;
    const { admin_decision, fine_amount } = req.body;

    // Call stored procedure
    await pool.execute(
      `CALL process_damage_report(?, ?, ?)`,
      [id, admin_decision, fine_amount || 0]
    );

    res.json({ message: 'Damage report resolved successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};