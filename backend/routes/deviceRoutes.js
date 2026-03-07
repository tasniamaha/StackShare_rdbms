// routes/deviceRoutes.js
const express = require('express');
const router = express.Router();
const deviceController = require('../controllers/deviceController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

// ================================
// PUBLIC — DeviceBrowser, DeviceDetails, LandingPage
// No auth needed for browsing
// ================================
router.get('/',                    deviceController.getAllDevices);
router.get('/available',           deviceController.getAvailableDevices);
router.get('/search',              deviceController.searchDevices);    // FULLTEXT idx_device_fulltext
router.get('/filter',              deviceController.filterDevices);    // idx_device_category
router.get('/categories',          deviceController.getAllCategories);
router.get('/top',                 deviceController.getTopDevices);    // view_top_borrowed_devices
router.get('/category/:category',  deviceController.getDevicesByCategory);
router.get('/:id',                 deviceController.getDeviceById);    // DeviceDetails.js

// ================================
// PROTECTED — AddDevice.js (owner/admin only)
// POST /api/devices — create new device
// Body: { device_name, device_category, device_description,
//         condition_status, location, price_per_day,
//         image_url (JSON array), specifications (JSON),
//         maintenance_tips, available_from }
// ================================
router.post('/',
    authMiddleware,
    roleMiddleware('owner', 'admin'),
    deviceController.createDevice
);

// ================================
// PUT /api/devices/:id — update device
// Owner or admin only
// ================================
router.put('/:id',
    authMiddleware,
    roleMiddleware('owner', 'admin'),
    deviceController.updateDevice
);

// ================================
// DELETE /api/devices/:id — remove device
// Owner or admin only
// ================================
router.delete('/:id',
    authMiddleware,
    roleMiddleware('owner', 'admin'),
    deviceController.deleteDevice
);

module.exports = router;