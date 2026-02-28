// src/components/utils/constants.js

/**
 * Application-wide constants
 * - API endpoints / base paths
 * - UI / theme related values
 * - Role types
 * - Notification types
 * - Device categories
 * - Status enums
 * - Other magic strings / numbers
 */

// ────────────────────────────────────────────────
// API / Backend Related
// ────────────────────────────────────────────────

export const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export const AUTH_ENDPOINTS = {
  LOGIN: '/auth/login',
  REGISTER: '/auth/register',
  REFRESH_TOKEN: '/auth/refresh',
  LOGOUT: '/auth/logout',
  ME: '/auth/me',
};

export const DEVICE_ENDPOINTS = {
  BASE: '/devices',
  MY_DEVICES: '/devices/my-devices',
  SEARCH: '/devices/search',
  AVAILABILITY: (id) => `/devices/${id}/availability`,
};

export const BORROW_ENDPOINTS = {
  BASE: '/borrows',
  REQUEST: '/borrows/request',
  MY_BORROWS: '/borrows/my-borrows',
  APPROVE: (id) => `/borrows/${id}/approve`,
  REJECT: (id) => `/borrows/${id}/reject`,
};

export const NOTIFICATION_ENDPOINTS = {
  BASE: '/notifications',
  UNREAD: '/notifications/unread',
  UNREAD_COUNT: '/notifications/unread/count',
  MARK_READ: (id) => `/notifications/${id}/read`,
  MARK_ALL_READ: '/notifications/read-all',
};

// ────────────────────────────────────────────────
// User Roles
// ────────────────────────────────────────────────

export const USER_ROLES = {
  STUDENT: 'student',
  OWNER:   'owner',
  ADMIN:   'admin',
  BOTH:    'both',      // user can borrow + lend
};

// ────────────────────────────────────────────────
// Device Status / Categories
// ────────────────────────────────────────────────

export const DEVICE_STATUS = {
  AVAILABLE: 'Available',
  BORROWED:  'Borrowed',
  MAINTENANCE: 'Maintenance',
  DAMAGED:   'Damaged',
  RESERVED:  'Reserved',
};

export const DEVICE_CATEGORIES = [
  'Laptop',
  'Tablet',
  'Camera',
  'Drone',
  'Audio',
  'Lighting',
  'Projector',
  'Microphone',
  'Accessories',
  'Other',
];

// ────────────────────────────────────────────────
// Notification Types
// ────────────────────────────────────────────────

export const NOTIFICATION_TYPES = {
  BORROW_REQUEST:    'borrow_request',
  BORROW_APPROVED:   'borrow_approved',
  BORROW_REJECTED:   'borrow_rejected',
  RETURN_REMINDER:   'return_reminder',
  DAMAGE_REPORT:     'damage_report',
  FINE_ISSUED:       'fine_issued',
  FINE_PAID:         'fine_paid',
  SYSTEM:            'system',
  REPUTATION_UPDATE: 'reputation_update',
};

// ────────────────────────────────────────────────
// UI / Theme Constants (cyberpunk/neon)
// ────────────────────────────────────────────────

export const THEME_COLORS = {
  neonCyan:    '#00f8ff',
  neonMagenta: '#ff00d9',
  neonPurple:  '#c300ff',
  neonGreen:   '#00ff9d',
  warning:     '#ffaa00',
  danger:      '#ff3366',
  success:     '#00ff9d',
  bgDark:      '#0a0014',
  textPrimary: '#f2fbff',
  textDim:     '#b0e0ff',
};

export const GLOW_SHADOWS = {
  cyan:  '0 0 20px rgba(0, 248, 255, 0.5)',
  magenta: '0 0 20px rgba(255, 0, 217, 0.5)',
  purple: '0 0 20px rgba(195, 0, 255, 0.5)',
};

export const BORDER_RADIUS = {
  sm: '8px',
  md: '12px',
  lg: '16px',
  pill: '999px',
};

export const TRANSITIONS = {
  fast:    '0.2s ease',
  normal:  '0.3s ease',
  smooth:  '0.5s cubic-bezier(0.22, 1, 0.36, 1)',
};

// ────────────────────────────────────────────────
// Pagination / Limits
// ────────────────────────────────────────────────

export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 12,
  MAX_PAGE_SIZE: 50,
};

// ────────────────────────────────────────────────
// Date / Time Formats
// ────────────────────────────────────────────────

export const DATE_FORMATS = {
  DISPLAY: 'MMM D, YYYY',
  DISPLAY_WITH_TIME: 'MMM D, YYYY h:mm A',
  API: 'YYYY-MM-DD',
};

// ────────────────────────────────────────────────
// Export everything as a single object (optional style)
export const CONSTANTS = {
  API_BASE_URL,
  AUTH_ENDPOINTS,
  DEVICE_ENDPOINTS,
  BORROW_ENDPOINTS,
  NOTIFICATION_ENDPOINTS,
  USER_ROLES,
  DEVICE_STATUS,
  DEVICE_CATEGORIES,
  NOTIFICATION_TYPES,
  THEME_COLORS,
  GLOW_SHADOWS,
  BORDER_RADIUS,
  TRANSITIONS,
  PAGINATION,
  DATE_FORMATS,
};

export default CONSTANTS;