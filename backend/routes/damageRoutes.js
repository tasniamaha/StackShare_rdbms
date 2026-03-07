// routes/damageRoutes.js
const express = require("express");
const router = express.Router();
const damageController = require("../controllers/damageController");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

// All routes require authentication
router.use(authMiddleware);

// ================================
// POST /api/damage/report
// Borrower or Owner reports damage
// Body: { borrow_id, device_id, reported_by, reported_by_role, accused_student, damage_description }
// ================================
router.post("/report", damageController.reportDamage);

// ================================
// GET /api/damage
// Get all damage reports (admin)
// ================================
router.get("/", roleMiddleware("admin"), damageController.getDamageReports);

// ================================
// GET /api/damage/pending
// Get pending damage reports (admin)
// ================================
router.get(
  "/pending",
  roleMiddleware("admin"),
  damageController.getPendingReports,
);

// ================================
// GET /api/damage/:id
// Get single damage report by ID
// For admin to review details
// ================================
router.get("/:id", roleMiddleware("admin"), damageController.getReportById);

// ================================
// PUT /api/damage/:id/review
// Admin reviews damage report
// Body: { notes, recommendation }
// ================================
router.put(
  "/:id/review",
  roleMiddleware("admin"),
  damageController.reviewReport,
);

// ================================
// PUT /api/damage/:id/decision
// Admin makes final decision on damage claim
// Body: { decision, fine_amount, notes }
// decision: 'Borrower_At_Fault' | 'Owner_At_Fault' | 'No_Fault' | 'Split_Cost' | 'Request_More_Info'
// ================================
router.put(
  "/:id/decision",
  roleMiddleware("admin"),
  damageController.resolveReport,
);

// ================================
// PUT /api/damage/:id/resolve (deprecated - use /decision)
// Admin resolves damage report
// ================================
router.put(
  "/:id/resolve",
  roleMiddleware("admin"),
  damageController.resolveReport,
);

module.exports = router;
