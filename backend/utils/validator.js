// utils/validator.js

class Validator {
  // Validate email
  static isEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  // Validate password strength
  static isStrongPassword(password) {
    return password.length >= 6;
  }

  // Validate student ID format
  static isValidStudentId(id) {
    return /^[A-Z0-9]{3,10}$/.test(id);
  }

  // Validate phone number
  static isPhone(phone) {
    return /^[0-9]{10,15}$/.test(phone);
  }

  // Check if empty
  static isEmpty(value) {
    return value === undefined || value === null || value === '';
  }

  // Validate date format (YYYY-MM-DD)
  static isDate(date) {
    return /^\d{4}-\d{2}-\d{2}$/.test(date) && !isNaN(Date.parse(date));
  }

  // Validate number range
  static isInRange(value, min, max) {
    return value >= min && value <= max;
  }
}

module.exports = Validator;