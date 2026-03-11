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
// ================================================================
// CHANGES TO controllers/borrowController.js
// ================================================================
// At the top with other requires, add:
// const Waitlist = require('../models/Waitlist');
// ================================================================

// ================================
// POST /api/borrow/request
// UPDATED createBorrowRequest — handles both normal borrow
// and waitlist offer claim in one endpoint
//
// Flow:
//   Normal borrow:  device_status = 'Available'
//   Waitlist claim: device_status = 'Reserved' + student has active offer
//
// trg_before_borrow_insert now allows 'Reserved'
// if the student has an active waitlist offer
// ================================
exports.createBorrowRequest = async (req, res) => {
    try {
        const { device_id, borrow_start_date, borrow_end_date } = req.body;
        const student_id = req.user.student_id;

        if (!device_id)
            return res.status(400).json({ message: 'device_id is required' });

        // Check device status
        const [deviceRows] = await pool.execute(
            `SELECT device_status, device_name FROM devices WHERE device_id = ?`,
            [device_id]
        );
        if (!deviceRows[0])
            return res.status(404).json({ message: 'Device not found' });

        const { device_status, device_name } = deviceRows[0];

        // If device is Reserved, verify student has an active offer
        // trg_before_borrow_insert does this at DB level too,
        // but checking here gives a cleaner error message
        if (device_status === 'Reserved') {
            const hasOffer = await Waitlist.hasActiveOffer(student_id, device_id);
            if (!hasOffer) {
                return res.status(400).json({
                    message: 'This device is reserved for another student'
                });
            }
        } else if (device_status !== 'Available') {
            return res.status(400).json({
                message: `Device is not available for borrowing (status: ${device_status})`
            });
        }

        // Create the borrow request
        // trg_before_borrow_insert validates at DB level
        const result = await BorrowRequest.create({
            student_id,
            device_id,
            borrow_start_date: borrow_start_date || null,
            borrow_end_date:   borrow_end_date   || null
        });

        // If this was a waitlist offer being claimed, mark it fulfilled
        if (device_status === 'Reserved') {
            await Waitlist.markFulfilled(device_id, student_id);
        }

        res.status(201).json({
            message:    'Borrow request created successfully',
            borrow_id:  result.insertId,
            device_name,
            from_waitlist: device_status === 'Reserved'
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};