// routes/ownerRoutes.js
const express = require("express");
const router = express.Router();
const ownerController = require("../controllers/ownerController");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

// All routes require authentication + permission to lend ("owner")
// the middleware examines req.user.can_lend rather than a separate DB role
router.use(authMiddleware);
router.use(roleMiddleware("owner"));

// ================================
// GET /api/owner/dashboard
// OwnerDashboard.js main data load
// Returns: owned devices, active lends, pending requests, stats
// ================================
router.get("/dashboard", ownerController.getDashboard);

// ================================
// GET /api/owner/devices
// OwnerDashboard device management table
// Returns all devices owned by logged-in student
// ================================
router.get("/devices", ownerController.getOwnedDevices);

// ================================
// POST /api/owner/devices
// OwnerDashboard "Add Device" modal
// Body: { device_name, device_category, condition_status,
//         description, price_per_day, image_url, specifications }
// Also inserts into device_owners via assign_device_owner procedure
// ================================
router.post("/devices", ownerController.addDevice);

// ================================
// PUT /api/owner/devices/:id
// OwnerDashboard "Edit Device" modal
// Body: { device_name, condition_status, price_per_day, ... }
// ================================
router.put("/devices/:id", ownerController.updateDevice);

// ================================
// DELETE /api/owner/devices/:id
// OwnerDashboard delete device button
// ================================
router.delete("/devices/:id", ownerController.deleteDevice);

// ================================
// GET /api/owner/active-lends
// OwnerDashboard active lends table
// Uses view_active_borrows filtered by owner's devices
// ================================
router.get("/active-lends", ownerController.getActiveLends);

// ================================
// GET /api/owner/lend-history
// OwnerDashboard lend history tab
// All completed borrows for owner's devices
// ================================
router.get("/lend-history", ownerController.getLendHistory);

module.exports = router;
