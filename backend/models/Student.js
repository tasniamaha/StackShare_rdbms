// models/Student.js
const pool = require('../config/database');

class Student {

    // ================================
    // Create student
    // Called by: Register.js
    // ================================
    static async create(studentData) {
        const {
            student_id,
            student_name,
            student_email,
            student_dept,
            password_hash,
            role = 'student',
            can_borrow = true,
            can_lend = true,
            whatsapp_number = null
        } = studentData;

        const [result] = await pool.execute(
            `INSERT INTO students 
                (student_id, student_name, student_email, student_dept, 
                 password_hash, role, can_borrow, can_lend, whatsapp_number)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [student_id, student_name, student_email, student_dept,
             password_hash, role, can_borrow, can_lend, whatsapp_number]
        );
        return result;
    }

    // ================================
    // Find by ID
    // Called by: authMiddleware, studentController.getById
    // ================================
    static async findById(studentId) {
        const [rows] = await pool.execute(
            `SELECT student_id, student_name, student_email, student_dept,
                    role, can_borrow, can_lend,
                    is_restricted, has_violations,
                    reputation_score, borrow_status,
                    suspended_until, whatsapp_number
             FROM students
             WHERE student_id = ?`,
            [studentId]
        );
        return rows[0] || null;
    }

    // ================================
    // Find by email
    // Called by: authController.login, adminController.login
    // ================================
    static async findByEmail(email) {
        const [rows] = await pool.execute(
            `SELECT * FROM students WHERE student_email = ?`,
            [email]
        );
        return rows[0] || null;
    }

    // ================================
    // Update profile
    // Called by: studentController.update
    // ================================
    static async update(studentId, updateData) {
        const { student_name, student_email, student_dept, whatsapp_number } = updateData;

        const [result] = await pool.execute(
            `UPDATE students 
             SET student_name = ?, student_email = ?, 
                 student_dept = ?, whatsapp_number = ?
             WHERE student_id = ?`,
            [student_name, student_email, student_dept, whatsapp_number, studentId]
        );
        return result;
    }

    // ================================
    // Update reputation score
    // Called by: reputationService, process_damage_report
    // ================================
    static async updateReputation(studentId, newScore) {
        const [result] = await pool.execute(
            `UPDATE students 
             SET reputation_score = GREATEST(?, 0)
             WHERE student_id = ?`,
            [newScore, studentId]
        );
        return result;
    }

    // ================================
    // Get student status flags
    // Called by: AuthContext /students/:id/status
    // Returns: hasLowReputation, isRestricted, hasViolations
    // ================================
    static async getStatus(studentId) {
        const [rows] = await pool.execute(
            `SELECT 
                reputation_score,
                is_restricted,
                has_violations,
                borrow_status,
                suspended_until,
                can_borrow,
                can_lend,
                reputation_score < 50 AS has_low_reputation
             FROM students
             WHERE student_id = ?`,
            [studentId]
        );
        return rows[0] || null;
    }

    // ================================
    // Check if suspended
    // Called by: authMiddleware
    // ================================
    static async isSuspended(studentId) {
        const [rows] = await pool.execute(
            `SELECT suspended_until, borrow_status
             FROM students
             WHERE student_id = ?`,
            [studentId]
        );

        if (!rows[0]) return false;
        if (rows[0].borrow_status === 'Suspended') return true;
        if (!rows[0].suspended_until) return false;

        return new Date(rows[0].suspended_until) > new Date();
    }

    // ================================
    // Suspend student
    // Called by: adminController.suspendStudent
    // ================================
    static async suspend(studentId, untilDate) {
        const [result] = await pool.execute(
            `UPDATE students 
             SET borrow_status = 'Suspended', 
                 suspended_until = ?,
                 is_restricted = TRUE
             WHERE student_id = ?`,
            [untilDate, studentId]
        );
        return result;
    }

    // ================================
    // Unsuspend student
    // Called by: adminController.unsuspendStudent
    // ================================
    static async unsuspend(studentId) {
        const [result] = await pool.execute(
            `UPDATE students 
             SET borrow_status = 'Active', 
                 suspended_until = NULL,
                 is_restricted = FALSE
             WHERE student_id = ?`,
            [studentId]
        );
        return result;
    }

    // ================================
    // Get all students
    // Called by: adminController.getStudentStats
    // ================================
    static async findAll() {
        const [rows] = await pool.execute(
            `SELECT student_id, student_name, student_email, student_dept,
                    role, can_borrow, can_lend,
                    is_restricted, has_violations,
                    reputation_score, borrow_status, suspended_until
             FROM students
             ORDER BY student_name ASC`
        );
        return rows;
    }

    // ================================
    // Check if email exists
    // Called by: authController.register
    // ================================
    static async emailExists(email) {
        const [rows] = await pool.execute(
            `SELECT student_id FROM students WHERE student_email = ?`,
            [email]
        );
        return rows.length > 0;
    }

    // ================================
    // Check if student ID exists
    // Called by: authController.register
    // ================================
    static async studentIdExists(studentId) {
        const [rows] = await pool.execute(
            `SELECT student_id FROM students WHERE student_id = ?`,
            [studentId]
        );
        return rows.length > 0;
    }

    // ================================
    // Get student with borrow stats
    // Called by: studentController.getById (full profile view)
    // ================================
    static async getWithStats(studentId) {
        const [rows] = await pool.execute(
            `SELECT s.student_id, s.student_name, s.student_email, s.student_dept,
                    s.role, s.can_borrow, s.can_lend,
                    s.is_restricted, s.has_violations,
                    s.reputation_score, s.borrow_status,
                    s.suspended_until, s.whatsapp_number,
                    COUNT(CASE WHEN br.borrow_status = 'Borrowed' 
                               THEN 1 END)                  AS active_borrows,
                    COUNT(CASE WHEN br.borrow_status = 'Overdue'  
                               THEN 1 END)                  AS overdue_borrows,
                    COUNT(CASE WHEN br.borrow_status = 'Returned' 
                               THEN 1 END)                  AS total_returns
             FROM students s
             LEFT JOIN borrow_requests br ON s.student_id = br.student_id
             WHERE s.student_id = ?
             GROUP BY s.student_id`,
            [studentId]
        );
        return rows[0] || null;
    }
}

module.exports = Student;