// models/Notification.js
const pool = require("../config/database");

class Notification {
  // ================================
  // Create notification
  // Called by: controllers directly (manual notifications)
  // Most notifications are auto-created by triggers:
  //   trg_notify_borrow_approved, apply_fine procedure,
  //   notify_waitlist procedure, send_return_reminders cursor
  // ================================
  static async create(notificationData) {
    const {
      user_id,
      related_entity,
      related_id,
      message,
      notification_type,
      title = null,
    } = notificationData;

    const [result] = await pool.execute(
      `INSERT INTO notifications 
                (user_id, related_entity, related_id, message, notification_type, title)
             VALUES (?, ?, ?, ?, ?, ?)`,
      [user_id, related_entity, related_id, message, notification_type, title],
    );
    return result;
  }

  // ================================
  // Get all notifications for a user
  // Called by: notificationController.getNotifications
  // Notifications.js full list
  // ================================
  static async findByUser(userId) {
    const [rows] = await pool.execute(
      `SELECT notification_id, user_id, title, message,
                    notification_type, related_entity, related_id,
                    is_read, created_at
             FROM notifications
             WHERE user_id = ?
             ORDER BY created_at DESC
             LIMIT 50`,
      [userId],
    );
    return rows;
  }

  // ================================
  // Get unread notifications
  // Called by: notificationController.getUnreadNotifications
  // Navbar bell icon unread count + dropdown
  // ================================
  static async getUnread(userId) {
    const [rows] = await pool.execute(
      `SELECT notification_id, user_id, title, message,
                    notification_type, related_entity, related_id,
                    is_read, created_at
             FROM notifications
             WHERE user_id = ? AND is_read = FALSE
             ORDER BY created_at DESC`,
      [userId],
    );
    return rows;
  }

  // ================================
  // Mark single notification as read
  // Called by: notificationController.markAsRead
  // Notifications.js on click
  // ================================
  static async markAsRead(notificationId) {
    const [result] = await pool.execute(
      `UPDATE notifications SET is_read = TRUE WHERE notification_id = ?`,
      [notificationId],
    );
    return result;
  }

  // ================================
  // Mark all notifications as read for user
  // Called by: notificationController.markAllAsRead
  // Notifications.js "Mark all as read" button
  // ================================
  static async markAllAsRead(userId) {
    const [result] = await pool.execute(
      `UPDATE notifications SET is_read = TRUE WHERE user_id = ?`,
      [userId],
    );
    return result;
  }

  // ================================
  // Delete notification
  // Called by: notificationController.deleteNotification
  // ================================
  static async delete(notificationId) {
    const [result] = await pool.execute(
      `DELETE FROM notifications WHERE notification_id = ?`,
      [notificationId],
    );
    return result;
  }

  // ================================
  // Get unread count for user (fast endpoint)
  // Called by: notificationController.getUnreadCount
  // Used for badge in navbar
  // ================================
  static async getUnreadCount(userId) {
    const [rows] = await pool.execute(
      `SELECT COUNT(*) AS count FROM notifications WHERE user_id = ? AND is_read = FALSE`,
      [userId],
    );
    return rows[0].count || 0;
  }

  // ================================
  // Delete all notifications for a user
  // Called by: notificationController.clearNotifications
  // ================================
  static async deleteByUser(userId) {
    const [result] = await pool.execute(
      `DELETE FROM notifications WHERE user_id = ?`,
      [userId],
    );
    return result;
  }

  // ================================
  // Delete read or unread notifications for a user
  // Called by: notificationController.clearNotifications
  // ================================
  static async deleteByUserAndStatus(userId, isRead) {
    const [result] = await pool.execute(
      `DELETE FROM notifications WHERE user_id = ? AND is_read = ?`,
      [userId, isRead],
    );
    return result;
  }
}

module.exports = Notification;
