// services/procedureService.js
const pool = require('../config/database');

class ProcedureService {

  // ================================
  // BORROW MANAGEMENT
  // ================================

  /**
   * Approve a borrow request
   * Calls: approve_borrow_request(borrowId, approverId)
   * Side effects: sets approval_status='Approved', updates device_status='Borrowed',
   *               fires trg_notify_borrow_approved trigger
   */
  static async approveBorrowRequest(borrowId, approverId) {
    try {
      await pool.execute('CALL approve_borrow_request(?, ?)', [borrowId, approverId]);
    } catch (err) {
      throw new Error(`approveBorrowRequest failed: ${err.message}`);
    }
  }

  /**
   * Get full borrow history of a student
   * Calls: get_student_borrow_history(studentId)
   * Returns: array of borrow records with device info, days_late, review
   */
  static async getBorrowHistory(studentId) {
    try {
      const [rows] = await pool.execute('CALL get_student_borrow_history(?)', [studentId]);
      return rows[0]; // stored procedures return results in rows[0]
    } catch (err) {
      throw new Error(`getBorrowHistory failed: ${err.message}`);
    }
  }

  // ================================
  // FINE MANAGEMENT
  // ================================

  /**
   * Apply a fine to a student for a borrow
   * Calls: apply_fine(borrowId, studentId, reason, amount, imposedBy, dueDate)
   * Side effects: inserts into fine_reports, sends notification to student
   * @param {string} imposedBy - student_id of admin imposing the fine, or 'ADMIN'
   * @param {string} dueDate   - format 'YYYY-MM-DD'
   */
  static async applyFine(borrowId, studentId, reason, amount, imposedBy, dueDate) {
    try {
      await pool.execute(
        'CALL apply_fine(?, ?, ?, ?, ?, ?)',
        [borrowId, studentId, reason, amount, imposedBy, dueDate]
      );
    } catch (err) {
      throw new Error(`applyFine failed: ${err.message}`);
    }
  }

  // ================================
  // DAMAGE MANAGEMENT
  // ================================

  /**
   * Process a damage report — sets admin decision, applies fine, marks resolved
   * Calls: process_damage_report(reportId, adminDecision, fineAmount)
   * Side effects: fires trg_penalize_reputation trigger, calls apply_fine internally
   * @param {string} adminDecision - one of: 'Borrower_At_Fault' | 'Owner_At_Fault' |
   *                                         'No_Fault' | 'Split_Cost' | 'Request_More_Info'
   * @param {number} fineAmount    - 0 if no fine
   */
  static async processDamageReport(reportId, adminDecision, fineAmount) {
    try {
      await pool.execute(
        'CALL process_damage_report(?, ?, ?)',
        [reportId, adminDecision, fineAmount]
      );
    } catch (err) {
      throw new Error(`processDamageReport failed: ${err.message}`);
    }
  }

  // ================================
  // WAITLIST MANAGEMENT
  // ================================

  /**
   * Notify the next student in the waitlist for a device
   * Calls: notify_waitlist(deviceId)
   * Side effects: sets device_status='Reserved', updates waitlist status='offered',
   *               sends notification to next student
   * Typically called after a device is returned (in borrow.controller.js)
   */
  static async notifyWaitlist(deviceId) {
    try {
      await pool.execute('CALL notify_waitlist(?)', [deviceId]);
    } catch (err) {
      throw new Error(`notifyWaitlist failed: ${err.message}`);
    }
  }

  // ================================
  // DEVICE OWNERSHIP
  // ================================

  /**
   * Assign a student as owner of a device
   * Calls: assign_device_owner(studentId, deviceId)
   * Side effects: inserts into device_owners table
   * Called after a new device is listed by an owner
   */
  static async assignDeviceOwner(studentId, deviceId) {
    try {
      await pool.execute('CALL assign_device_owner(?, ?)', [studentId, deviceId]);
    } catch (err) {
      throw new Error(`assignDeviceOwner failed: ${err.message}`);
    }
  }

  // ================================
  // SCHEDULED / SYSTEM
  // ================================

  /**
   * Send return reminder notifications for borrows due tomorrow
   * Calls: send_return_reminders()
   * Side effects: inserts return_reminder notifications for affected students
   * Should be called daily via a cron job (e.g. node-cron at 8:00 AM)
   *
   * Example cron setup in server.js:
   *   const cron = require('node-cron');
   *   cron.schedule('0 8 * * *', () => ProcedureService.sendReturnReminders());
   */
  static async sendReturnReminders() {
    try {
      await pool.execute('CALL send_return_reminders()');
    } catch (err) {
      throw new Error(`sendReturnReminders failed: ${err.message}`);
    }
  }
}

module.exports = ProcedureService;