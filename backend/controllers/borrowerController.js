// controllers/borrowerController.js
const BorrowRequest = require("../models/BorrowRequest");
const Notification = require("../models/Notification");
const FineReport = require("../models/FineReport");
const RecommendationService = require("../services/recommendationService");
const pool = require("../config/database");

// ================================
// GET /api/borrower/dashboard
// BorrowerDashboard.js main data load
// ================================
exports.getDashboard = async (req, res) => {
  try {
    const student_id = req.user.student_id;

    // Active borrows for BorrowedItemCard.js
    const activeBorrows = await BorrowRequest.getActiveBorrows(student_id);

    // Upcoming returns — 3 days matches send_return_reminders cursor
    const [upcomingReturns] = await pool.execute(
      `SELECT br.borrow_id, br.device_id, br.borrow_end_date,
                    br.borrow_status,
                    d.device_name, d.location, d.image_url,
                    DATEDIFF(br.borrow_end_date, CURDATE()) AS days_remaining
             FROM borrow_requests br
             JOIN devices d ON br.device_id = d.device_id
             WHERE br.student_id = ?
               AND br.borrow_status = 'Borrowed'
               AND br.borrow_end_date BETWEEN CURDATE()
                   AND DATE_ADD(CURDATE(), INTERVAL 3 DAY)
             ORDER BY br.borrow_end_date ASC`,
      [student_id],
    );

    // Unread notifications for bell icon
    const notifications = await Notification.getUnread(student_id);

    // Total unpaid fines
    const totalFines = await FineReport.getTotalByStudent(student_id);

    // Student status flags for dashboard header
    const [studentRows] = await pool.execute(
      `SELECT reputation_score, is_restricted, has_violations,
                    borrow_status, can_borrow, can_lend
             FROM students WHERE student_id = ?`,
      [student_id],
    );
    const studentStatus = studentRows[0] || {};

    res.json({
      activeBorrows,
      upcomingReturns,
      notifications,
      totalFines,
      reputation_score: studentStatus.reputation_score,
      is_restricted: studentStatus.is_restricted,
      has_violations: studentStatus.has_violations,
      borrow_status: studentStatus.borrow_status,
      can_borrow: studentStatus.can_borrow,
      can_lend: studentStatus.can_lend,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ================================
// GET /api/borrower/active-borrows
// BorrowerDashboard BorrowedItemCard.js
// ================================
exports.getActiveBorrows = async (req, res) => {
  try {
    const activeBorrows = await BorrowRequest.getActiveBorrows(
      req.user.student_id,
    );
    res.json(activeBorrows);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ================================
// GET /api/borrower/history
// BorrowerDashboard borrow history modal
// Calls get_student_borrow_history stored procedure via model
// ================================
exports.getBorrowHistory = async (req, res) => {
  try {
    const history = await BorrowRequest.getBorrowHistory(req.user.student_id);
    res.json(history);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ================================
// GET /api/borrower/upcoming-returns
// BorrowerDashboard return reminders
// ================================
exports.getUpcomingReturns = async (req, res) => {
  try {
    const [returns] = await pool.execute(
      `SELECT br.borrow_id, br.device_id, br.borrow_end_date,
                    br.borrow_status,
                    d.device_name, d.location, d.image_url,
                    DATEDIFF(br.borrow_end_date, CURDATE()) AS days_remaining
             FROM borrow_requests br
             JOIN devices d ON br.device_id = d.device_id
             WHERE br.student_id = ?
               AND br.borrow_status = 'Borrowed'
               AND br.borrow_end_date BETWEEN CURDATE()
                   AND DATE_ADD(CURDATE(), INTERVAL 3 DAY)
             ORDER BY br.borrow_end_date ASC`,
      [req.user.student_id],
    );
    res.json(returns);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ================================
// GET /api/borrower/recommendations
// BorrowerDashboard recommendations section
// Rule-based: matches past borrow categories,
// excludes devices already borrowed/pending
// ================================
exports.getRecommendations = async (req, res) => {
  try {
    const student_id = req.user.student_id;
    const recommendations =
      await RecommendationService.getRecommendations(student_id);
    res.json(recommendations);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ================================
// GET /api/borrower/fines
// BorrowerDashboard fines modal
// ================================
exports.getFines = async (req, res) => {
  try {
    const fines = await FineReport.getMyFines(req.user.student_id);
    res.json(fines);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
