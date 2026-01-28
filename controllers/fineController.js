// controllers/fineController.js
const FineReport = require('../models/FineReport');
const Notification = require('../models/Notification');
const pool = require('../config/database');

// Get fines by student
exports.getFinesByStudent = async (req, res) => {
  try {
    const { studentId } = req.params;
    const fines = await FineReport.findByStudent(studentId);
    res.json(fines);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get my fines
exports.getMyFines = async (req, res) => {
  try {
    const fines = await FineReport.findByStudent(req.user.student_id);
    res.json(fines);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Apply fine (Admin)
exports.applyFine = async (req, res) => {
  try {
    const { borrow_id, student_id, reason, fine_amount, due_date } = req.body;
    const imposed_by = req.user.student_id;

    // Call stored procedure
    await pool.execute(
      `CALL apply_fine(?, ?, ?, ?, ?, ?)`,
      [borrow_id, student_id, reason, fine_amount, imposed_by, due_date]
    );

    res.status(201).json({ message: 'Fine applied successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Pay fine
exports.payFine = async (req, res) => {
  try {
    const { id } = req.params;

    await FineReport.markPaid(id);

    // Notify student
    const [fine] = await pool.execute(
      `SELECT student_id FROM fine_reports WHERE fine_id = ?`,
      [id]
    );
    
    if (fine[0]) {
      await Notification.create({
        user_id: fine[0].student_id,
        related_entity: 'fine',
        related_id: id,
        message: 'Your fine payment has been confirmed',
        notification_type: 'Info'
      });
    }

    res.json({ message: 'Fine marked as paid' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Waive fine (Admin)
exports.waiveFine = async (req, res) => {
  try {
    const { id } = req.params;

    await FineReport.waive(id);

    // Notify student
    const [fine] = await pool.execute(
      `SELECT student_id FROM fine_reports WHERE fine_id = ?`,
      [id]
    );
    
    if (fine[0]) {
      await Notification.create({
        user_id: fine[0].student_id,
        related_entity: 'fine',
        related_id: id,
        message: 'Your fine has been waived',
        notification_type: 'Info'
      });
    }

    res.json({ message: 'Fine waived successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get overdue fines (Admin)
exports.getOverdueFines = async (req, res) => {
  try {
    const fines = await FineReport.getOverdue();
    res.json(fines);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};