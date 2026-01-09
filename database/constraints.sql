USE StackShare;

-- ================================
-- 1️⃣ BORROW REQUESTS: VALID DATE ORDER
-- ================================
ALTER TABLE borrow_requests
ADD CONSTRAINT chk_borrow_dates
CHECK (borrow_end_date IS NULL OR borrow_start_date IS NULL OR borrow_end_date >= borrow_start_date);

ALTER TABLE borrow_requests
ADD CONSTRAINT chk_return_date
CHECK (return_date IS NULL OR borrow_start_date IS NULL OR return_date >= borrow_start_date);

-- ================================
-- 2️⃣ FINE REPORTS: CONSISTENCY
-- ================================
ALTER TABLE fine_reports
ADD CONSTRAINT chk_fine_paid_status
CHECK ((fine_status = 'Paid' AND fine_amount >= 0 AND paid_date IS NOT NULL)
    OR (fine_status <> 'Paid'));

-- ================================
-- 3️⃣ USAGE STATS: HOURS NON-NEGATIVE
-- ================================
ALTER TABLE usage_stats
ADD CONSTRAINT chk_hours_nonnegative
CHECK (hours_used >= 0);

-- ================================
-- 4️⃣ DEVICE OWNERS: NO DUPLICATES
-- ================================
ALTER TABLE device_owners
ADD CONSTRAINT uq_device_owner UNIQUE (owner_id, device_id);

-- ================================
-- 5️⃣ DAMAGE REPORTS: VALID ADMIN DECISION
-- ================================
ALTER TABLE damage_reports
ADD CONSTRAINT chk_fine_consistency
CHECK ((fine_amount > 0 AND admin_decision IN ('Borrower_At_Fault','Owner_At_Fault'))
       OR (fine_amount = 0 AND admin_decision IN ('Pending','No_Fault')));

-- ================================
-- 6️⃣ TRIGGERS
-- ================================

-- Auto set borrow_status to 'Overdue' if borrow_end_date < CURRENT_DATE
DELIMITER $$
CREATE TRIGGER trg_borrow_overdue
BEFORE UPDATE ON borrow_requests
FOR EACH ROW
BEGIN
    IF NEW.borrow_end_date IS NOT NULL AND NEW.borrow_status = 'Borrowed' AND NEW.borrow_end_date < CURDATE() THEN
        SET NEW.borrow_status = 'Overdue';
    END IF;
END$$
DELIMITER ;

-- Auto set fine_paid to TRUE if fine_status = 'Paid' (on UPDATE)
DELIMITER $$
CREATE TRIGGER trg_fine_paid_update
BEFORE UPDATE ON fine_reports
FOR EACH ROW
BEGIN
    IF NEW.fine_status = 'Paid' THEN
        SET NEW.fine_paid = TRUE;
    ELSE
        SET NEW.fine_paid = FALSE;
    END IF;
END$$
DELIMITER ;

-- Ensure borrow_start_date is not NULL when status is 'Borrowed'
DELIMITER $$
CREATE TRIGGER trg_borrow_start_not_null
BEFORE UPDATE ON borrow_requests
FOR EACH ROW
BEGIN
    IF NEW.borrow_status = 'Borrowed' AND NEW.borrow_start_date IS NULL THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Borrow start date cannot be NULL when status is Borrowed';
    END IF;
END$$
DELIMITER ;

-- Enforce borrow_end_date >= borrow_start_date on INSERT
DELIMITER $$
CREATE TRIGGER trg_borrow_dates_insert
BEFORE INSERT ON borrow_requests
FOR EACH ROW
BEGIN
    IF NEW.borrow_end_date IS NOT NULL AND NEW.borrow_start_date IS NOT NULL
       AND NEW.borrow_end_date < NEW.borrow_start_date THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Borrow end date cannot be before start date';
    END IF;
END$$
DELIMITER ;

-- Auto set fine_paid on INSERT
DELIMITER $$
CREATE TRIGGER trg_fine_paid_insert
BEFORE INSERT ON fine_reports
FOR EACH ROW
BEGIN
    IF NEW.fine_status = 'Paid' THEN
        SET NEW.fine_paid = TRUE;
    ELSE
        SET NEW.fine_paid = FALSE;
    END IF;
END$$
DELIMITER ;

-- Ensure reputation_score never goes below 0
DELIMITER $$
CREATE TRIGGER trg_reputation_min
BEFORE UPDATE ON students
FOR EACH ROW
BEGIN
    IF NEW.reputation_score < 0 THEN
        SET NEW.reputation_score = 0;
    END IF;
END$$
DELIMITER ;
