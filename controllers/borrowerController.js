// controllers/borrowerController.js
const BorrowRequest = require('../models/BorrowRequest');
const Notification = require('../models/Notification');
const FineReport = require('../models/FineReport');
const pool = require('../config/database');

// Get borrower dashboard
exports.getDashboard = async (req, res) => {
  try {
    const student_id = req.user.student_id;

    // Get active borrows
    const activeBorrows = await BorrowRequest.getActiveBorrows(student_id);

    // Get upcoming returns (next 7 days)
    const [upcomingReturns] = await pool.execute(
      `SELECT br.*, d.device_name
       FROM borrow_requests br
       JOIN devices d ON br.device_id = d.device_id
       WHERE br.student_id = ? AND br.borrow_status = 'Borrowed'
         AND br.borrow_end_date BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 7 DAY)
       ORDER BY br.borrow_end_date ASC`,
      [student_id]
    );

    // Get unread notifications
    const notifications = await Notification.getUnread(student_id);

    // Get pending fines
    const totalFines = await FineReport.getTotalByStudent(student_id);

    res.json({
      activeBorrows,
      upcomingReturns,
      notifications,
      totalFines
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get active borrows
exports.getActiveBorrows = async (req, res) => {
  try {
    const activeBorrows = await BorrowRequest.getActiveBorrows(req.user.student_id);
    res.json(activeBorrows);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get borrow history
exports.getBorrowHistory = async (req, res) => {
  try {
    const history = await BorrowRequest.getBorrowHistory(req.user.student_id);
    res.json(history);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get recommendations (rule-based)
exports.getRecommendations = async (req, res) => {
  try {
    const student_id = req.user.student_id;

    // Get categories from borrow history
    const [categories] = await pool.execute(
      `SELECT DISTINCT d.device_category
       FROM borrow_requests br
       JOIN devices d ON br.device_id = d.device_id
       WHERE br.student_id = ?
       LIMIT 3`,
      [student_id]
    );

    // Get available devices in those categories
    const categoryList = categories.map(c => c.device_category);
    
    let recommendations = [];
    if (categoryList.length > 0) {
      const placeholders = categoryList.map(() => '?').join(',');
      const [devices] = await pool.execute(
        `SELECT * FROM devices
         WHERE device_category IN (${placeholders})
           AND device_status = 'Available'
         ORDER BY borrow_count DESC
         LIMIT 10`,
        categoryList
      );
      recommendations = devices;
    } else {
      // If no history, show popular devices
      const [devices] = await pool.execute(
        `SELECT * FROM devices
         WHERE device_status = 'Available'
         ORDER BY borrow_count DESC
         LIMIT 10`
      );
      recommendations = devices;
    }

    res.json(recommendations);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get upcoming returns
exports.getUpcomingReturns = async (req, res) => {
  try {
    const [returns] = await pool.execute(
      `SELECT br.*, d.device_name, d.location
       FROM borrow_requests br
       JOIN devices d ON br.device_id = d.device_id
       WHERE br.student_id = ? AND br.borrow_status = 'Borrowed'
         AND br.borrow_end_date BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 7 DAY)
       ORDER BY br.borrow_end_date ASC`,
      [req.user.student_id]
    );
    
    res.json(returns);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};