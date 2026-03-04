// controllers/adminController.js
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Student = require("../models/Student");
const BorrowRequest = require("../models/BorrowRequest");
const DamageReport = require("../models/DamageReport");
const pool = require("../config/database");
const config = require("../config/config");

// ================================
// POST /api/admin/login
// ================================
exports.login = async (req, res) => {
  try {
    const { student_email, password } = req.body;

    const student = await Student.findByEmail(student_email);
    if (!student || student.role !== "admin") {
      return res.status(401).json({ message: "Invalid admin credentials" });
    }

    const isMatch = await bcrypt.compare(password, student.password_hash);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid admin credentials" });
    }

    const token = jwt.sign(
      {
        student_id: student.student_id,
        role: "admin",
        can_borrow: student.can_borrow,
        can_lend: student.can_lend,
      },
      config.JWT_SECRET,
      { expiresIn: config.JWT_EXPIRES_IN },
    );

    res.json({
      message: "Admin login successful",
      token,
      admin: {
        student_id: student.student_id,
        student_name: student.student_name,
        role: student.role,
        can_borrow: student.can_borrow,
        can_lend: student.can_lend,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ================================
// GET /api/admin/overdue-borrows
// AdminDashboard overdue panel
// ================================
exports.getOverdueBorrows = async (req, res) => {
  try {
    const overdue = await BorrowRequest.getOverdueBorrows();
    res.json(overdue);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ================================
// GET /api/admin/pending-approvals
// AdminDashboard pending approvals table
// ================================
exports.getPendingApprovals = async (req, res) => {
  try {
    const pending = await BorrowRequest.getPendingRequests();
    res.json(pending);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ================================
// GET /api/admin/student-stats
// AdminDashboard student table
// ================================
exports.getStudentStats = async (req, res) => {
  try {
    const [stats] = await pool.execute(
      `SELECT student_id, student_name, reputation_score,
                    is_restricted, has_violations, borrow_status,
                    active_borrows, overdue_borrows
             FROM view_student_reputation
             ORDER BY reputation_score DESC`,
    );
    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ================================
// GET /api/admin/system-stats
// AdminDashboard top stat cards
// ================================
exports.getSystemStats = async (req, res) => {
  try {
    const [stats] = await pool.execute(
      `SELECT
                (SELECT COUNT(*) FROM devices
                 WHERE device_status = 'Available')             AS available_devices,
                (SELECT COUNT(*) FROM devices
                 WHERE device_status = 'Borrowed')              AS borrowed_devices,
                (SELECT COUNT(*) FROM borrow_requests
                 WHERE borrow_status = 'Overdue')               AS overdue_borrows,
                (SELECT COUNT(*) FROM fine_reports
                 WHERE fine_status = 'Pending')                 AS pending_fines,
                (SELECT COUNT(*) FROM students
                 WHERE role = 'student')                        AS total_students,
                (SELECT COUNT(*) FROM students
                 WHERE borrow_status = 'Suspended')             AS suspended_users,
                (SELECT COUNT(*) FROM damage_reports
                 WHERE status = 'Under_Review')                 AS active_complaints`,
    );
    res.json(stats[0]);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ================================
// PUT /api/admin/students/:id/suspend
// Body: { suspended_until: 'YYYY-MM-DD' }
// ================================
exports.suspendStudent = async (req, res) => {
  try {
    const { suspended_until } = req.body;
    if (!suspended_until) {
      return res
        .status(400)
        .json({ message: "suspended_until date is required" });
    }
    await Student.suspend(req.params.id, suspended_until);
    res.json({ message: "Student suspended successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ================================
// PUT /api/admin/students/:id/unsuspend
// ================================
exports.unsuspendStudent = async (req, res) => {
  try {
    await Student.unsuspend(req.params.id);
    res.json({ message: "Student unsuspended successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ================================
// PUT /api/admin/students/:id/approve
// Sets borrow_status = 'Active'
// ================================
exports.approveUser = async (req, res) => {
  try {
    await pool.execute(
      `UPDATE students SET borrow_status = 'Active' WHERE student_id = ?`,
      [req.params.id],
    );
    res.json({ message: "User approved successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ================================
// DELETE /api/admin/students/:id/reject
// Deletes student — ON DELETE CASCADE cleans up their data
// ================================
exports.rejectUser = async (req, res) => {
  try {
    await pool.execute(`DELETE FROM students WHERE student_id = ?`, [
      req.params.id,
    ]);
    res.json({ message: "User rejected and deleted" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ================================
// GET /api/admin/complaints
// AdminDashboard complaints list
// Uses view_pending_damages
// ================================
exports.getComplaints = async (req, res) => {
  try {
    const complaints = await DamageReport.getPending();
    res.json(complaints);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ================================
// GET /api/admin/complaints/:id
// AdminDashboard complaint detail modal
// Returns: full damage report with images + student/device info
// ================================
exports.getComplaintById = async (req, res) => {
  try {
    const complaint = await DamageReport.findById(req.params.id);
    if (!complaint) {
      return res.status(404).json({ message: "Complaint not found" });
    }
    res.json(complaint);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ================================
// POST /api/admin/complaints/:id/decision
// AdminDashboard decision buttons
// Body: { decision, fine_amount }
// decision maps to ENUM:
//   'Borrower_At_Fault' | 'Owner_At_Fault' |
//   'No_Fault' | 'Split_Cost' | 'Request_More_Info'
// Calls process_damage_report procedure via DamageReport.resolve()
// ================================
exports.resolveComplaint = async (req, res) => {
  try {
    const { decision, fine_amount } = req.body;

    if (!decision) {
      return res.status(400).json({ message: "decision is required" });
    }

    await DamageReport.resolve(req.params.id, decision, fine_amount || 0);
    res.json({ message: "Complaint resolved successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
