// utils/auditLogger.js
const AuditLog = require('../models/AuditLog');

class AuditLogger {
  // Log action
  static async log(tableName, recordId, action, userId) {
    try {
      await AuditLog.create(tableName, recordId, action, userId);
    } catch (error) {
      console.error('Audit log error:', error.message);
    }
  }

  // Log insert
  static async logInsert(tableName, recordId, userId) {
    await this.log(tableName, recordId, 'INSERT', userId);
  }

  // Log update
  static async logUpdate(tableName, recordId, userId) {
    await this.log(tableName, recordId, 'UPDATE', userId);
  }

  // Log delete
  static async logDelete(tableName, recordId, userId) {
    await this.log(tableName, recordId, 'DELETE', userId);
  }
}

module.exports = AuditLogger;