// controllers/adminController.js
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Student = require('../models/Student');
const BorrowRequest = require('../models/BorrowRequest');
const pool = require('../config/database');
const config = require('../config/config');

// Admin login (students with admin role)
exports.login = async (req, res) => {
  try {
    const { student_email, password } = req.body;

    const student = await Student.findByEmail(student_email);
    if (!student || student.role !== 'admin') {  // ✅ ADD ROLE CHECK
      return res.status(401).json({ message: 'Invalid admin credentials' });
    }

    const isMatch = await bcrypt.compare(password, student.password_hash);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid admin credentials' });
    }

    // Generate token
    const token = jwt.sign(
      { student_id: student.student_id, role: 'admin' },
      config.JWT_SECRET,
      { expiresIn: config.JWT_EXPIRES_IN }
    );

    res.json({
      message: 'Admin login successful',
      token,
      admin: {
        student_id: student.student_id,
        student_name: student.student_name,
        role: student.role  // ✅ ADD ROLE TO RESPONSE
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get overdue borrows
exports.getOverdueBorrows = async (req, res) => {
  try {
    const overdue = await BorrowRequest.getOverdueBorrows();
    res.json(overdue);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get pending approvals
exports.getPendingApprovals = async (req, res) => {
  try {
    const pending = await BorrowRequest.getPendingRequests();
    res.json(pending);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get student stats
exports.getStudentStats = async (req, res) => {
  try {
    const [stats] = await pool.execute(
      `SELECT student_id, student_name, reputation_score, active_borrows, overdue_borrows
       FROM view_student_reputation
       ORDER BY reputation_score DESC`
    );
    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get system stats
exports.getSystemStats = async (req, res) => {
  try {
    const [stats] = await pool.execute(
      `SELECT 
        (SELECT COUNT(*) FROM devices WHERE device_status = 'Available') AS available_devices,
        (SELECT COUNT(*) FROM devices WHERE device_status = 'Borrowed') AS borrowed_devices,
        (SELECT COUNT(*) FROM borrow_requests WHERE borrow_status = 'Overdue') AS overdue_borrows,
        (SELECT COUNT(*) FROM fine_reports WHERE fine_status = 'Pending') AS pending_fines,
        (SELECT COUNT(*) FROM students) AS total_students`
    );
    res.json(stats[0]);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Suspend student
exports.suspendStudent = async (req, res) => {
  try {
    const { id } = req.params;
    const { suspended_until } = req.body;

    await Student.suspend(id, suspended_until);
    res.json({ message: 'Student suspended successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Unsuspend student
exports.unsuspendStudent = async (req, res) => {
  try {
    const { id } = req.params;

    await Student.unsuspend(id);
    res.json({ message: 'Student unsuspended successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};