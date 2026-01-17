// routes/ownerRoutes.js
const express = require('express');
const router = express.Router();
const ownerController = require('../controllers/ownerController');
const authMiddleware = require('../middleware/authMiddleware');

// All routes require authentication
router.use(authMiddleware);

// Dashboard
router.get('/dashboard', ownerController.getDashboard);

// Device management
router.get('/devices', ownerController.getOwnedDevices);
router.post('/devices', ownerController.addDevice);
router.put('/devices/:id', ownerController.updateDevice);
router.delete('/devices/:id', ownerController.deleteDevice);

// Lends
router.get('/active-lends', ownerController.getActiveLends);
router.get('/lend-history', ownerController.getLendHistory);

module.exports = router;