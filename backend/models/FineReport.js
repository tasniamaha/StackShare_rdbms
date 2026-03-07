// models/FineReport.js
const pool = require('../config/database');

class FineReport {

    // ================================
    // Create fine — calls apply_fine stored procedure
    // Procedure handles:
    //   - validates borrow_id exists
    //   - auto-sets due_date if null (14 days)
    //   - sends fine_issued notification automatically
    // Called by: fineController.applyFine
    // ================================
    static async create(fineData) {
        const {
            borrow_id,
            student_id,
            reason,
            fine_amount,
            imposed_by,
            due_date = null
        } = fineData;

        const [result] = await pool.execute(
            `CALL apply_fine(?, ?, ?, ?, ?, ?)`,
            [borrow_id, student_id, reason, fine_amount, imposed_by, due_date]
        );
        return result;
    }

    // ================================
    // Get fines by student
    // Called by: fineController.getFinesByStudent
    // AdminDashboard student fine history
    // ================================
    static async findByStudent(studentId) {
        const [rows] = await pool.execute(
            `SELECT fr.*,
                    s.student_name,
                    d.device_name,
                    d.device_category
             FROM fine_reports fr
             JOIN borrow_requests br ON fr.borrow_id  = br.borrow_id
             JOIN devices d          ON br.device_id  = d.device_id
             JOIN students s         ON fr.student_id = s.student_id
             WHERE fr.student_id = ?
             ORDER BY fr.imposed_date DESC`,
            [studentId]
        );
        return rows;
    }

    // ================================
    // Get overdue AND pending fines
    // Called by: fineController.getOverdueFines
    // AdminDashboard overdue fines panel
    // Matches view_overdue_fines definition (both statuses)
    // ================================
    static async getOverdue() {
        const [rows] = await pool.execute(
            `SELECT fr.*,
                    s.student_name,
                    s.student_email,
                    s.whatsapp_number,
                    d.device_name
             FROM fine_reports fr
             JOIN students s         ON fr.student_id = s.student_id
             JOIN borrow_requests br ON fr.borrow_id  = br.borrow_id
             JOIN devices d          ON br.device_id  = d.device_id
             WHERE fr.fine_status IN ('Pending', 'Overdue')
             ORDER BY fr.due_date ASC`
        );
        return rows;
    }

    // ================================
    // Get my fines — for logged-in borrower
    // Called by: fineController.getMyFines
    // BorrowerDashboard fines modal
    // student_id injected from JWT token in controller
    // ================================
    static async getMyFines(studentId) {
        const [rows] = await pool.execute(
            `SELECT fr.*,
                    d.device_name,
                    d.device_category,
                    CASE 
                        WHEN fr.fine_status IN ('Pending','Overdue') 
                             AND fr.due_date < CURDATE()
                        THEN TRUE ELSE FALSE 
                    END AS is_overdue
             FROM fine_reports fr
             JOIN borrow_requests br ON fr.borrow_id = br.borrow_id
             JOIN devices d          ON br.device_id = d.device_id
             WHERE fr.student_id = ?
             ORDER BY fr.imposed_date DESC`,
            [studentId]
        );
        return rows;
    }

    // ================================
    // Mark fine as paid
    // Called by: fineController.payFine
    // chk_fine_paid_status constraint enforces paid_date NOT NULL when Paid
    // ================================
    static async markPaid(fineId) {
        const [result] = await pool.execute(
            `UPDATE fine_reports
             SET fine_status = 'Paid',
                 paid_date   = CURDATE()
             WHERE fine_id = ?`,
            [fineId]
        );
        return result;
    }

    // ================================
    // Waive fine — Admin only
    // Called by: fineController.waiveFine
    // ================================
    static async waive(fineId) {
        const [result] = await pool.execute(
            `UPDATE fine_reports
             SET fine_status = 'Waived'
             WHERE fine_id = ?`,
            [fineId]
        );
        return result;
    }

    // ================================
    // Get total unpaid fines for a student
    // Called by: borrowerController.getDashboard
    // BorrowerDashboard fine total display
    // Matches total_fine_amount() stored function logic
    // ================================
    static async getTotalByStudent(studentId) {
        const [rows] = await pool.execute(
            `SELECT IFNULL(SUM(fine_amount), 0) AS total_fines
             FROM fine_reports
             WHERE student_id = ?
               AND fine_status IN ('Pending', 'Overdue')`,
            [studentId]
        );
        return rows[0].total_fines;
    }
}

module.exports = FineReport;