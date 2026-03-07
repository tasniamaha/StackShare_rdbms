USE StackShare;
-- auto audit on user creation

DELIMITER $$

CREATE TRIGGER after_student_insert
AFTER INSERT ON students
FOR EACH ROW
BEGIN
    INSERT INTO audit_logs (
        table_name,
        record_id,
        action,
        performed_by
    )
    VALUES (
        'students',
        NEW.student_id,
        'INSERT',
        NEW.student_id
    );
END$$

DELIMITER ;

-- ================================
-- Update device_status to 'Borrowed' when a borrow request starts
-- ================================
DELIMITER $$
CREATE TRIGGER trg_device_borrowed
AFTER UPDATE ON borrow_requests
FOR EACH ROW
BEGIN
    IF NEW.borrow_status = 'Borrowed' AND OLD.borrow_status <> 'Borrowed' THEN
        UPDATE devices
        SET device_status = 'Borrowed'
        WHERE device_id = NEW.device_id;
    END IF;
END$$
DELIMITER ;

-- ================================
-- Update device_status to 'Available' and increment borrow_count when returned
-- ================================
DELIMITER $$
CREATE TRIGGER trg_device_returned
AFTER UPDATE ON borrow_requests
FOR EACH ROW
BEGIN
    IF NEW.borrow_status = 'Returned' AND OLD.borrow_status <> 'Returned' THEN
        UPDATE devices
        SET device_status = 'Available',
            borrow_count = borrow_count + 1
        WHERE device_id = NEW.device_id;
    END IF;
END$$
DELIMITER ;

-- ================================
-- Insert into audit_logs on UPDATE or DELETE of borrow_requests
-- ================================
DELIMITER $$
CREATE TRIGGER trg_audit_borrow_update
AFTER UPDATE ON borrow_requests
FOR EACH ROW
BEGIN
    INSERT INTO audit_logs(table_name, record_id, action, performed_by)
    VALUES ('borrow_requests', NEW.borrow_id, 'UPDATE', NEW.student_id);
END$$
DELIMITER ;

DELIMITER $$
CREATE TRIGGER trg_audit_borrow_delete
AFTER DELETE ON borrow_requests
FOR EACH ROW
BEGIN
    INSERT INTO audit_logs(table_name, record_id, action, performed_by)
    VALUES ('borrow_requests', OLD.borrow_id, 'DELETE', OLD.student_id);
END$$
DELIMITER ;

-- ================================
-- Auto-create notification when a borrow request is approved
-- ================================
DELIMITER $$
CREATE TRIGGER trg_notify_borrow_approved
AFTER UPDATE ON borrow_requests
FOR EACH ROW
BEGIN
    IF NEW.approval_status = 'Approved' AND OLD.approval_status <> 'Approved' THEN
        INSERT INTO notifications(user_id, related_entity, related_id, message, notification_type)
        VALUES (NEW.student_id, 'borrow_request', NEW.borrow_id, 'Your borrow request has been approved!', 'borrow_request');
    END IF;
END$$
DELIMITER ;

-- ================================
-- Penalize reputation score on confirmed damage
-- ================================
DELIMITER $$
CREATE TRIGGER trg_penalize_reputation
AFTER UPDATE ON damage_reports
FOR EACH ROW
BEGIN
    IF NEW.status = 'Confirmed' AND OLD.status <> 'Confirmed' THEN
        -- Deduct 10 points from accused_student
        UPDATE students
        SET reputation_score = GREATEST(reputation_score - 10, 0)
        WHERE student_id = NEW.accused_student;
    END IF;
END$$
DELIMITER ;
-- validate device availability,student status,Student must not already have a pending request for the same device
DELIMITER $$
CREATE TRIGGER trg_before_borrow_insert
BEFORE INSERT ON borrow_requests
FOR EACH ROW
BEGIN
    DECLARE v_device_status VARCHAR(20);
    DECLARE v_is_restricted BOOLEAN;
    DECLARE v_duplicate INT;

    -- 1. Check device is available
    SELECT device_status INTO v_device_status
    FROM devices
    WHERE device_id = NEW.device_id;

    IF v_device_status != 'Available' THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Device is not available for borrowing';
    END IF;

    -- 2. Check student is not restricted
    SELECT is_restricted INTO v_is_restricted
    FROM students
    WHERE student_id = NEW.student_id;

    IF v_is_restricted = TRUE THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Your account is restricted. Resolve outstanding issues first.';
    END IF;

    -- 3. Prevent duplicate pending request
    SELECT COUNT(*) INTO v_duplicate
    FROM borrow_requests
    WHERE student_id = NEW.student_id
      AND device_id = NEW.device_id
      AND approval_status = 'Pending';

    IF v_duplicate > 0 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'You already have a pending request for this device';
    END IF;
