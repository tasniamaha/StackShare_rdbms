USE StackShare;

-- ================================
-- 1️⃣ approve_borrow_request
-- Approves a borrow request, sets borrow status, dates, and notifies student
-- ================================
DELIMITER $$
CREATE PROCEDURE approve_borrow_request(
    IN p_borrow_id INT, 
    IN p_approver_id VARCHAR(10)
)
BEGIN
    DECLARE v_start_date DATE;
    DECLARE v_end_date DATE;

    -- Set start date as today, end date 7 days later (example)
    SET v_start_date = CURDATE();
    SET v_end_date = DATE_ADD(v_start_date, INTERVAL 7 DAY);

    -- Update borrow request
    UPDATE borrow_requests
    SET approval_status = 'Approved',
        borrow_status = 'Borrowed',
        approved_by = p_approver_id,
        approved_at = NOW(),
        borrow_start_date = v_start_date,
        borrow_end_date = v_end_date
    WHERE borrow_id = p_borrow_id;

    -- Update device status
    UPDATE devices d
    JOIN borrow_requests br ON d.device_id = br.device_id
    SET d.device_status = 'Borrowed'
    WHERE br.borrow_id = p_borrow_id;

    -- Create notification
    INSERT INTO notifications(user_id, related_entity, related_id, message, notification_type)
    SELECT student_id, 'borrow_request', borrow_id, 'Your borrow request has been approved!', 'Info'
    FROM borrow_requests
    WHERE borrow_id = p_borrow_id;
END$$
DELIMITER ;

-- ================================
-- 2️⃣ return_device
-- Marks a device as returned, updates borrow count, logs return
-- ================================
DELIMITER $$
CREATE PROCEDURE return_device(
    IN p_borrow_id INT, 
    IN p_condition VARCHAR(20), 
    IN p_remarks TEXT
)
BEGIN
    DECLARE v_device_id INT;

    -- Get device id
    SELECT device_id INTO v_device_id 
    FROM borrow_requests 
    WHERE borrow_id = p_borrow_id;

    -- Update borrow request
    UPDATE borrow_requests
    SET borrow_status = 'Returned',
        return_date = CURDATE(),
        borrow_condition_snapshot = p_condition
    WHERE borrow_id = p_borrow_id;

    -- Update device status and increment borrow_count
    UPDATE devices
    SET device_status = 'Available',
        borrow_count = borrow_count + 1
    WHERE device_id = v_device_id;

    -- Insert into return logs
    INSERT INTO return_logs(borrow_id, device_id, returned_at, condition_status, remarks)
    VALUES (p_borrow_id, v_device_id, CURDATE(), p_condition, p_remarks);
END$$
DELIMITER ;

-- ================================
-- 3️⃣ apply_fine
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
-- 4️⃣ notify_waitlist
-- Notify the next student in waitlist for a device
-- ================================
DELIMITER $$
CREATE PROCEDURE notify_waitlist(IN p_device_id INT)
BEGIN
    DECLARE v_student_id VARCHAR(10);

    -- Find the next waiting student
    SELECT student_id INTO v_student_id
    FROM waitlist
    WHERE device_id = p_device_id AND status = 'waiting'
    ORDER BY priority_level DESC, request_time ASC
    LIMIT 1;

    IF v_student_id IS NOT NULL THEN
        -- Update waitlist status to notified
        UPDATE waitlist
        SET status = 'notified'
        WHERE device_id = p_device_id AND student_id = v_student_id;

        -- Insert notification
        INSERT INTO notifications(user_id, related_entity, related_id, message, notification_type)
        VALUES (
            v_student_id, 
            'waitlist', 
            p_device_id, 
            'The device you requested is now available.', 
            'Info'
        );
    END IF;
END$$
DELIMITER ;

-- ================================
-- 5️⃣ process_damage_report
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
