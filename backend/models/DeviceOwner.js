// models/DeviceOwner.js
const pool = require('../config/database');

class DeviceOwner {

    // ================================
    // Add owner to device
    // Calls assign_device_owner procedure which validates:
    // student exists, device exists, not already owner
    // ================================
    static async addOwner(owner_id, device_id) {
        const [result] = await pool.execute(
            `CALL assign_device_owner(?, ?)`,
            [owner_id, device_id]
        );
        return result;
    }

    // ================================
    // Remove owner from device
    // Called by: ownerController.deleteDevice
    // ================================
    static async removeOwner(owner_id, device_id) {
        const [result] = await pool.execute(
            `DELETE FROM device_owners WHERE owner_id = ? AND device_id = ?`,
            [owner_id, device_id]
        );
        return result;
    }

    // ================================
    // Get all devices owned by a student
    // Called by: ownerController.getOwnedDevices
    // OwnerDashboard device management table
    // ================================
    static async getDevicesByOwner(owner_id) {
        const [rows] = await pool.execute(
            `SELECT d.*
             FROM devices d
             JOIN device_owners do2 ON d.device_id = do2.device_id
             WHERE do2.owner_id = ?
             ORDER BY d.device_name ASC`,
            [owner_id]
        );
        return rows;
    }

    // ================================
    // Get all owners of a device
    // Called by: deviceController.getDeviceById (DeviceDetails.js owner info)
    // ================================
    static async getOwnersByDevice(device_id) {
        const [rows] = await pool.execute(
            `SELECT s.student_id, s.student_name, s.student_email, s.whatsapp_number
             FROM students s
             JOIN device_owners do2 ON s.student_id = do2.owner_id
             WHERE do2.device_id = ?`,
            [device_id]
        );
        return rows;
    }

    // ================================
    // Check if student owns device
    // Called by: ownerController before update/delete
    // ================================
    static async isOwner(owner_id, device_id) {
        const [rows] = await pool.execute(
            `SELECT 1 FROM device_owners WHERE owner_id = ? AND device_id = ?`,
            [owner_id, device_id]
        );
        return rows.length > 0;
    }
}

module.exports = DeviceOwner;