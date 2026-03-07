// models/BorrowRequest.js
const pool = require("../config/database");

class BorrowRequest {
  // ================================
  // Create borrow request
  // Called by: borrowController.createBorrowRequest
  // trg_before_borrow_insert fires automatically (validates device, student)
  // ================================
  static async create(borrowData) {
    const { student_id, device_id, borrow_start_date, borrow_end_date } =
      borrowData;

    const [result] = await pool.execute(
      `INSERT INTO borrow_requests 
                (student_id, device_id, request_date, borrow_start_date, borrow_end_date)
             VALUES (?, ?, CURDATE(), ?, ?)`,
      [student_id, device_id, borrow_start_date, borrow_end_date],
    );
    return result;
  }

  // ================================
  // Find by ID — with full join for detail modals
  // ================================
  static async findById(borrowId) {
    const [rows] = await pool.execute(
      `SELECT br.*,
                    s.student_name, s.student_email, s.whatsapp_number,
                    d.device_name, d.device_category, d.location,
                    d.condition_status, d.price_per_day
             FROM borrow_requests br
             JOIN students s ON br.student_id = s.student_id
             JOIN devices d  ON br.device_id  = d.device_id
             WHERE br.borrow_id = ?`,
      [borrowId],
    );
    return rows[0] || null;
  }

  // ================================
  // Get active borrows for a student
  // Called by: borrowerController.getActiveBorrows
  // BorrowerDashboard BorrowedItemCard.js
  // ================================
  static async getActiveBorrows(studentId) {
    const [rows] = await pool.execute(
      `SELECT br.borrow_id, br.device_id, br.borrow_start_date,
                    br.borrow_end_date, br.borrow_status, br.approval_status,
                    br.borrow_condition_snapshot,
                    d.device_name, d.device_category, d.location,
                    d.image_url, d.price_per_day,
                    DATEDIFF(CURDATE(), br.borrow_end_date) AS days_overdue
             FROM borrow_requests br
             JOIN devices d ON br.device_id = d.device_id
             WHERE br.student_id = ?
               AND br.borrow_status IN ('Borrowed','Overdue')
             ORDER BY br.borrow_end_date ASC`,
      [studentId],
    );
    return rows;
  }

  // ================================
  // Get borrow history — calls stored procedure
  // Called by: borrowerController.getBorrowHistory
  // Returns all statuses including Returned
  // ================================
  static async getBorrowHistory(studentId) {
    const [rows] = await pool.execute(`CALL get_student_borrow_history(?)`, [
      studentId,
    ]);
    return rows[0]; // procedures return results in rows[0]
  }

  // ================================
  // Get pending approvals for a device owner
  // Called by: ownerController.getDashboard
  // ================================
  static async getPendingApprovals(ownerId) {
    const [rows] = await pool.execute(
      `SELECT br.borrow_id, br.student_id, br.device_id,
                    br.request_date, br.borrow_start_date, br.borrow_end_date,
                    br.approval_status,
                    s.student_name, s.student_email,
                    s.reputation_score, s.whatsapp_number,
                    d.device_name, d.device_category
             FROM borrow_requests br
             JOIN students s     ON br.student_id  = s.student_id
             JOIN devices d      ON br.device_id   = d.device_id
             JOIN device_owners do2 ON d.device_id = do2.device_id
             WHERE do2.owner_id = ?
               AND br.approval_status = 'Pending'
             ORDER BY br.request_date ASC`,
      [ownerId],
    );
    return rows;
  }

  // ================================
  // Get active lends for owner
  // Called by: ownerController.getActiveLends
  // OwnerDashboard active lends table
  // ================================
  static async getActiveLends(ownerId) {
    const [rows] = await pool.execute(
      `SELECT br.borrow_id, br.student_id, br.device_id,
                    br.borrow_start_date, br.borrow_end_date,
                    br.borrow_status, br.approval_status,
                    s.student_name, s.whatsapp_number,
                    d.device_name, d.device_category,
                    DATEDIFF(CURDATE(), br.borrow_end_date) AS days_overdue
             FROM borrow_requests br
             JOIN students s        ON br.student_id  = s.student_id
             JOIN devices d         ON br.device_id   = d.device_id
             JOIN device_owners do2 ON d.device_id    = do2.device_id
             WHERE do2.owner_id = ?
               AND br.borrow_status IN ('Borrowed','Overdue')
             ORDER BY br.borrow_end_date ASC`,
      [ownerId],
    );
    return rows;
  }

  // ================================
  // Approve request — calls stored procedure
  // Procedure handles: device_status, notification, transaction
  // Called by: borrowController.approveBorrowRequest
  // ================================
  static async approve(borrowId, approverId) {
    const [result] = await pool.execute(`CALL approve_borrow_request(?, ?)`, [
      borrowId,
      approverId,
    ]);
    return result;
  }

  // ================================
  // Reject request
  // Called by: borrowController.rejectBorrowRequest
  // ================================
  static async reject(borrowId, approverId) {
    const [result] = await pool.execute(
      `UPDATE borrow_requests
             SET approval_status = 'Rejected',
                 approved_by     = ?,
                 approved_at     = NOW()
             WHERE borrow_id = ?`,
      [approverId, borrowId],
    );
    return result;
  }

