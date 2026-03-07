// routes/adminRoutes.js
const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

// ================================
// POST /api/admin/login
// No auth required — admin login page
// ================================
router.post('/login', adminController.login);

// ================================
// All routes below: auth + admin role required
// ================================
router.use(authMiddleware);
router.use(roleMiddleware('admin'));  // ✅ blocks non-admins

// ================================
// GET /api/admin/overdue-borrows
// AdminDashboard overdue panel
// Uses Q3 query (multi-join + nested subquery)
// ================================
router.get('/overdue-borrows',             adminController.getOverdueBorrows);

// ================================
// GET /api/admin/pending-approvals
// AdminDashboard pending approvals table
// ================================
router.get('/pending-approvals',           adminController.getPendingApprovals);

// ================================
// PUT /api/admin/students/:id/suspend
// AdminDashboard suspend button
// Body: { suspended_until: 'YYYY-MM-DD' }
// ================================
router.put('/students/:id/suspend',        adminController.suspendStudent);

// ================================
// PUT /api/admin/students/:id/unsuspend
// AdminDashboard unsuspend button
// ================================
router.put('/students/:id/unsuspend',      adminController.unsuspendStudent);

// ================================
// PUT /api/admin/students/:id/approve
// AdminDashboard pending users → Approve button
// ================================
router.put('/students/:id/approve',        adminController.approveUser);

// ================================
// DELETE /api/admin/students/:id/reject
// AdminDashboard pending users → Reject button
// ================================
router.delete('/students/:id/reject',      adminController.rejectUser);

// ================================
// GET /api/admin/complaints
// AdminDashboard active complaints list
// Queries view_pending_damages
// ================================
router.get('/complaints',                  adminController.getComplaints);

// ================================
// GET /api/admin/complaints/:id
// AdminDashboard complaint detail modal
// Returns: damage_report + before/after images
// ================================
router.get('/complaints/:id',              adminController.getComplaintById);

// ================================
// POST /api/admin/complaints/:id/decision
// AdminDashboard decision buttons:
// 'Borrower Responsible' → 'Borrower_At_Fault'
// 'Dismiss Claim'        → 'No_Fault'
// 'Split Cost (50/50)'   → 'Split_Cost'
// 'Request More Info'    → 'Request_More_Info'
// Calls: process_damage_report stored procedure
// ================================
router.post('/complaints/:id/decision',    adminController.resolveComplaint);

module.exports = router;