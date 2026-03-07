// controllers/damageController.js
const DamageReport = require('../models/DamageReport');
const Notification = require('../models/Notification');
const pool         = require('../config/database');

// ================================
// POST /api/damage/report
// Owner or Admin files a damage report
// Body: { borrow_id, device_id, accused_student,
//         damage_description, reported_by_role,
//         before_image_url, after_image_url }
// trg_before_damage_insert fires:
//   - validates borrow exists
//   - prevents duplicate active reports
// ================================
exports.reportDamage = async (req, res) => {
    try {
        const {
            borrow_id,
            device_id,
            accused_student,
            damage_description,
            before_image_url = null,
            after_image_url  = null
        } = req.body;

        const reported_by      = req.user.student_id;
        const reported_by_role = req.body.reported_by_role || 'OWNER';

        if (!borrow_id || isNaN(borrow_id))
            return res.status(400).json({ message: 'Valid borrow_id is required' });
        if (!device_id || isNaN(device_id))
            return res.status(400).json({ message: 'Valid device_id is required' });
        if (!accused_student)
            return res.status(400).json({ message: 'accused_student is required' });
        if (!damage_description)
            return res.status(400).json({ message: 'damage_description is required' });
        if (!['OWNER','ADMIN'].includes(reported_by_role))
            return res.status(400).json({ message: 'reported_by_role must be OWNER or ADMIN' });

        // Uses DamageReport.create() — trigger validates at DB level too
        const result = await DamageReport.create({
            borrow_id,
            device_id,
            reported_by,
            reported_by_role,
            accused_student,
            damage_description,
            before_image_url,
            after_image_url
        });

        // Notify accused student
        await Notification.create({
            user_id:           accused_student,
            related_entity:    'damage_report',
            related_id:        result.insertId,
            title:             'Damage Report Filed',
            message:           'A damage report has been filed against you. Please check the details.',
            notification_type: 'damage_report'  // ✅ matches ENUM
        });

        res.status(201).json({
            message:   'Damage report submitted successfully',
            report_id: result.insertId
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// ================================
// GET /api/damage
// All damage reports — Admin only
// AdminDashboard complaints table
// ================================
exports.getDamageReports = async (req, res) => {
    try {
        const reports = await DamageReport.findAll();
        res.json(reports);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// ================================
// GET /api/damage/pending
// Pending + Under_Review reports — Admin only
// Uses view_pending_damages
// ================================
exports.getPendingReports = async (req, res) => {
    try {
        const reports = await DamageReport.getPending();
        res.json(reports);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// ================================
// GET /api/damage/:id
// Full damage report detail — Admin only
// Includes borrow dates for context in modal
// More detailed than model's findById so kept inline
// ================================
exports.getReportById = async (req, res) => {
    try {
        const { id } = req.params;

        if (!id || isNaN(id))
            return res.status(400).json({ message: 'Valid report ID is required' });

        const [reports] = await pool.execute(
            `SELECT dr.*,
                    s1.student_name   AS reported_by_name,
                    s1.student_email  AS reported_by_email,
                    s2.student_name   AS accused_name,
                    s2.student_email  AS accused_email,
                    s2.whatsapp_number AS accused_whatsapp,
                    d.device_name,
                    d.device_category,
                    br.borrow_start_date,
                    br.borrow_end_date,
                    br.return_date
             FROM damage_reports dr
             JOIN students s1        ON dr.reported_by     = s1.student_id
             JOIN students s2        ON dr.accused_student = s2.student_id
             JOIN devices d          ON dr.device_id       = d.device_id
             LEFT JOIN borrow_requests br ON dr.borrow_id  = br.borrow_id
             WHERE dr.report_id = ?`,
            [id]
        );

        if (reports.length === 0)
            return res.status(404).json({ message: 'Damage report not found' });

        res.json(reports[0]);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// ================================
// PUT /api/damage/:id/review
// Admin sets status to Under_Review
// Inline kept — conditional resolution_date logic
// not in model's updateStatus()
// ================================
exports.reviewReport = async (req, res) => {
    try {
        const { id }     = req.params;
        const { status } = req.body;

        if (!id || isNaN(id))
            return res.status(400).json({ message: 'Valid report ID is required' });

        const validStatuses = ['Reported','Under_Review','Confirmed','Rejected','Resolved'];
        if (!status || !validStatuses.includes(status))
            return res.status(400).json({
                message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
            });

        await pool.execute(
            `UPDATE damage_reports
             SET status = ?,
                 resolution_date = CASE
                     WHEN ? IN ('Confirmed','Rejected','Resolved') THEN NOW()
                     ELSE resolution_date
                 END
             WHERE report_id = ?`,
            [status, status, id]
        );

        res.json({ message: 'Damage report status updated successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// ================================
// PUT /api/damage/:id/resolve
// Admin makes final decision
// Body: { decision, fine_amount }
// Calls process_damage_report procedure via model:
//   Step 1: Confirmed → trg_penalize_reputation (-10 pts)
//   Step 2: Fine applied if Borrower_At_Fault
//   Step 3: Resolved + resolution_date
// ================================
exports.resolveReport = async (req, res) => {
    try {
        const { id }                   = req.params;
        const { decision, fine_amount } = req.body;

        if (!id || isNaN(id))
            return res.status(400).json({ message: 'Valid report ID is required' });

        const validDecisions = [
            'Borrower_At_Fault','Owner_At_Fault',
            'No_Fault','Split_Cost','Request_More_Info'
        ];
        if (!decision || !validDecisions.includes(decision))
            return res.status(400).json({
                message: `Invalid decision. Must be one of: ${validDecisions.join(', ')}`
            });

        if (fine_amount !== undefined && (isNaN(fine_amount) || fine_amount < 0))
            return res.status(400).json({ message: 'fine_amount must be a non-negative number' });

        await DamageReport.resolve(id, decision, fine_amount || 0);

        res.json({ message: 'Damage report resolved successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};