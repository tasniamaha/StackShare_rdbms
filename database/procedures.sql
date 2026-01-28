USE StackShare;
DELIMITER $$

CREATE PROCEDURE assign_device_owner(
    IN p_student_id VARCHAR(10),
    IN p_device_id INT
)
BEGIN
    DECLARE v_student_exists INT;
    DECLARE v_device_exists INT;
    DECLARE v_already_owner INT;

    -- 1. Check if student exists
    SELECT COUNT(*) INTO v_student_exists
    FROM students
    WHERE student_id = p_student_id;

    IF v_student_exists = 0 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Student does not exist';
    END IF;

    -- 2. Check if device exists
    SELECT COUNT(*) INTO v_device_exists
    FROM devices
    WHERE device_id = p_device_id;

    IF v_device_exists = 0 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Device does not exist';
    END IF;

    -- 3. Check if student is already an owner
    SELECT COUNT(*) INTO v_already_owner
    FROM device_owners
    WHERE owner_id = p_student_id
      AND device_id = p_device_id;

    IF v_already_owner > 0 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Student is already an owner of this device';
    END IF;

    -- 4. Insert ownership record
    INSERT INTO device_owners (owner_id, device_id)
    VALUES (p_student_id, p_device_id);
END$$

DELIMITER ;

-- ================================
--  approve_borrow_request
-- Approves a borrow request, sets borrow status, dates, and notifies student
-- ================================
DELIMITER $$

CREATE PROCEDURE approve_borrow_request(
    IN p_borrow_id INT,
    IN p_approver_id VARCHAR(10)
)
BEGIN
    DECLARE v_device_id INT;
    DECLARE v_status VARCHAR(20);
    DECLARE v_student_id VARCHAR(10);

    START TRANSACTION;

    SELECT device_id, approval_status, student_id
    INTO v_device_id, v_status, v_student_id
    FROM borrow_requests
    WHERE borrow_id = p_borrow_id
    FOR UPDATE;

    IF v_status <> 'Pending' THEN
        ROLLBACK;
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Borrow request is not pending';
    END IF;

    UPDATE borrow_requests
    SET approval_status = 'Approved',
        borrow_status = 'Borrowed',
        approved_by = p_approver_id,
        approved_at = NOW(),
        borrow_start_date = CURDATE(),
        borrow_end_date = DATE_ADD(CURDATE(), INTERVAL 7 DAY)
    WHERE borrow_id = p_borrow_id;

    UPDATE devices
    SET device_status = 'Borrowed'
    WHERE device_id = v_device_id
      AND device_status = 'Available';

    INSERT INTO notifications (
        user_id, related_entity, related_id, message, notification_type
    )
    SELECT
        v_student_id,
        'borrow_request',
        p_borrow_id,
        'Your borrow request has been approved',
        'Info';

    COMMIT;
END$$

DELIMITER ;
-- ================================
--  apply_fine
-- Applies a fine to a student for a borrow or damage
-- ================================
DELIMITER $$
CREATE PROCEDURE apply_fine(
    IN p_borrow_id INT,
    IN p_student_id VARCHAR(10),
    IN p_reason VARCHAR(255),
    IN p_amount DECIMAL(10,2),
    IN p_imposed_by VARCHAR(10),
    IN p_due_date DATE
)
BEGIN
    INSERT INTO fine_reports(
        borrow_id, student_id, reason, fine_amount, fine_status, imposed_date, due_date, imposed_by
    ) VALUES (
        p_borrow_id, p_student_id, p_reason, p_amount, 'Pending', NOW(), p_due_date, p_imposed_by
    );
    SELECT COUNT(*) INTO v_exists
    FROM borrow_requests
    WHERE borrow_id = p_borrow_id;

    IF v_exists = 0 THEN
        ROLLBACK;
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Invalid borrow_id for fine';
    END IF;
    -- Notify student
    INSERT INTO notifications(user_id, related_entity, related_id, message, notification_type)
    VALUES (
        p_student_id, 
        'fine', 
        LAST_INSERT_ID(), 
        CONCAT('A fine of ', p_amount, ' has been imposed: ', p_reason), 
        'Alert'
    );
END$$
DELIMITER ;

-- ================================
-- notify_waitlist
-- Notify the next student in waitlist for a device
-- ================================
DELIMITER $$

CREATE PROCEDURE notify_waitlist(IN p_device_id INT)
BEGIN
    DECLARE v_student_id VARCHAR(10);

    -- Pick first waiting student
    SELECT student_id
    INTO v_student_id
    FROM waitlist
    WHERE device_id = p_device_id
      AND status = 'waiting'
    ORDER BY priority_level DESC, request_time ASC
    LIMIT 1;

    IF v_student_id IS NOT NULL THEN

        -- Reserve the device
        UPDATE devices
        SET device_status = 'Reserved'
        WHERE device_id = p_device_id
          AND device_status = 'Available';

        -- Offer device to student
        UPDATE waitlist
        SET status = 'offered'
        WHERE device_id = p_device_id
          AND student_id = v_student_id;

        -- Notify student
        INSERT INTO notifications(
            user_id, related_entity, related_id, message, notification_type
        )
        VALUES (
            v_student_id,
            'waitlist',
            p_device_id,
            'You have priority to borrow this device. Please respond within the allowed time.',
            'Info'
        );

    END IF;
END$$

DELIMITER ;


-- ================================
-- process_damage_report
-- Confirms damage, applies fine, penalizes reputation
-- ================================
DELIMITER $$
CREATE PROCEDURE process_damage_report(
    IN p_report_id INT,
    IN p_admin_decision ENUM('Borrower_At_Fault','Owner_At_Fault','No_Fault'),
    IN p_fine_amount DECIMAL(10,2)
)
BEGIN
    DECLARE v_accused_student VARCHAR(10);

    -- Get accused student
    SELECT accused_student INTO v_accused_student
    FROM damage_reports
    WHERE report_id = p_report_id;

    -- Update damage report
    UPDATE damage_reports
    SET status = 'Resolved',
        admin_decision = p_admin_decision,
        fine_amount = p_fine_amount,
        fine_paid = FALSE,
        resolution_date = NOW()
    WHERE report_id = p_report_id;

    -- Apply fine if needed
    IF p_admin_decision = 'Borrower_At_Fault' AND p_fine_amount > 0 THEN
        CALL apply_fine(
            (SELECT borrow_id FROM damage_reports WHERE report_id = p_report_id),
            v_accused_student,
            'Damage reported and confirmed by admin',
            p_fine_amount,
            'ADMIN',
            DATE_ADD(CURDATE(), INTERVAL 14 DAY)
        );

        -- Penalize reputation
        UPDATE students
        SET reputation_score = reputation_score - 10
        WHERE student_id = v_accused_student;
    END IF;
END$$
DELIMITER ;
