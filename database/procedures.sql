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
-- approve_borrow_request
-- Approves a borrow request, sets borrow status, dates, and notifies student
-- ================================
DELIMITER $$
CREATE PROCEDURE approve_borrow_request(
    IN p_borrow_id   INT,
    IN p_approver_id VARCHAR(10)
)
BEGIN
    DECLARE v_device_id  INT;
    DECLARE v_status     VARCHAR(20);
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
    SET approval_status   = 'Approved',
        borrow_status     = 'Borrowed',
        approved_by       = p_approver_id,
        approved_at       = NOW(),
        borrow_start_date = CURDATE(),
        borrow_end_date   = DATE_ADD(CURDATE(), INTERVAL 7 DAY)
    WHERE borrow_id = p_borrow_id;


    COMMIT;
END$$
DELIMITER ;


-- ================================
--  apply_fine
-- Applies a fine to a student for a borrow or damage
-- ================================
DELIMITER $$
CREATE PROCEDURE apply_fine(
    IN p_borrow_id  INT,
    IN p_student_id VARCHAR(10),
    IN p_reason     VARCHAR(255),
    IN p_amount     DECIMAL(10,2),
    IN p_imposed_by VARCHAR(10),
    IN p_due_date   DATE
)
BEGIN
    DECLARE v_exists  INT DEFAULT 0;
    DECLARE v_fine_id INT;

    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        RESIGNAL;
    END;

    -- 1. Validate borrow_id FIRST before inserting anything
    SELECT COUNT(*) INTO v_exists
    FROM borrow_requests
    WHERE borrow_id = p_borrow_id;

    IF v_exists = 0 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Invalid borrow_id for fine';
    END IF;

    -- 2. Insert fine only after validation passes
    INSERT INTO fine_reports(
        borrow_id, student_id, reason, fine_amount,
        fine_status, imposed_date, due_date, imposed_by
    )
    VALUES(
        p_borrow_id, p_student_id, p_reason, p_amount,
        'Pending', NOW(), p_due_date, p_imposed_by
    );

    SET v_fine_id = LAST_INSERT_ID();

    -- 3. Notify student
    INSERT INTO notifications(user_id, related_entity, related_id, message, notification_type)
    VALUES(
        p_student_id,
        'fine',
        v_fine_id,
        CONCAT('A fine of ৳', p_amount, ' has been imposed: ', p_reason),
        'system'
    );
END$$
DELIMITER ;


-- ================================
-- process_damage_report
-- Confirms damage, applies fine, penalizes reputation
-- ================================
DROP PROCEDURE IF EXISTS process_damage_report;

DELIMITER $$
CREATE PROCEDURE process_damage_report(
    IN p_report_id    INT,
    IN p_admin_decision ENUM('Borrower_At_Fault','Owner_At_Fault','No_Fault','Split_Cost','Request_More_Info'),
    IN p_fine_amount  DECIMAL(10,2),
    IN p_admin_id     VARCHAR(10)       -- ← added
)
BEGIN
    DECLARE v_accused_student VARCHAR(10);
    DECLARE v_borrow_id INT;

    SELECT accused_student, borrow_id
    INTO v_accused_student, v_borrow_id
    FROM damage_reports
    WHERE report_id = p_report_id;

    -- Step 1: Confirmed → trg_penalize_reputation fires
    UPDATE damage_reports
    SET status = 'Confirmed',
        admin_decision = p_admin_decision,
        fine_amount = p_fine_amount,
        fine_paid = FALSE
    WHERE report_id = p_report_id;

    -- Step 2: Apply fine if borrower at fault
    IF p_admin_decision = 'Borrower_At_Fault' AND p_fine_amount > 0 THEN
        CALL apply_fine(
            v_borrow_id,
            v_accused_student,
            'Damage reported and confirmed by admin',
            p_fine_amount,
            p_admin_id,        -- ← real student_id now
            DATE_ADD(CURDATE(), INTERVAL 14 DAY)
        );
    END IF;

    -- Step 3: Resolve
    UPDATE damage_reports
    SET status = 'Resolved',
        resolution_date = NOW()
    WHERE report_id = p_report_id;
END$$
DELIMITER ;

DELIMITER $$
CREATE PROCEDURE get_student_borrow_history(IN p_student_id VARCHAR(10))
BEGIN
    SELECT 
        br.borrow_id,
        d.device_name,
        d.device_category,
        br.borrow_start_date,
        br.borrow_end_date,
        br.return_date,
        br.borrow_status,
        br.approval_status,
        br.borrow_condition_snapshot,
        br.review_rating,
        br.review_comment,
        DATEDIFF(br.return_date, br.borrow_end_date) AS days_late
    FROM borrow_requests br
    JOIN devices d ON br.device_id = d.device_id
    WHERE br.student_id = p_student_id
    ORDER BY br.request_date DESC;
END$$
DELIMITER ;

-- Usage:
CALL get_student_borrow_history('STU001');
CALL get_student_borrow_history('STU045');




DELIMITER $$
CREATE PROCEDURE process_waitlist_next(IN p_device_id INT)
BEGIN
    DECLARE v_first_student_id VARCHAR(10);
    DECLARE v_device_name      VARCHAR(100);
    DECLARE v_owner_id         VARCHAR(10);
    DECLARE v_waitlist_id      INT;

    -- No START TRANSACTION here — caller's transaction wraps this

    SELECT w.student_id, w.waitlist_id
    INTO v_first_student_id, v_waitlist_id
    FROM waitlist w
    WHERE w.device_id = p_device_id
      AND w.status = 'waiting'
    ORDER BY w.request_time ASC
    LIMIT 1
    FOR UPDATE;

    IF v_first_student_id IS NOT NULL THEN

        SELECT device_name INTO v_device_name
        FROM devices WHERE device_id = p_device_id;

        SELECT owner_id INTO v_owner_id
        FROM device_owners WHERE device_id = p_device_id LIMIT 1;

        UPDATE waitlist
        SET status     = 'offered',
            offered_at = NOW(),
            expires_at = DATE_ADD(NOW(), INTERVAL 24 HOUR)
        WHERE waitlist_id = v_waitlist_id;

        -- Notify the student whose turn it is
        INSERT INTO notifications (user_id, title, related_entity, related_id, message, notification_type)
        VALUES (
            v_first_student_id,
            'Your Turn! Device Available',
            'device',
            p_device_id,
            CONCAT('The device "', v_device_name, '" is now available. Borrow it within 24 hours or it goes to the next person.'),
            'waitlist_turn'
        );

        -- Notify the owner
        IF v_owner_id IS NOT NULL THEN
            INSERT INTO notifications (user_id, title, related_entity, related_id, message, notification_type)
            VALUES (
                v_owner_id,
                'Waitlist User Ready',
                'device',
                p_device_id,
                CONCAT('The first person in the waitlist for "', v_device_name, '" is ready to borrow it.'),
                'waitlist_ready'
            );
        END IF;

        UPDATE devices SET device_status = 'Reserved' WHERE device_id = p_device_id;

    ELSE
        -- Queue empty — release device back to Available
        UPDATE devices SET device_status = 'Available' WHERE device_id = p_device_id;

    END IF;

    -- No COMMIT here either
END$$
DELIMITER ;