END$$
DELIMITER ;

--before a fine is inserted, validate the amount is within policy limits and the student exists
DELIMITER $$
CREATE TRIGGER trg_before_fine_insert
BEFORE INSERT ON fine_reports
FOR EACH ROW
BEGIN
    DECLARE v_student_exists INT;
    DECLARE v_borrow_exists  INT;

    -- 1. Validate student exists
    SELECT COUNT(*) INTO v_student_exists
    FROM students
    WHERE student_id = NEW.student_id;

    IF v_student_exists = 0 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Student does not exist';
    END IF;

    -- 2. Validate fine amount is not negative
    IF NEW.fine_amount < 0 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Fine amount cannot be negative';
    END IF;

    -- 3. Auto-set due_date if not provided (14 days from now per policyRules.js)
    IF NEW.due_date IS NULL THEN
        SET NEW.due_date = DATE_ADD(CURDATE(), INTERVAL 14 DAY);
    END IF;
END$$
DELIMITER ;



--before a return is processed, validate the transition is legal:
DELIMITER $$
CREATE TRIGGER trg_before_borrow_update
BEFORE UPDATE ON borrow_requests
FOR EACH ROW
BEGIN
    -- 1. Prevent returning an already returned borrow
    IF NEW.borrow_status = 'Returned' AND OLD.borrow_status = 'Returned' THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Device has already been returned';
    END IF;

    -- 2. Prevent approving an already approved request
    IF NEW.approval_status = 'Approved' AND OLD.approval_status = 'Approved' THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Borrow request is already approved';
    END IF;

    -- 3. Auto-set return_date when status changes to Returned
    IF NEW.borrow_status = 'Returned' AND OLD.borrow_status != 'Returned' THEN
        SET NEW.return_date = CURDATE();
    END IF;
END$$
DELIMITER ;

--before a damage report is filed, validate the borrow actually exists and is in a returnable state:
DELIMITER $$
CREATE TRIGGER trg_before_damage_insert
BEFORE INSERT ON damage_reports
FOR EACH ROW
BEGIN
    DECLARE v_borrow_status VARCHAR(20);
    DECLARE v_existing_report INT;

    -- 1. Check borrow exists and is in valid state
    SELECT borrow_status INTO v_borrow_status
    FROM borrow_requests
    WHERE borrow_id = NEW.borrow_id;

    IF v_borrow_status IS NULL THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Borrow record does not exist';
    END IF;

    IF v_borrow_status NOT IN ('Borrowed', 'Returned', 'Overdue') THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Cannot file damage report for this borrow status';
    END IF;

    -- 2. Prevent duplicate damage report for same borrow
    SELECT COUNT(*) INTO v_existing_report
    FROM damage_reports
    WHERE borrow_id = NEW.borrow_id
      AND status NOT IN ('Rejected', 'Resolved');

    IF v_existing_report > 0 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'An active damage report already exists for this borrow';
    END IF;
END$$
DELIMITER ;
-- before a student is registered, validate email format and that admin role cannot have sub-roles:
DELIMITER $$
CREATE TRIGGER trg_before_student_insert
BEFORE insert ON students
FOR EACH ROW
BEGIN
    -- 1. Validate email format
    IF NEW.student_email NOT LIKE '%@%.%' THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Invalid email format';
    END IF;

    -- 2. Admin cannot have can_borrow or can_lend
    IF NEW.role = 'admin' THEN
        SET NEW.can_borrow = FALSE;
        SET NEW.can_lend   = FALSE;
    END IF;

    -- 3. Default reputation for new student
    IF NEW.reputation_score IS NULL THEN
        SET NEW.reputation_score = 100;
    END IF;
END$$
DELIMITER ;

DELIMITER $$

CREATE TRIGGER trg_after_device_available
AFTER UPDATE ON borrow_requests
FOR EACH ROW
BEGIN
    -- Device just became free
    IF NEW.borrow_status = 'Returned' 
       AND OLD.borrow_status != 'Returned' THEN

        -- Optional: make sure device is really available
        UPDATE devices 
        SET device_status = 'Available'
        WHERE device_id = NEW.device_id
          AND device_status != 'Available';

        -- Call procedure to notify next in line
        CALL process_waitlist_next(NEW.device_id);

    END IF;
END$$

DELIMITER ;