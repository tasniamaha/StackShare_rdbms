// src/components/notifications/notification.api.js

import axios from 'axios';
import { getAuthHeader } from '../utils/authStorage'; // your auth helper

const API_BASE_URL = '/api/notifications'; // adjust if needed

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Automatically add Authorization header when token exists
api.interceptors.request.use((config) => {
  const authHeader = getAuthHeader();
  if (authHeader) {
    config.headers.Authorization = authHeader;
  }
  return config;
}, (error) => Promise.reject(error));

// ────────────────────────────────────────────────
// Notification API Functions
// ────────────────────────────────────────────────

/**
 * Get all notifications for the current user
 * @param {object} params - optional query params (page, limit, unreadOnly, type, etc.)
 * @returns {Promise<{ notifications: array, unreadCount: number, total: number }>}
 */
export const getNotifications = async (params = {}) => {
  try {
    const response = await api.get('/', { params });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch notifications' };
  }
};

/**
 * Get only unread notifications
 * @returns {Promise<array>} list of unread notifications
 */
export const getUnreadNotifications = async () => {
  try {
    const response = await api.get('/unread');
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch unread notifications' };
  }
};

/**
 * Get unread notification count (fast endpoint)
 * @returns {Promise<number>} number of unread notifications
 */
export const getUnreadCount = async () => {
  try {
    const response = await api.get('/unread/count');
    return response.data.count || 0;
  } catch (error) {
    console.error('Failed to get unread count:', error);
    return 0; // silent fail - don't break UI
  }
};

/**
 * Mark a single notification as read
 * @param {string|number} notificationId
 * @returns {Promise<object>} updated notification
 */
export const markAsRead = async (notificationId) => {
  try {
    const response = await api.patch(`/${notificationId}/read`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to mark notification as read' };
  }
};

/**
 * Mark all notifications as read
 * @returns {Promise<void>}
 */
export const markAllAsRead = async () => {
  try {
    await api.patch('/read-all');
  } catch (error) {
    throw error.response?.data || { message: 'Failed to mark all as read' };
  }
};

/**
 * Delete a single notification
 * @param {string|number} notificationId
 * @returns {Promise<void>}
 */
export const deleteNotification = async (notificationId) => {
  try {
    await api.delete(`/${notificationId}`);
  } catch (error) {
    throw error.response?.data || { message: 'Failed to delete notification' };
  }
};

/**
 * Delete all notifications (or all read ones)
 * @param {object} options - { onlyRead: true }
 * @returns {Promise<void>}
 */
export const clearNotifications = async (options = {}) => {
  try {
    const params = options.onlyRead ? { onlyRead: true } : {};
    await api.delete('/', { params });
  } catch (error) {
    throw error.response?.data || { message: 'Failed to clear notifications' };
  }
};

/**
 * Get notifications of a specific type (borrow_request, damage_report, fine, etc.)
 * @param {string} type - notification type
 * @returns {Promise<array>}
 */
export const getNotificationsByType = async (type) => {
  try {
    const response = await api.get('/', { params: { type } });
    return response.data.notifications || [];
  } catch (error) {
    throw error.response?.data || { message: `Failed to fetch ${type} notifications` };
  }
};

export default {
  getNotifications,
  getUnreadNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  clearNotifications,
  getNotificationsByType,
};