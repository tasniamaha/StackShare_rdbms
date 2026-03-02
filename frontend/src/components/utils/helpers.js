// D:\StackShare\frontend\src\components\utils\helpers.js

/**
 * Common utility/helper functions for the StackShare frontend
 * - Date formatting
 * - String & number formatting
 * - Validation
 * - Debounce / throttle
 * - Array/object helpers
 * - UI/UX helpers
 */

// ────────────────────────────────────────────────
// Date & Time Helpers
// ────────────────────────────────────────────────

/**
 * Format a date to readable string (e.g. "Feb 22, 2026")
 * @param {string|Date} date - date string or Date object
 * @param {string} [format='MMM D, YYYY'] - optional format
 * @returns {string}
 */
export const formatDate = (date, format = 'MMM D, YYYY') => {
  if (!date) return 'N/A';
  const d = new Date(date);
  if (isNaN(d.getTime())) return 'Invalid Date';

  const options = {
    'MMM D, YYYY': { month: 'short', day: 'numeric', year: 'numeric' },
    'MMM D, YYYY h:mm A': { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true },
    'YYYY-MM-DD': { year: 'numeric', month: '2-digit', day: '2-digit' },
  }[format] || { dateStyle: 'medium' };

  return new Intl.DateTimeFormat('en-US', options).format(d);
};

/**
 * Check if a date is in the past (overdue)
 * @param {string|Date} dueDate
 * @returns {boolean}
 */
export const isOverdue = (dueDate) => {
  if (!dueDate) return false;
  return new Date(dueDate) < new Date();
};

/**
 * Calculate days remaining until a date
 * @param {string|Date} dueDate
 * @returns {number} days left (negative if overdue)
 */
export const daysUntil = (dueDate) => {
  if (!dueDate) return 0;
  const diff = new Date(dueDate) - new Date();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
};

// ────────────────────────────────────────────────
// String & Number Formatting
// ────────────────────────────────────────────────

/**
 * Format currency (Bangladeshi Taka)
 * @param {number} amount
 * @returns {string} e.g. "৳1,200"
 */
export const formatCurrency = (amount) => {
  if (amount == null || isNaN(amount)) return '৳0';
  return `৳${Number(amount).toLocaleString('en-US')}`;
};

/**
 * Truncate long text with ellipsis
 * @param {string} text
 * @param {number} maxLength
 * @returns {string}
 */
export const truncateText = (text, maxLength = 100) => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3) + '...';
};

/**
 * Capitalize first letter of each word
 * @param {string} str
 * @returns {string}
 */
export const capitalizeWords = (str) => {
  if (!str) return '';
  return str
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

// ────────────────────────────────────────────────
// Validation Helpers
// ────────────────────────────────────────────────

/**
 * Validate email format
 * @param {string} email
 * @returns {boolean}
 */
export const isValidEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(String(email).toLowerCase());
};

/**
 * Validate password strength (min 8 chars, 1 uppercase, 1 number)
 * @param {string} password
 * @returns {boolean}
 */
export const isStrongPassword = (password) => {
  const re = /^(?=.*[A-Z])(?=.*\d).{8,}$/;
  return re.test(password);
};

/**
 * Check if value is empty (null, undefined, empty string, empty array)
 * @param {*} value
 * @returns {boolean}
 */
export const isEmpty = (value) => {
  if (value === null || value === undefined) return true;
  if (typeof value === 'string' && value.trim() === '') return true;
  if (Array.isArray(value) && value.length === 0) return true;
  if (typeof value === 'object' && Object.keys(value).length === 0) return true;
  return false;
};

// ────────────────────────────────────────────────
// Performance / UI Helpers
// ────────────────────────────────────────────────

/**
 * Debounce a function (e.g. for search input)
 * @param {Function} func
 * @param {number} wait - delay in ms
 * @returns {Function}
 */
export const debounce = (func, wait = 300) => {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

/**
 * Throttle a function (e.g. for scroll events)
 * @param {Function} func
 * @param {number} limit - ms between calls
 * @returns {Function}
 */
export const throttle = (func, limit = 100) => {
  let inThrottle;
  return (...args) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};

// ────────────────────────────────────────────────
// Array & Object Helpers
// ────────────────────────────────────────────────

/**
 * Group array items by key
 * @param {array} array
 * @param {string|Function} key
 * @returns {object}
 */
export const groupBy = (array, key) => {
  return array.reduce((result, item) => {
    const groupKey = typeof key === 'function' ? key(item) : item[key];
    result[groupKey] = result[groupKey] || [];
    result[groupKey].push(item);
    return result;
  }, {});
};

/**
 * Deep clone an object/array (simple version)
 * @param {*} obj
 * @returns {*}
 */
export const deepClone = (obj) => {
  return JSON.parse(JSON.stringify(obj));
};

// ────────────────────────────────────────────────
// UI / UX Helpers
// ────────────────────────────────────────────────

/**
 * Generate random neon glow color (for dynamic effects)
 * @returns {string} hex color
 */
export const getRandomNeonColor = () => {
  const colors = ['#00f8ff', '#ff00d9', '#c300ff', '#00ff9d', '#ffaa00'];
  return colors[Math.floor(Math.random() * colors.length)];
};

/**
 * Get status badge class based on status string
 * @param {string} status
 * @returns {string} class name
 */
export const getStatusClass = (status) => {
  const map = {
    available: 'status-available',
    borrowed: 'status-borrowed',
    pending: 'status-pending',
    overdue: 'status-overdue',
    approved: 'status-approved',
    rejected: 'status-rejected',
  };
  return map[status?.toLowerCase()] || 'status-default';
};

export default {
  formatDate,
  isOverdue,
  daysUntil,
  formatCurrency,
  truncateText,
  capitalizeWords,
  isValidEmail,
  isStrongPassword,
  isEmpty,
  debounce,
  throttle,
  groupBy,
  deepClone,
  getRandomNeonColor,
  getStatusClass,
};