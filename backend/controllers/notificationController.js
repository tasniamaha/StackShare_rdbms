// controllers/notificationController.js
const Notification = require("../models/Notification");

// Get all notifications for user
exports.getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.findByUser(req.user.student_id);
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get unread notifications
exports.getUnreadNotifications = async (req, res) => {
  try {
    const notifications = await Notification.getUnread(req.user.student_id);
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Mark notification as read
exports.markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    await Notification.markAsRead(id);
    res.json({ message: "Notification marked as read" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Mark all as read
exports.markAllAsRead = async (req, res) => {
  try {
    await Notification.markAllAsRead(req.user.student_id);
    res.json({ message: "All notifications marked as read" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Delete notification
exports.deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;
    await Notification.delete(id);
    res.json({ message: "Notification deleted" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get unread notifications count (fast endpoint for badge)
exports.getUnreadCount = async (req, res) => {
  try {
    const count = await Notification.getUnreadCount(req.user.student_id);
    res.json({ count });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Clear all notifications (or only read ones)
exports.clearNotifications = async (req, res) => {
  try {
    const { onlyRead } = req.query;

    if (onlyRead === "true") {
      // Delete only read notifications
      await Notification.deleteByUserAndStatus(req.user.student_id, true);
    } else {
      // Delete all notifications for user
      await Notification.deleteByUser(req.user.student_id);
    }

    res.json({ message: "Notifications cleared" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
