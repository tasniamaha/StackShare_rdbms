// models/Notification.js
const pool = require('../config/database');

class Notification {
  // Create notification
  static async create(notificationData) {
    const { user_id, related_entity, related_id, message, notification_type } = notificationData;
    
    const [result] = await pool.execute(
      `INSERT INTO notifications (user_id, related_entity, related_id, message, notification_type)
       VALUES (?, ?, ?, ?, ?)`,
      [user_id, related_entity, related_id, message, notification_type]
    );
    return result;
  }

  // Get notifications by user
  static async findByUser(userId) {
    const [rows] = await pool.execute(
      `SELECT * FROM notifications
       WHERE user_id = ?
       ORDER BY created_at DESC
       LIMIT 50`,
      [userId]
    );
    return rows;
  }

  // Get unread notifications
  static async getUnread(userId) {
    const [rows] = await pool.execute(
      `SELECT * FROM notifications
       WHERE user_id = ? AND is_read = FALSE
       ORDER BY created_at DESC`,
      [userId]
    );
    return rows;
  }

  // Mark as read
  static async markAsRead(notificationId) {
    const [result] = await pool.execute(
      `UPDATE notifications SET is_read = TRUE WHERE notification_id = ?`,
      [notificationId]
    );
    return result;
  }

  // Mark all as read for user
  static async markAllAsRead(userId) {
    const [result] = await pool.execute(
      `UPDATE notifications SET is_read = TRUE WHERE user_id = ?`,
      [userId]
    );
    return result;
  }

  // Delete notification
  static async delete(notificationId) {
    const [result] = await pool.execute(
      `DELETE FROM notifications WHERE notification_id = ?`,
      [notificationId]
    );
    return result;
  }
}

module.exports = Notification;