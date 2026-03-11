// controllers/borrowController.js
const BorrowRequest = require('../models/BorrowRequest');
const Device        = require('../models/Device');
const Notification  = require('../models/Notification');
const pool          = require('../config/database');

// ================================
// POST /api/borrow/request
// Body: { device_id, borrow_start_date, borrow_end_date }
// Handles both Available (normal) and Reserved (waitlist offer) devices
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

        const device = await Device.findById(device_id);
        if (!device) {
            return res.status(404).json({ message: 'Device not found' });
        }

        // Handle each device status explicitly
        if (device.device_status === 'Borrowed') {
            return res.status(400).json({ message: 'Device is currently borrowed' });
        }

        if (device.device_status === 'Reserved') {
            // Only allow if this student has an active waitlist offer
            const [offerRows] = await pool.execute(
                `SELECT waitlist_id FROM waitlist
                 WHERE device_id  = ?
                   AND student_id = ?
                   AND status     = 'offered'`,
                [device_id, student_id]
            );
            if (offerRows.length === 0) {
                return res.status(400).json({
                    message: 'Device is reserved for another student in the waitlist'
                });
            }
            // Has active offer — fall through to create request
        }

        // ✅ includes Approved+NotStarted state
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

        // If device was Reserved, mark waitlist entry as fulfilled
        if (device.device_status === 'Reserved') {
            await pool.execute(
                `UPDATE waitlist SET status = 'fulfilled'
                 WHERE device_id  = ?
                   AND student_id = ?
                   AND status     = 'offered'`,
                [device_id, student_id]
            );
        }

        res.status(201).json({
            message:   'Borrow request created successfully',
            borrow_id: result.insertId
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// ================================
// PUT /api/borrow/approve/:id
// Admin approves — CALL approve_borrow_request procedure
// trg_notify_borrow_approved fires automatically
// trg_device_borrowed fires automatically
// ================================
exports.approveBorrowRequest = async (req, res) => {
    try {
        const borrowId  = req.params.id;
        const approverId = req.user.student_id;

        // Verify the approver owns the device being borrowed
        const [ownerCheck] = await pool.execute(
            `SELECT do2.owner_id FROM borrow_requests br
             JOIN device_owners do2 ON br.device_id = do2.device_id
             WHERE br.borrow_id = ? AND do2.owner_id = ?`,
            [borrowId, approverId]
        );
        if (ownerCheck.length === 0) {
            return res.status(403).json({ message: 'You can only approve requests for your own devices' });
        }

        await BorrowRequest.approve(borrowId, approverId);
        res.json({ message: 'Borrow request approved successfully' });
    } catch (error) {
        const status = error.message.includes('not pending') ? 400 : 500;
        res.status(status).json({ message: error.message });
    }
};

// ================================
// PUT /api/borrow/reject/:id
// Admin rejects — model validates it's still Pending
// ================================
exports.rejectBorrowRequest = async (req, res) => {
    try {
        const { id } = req.params;

        await BorrowRequest.reject(id, req.user.student_id);

        // Trigger only fires on Approved — manual notification for Rejected
        const borrow = await BorrowRequest.findById(id);
        if (borrow) {
            await Notification.create({
                user_id:           borrow.student_id,
                related_entity:    'borrow_request',
                related_id:        parseInt(id),
                title:             'Borrow Request Rejected',
                message:           `Your request for ${borrow.device_name} has been rejected.`,
                notification_type: 'borrow_rejected'
            });
        }

        res.json({ message: 'Borrow request rejected' });
    } catch (error) {
        if (error.message === 'Request is not in pending state') {
            return res.status(400).json({ message: error.message });
        }
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// ================================
// PUT /api/borrow/return/:id
// Body: { condition_status, remarks }
// trg_device_returned → device Available, borrow_count++
// trg_after_device_available → process_waitlist_next()
// ================================
exports.returnDevice = async (req, res) => {
    try {
        const { id } = req.params;
        const { condition_status, remarks } = req.body;

        if (!condition_status) {
            return res.status(400).json({ message: 'condition_status is required' });
        }

        const borrow = await BorrowRequest.findById(id);
        if (!borrow)
            return res.status(404).json({ message: 'Borrow request not found' });
        if (borrow.student_id !== req.user.student_id)
            return res.status(403).json({ message: 'Unauthorized' });

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
// Body: { new_end_date }
// ================================
exports.extendBorrow = async (req, res) => {
    try {
        const { id } = req.params;
        const { new_end_date } = req.body;

        if (!new_end_date)
            return res.status(400).json({ message: 'new_end_date is required' });

        const borrow = await BorrowRequest.findById(id);
        if (!borrow)
            return res.status(404).json({ message: 'Borrow not found' });
        if (borrow.student_id !== req.user.student_id)
            return res.status(403).json({ message: 'Unauthorized' });

        await BorrowRequest.extendBorrow(id, new_end_date);
        res.json({ message: 'Borrow period extended successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// ================================
// PUT /api/borrow/:id/review
// Body: { review_rating, review_comment }
// Only after borrow_status = 'Returned'
// ================================
exports.submitReview = async (req, res) => {
    try {
        const { id } = req.params;
        const { review_rating, review_comment } = req.body;

        if (!review_rating || review_rating < 1 || review_rating > 5)
            return res.status(400).json({ message: 'review_rating must be between 1 and 5' });

        const borrow = await BorrowRequest.findById(id);
        if (!borrow)
            return res.status(404).json({ message: 'Borrow not found' });
        if (borrow.student_id !== req.user.student_id)
            return res.status(403).json({ message: 'Unauthorized' });
        if (borrow.borrow_status !== 'Returned')
            return res.status(400).json({ message: 'Can only review a returned borrow' });

        await BorrowRequest.submitReview(id, { review_rating, review_comment });
        res.json({ message: 'Review submitted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// ================================
// GET /api/borrow/pending
// Admin — pending approval queue
// ================================
exports.getPendingRequests = async (req, res) => {
    try {
        // Owners see only their own devices' requests; admins see all
        const ownerId = req.user.role === 'admin' ? null : req.user.student_id;
        const pending = await BorrowRequest.getPendingRequests(ownerId);
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
        if (!borrow)
            return res.status(404).json({ message: 'Borrow request not found' });
        res.json(borrow);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};