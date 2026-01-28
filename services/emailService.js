// services/emailService.js
const nodemailer = require('nodemailer');
const config = require('../config/config');

// Create transporter
const transporter = nodemailer.createTransport({
  host: config.EMAIL_HOST,
  port: config.EMAIL_PORT,
  secure: false,
  auth: {
    user: config.EMAIL_USER,
    pass: config.EMAIL_PASSWORD
  }
});

class EmailService {
  // Send email
  static async send(to, subject, text, html) {
    if (!config.EMAIL_USER) return; // Skip if email not configured

    try {
      await transporter.sendMail({
        from: config.EMAIL_USER,
        to,
        subject,
        text,
        html
      });
      console.log(`✅ Email sent to ${to}`);
    } catch (error) {
      console.error('❌ Email error:', error.message);
    }
  }

  // Send borrow approved email
  static async sendBorrowApproved(email, deviceName) {
    await this.send(
      email,
      'Borrow Request Approved',
      `Your borrow request for ${deviceName} has been approved!`,
      `<p>Your borrow request for <strong>${deviceName}</strong> has been approved!</p>`
    );
  }

  // Send fine notification email
  static async sendFineNotification(email, amount, reason) {
    await this.send(
      email,
      'Fine Applied',
      `A fine of ${amount} has been imposed: ${reason}`,
      `<p>A fine of <strong>${amount}</strong> has been imposed.</p><p>Reason: ${reason}</p>`
    );
  }

  // Send overdue reminder email
  static async sendOverdueReminder(email, deviceName, dueDate) {
    await this.send(
      email,
      'Device Overdue Reminder',
      `Your borrowed device ${deviceName} is overdue (due: ${dueDate})`,
      `<p>Your borrowed device <strong>${deviceName}</strong> is overdue.</p><p>Due date: ${dueDate}</p>`
    );
  }
}

module.exports = EmailService;