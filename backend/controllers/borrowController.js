// controllers/borrowController.js
const BorrowRequest = require('../models/BorrowRequest');
const Device        = require('../models/Device');
const Notification  = require('../models/Notification');

// ================================
// POST /api/borrow/request
// BorrowRequest.js form submit
// Body: { device_id, borrow_start_date, borrow_end_date }
// trg_before_borrow_insert fires: validates device, student, duplicates
// ================================
exports.createBorrowRequest = async (req, res) => {
    try {
        const { device_id, borrow_start_date, borrow_end_date } = req.body;
        const student_id = req.user.student_id;

        if (!device_id || !borrow_start_date || !borrow_end_date) {
            return res.status(400).json({
                message: 'device_id, borrow_start_date and borrow_end_date are required'
            });
        }

        // App-level check before DB trigger (better error message for user)
        const device = await Device.findById(device_id);
        if (!device || device.device_status !== 'Available') {
            return res.status(400).json({ message: 'Device is not available for borrowing' });
        }

        const hasActive = await BorrowRequest.hasActiveOrPending(student_id, device_id);
        if (hasActive) {
            return res.status(400).json({
                message: 'You already have an active or pending request for this device'
            });
        }

        const result = await BorrowRequest.create({
            student_id,
            device_id,
            borrow_start_date,
            borrow_end_date
        });

        res.status(201).json({
            message: 'Borrow request created successfully',
            borrow_id: result.insertId
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// ================================
// PUT /api/borrow/approve/:id
// AdminDashboard approve button
// Calls approve_borrow_request procedure via model
// trg_notify_borrow_approved fires automatically
// ================================
exports.approveBorrowRequest = async (req, res) => {
    try {
        await BorrowRequest.approve(req.params.id, req.user.student_id);
        res.json({ message: 'Borrow request approved successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// ================================
// PUT /api/borrow/reject/:id
// AdminDashboard reject button
// ================================
exports.rejectBorrowRequest = async (req, res) => {
    try {
        const { id } = req.params;

        await BorrowRequest.reject(id, req.user.student_id);

        // Notify student — approval trigger only fires on Approved, not Rejected
        const borrow = await BorrowRequest.findById(id);
        if (borrow) {
            await Notification.create({
                user_id:           borrow.student_id,
                related_entity:    'borrow_request',
                related_id:        parseInt(id),
                title:             'Borrow Request Rejected',
                message:           `Your request for ${borrow.device_name} has been rejected.`,
                notification_type: 'borrow_rejected'  // ✅ matches ENUM
            });
        }

        res.json({ message: 'Borrow request rejected' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// ================================
// PUT /api/borrow/return/:id
// BorrowedItemCard.js "Return Device" button
// Body: { condition_status, remarks }
// trg_device_returned fires → device_status = Available, borrow_count++
// Model handles return_logs insert inside transaction
// ================================
exports.returnDevice = async (req, res) => {
    try {
        const { id } = req.params;
        const { condition_status, remarks } = req.body;

        if (!condition_status) {
            return res.status(400).json({ message: 'condition_status is required' });
        }

        // Verify borrow belongs to this student
        const borrow = await BorrowRequest.findById(id);
        if (!borrow) {
            return res.status(404).json({ message: 'Borrow request not found' });
        }
        if (borrow.student_id !== req.user.student_id) {
            return res.status(403).json({ message: 'Unauthorized' });
        }

        await BorrowRequest.returnDevice(id, {
            condition_status,
            remarks:    remarks || null,
            student_id: req.user.student_id
        });

        res.json({ message: 'Device returned successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// ================================
// PUT /api/borrow/extend/:id
// BorrowerDashboard extend button
// Body: { new_end_date }
// ================================
exports.extendBorrow = async (req, res) => {
    try {
        const { id } = req.params;
        const { new_end_date } = req.body;

        if (!new_end_date) {
            return res.status(400).json({ message: 'new_end_date is required' });
        }

        const borrow = await BorrowRequest.findById(id);
        if (!borrow) {
            return res.status(404).json({ message: 'Borrow not found' });
        }
        if (borrow.student_id !== req.user.student_id) {
            return res.status(403).json({ message: 'Unauthorized' });
        }

        await BorrowRequest.extendBorrow(id, new_end_date);
        res.json({ message: 'Borrow period extended successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// ================================
// PUT /api/borrow/:id/review
// BorrowedItemCard.js review modal after return
// Body: { review_rating, review_comment }
// ================================
exports.submitReview = async (req, res) => {
    try {
        const { id } = req.params;
        const { review_rating, review_comment } = req.body;

        if (!review_rating || review_rating < 1 || review_rating > 5) {
            return res.status(400).json({ message: 'review_rating must be between 1 and 5' });
        }

        const borrow = await BorrowRequest.findById(id);
        if (!borrow) {
            return res.status(404).json({ message: 'Borrow not found' });
        }
        if (borrow.student_id !== req.user.student_id) {
            return res.status(403).json({ message: 'Unauthorized' });
        }

        await BorrowRequest.submitReview(id, { review_rating, review_comment });
        res.json({ message: 'Review submitted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// ================================
// GET /api/borrow/pending
// AdminDashboard pending approvals queue
// ================================
exports.getPendingRequests = async (req, res) => {
    try {
        const pending = await BorrowRequest.getPendingRequests();
        res.json(pending);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// ================================
// GET /api/borrow/:id
// Borrow detail modal
// ================================
exports.getBorrowDetails = async (req, res) => {
    try {
        const borrow = await BorrowRequest.findById(req.params.id);
        if (!borrow) {
            return res.status(404).json({ message: 'Borrow request not found' });
        }
        res.json(borrow);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};