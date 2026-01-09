USE StackShare;

-- ================================
-- 1️⃣ Update device_status to 'Borrowed' when a borrow request starts
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
-- 2️⃣ Update device_status to 'Available' and increment borrow_count when returned
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
-- 3️⃣ Insert into audit_logs on UPDATE or DELETE of borrow_requests
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
-- 4️⃣ Auto-create notification when a borrow request is approved
-- ================================
DELIMITER $$
CREATE TRIGGER trg_notify_borrow_approved
AFTER UPDATE ON borrow_requests
FOR EACH ROW
BEGIN
    IF NEW.approval_status = 'Approved' AND OLD.approval_status <> 'Approved' THEN
        INSERT INTO notifications(user_id, related_entity, related_id, message, notification_type)
        VALUES (NEW.student_id, 'borrow_request', NEW.borrow_id, 'Your borrow request has been approved!', 'Info');
    END IF;
END$$
DELIMITER ;

-- ================================
-- 5️⃣ Penalize reputation score on confirmed damage
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