  // ================================
  // Return device
  // Called by: borrowController.returnDevice
  // trg_device_returned fires → device_status = 'Available', borrow_count++
  // Also inserts into return_logs
  // ================================
  static async returnDevice(borrowId, returnData) {
    const { condition_status, remarks, student_id } = returnData;

    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      // 1. Update borrow status — triggers trg_before_borrow_update (sets return_date)
      //    and trg_device_returned (sets device Available)
      const [brResult] = await connection.execute(
        `UPDATE borrow_requests
                 SET borrow_status = 'Returned',
                     borrow_condition_snapshot = ?
                 WHERE borrow_id = ?`,
        [condition_status, borrowId],
      );

      // 2. Get device_id for return_logs
      const [br] = await connection.execute(
        `SELECT device_id FROM borrow_requests WHERE borrow_id = ?`,
        [borrowId],
      );

      // 3. Insert into return_logs
      await connection.execute(
        `INSERT INTO return_logs 
                    (borrow_id, device_id, returned_at, condition_status, remarks)
                 VALUES (?, ?, CURDATE(), ?, ?)`,
        [borrowId, br[0].device_id, condition_status, remarks || null],
      );

      await connection.commit();
      return brResult;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  // ================================
  // Extend borrow period
  // Called by: borrowController.extendBorrow
  // ================================
  static async extendBorrow(borrowId, newEndDate) {
    const [result] = await pool.execute(
      `UPDATE borrow_requests
             SET borrow_end_date = ?
             WHERE borrow_id = ?
               AND borrow_status IN ('Borrowed','NotStarted')`,
      [newEndDate, borrowId],
    );
    return result;
  }

  // ================================
  // Submit review after return
  // Called by: borrowController.submitReview
  // BorrowedItemCard.js review modal
  // ================================
  static async submitReview(borrowId, reviewData) {
    const { review_rating, review_comment } = reviewData;

    const [result] = await pool.execute(
      `UPDATE borrow_requests
             SET review_rating  = ?,
                 review_comment = ?
             WHERE borrow_id = ?
               AND borrow_status = 'Returned'`,
      [review_rating, review_comment, borrowId],
    );
    return result;
  }

  // ================================
  // Update borrow_status manually
  // Called by: scheduled overdue job
  // ================================
  static async updateStatus(borrowId, status) {
    const [result] = await pool.execute(
      `UPDATE borrow_requests SET borrow_status = ? WHERE borrow_id = ?`,
      [status, borrowId],
    );
    return result;
  }

  // ================================
  // Check if student already has active/pending for device
  // Called by: borrowController before create (double-check)
  // Note: trg_before_borrow_insert also validates this at DB level
  // ================================
  static async hasActiveOrPending(studentId, deviceId) {
    const [rows] = await pool.execute(
      `SELECT borrow_id FROM borrow_requests
             WHERE student_id = ? AND device_id = ?
               AND (borrow_status IN ('Borrowed','Overdue')
                    OR approval_status = 'Pending')`,
      [studentId, deviceId],
    );
    return rows.length > 0;
  }

  // ================================
  // Get all overdue borrows — Admin
  // Called by: borrowController.getOverdueBorrows
  // AdminDashboard overdue panel
  // ================================
  static async getOverdueBorrows() {
    const [rows] = await pool.execute(
      `SELECT br.borrow_id, br.student_id, br.device_id,
                    br.borrow_start_date, br.borrow_end_date,
                    DATEDIFF(CURDATE(), br.borrow_end_date) AS days_overdue,
                    s.student_name, s.student_email,
                    s.student_dept, s.whatsapp_number,
                    d.device_name, d.device_category
             FROM borrow_requests br
             JOIN students s ON br.student_id = s.student_id
             JOIN devices d  ON br.device_id  = d.device_id
             WHERE br.borrow_status = 'Overdue'
             ORDER BY days_overdue DESC`,
    );
    return rows;
  }

  // ================================
  // Get all pending requests — Admin
  // Called by: borrowController.getPendingRequests
  // AdminDashboard approval queue
  // ================================
  static async getPendingRequests() {
    const [rows] = await pool.execute(
      `SELECT br.borrow_id, br.student_id, br.device_id,
                    br.request_date, br.borrow_start_date, br.borrow_end_date,
                    br.approval_status,
                    s.student_name, s.student_email,
                    s.student_dept, s.reputation_score,
                    d.device_name, d.device_category
             FROM borrow_requests br
             JOIN students s ON br.student_id = s.student_id
             JOIN devices d  ON br.device_id  = d.device_id
             WHERE br.approval_status = 'Pending'
             ORDER BY br.request_date ASC`,
    );
    return rows;
  }

  // ================================
  // Get lend history for owner
  // Called by: ownerController.getLendHistory
  // OwnerDashboard lend history tab
  // Shows all completed (returned) borrows for owner's devices
  // ================================
  static async getLendHistoryByOwner(ownerId) {
    const [rows] = await pool.execute(
      `SELECT br.borrow_id, br.student_id, br.device_id,
                    br.borrow_start_date, br.borrow_end_date, br.return_date,
                    br.borrow_status, br.review_rating, br.review_comment,
                    s.student_name, s.student_email,
                    d.device_name, d.device_category
             FROM borrow_requests br
             JOIN students s ON br.student_id = s.student_id
             JOIN devices d ON br.device_id = d.device_id
             JOIN device_owners do2 ON d.device_id = do2.device_id
             WHERE do2.owner_id = ? AND br.borrow_status = 'Returned'
             ORDER BY br.return_date DESC
             LIMIT 20`,
      [ownerId],
    );
    return rows;
  }
}

module.exports = BorrowRequest;
