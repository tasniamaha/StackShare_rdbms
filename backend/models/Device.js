// models/Device.js
const pool = require("../config/database");

class Device {
  // ================================
  // Create device
  // Called by: ownerController.addDevice
  // After insert, assign_device_owner procedure is called separately
  // to insert into device_owners M:N table
  // Body: { device_name, device_category, device_description,
  //         condition_status, price_per_day, location,
  //         image_url (JSON array), specifications (JSON),
  //         maintenance_tips, available_from }
  // ================================
  static async create(deviceData) {
    const {
      device_name,
      device_category,
      device_description = null,
      condition_status = "Good",
      price_per_day = 0,
      location = null,
      image_url = null,
      specifications = null,
      maintenance_tips = null,
      available_from = null,
    } = deviceData;

    const [result] = await pool.execute(
      `INSERT INTO devices 
                (device_name, device_category, device_description,
                 condition_status, price_per_day, location,
                 image_url, specifications, maintenance_tips, available_from)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        device_name,
        device_category,
        device_description,
        condition_status,
        price_per_day,
        location,
        image_url ? JSON.stringify(image_url) : null,
        specifications ? JSON.stringify(specifications) : null,
        maintenance_tips,
        available_from,
      ],
    );
    return result;
  }

  // ================================
  // Find by ID — full detail
  // Called by: deviceController.getDeviceById
  // DeviceDetails.js: renders image carousel (image_url JSON array),
  // specifications panel, owner contact info
  // ================================
  static async findById(deviceId) {
    const [rows] = await pool.execute(
      `SELECT 
                d.device_id,
                d.device_name,
                d.device_category,
                d.device_status,
                d.device_description,
                d.condition_status,
                d.borrow_count,
                d.location,
                d.price_per_day,
                d.image_url,
                d.specifications,
                d.maintenance_tips,
                d.available_from,
                s.student_id      AS owner_id,
                s.student_name    AS owner_name,
                s.whatsapp_number AS owner_contact
             FROM devices d
             LEFT JOIN device_owners do2 ON d.device_id  = do2.device_id
             LEFT JOIN students s        ON do2.owner_id = s.student_id
             WHERE d.device_id = ?`,
      [deviceId],
    );
    return rows[0] || null;
  }

  // ================================
  // Get all devices with optional filters
  // Called by: deviceController.getAllDevices
  // DeviceBrowser.js: filter by category, status, search
  // Params: { category, status, search }
  // ================================
  static async findAll(filters = {}) {
    const { category, status, search } = filters;

    let query = `
            SELECT
                d.device_id,
                d.device_name,
                d.device_category,
                d.device_status,
                d.condition_status,
                d.borrow_count,
                d.price_per_day,
                d.location,
                d.image_url,
                d.available_from,
                s.student_name AS owner_name
            FROM devices d
            LEFT JOIN device_owners do2 ON d.device_id  = do2.device_id
            LEFT JOIN students s        ON do2.owner_id = s.student_id
            WHERE 1=1
        `;
    const params = [];

    if (category) {
      query += ` AND d.device_category = ?`;
      params.push(category);
    }

    if (status) {
      query += ` AND d.device_status = ?`;
      params.push(status);
    }

    if (search) {
      // Uses idx_device_fulltext index for performance
      query += ` AND MATCH(d.device_name, d.device_description) AGAINST (? IN BOOLEAN MODE)`;
      params.push(search + "*");
    }

    query += ` ORDER BY d.borrow_count DESC`;

    const [rows] = await pool.execute(query, params);
    return rows;
  }

  // ================================
  // Get available devices only
  // Called by: deviceController.getAllDevices (status=Available)
  // DeviceBrowser.js default view
  // Uses idx_device_status index
  // ================================
  static async getAvailable() {
    const [rows] = await pool.execute(
      `SELECT
                d.device_id,
                d.device_name,
                d.device_category,
                d.device_status,
                d.condition_status,
                d.borrow_count,
                d.price_per_day,
                d.location,
                d.image_url,
                d.available_from,
                s.student_name    AS owner_name,
                s.whatsapp_number AS owner_contact
             FROM devices d
             LEFT JOIN device_owners do2 ON d.device_id  = do2.device_id
             LEFT JOIN students s        ON do2.owner_id = s.student_id
             WHERE d.device_status = 'Available'
             ORDER BY d.borrow_count DESC`,
    );
    return rows;
  }

  // ================================
  // Update device details
  // Called by: ownerController.updateDevice
  // OwnerDashboard edit device modal
  // ================================
  static async update(deviceId, updateData) {
    const {
      device_name,
      device_category,
      device_description,
      condition_status,
      price_per_day,
      location,
      image_url,
      specifications,
      maintenance_tips,
      available_from,
    } = updateData;

    const [result] = await pool.execute(
      `UPDATE devices
             SET device_name        = ?,
                 device_category    = ?,
                 device_description = ?,
                 condition_status   = ?,
                 price_per_day      = ?,
                 location           = ?,
                 image_url          = ?,
                 specifications     = ?,
                 maintenance_tips   = ?,
                 available_from     = ?
             WHERE device_id = ?`,
      [
        device_name,
        device_category,
        device_description || null,
        condition_status || "Good",
        price_per_day || 0,
        location || null,
        image_url ? JSON.stringify(image_url) : null,
        specifications ? JSON.stringify(specifications) : null,
        maintenance_tips || null,
        available_from || null,
        deviceId,
      ],
    );
    return result;
  }

  // ================================
  // Update device status only
  // Called by: deviceController.updateDeviceStatus
  // Admin manually sets Available / Borrowed / Reserved / Maintenance
  // Note: triggers handle status changes on borrow/return automatically
  // ================================
  static async updateStatus(deviceId, device_status) {
    const [result] = await pool.execute(
      `UPDATE devices SET device_status = ? WHERE device_id = ?`,
      [device_status, deviceId],
    );
    return result;
  }

  // ================================
  // Delete device
  // Called by: ownerController.deleteDevice
  // ON DELETE CASCADE removes device_owners, borrow_requests automatically
  // ================================
  static async delete(deviceId) {
    const [result] = await pool.execute(
      `DELETE FROM devices WHERE device_id = ?`,
      [deviceId],
    );
    return result;
  }

  // ================================
  // Get top borrowed devices
  // Called by: statsController / adminController
  // AdminDashboard top devices panel
  // View excludes LIMIT so applied here
  // ================================
  static async getTopBorrowed(limit = 5) {
    const [rows] = await pool.execute(
      `SELECT device_id, device_name, device_category,
                    borrow_count, device_status, condition_status
             FROM view_top_borrowed_devices
             LIMIT ?`,
      [limit],
    );
    return rows;
  }

  // ================================
  // Get devices by category
  // Called by: deviceController (category filter in DeviceBrowser)
  // Uses idx_device_category index
  // ================================
  static async findByCategory(category) {
    const [rows] = await pool.execute(
      `SELECT
                d.device_id,
                d.device_name,
                d.device_status,
                d.condition_status,
                d.borrow_count,
                d.price_per_day,
                d.image_url,
                s.student_name AS owner_name
             FROM devices d
             LEFT JOIN device_owners do2 ON d.device_id  = do2.device_id
             LEFT JOIN students s        ON do2.owner_id = s.student_id
             WHERE d.device_category = ?
             ORDER BY d.borrow_count DESC`,
      [category],
    );
    return rows;
  }

  // ================================
  // Get devices never borrowed
  // Called by: adminController (underutilised devices report)
  // AdminDashboard analytics — maps to Q11
  // ================================
  static async getNeverBorrowed() {
    const [rows] = await pool.execute(
      `SELECT
                d.device_id,
                d.device_name,
                d.device_category,
                d.device_status,
                d.condition_status,
                s.student_name AS owner_name
             FROM devices d
             JOIN device_owners do2 ON d.device_id  = do2.device_id
             JOIN students s        ON do2.owner_id = s.student_id
             WHERE d.device_id NOT IN (
                 SELECT DISTINCT device_id
                 FROM borrow_requests
                 WHERE borrow_status IN ('Borrowed','Returned','Overdue')
             )
             ORDER BY d.device_category`,
    );
    return rows;
  }

  // ================================
  // Get device availability with waitlist info
  // Called by: deviceController.getAllDevices
  // DeviceBrowser.js shows next waiting student
  // Uses view_device_availability
  // ================================
  static async getAvailabilityView() {
    const [rows] = await pool.execute(`SELECT * FROM view_device_availability`);
    return rows;
  }

  // ================================
  // Filter devices by multiple criteria
  // Called by: deviceController.filterDevices
  // Supports ?condition_status=&location=
  // ================================
  static async filter(filters = {}) {
    const { condition_status, location } = filters;
    let query = `SELECT
                d.device_id,
                d.device_name,
                d.device_category,
                d.device_status,
                d.condition_status,
                d.price_per_day,
                d.location,
                d.image_url,
                s.student_name AS owner_name
             FROM devices d
             LEFT JOIN device_owners do2 ON d.device_id  = do2.device_id
             LEFT JOIN students s        ON do2.owner_id = s.student_id
             WHERE 1=1`;

    const params = [];

    if (condition_status) {
      query += ` AND d.condition_status = ?`;
      params.push(condition_status);
    }

    if (location) {
      query += ` AND d.location = ?`;
      params.push(location);
    }

    query += ` ORDER BY d.borrow_count DESC`;

    const [rows] = await pool.execute(query, params);
    return rows;
  }

  // ================================
  // Get all unique categories
  // Called by: deviceController.getAllCategories
  // DeviceBrowser.js category dropdown
  // ================================
  static async getAllCategories() {
    const [rows] = await pool.execute(
      `SELECT DISTINCT device_category FROM devices ORDER BY device_category`,
    );
    return rows;
  }

  // ================================
  // Search devices by name/description
  // Called by: deviceController (DeviceBrowser search bar)
  // Uses FULLTEXT index idx_device_fulltext
  // ================================
  static async search(searchTerm) {
    const [rows] = await pool.execute(
      `SELECT
                d.device_id,
                d.device_name,
                d.device_category,
                d.device_status,
                d.condition_status,
                d.price_per_day,
                d.image_url,
                s.student_name AS owner_name
             FROM devices d
             LEFT JOIN device_owners do2 ON d.device_id  = do2.device_id
             LEFT JOIN students s        ON do2.owner_id = s.student_id
             WHERE MATCH(d.device_name, d.device_description)
                   AGAINST (? IN BOOLEAN MODE)
               AND d.device_status = 'Available'
             ORDER BY d.borrow_count DESC`,
      [searchTerm + "*"],
    );
    return rows;
  }
}

module.exports = Device;
