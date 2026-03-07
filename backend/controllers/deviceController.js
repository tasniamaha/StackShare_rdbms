// controllers/deviceController.js
const Device = require("../models/Device");
const DeviceOwner = require("../models/DeviceOwner");

// ================================
// GET /api/devices
// DeviceBrowser.js — supports ?category=&status=&search=
// ================================
exports.getAllDevices = async (req, res) => {
  try {
    const devices = await Device.findAll(req.query);
    res.json(devices);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ================================
// GET /api/devices/available
// DeviceBrowser.js default view
// ================================
exports.getAvailableDevices = async (req, res) => {
  try {
    const devices = await Device.getAvailable();
    res.json(devices);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ================================
// GET /api/devices/:id
// DeviceDetails.js full detail page
// ================================
exports.getDeviceById = async (req, res) => {
  try {
    const device = await Device.findById(req.params.id);

    if (!device) {
      return res.status(404).json({ message: "Device not found" });
    }

    res.json(device);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ================================
// GET /api/devices/search?q=
// DeviceBrowser.js search bar
// Uses FULLTEXT index
// ================================
exports.searchDevices = async (req, res) => {
  try {
    const { q } = req.query;

    if (!q) {
      return res.status(400).json({ message: "Search query required" });
    }

    const devices = await Device.search(q);
    res.json(devices);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ================================
// GET /api/devices/category/:category
// DeviceBrowser.js category filter
// ================================
exports.getDevicesByCategory = async (req, res) => {
  try {
    const devices = await Device.findByCategory(req.params.category);
    res.json(devices);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ================================
// GET /api/devices/filter
// DeviceBrowser.js filter devices
// Supports ?condition_status=&location=
// ================================
exports.filterDevices = async (req, res) => {
  try {
    const filters = req.query;
    const devices = await Device.filter(filters);
    res.json(devices);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ================================
// GET /api/devices/categories
// DeviceBrowser.js category dropdown
// ================================
exports.getAllCategories = async (req, res) => {
  try {
    const categories = await Device.getAllCategories();
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ================================
// GET /api/devices/top
// AdminDashboard top devices panel
// ================================
exports.getTopDevices = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 5;
    const devices = await Device.getTopBorrowed(limit);
    res.json(devices);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ================================
// POST /api/devices  OR  POST /api/owner/devices
// OwnerDashboard add device modal
// Creates device then links owner via assign_device_owner procedure
// ================================
exports.createDevice = async (req, res) => {
  try {
    const {
      device_name,
      device_category,
      device_description,
      condition_status,
      location,
      price_per_day,
      image_url,
      specifications,
      maintenance_tips,
      available_from,
    } = req.body;

    if (!device_name || !device_category) {
      return res
        .status(400)
        .json({ message: "Device name and category are required" });
    }

    // 1. Create device
    const result = await Device.create({
      device_name,
      device_category,
      device_description,
      condition_status: condition_status || "Good",
      location,
      price_per_day: price_per_day || 0,
      image_url,
      specifications,
      maintenance_tips,
      available_from,
    });

    // 2. Link device to owner — calls assign_device_owner procedure
    await DeviceOwner.addOwner(req.user.student_id, result.insertId);

    res.status(201).json({
      message: "Device created successfully",
      device_id: result.insertId,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ================================
// PUT /api/devices/:id  OR  PUT /api/owner/devices/:id
// OwnerDashboard edit device modal
// ================================
exports.updateDevice = async (req, res) => {
  try {
    const { id } = req.params;

    // Ownership check — only device owner can update
    const isOwner = await DeviceOwner.isOwner(req.user.student_id, id);
    if (!isOwner && req.user.role !== "admin") {
      return res.status(403).json({ message: "You do not own this device" });
    }

    await Device.update(id, req.body);
    res.json({ message: "Device updated successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ================================
// PUT /api/devices/:id/status
// Admin manually changes device status
// ================================
exports.updateDeviceStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { device_status } = req.body;

    if (!device_status) {
      return res.status(400).json({ message: "device_status is required" });
    }

    await Device.updateStatus(id, device_status);
    res.json({ message: "Device status updated" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ================================
// DELETE /api/devices/:id  OR  DELETE /api/owner/devices/:id
// OwnerDashboard delete device button
// ON DELETE CASCADE handles device_owners cleanup
// ================================
exports.deleteDevice = async (req, res) => {
  try {
    const { id } = req.params;

    // Ownership check — only device owner or admin can delete
    const isOwner = await DeviceOwner.isOwner(req.user.student_id, id);
    if (!isOwner && req.user.role !== "admin") {
      return res.status(403).json({ message: "You do not own this device" });
    }

    await Device.delete(id);
    res.json({ message: "Device deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
