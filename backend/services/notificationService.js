// services/notificationService.js
const Notification = require('../models/Notification');

class NotificationService {
  // Send notification
  static async send(userId, entity, entityId, message, type = 'Info') {
    await Notification.create({
      user_id: userId,
      related_entity: entity,
      related_id: entityId,
      message,
      notification_type: type
    });
  }

  // Send bulk notifications
  static async sendBulk(userIds, entity, entityId, message, type = 'Info') {
    for (const userId of userIds) {
      await this.send(userId, entity, entityId, message, type);
    }
  }

  // Notify borrow approved
  static async notifyBorrowApproved(studentId, borrowId) {
    await this.send(studentId, 'borrow_request', borrowId, 'Your borrow request has been approved!', 'Info');
  }

  // Notify borrow rejected
  static async notifyBorrowRejected(studentId, borrowId) {
    await this.send(studentId, 'borrow_request', borrowId, 'Your borrow request has been rejected', 'Info');
  }

  // Notify fine applied
  static async notifyFineApplied(studentId, fineId, amount) {
    await this.send(studentId, 'fine', fineId, `A fine of ${amount} has been imposed`, 'Alert');
  }

  // Notify damage report
  static async notifyDamageReport(studentId, reportId) {
    await this.send(studentId, 'damage_report', reportId, 'A damage report has been filed against you', 'Alert');
  }

  // Notify waitlist available
  static async notifyWaitlistAvailable(studentId, deviceId) {
    await this.send(studentId, 'waitlist', deviceId, 'The device you requested is now available', 'Info');
  }
}

module.exports = NotificationService;