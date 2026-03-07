// routes/authRoutes.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { validateRegister, validateLogin } = require('../middleware/validationMiddleware');
const { authLimiter } = require('../middleware/rateLimiter');
const authMiddleware = require('../middleware/authMiddleware');

// ================================
// POST /api/auth/register
// Register.js sends:
// { student_id, student_name, student_email, student_dept,
//   password, role, subRole }
// Controller maps:
//   subRole='borrower' → can_borrow=TRUE,  can_lend=FALSE
//   subRole='lender'   → can_borrow=FALSE, can_lend=TRUE
//   role='admin'       → can_borrow=FALSE, can_lend=FALSE (trigger handles)
// ================================
router.post('/register', authLimiter, validateRegister, authController.register);

// ================================
// POST /api/auth/login
// Login.js sends: { student_email, password, role, subRole }
// Returns: { token, user: { student_id, student_name,
//            student_email, role, can_borrow, can_lend,
//            reputation_score, is_restricted } }
// ================================
router.post('/login', authLimiter, validateLogin, authController.login);

// ================================
// GET /api/auth/me
// AuthContext.js loads user on app start
// Returns full user object from JWT
// ================================
router.get('/me', authMiddleware, authController.getMe);

// ================================
// GET /api/auth/profile
// Same as /me but matches authController.getProfile
// ================================
router.get('/profile', authMiddleware, authController.getProfile);

// ================================
// PUT /api/auth/profile
// Student updates: student_name, student_email,
//                 student_dept, whatsapp_number
// ================================
router.put('/profile', authMiddleware, authController.updateProfile);

// ================================
// POST /api/auth/logout
// Clears token (if using server-side blacklist)
// AuthContext.logout() calls this then clears localStorage
// ================================
router.post('/logout', authMiddleware, authController.logout);

// ================================
// GET /api/auth/students/:id/status
// AuthContext: checks hasLowReputation, isRestricted, hasViolations
// BorrowerDashboard + OwnerDashboard reputation pill
// Returns: { reputation_score, is_restricted, has_violations,
//            borrow_status, can_borrow, can_lend,
//            has_low_reputation (reputation < 50) }
// ================================
router.get('/students/:id/status', authMiddleware, authController.getStudentStatus);

module.exports = router;