// controllers/authController.js
const bcrypt  = require('bcryptjs');
const jwt     = require('jsonwebtoken');
const Student = require('../models/Student');
const config  = require('../config/config');

// ================================
// POST /api/auth/register
// Body: { student_id, student_name, student_email,
//         student_dept, password, role, subRole }
// subRole: 'borrower' | 'lender' | undefined (both)
// role:    'student'  | 'admin'
// ================================
exports.register = async (req, res) => {
    try {
        const {
            student_id,
            student_name,
            student_email,
            student_dept,
            password,
            role    = 'student',
            subRole                // 'borrower' | 'lender' | undefined
        } = req.body;

        // Validate role value
        if (!['student', 'admin'].includes(role)) {
            return res.status(400).json({ message: 'Invalid role' });
        }

        // Map subRole → permission flags
        // Admin: trigger forces both FALSE regardless
        // No subRole: student can do both
        const can_borrow = role !== 'admin';
        const can_lend   = role !== 'admin';
        // Check duplicates
        const emailExists = await Student.emailExists(student_email);
        if (emailExists)
            return res.status(400).json({ message: 'Email already registered' });

        const idExists = await Student.studentIdExists(student_id);
        if (idExists)
            return res.status(400).json({ message: 'Student ID already registered' });

        const password_hash = await bcrypt.hash(password, 10);

        await Student.create({
            student_id,
            student_name,
            student_email,
            student_dept,
            password_hash,
            role,           // ✅ now passed
            can_borrow,     // ✅ now passed
            can_lend        // ✅ now passed
            // trg_before_student_insert will override can_borrow/can_lend to FALSE
            // if role = 'admin', as a safety net at DB level
        });

        res.status(201).json({ message: 'Registration successful' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// ================================
// POST /api/auth/login
// Body: { student_email, password }
// Returns: { token, user }
// ================================
exports.login = async (req, res) => {
    try {
        const { student_email, password } = req.body;

        const student = await Student.findByEmail(student_email);
        if (!student)
            return res.status(401).json({ message: 'Invalid credentials' });

        const isMatch = await bcrypt.compare(password, student.password_hash);
        if (!isMatch)
            return res.status(401).json({ message: 'Invalid credentials' });

        const isSuspended = await Student.isSuspended(student.student_id);
        if (isSuspended)
            return res.status(403).json({ message: 'Account is suspended' });

        const token = jwt.sign(
            {
                student_id:    student.student_id,
                student_email: student.student_email,
                role:          student.role,
                can_borrow:    student.can_borrow,
                can_lend:      student.can_lend
            },
            config.JWT_SECRET,
            { expiresIn: config.JWT_EXPIRES_IN }
        );

        res.json({
            message: 'Login successful',
            token,
            user: {
                student_id:       student.student_id,
                student_name:     student.student_name,
                student_email:    student.student_email,
                student_dept:     student.student_dept,
                role:             student.role,
                can_borrow:       student.can_borrow,
                can_lend:         student.can_lend,
                reputation_score: student.reputation_score,
                is_restricted:    student.is_restricted
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// ================================
// GET /api/auth/me
// AuthContext.js on app load
// ================================
exports.getMe = async (req, res) => {
    try {
        const student = await Student.getWithStats(req.user.student_id);
        if (!student)
            return res.status(404).json({ message: 'Student not found' });
        res.json(student);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// ================================
// GET /api/auth/profile
// ================================
exports.getProfile = async (req, res) => {
    try {
        const student = await Student.getWithStats(req.user.student_id);
        if (!student)
            return res.status(404).json({ message: 'Student not found' });
        res.json(student);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// ================================
// PUT /api/auth/profile
// Body: { student_name, student_email, student_dept, whatsapp_number }
// ================================
exports.updateProfile = async (req, res) => {
    try {
        const { student_name, student_email, student_dept, whatsapp_number } = req.body;

        await Student.update(req.user.student_id, {
            student_name,
            student_email,
            student_dept,
            whatsapp_number   // ✅ now included
        });

        res.json({ message: 'Profile updated successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// ================================
// POST /api/auth/logout
// Token invalidation is client-side (remove from localStorage)
// ================================
exports.logout = async (req, res) => {
    res.json({ message: 'Logout successful' });
};

// ================================
// GET /api/auth/students/:id/status
// AuthContext reputation + restriction checks
// ================================
exports.getStudentStatus = async (req, res) => {
    try {
        const student = await Student.findById(req.params.id);
        if (!student)
            return res.status(404).json({ message: 'Student not found' });

        res.json({
            reputation_score:   student.reputation_score,
            is_restricted:      student.is_restricted,
            has_violations:     student.has_violations,
            borrow_status:      student.borrow_status,
            can_borrow:         student.can_borrow,
            can_lend:           student.can_lend,
            has_low_reputation: student.reputation_score < 50
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
