// models/DamageReport.js
const pool = require('../config/database');

class DamageReport {

    // ================================
    // Create damage report
    // Called by: damageController.reportDamage
    // trg_before_damage_insert fires automatically:
    //   - validates borrow exists
    //   - prevents duplicate active reports
    // ================================
    static async create(reportData) {
        const {
            borrow_id,
            device_id,
            reported_by,
            reported_by_role,
            accused_student,
            damage_description,
            before_image_url = null,
            after_image_url  = null
        } = reportData;

        const [result] = await pool.execute(
            `INSERT INTO damage_reports 
                (borrow_id, device_id, reported_by, reported_by_role,
                 accused_student, damage_description,
                 before_image_url, after_image_url)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [borrow_id, device_id, reported_by, reported_by_role,
             accused_student, damage_description,
             before_image_url, after_image_url]
        );
        return result;
    }

    // ================================
    // Find by ID
    // Called by: damageController.getDamageById
    // AdminDashboard complaint detail modal
    // ================================
    static async findById(reportId) {
        const [rows] = await pool.execute(
            `SELECT dr.*,
                    s1.student_name  AS reported_by_name,
                    s2.student_name  AS accused_name,
                    s2.student_email AS accused_email,
                    s2.whatsapp_number AS accused_whatsapp,
                    d.device_name,
                    d.device_category
             FROM damage_reports dr
             JOIN students s1 ON dr.reported_by      = s1.student_id
             JOIN students s2 ON dr.accused_student   = s2.student_id
             JOIN devices d   ON dr.device_id         = d.device_id
             WHERE dr.report_id = ?`,
            [reportId]
        );
        return rows[0] || null;
    }

    // ================================
    // Get all damage reports
    // Called by: damageController.getDamageReports
    // AdminDashboard complaints table
    // ================================
    static async findAll() {
        const [rows] = await pool.execute(
            `SELECT dr.*,
                    s1.student_name AS reported_by_name,
                    s2.student_name AS accused_name,
                    d.device_name,
                    d.device_category
             FROM damage_reports dr
             JOIN students s1 ON dr.reported_by    = s1.student_id
             JOIN students s2 ON dr.accused_student = s2.student_id
             JOIN devices d   ON dr.device_id       = d.device_id
             ORDER BY dr.report_date DESC`
        );
        return rows;
    }

    // ================================
    // Get pending/under-review reports
    // Called by: damageController.getPendingReports
    // AdminDashboard pending complaints panel
    // Uses view_pending_damages for consistency
    // ================================
    static async getPending() {
        const [rows] = await pool.execute(
            `SELECT * FROM view_pending_damages
             ORDER BY report_date ASC`
        );
        return rows;
    }

    // ================================
    // Resolve damage report
    // Calls process_damage_report procedure which handles:
    //   Step 1: status = 'Confirmed' → trg_penalize_reputation fires (-10 pts)
    //   Step 2: applies fine if Borrower_At_Fault
    //   Step 3: status = 'Resolved', resolution_date = NOW()
    // Called by: damageController.resolveReport
    // ================================
    static async resolve(reportId, adminDecision, fineAmount = 0) {
        const [result] = await pool.execute(
            `CALL process_damage_report(?, ?, ?)`,
            [reportId, adminDecision, fineAmount]
        );
        return result;
    }

    // ================================
    // Update status only (for review step before resolution)
    // Called by: damageController.reviewReport
    // Sets status to 'Under_Review'
    // ================================
    static async updateStatus(reportId, status) {
        const [result] = await pool.execute(
            `UPDATE damage_reports SET status = ? WHERE report_id = ?`,
            [status, reportId]
        );
        return result;
    }

    // ================================
    // Get reports where student is accused
    // Called by: studentController (profile damage history)
    // ================================
    static async findByStudent(studentId) {
        const [rows] = await pool.execute(
            `SELECT dr.*,
                    s1.student_name AS reported_by_name,
                    d.device_name,
                    d.device_category
             FROM damage_reports dr
             JOIN students s1 ON dr.reported_by = s1.student_id
             JOIN devices d   ON dr.device_id   = d.device_id
             WHERE dr.accused_student = ?
             ORDER BY dr.report_date DESC`,
            [studentId]
        );
        return rows;
    }

    // ================================
    // Get reports by device
    // Called by: deviceController.getDeviceById
    // DeviceDetails.js damage history section
    // ================================
    static async findByDevice(deviceId) {
        const [rows] = await pool.execute(
            `SELECT dr.*,
                    s1.student_name AS reported_by_name,
                    s2.student_name AS accused_name
             FROM damage_reports dr
             JOIN students s1 ON dr.reported_by    = s1.student_id
             JOIN students s2 ON dr.accused_student = s2.student_id
             WHERE dr.device_id = ?
             ORDER BY dr.report_date DESC`,
            [deviceId]
        );
        return rows;
    }
}

module.exports = DamageReport;