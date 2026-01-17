// services/viewService.js
const pool = require('../config/database');

class ViewService {
  // Get active borrows
  static async getActiveBorrows() {
    const [rows] = await pool.execute('SELECT * FROM view_active_borrows');
    return rows;
  }

  // Get device availability
  static async getDeviceAvailability() {
    const [rows] = await pool.execute('SELECT * FROM view_device_availability');
    return rows;
  }

  // Get student reputation
  static async getStudentReputation() {
    const [rows] = await pool.execute('SELECT * FROM view_student_reputation');
    return rows;
  }

  // Get pending damages
  static async getPendingDamages() {
    const [rows] = await pool.execute('SELECT * FROM view_pending_damages');
    return rows;
  }

  // Get top borrowed devices
  static async getTopBorrowedDevices() {
    const [rows] = await pool.execute('SELECT * FROM view_top_borrowed_devices');
    return rows;
  }

  // Get overdue fines
  static async getOverdueFines() {
    const [rows] = await pool.execute('SELECT * FROM view_overdue_fines');
    return rows;
  }

  // Get pending notifications
  static async getPendingNotifications() {
    const [rows] = await pool.execute('SELECT * FROM view_pending_notifications');
    return rows;
  }
}

module.exports = ViewService;