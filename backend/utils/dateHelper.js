// utils/dateHelper.js

class DateHelper {
  // Format date to YYYY-MM-DD
  static formatDate(date) {
    return new Date(date).toISOString().split('T')[0];
  }

  // Check if date is overdue
  static isOverdue(date) {
    return new Date(date) < new Date();
  }

  // Add days to date
  static addDays(date, days) {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  }

  // Calculate days between dates
  static daysBetween(date1, date2) {
    const diff = new Date(date2) - new Date(date1);
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  }

  // Get current date (YYYY-MM-DD)
  static today() {
    return this.formatDate(new Date());
  }

  // Check if date is within range
  static isWithinDays(date, days) {
    const target = new Date(date);
    const future = this.addDays(new Date(), days);
    return target <= future && target >= new Date();
  }
}

module.exports = DateHelper;