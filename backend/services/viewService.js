// services/viewService.js
const pool = require('../config/database'); // ✅ fixed import

class ViewService {

  // ================================
  // BORROW VIEWS
  // ================================

  /**
   * All active borrows — AdminDashboard
   */
  static async getAllActiveBorrows() {
    try {
      const [rows] = await pool.execute('SELECT * FROM view_active_borrows');
      return rows;
    } catch (err) {
      throw new Error(`getAllActiveBorrows failed: ${err.message}`);
    }
  }

  /**
   * Active borrows for one student — BorrowerDashboard
   */
  static async getActiveBorrowsByStudent(studentId) {
    try {
      const [rows] = await pool.execute(
        'SELECT * FROM view_active_borrows WHERE student_id = ?',
        [studentId]
      );
      return rows;
    } catch (err) {
      throw new Error(`getActiveBorrowsByStudent failed: ${err.message}`);
    }
  }

  /**
   * Overdue borrows only — AdminDashboard overdue panel
   */
  static async getOverdueBorrows() {
    try {
      const [rows] = await pool.execute(
        "SELECT * FROM view_active_borrows WHERE borrow_status = 'Overdue' ORDER BY borrow_end_date ASC"
      );
      return rows;
    } catch (err) {
      throw new Error(`getOverdueBorrows failed: ${err.message}`);
    }
  }

  // ================================
  // DEVICE VIEWS
  // ================================

  /**
   * All devices with availability — DeviceList browse page
   */
  static async getDeviceAvailability() {
    try {
      const [rows] = await pool.execute('SELECT * FROM view_device_availability');
      return rows;
    } catch (err) {
      throw new Error(`getDeviceAvailability failed: ${err.message}`);
    }
  }

  /**
   * Available devices only — DeviceList default filter
   */
  static async getAvailableDevices() {
    try {
      const [rows] = await pool.execute(
        "SELECT * FROM view_device_availability WHERE device_status = 'Available'"
      );
      return rows;
    } catch (err) {
      throw new Error(`getAvailableDevices failed: ${err.message}`);
    }
  }

  /**
   * Single device availability — DeviceDetails.js
   */
  static async getDeviceAvailabilityById(deviceId) {
    try {
      const [rows] = await pool.execute(
        'SELECT * FROM view_device_availability WHERE device_id = ?',
        [deviceId]
      );
      return rows[0] || null;
    } catch (err) {
      throw new Error(`getDeviceAvailabilityById failed: ${err.message}`);
    }
  }

  /**
   * Top 5 most borrowed devices — AdminDashboard
   */
  static async getTopBorrowedDevices() {
    try {
      const [rows] = await pool.execute('SELECT * FROM view_top_borrowed_devices');
      return rows;
    } catch (err) {
      throw new Error(`getTopBorrowedDevices failed: ${err.message}`);
    }
  }

  // ================================
  // REPUTATION VIEWS
  // ================================

  /**
   * All student reputations — AdminDashboard student stats table
   */
  static async getAllStudentReputations() {
    try {
      const [rows] = await pool.execute('SELECT * FROM view_student_reputation');
      return rows;
    } catch (err) {
      throw new Error(`getAllStudentReputations failed: ${err.message}`);
    }
  }

  /**
   * Single student reputation — BorrowerDashboard / OwnerDashboard
   */
  static async getStudentReputationById(studentId) {
    try {
      const [rows] = await pool.execute(
        'SELECT * FROM view_student_reputation WHERE student_id = ?',
        [studentId]
      );
      return rows[0] || null;
    } catch (err) {
      throw new Error(`getStudentReputationById failed: ${err.message}`);
    }
  }

  // ================================
  // DAMAGE VIEWS
  // ================================

  /**
   * All damage reports under review — AdminDashboard complaints section
   */
  static async getPendingDamages() {
    try {
      const [rows] = await pool.execute('SELECT * FROM view_pending_damages');
      return rows;
    } catch (err) {
      throw new Error(`getPendingDamages failed: ${err.message}`);
    }
  }

  // ================================
  // FINE VIEWS
  // ================================

  /**
   * All overdue fines — AdminDashboard fines panel
   */
  static async getAllOverdueFines() {
    try {
      const [rows] = await pool.execute('SELECT * FROM view_overdue_fines');
      return rows;
    } catch (err) {
      throw new Error(`getAllOverdueFines failed: ${err.message}`);
    }
  }

  /**
   * Overdue fines for one student — BorrowerDashboard / OwnerDashboard fines modal
   */
  static async getOverdueFinesByStudent(studentId) {
    try {
      const [rows] = await pool.execute(
        'SELECT * FROM view_overdue_fines WHERE student_id = ?',
        [studentId]
      );
      return rows[0] || null;
    } catch (err) {
      throw new Error(`getOverdueFinesByStudent failed: ${err.message}`);
    }
  }

  // ================================
  // NOTIFICATION VIEWS
  // ================================

  /**
   * Unread notifications for one user — Notifications.js page
   */
  static async getPendingNotificationsByUser(userId) {
    try {
      const [rows] = await pool.execute(
        'SELECT * FROM view_pending_notifications WHERE user_id = ?',
        [userId]
      );
      return rows;
    } catch (err) {
      throw new Error(`getPendingNotificationsByUser failed: ${err.message}`);
    }
  }

  /**
   * Unread count only — bell badge in navbar
   */
  static async getUnreadCountByUser(userId) {
    try {
      const [rows] = await pool.execute(
        'SELECT COUNT(*) AS unread_count FROM view_pending_notifications WHERE user_id = ?',
        [userId]
      );
      return rows[0].unread_count;
    } catch (err) {
      throw new Error(`getUnreadCountByUser failed: ${err.message}`);
    }
  }

  /**
   * All unread notifications — AdminDashboard only
   */
  static async getAllPendingNotifications() {
    try {
      const [rows] = await pool.execute('SELECT * FROM view_pending_notifications');
      return rows;
    } catch (err) {
      throw new Error(`getAllPendingNotifications failed: ${err.message}`);
    }
  }
}

module.exports = ViewService;