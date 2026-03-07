// routes/notificationRoutes.js
const express = require("express");
const router = express.Router();
const notificationController = require("../controllers/notificationController");
const authMiddleware = require("../middleware/authMiddleware");

// All routes require authentication
router.use(authMiddleware);

// ================================
// GET /api/notifications
// Notifications.js — full notification list for logged-in user
// student_id comes from JWT token in controller
// ================================
router.get("/", notificationController.getNotifications);

// ================================
// GET /api/notifications/unread
// Bell icon unread count in navbar
// Returns unread notifications for logged-in user
// ================================
router.get("/unread", notificationController.getUnreadNotifications);

// ================================
// GET /api/notifications/unread/count
// Fast endpoint for unread badge count
// Frontend bell icon notification count
// ================================
router.get("/unread/count", notificationController.getUnreadCount);

// ================================
// PUT /api/notifications/read-all
// Notifications.js "Mark all as read" button
// CRITICAL: must be BEFORE /:id/read to avoid Express
// matching 'read-all' as an :id parameter
// ================================
router.put("/read-all", notificationController.markAllAsRead);

// ================================
// PATCH /api/notifications/read-all
// Alternative PATCH method for marking all as read
// Supports frontend notification.api.js compatibility
// ================================
router.patch("/read-all", notificationController.markAllAsRead);

// ================================
// PUT /api/notifications/:id/read
// Notifications.js — mark single notification as read
// on click
// ================================
router.put("/:id/read", notificationController.markAsRead);

// ================================
// PATCH /api/notifications/:id/read
// Alternative PATCH method for marking notification as read
// Supports frontend notification.api.js compatibility
// ================================
router.patch("/:id/read", notificationController.markAsRead);

// ================================
// DELETE /api/notifications/:id
// Notifications.js — delete a notification
// ================================
router.delete("/:id", notificationController.deleteNotification);

// ================================
// DELETE /api/notifications
// Clear all notifications (or only read notifications)
// Query param: ?onlyRead=true to delete only read ones
// ================================
router.delete("/", notificationController.clearNotifications);

module.exports = router;
