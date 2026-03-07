// utils/logger.js

class Logger {
  // Info log
  static info(message, data = '') {
    console.log(`ℹ️  [INFO] ${new Date().toISOString()} - ${message}`, data);
  }

  // Error log
  static error(message, error = '') {
    console.error(`❌ [ERROR] ${new Date().toISOString()} - ${message}`, error);
  }

  // Warning log
  static warn(message, data = '') {
    console.warn(`⚠️  [WARN] ${new Date().toISOString()} - ${message}`, data);
  }

  // Success log
  static success(message, data = '') {
    console.log(`✅ [SUCCESS] ${new Date().toISOString()} - ${message}`, data);
  }
}

module.exports = Logger;