// models/DeviceOwner.js
const pool = require('../config/database');

class DeviceOwner {
  // Add owner to device
  static async addOwner(owner_id, device_id) {
    const [result] = await pool.execute(
      `INSERT INTO device_owners (owner_id, device_id) VALUES (?, ?)`,
      [owner_id, device_id]
    );
    return result;
  }

  // Remove owner from device
  static async removeOwner(owner_id, device_id) {
    const [result] = await pool.execute(
      `DELETE FROM device_owners WHERE owner_id = ? AND device_id = ?`,
      [owner_id, device_id]
    );
    return result;
  }

  // Get all devices owned by a student
  static async getDevicesByOwner(owner_id) {
    const [rows] = await pool.execute(
      `SELECT d.* FROM devices d
       JOIN device_owners do ON d.device_id = do.device_id
       WHERE do.owner_id = ?`,
      [owner_id]
    );
    return rows;
  }

  // Get all owners of a device
  static async getOwnersByDevice(device_id) {
    const [rows] = await pool.execute(
      `SELECT s.student_id, s.student_name, s.student_email
       FROM students s
       JOIN device_owners do ON s.student_id = do.owner_id
       WHERE do.device_id = ?`,
      [device_id]
    );
    return rows;
  }

  // Check if student owns device
  static async isOwner(owner_id, device_id) {
    const [rows] = await pool.execute(
      `SELECT 1 FROM device_owners WHERE owner_id = ? AND device_id = ?`,
      [owner_id, device_id]
    );
    return rows.length > 0;
  }
}

module.exports = DeviceOwner;