// routes/deviceRoutes.js
const express = require('express');
const router = express.Router();
const deviceController = require('../controllers/deviceController');

// Public routes - browse devices
router.get('/', deviceController.getAllDevices);
router.get('/available', deviceController.getAvailableDevices);
router.get('/search', deviceController.searchDevices);
router.get('/filter', deviceController.filterDevices);
router.get('/categories', deviceController.getAllCategories);
router.get('/top', deviceController.getTopDevices);
router.get('/category/:category', deviceController.getDevicesByCategory);
router.get('/:id', deviceController.getDeviceById);

module.exports = router;