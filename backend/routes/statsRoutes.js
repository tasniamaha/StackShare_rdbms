// routes/statsRoutes.js
const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const auth = require('../middleware/authMiddleware');
const roleCheck = require('../middleware/roleMiddleware');

// ================================
// GET /api/stats
// System-wide stats for AdminDashboard top cards
// ================================
router.get('/', auth, roleCheck('admin'), async (req, res) => {
    try {
        const [rows] = await pool.execute(`
            SELECT
                (SELECT COUNT(*) FROM devices 
                 WHERE device_status = 'Available')                          AS available_devices,
                (SELECT COUNT(*) FROM devices 
                 WHERE device_status = 'Borrowed')                           AS borrowed_devices,
                (SELECT COUNT(*) FROM borrow_requests 
                 WHERE borrow_status = 'Overdue')                            AS overdue_borrows,
                (SELECT COUNT(*) FROM fine_reports 
                 WHERE fine_status = 'Pending')                              AS pending_fines,
                (SELECT COUNT(*) FROM students 
                 WHERE role = 'student')                                     AS total_students,
                (SELECT COUNT(*) FROM students 
                 WHERE borrow_status = 'Suspended')                          AS suspended_users,
                (SELECT COUNT(*) FROM damage_reports 
                 WHERE status = 'Under_Review')                              AS active_complaints
        `);

        res.json(rows[0]);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch system stats', error: error.message });
    }
});

// ================================
// GET /api/stats/students
// Per-student stats for AdminDashboard student table
// ================================
router.get('/students', auth, roleCheck('admin'), async (req, res) => {
    try {
        const [rows] = await pool.execute(`
            SELECT 
                s.student_id,
                s.student_name,
                s.student_email,
                s.student_dept,
                s.reputation_score,
                s.is_restricted,
                s.has_violations,
                s.borrow_status,
                s.suspended_until,
                COUNT(CASE WHEN br.borrow_status = 'Borrowed' 
                           THEN 1 END)              AS active_borrows,
                COUNT(CASE WHEN br.borrow_status = 'Overdue'  
                           THEN 1 END)              AS overdue_borrows,
                IFNULL(SUM(CASE WHEN fr.fine_status = 'Pending' 
                           THEN fr.fine_amount END), 0) AS pending_fines
            FROM students s
            LEFT JOIN borrow_requests br ON s.student_id = br.student_id
            LEFT JOIN fine_reports fr    ON s.student_id = fr.student_id
            WHERE s.role = 'student'
            GROUP BY s.student_id
            ORDER BY s.reputation_score DESC
        `);

        res.json(rows);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch student stats', error: error.message });
    }
});

// ================================
// GET /api/stats/devices
// Device usage stats for AdminDashboard
// ================================
router.get('/devices', auth, roleCheck('admin'), async (req, res) => {
    try {
        const [rows] = await pool.execute(`
            SELECT 
                d.device_id,
                d.device_name,
                d.device_category,
                d.device_status,
                d.condition_status,
                d.borrow_count,
                d.price_per_day,
                s.student_name AS owner_name
            FROM devices d
            LEFT JOIN device_owners do2 ON d.device_id  = do2.device_id
            LEFT JOIN students s        ON do2.owner_id = s.student_id
            ORDER BY d.borrow_count DESC
        `);

        res.json(rows);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch device stats', error: error.message });
    }
});

module.exports = router;