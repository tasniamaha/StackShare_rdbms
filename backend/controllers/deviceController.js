// controllers/deviceController.js
const Device = require('../models/Device');

// Get all devices
exports.getAllDevices = async (req, res) => {
  try {
    const devices = await Device.findAll();
    res.json(devices);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get available devices
exports.getAvailableDevices = async (req, res) => {
  try {
    const devices = await Device.findAvailable();
    res.json(devices);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get device by ID
exports.getDeviceById = async (req, res) => {
  try {
    const device = await Device.getWithOwners(req.params.id);
    
    if (!device) {
      return res.status(404).json({ message: 'Device not found' });
    }
    
    res.json(device);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Search devices
exports.searchDevices = async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q) {
      return res.status(400).json({ message: 'Search query required' });
    }
    
    const devices = await Device.search(q);
    res.json(devices);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Filter devices
exports.filterDevices = async (req, res) => {
  try {
    const { category, status, condition, location } = req.query;
    
    const devices = await Device.filter({
      category,
      status,
      condition,
      location
    });
    
    res.json(devices);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get devices by category
exports.getDevicesByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    const devices = await Device.findByCategory(category);
    res.json(devices);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get all categories
exports.getAllCategories = async (req, res) => {
  try {
    const categories = await Device.getAllCategories();
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get top borrowed devices
exports.getTopDevices = async (req, res) => {
  try {
    const limit = req.query.limit || 5;
    const devices = await Device.getTopBorrowed(limit);
    res.json(devices);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};