// services/procedureService.js
const pool = require('../config/database');

class ProcedureService {
  // Approve borrow request
  static async approveBorrowRequest(borrowId, approverId) {
    await pool.execute('CALL approve_borrow_request(?, ?)', [borrowId, approverId]);
  }

  // Return device
  static async returnDevice(borrowId, condition, remarks) {
    await pool.execute('CALL return_device(?, ?, ?)', [borrowId, condition, remarks || null]);
  }

  // Apply fine
  static async applyFine(borrowId, studentId, reason, amount, imposedBy, dueDate) {
    await pool.execute(
      'CALL apply_fine(?, ?, ?, ?, ?, ?)',
      [borrowId, studentId, reason, amount, imposedBy, dueDate]
    );
  }

  // Notify waitlist
  static async notifyWaitlist(deviceId) {
    await pool.execute('CALL notify_waitlist(?)', [deviceId]);
  }

  // Process damage report
  static async processDamageReport(reportId, adminDecision, fineAmount) {
    await pool.execute(
      'CALL process_damage_report(?, ?, ?)',
      [reportId, adminDecision, fineAmount]
    );
  }
}

module.exports = ProcedureService;