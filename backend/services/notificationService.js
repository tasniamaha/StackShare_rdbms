// services/notificationService.js
const Notification = require("../models/Notification");

/**
 * NotificationService — wraps Notification model
 * All notification_type values MUST match the ENUM in database schema:
 *   'borrow_request', 'borrow_approved', 'borrow_rejected', 'return_reminder',
 *   'damage_report', 'fine_issued', 'fine_paid', 'system', 'reputation_update'
 */
class NotificationService {
  /**
   * Generic send — use proper ENUM value for notification_type
   * @param {string} userId - student_id
   * @param {string} entity - related_entity (e.g. 'borrow_request', 'fine', 'device')
   * @param {number} entityId - related_id (e.g. borrow_id, fine_id, device_id)
   * @param {string} message - notification text
   * @param {string} type - MUST be a valid ENUM value from schema
   */
  static async send(userId, entity, entityId, message, type) {
    if (!type) {
      throw new Error(
        "notification_type is required and must match database ENUM",
      );
    }
    await Notification.create({
      user_id: userId,
      related_entity: entity,
      related_id: entityId,
      message,
      notification_type: type,
    });
  }

  /**
   * Send bulk notifications with same message and type
   */
  static async sendBulk(userIds, entity, entityId, message, type) {
    for (const userId of userIds) {
      await this.send(userId, entity, entityId, message, type);
    }
  }

  /**
   * Notify borrow request approved
   */
  static async notifyBorrowApproved(studentId, borrowId) {
    await this.send(
      studentId,
      "borrow_request",
      borrowId,
      "Your borrow request has been approved!",
      "borrow_approved",
    );
  }

  /**
   * Notify borrow request rejected
   */
  static async notifyBorrowRejected(studentId, borrowId) {
    await this.send(
      studentId,
      "borrow_request",
      borrowId,
      "Your borrow request has been rejected",
      "borrow_rejected",
    );
  }

  /**
   * Notify fine imposed
   */
  static async notifyFineApplied(studentId, fineId, amount) {
    await this.send(
      studentId,
      "fine",
      fineId,
      `A fine of ${amount} has been imposed`,
      "fine_issued",
    );
  }

  /**
   * Notify damage report filed
   */
  static async notifyDamageReport(studentId, reportId) {
    await this.send(
      studentId,
      "damage_report",
      reportId,
      "A damage report has been filed against you",
      "damage_report",
    );
  }

  /**
   * Notify waitlist item available (using generic 'system' type since DB has no specific waitlist type)
   */
  static async notifyWaitlistAvailable(studentId, deviceId) {
    await this.send(
      studentId,
      "device",
      deviceId,
      "The device you requested is now available",
      "system",
    );
  }

  /**
   * Notify fine paid (used when a fine is marked as paid)
   */
  static async notifyFinePaid(studentId, fineId) {
    await this.send(
      studentId,
      "fine",
      fineId,
      "Your fine has been marked as paid",
      "fine_paid",
    );
  }

  /**
   * Notify return reminder (used by job/procedure to remind of upcoming returns)
   */
  static async notifyReturnReminder(studentId, borrowId) {
    await this.send(
      studentId,
      "borrow_request",
      borrowId,
      "Reminder: You have a device to return soon",
      "return_reminder",
    );
  }

  /**
   * Notify reputation change (used when reputation score updates)
   */
  static async notifyReputationUpdate(studentId, change) {
    await this.send(
      studentId,
      "student",
      0,
      `Your reputation score changed by ${change}`,
      "reputation_update",
    );
  }
}

module.exports = NotificationService;
