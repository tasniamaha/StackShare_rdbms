USE StackShare;

-- ================================
-- Alter students table for constraints
-- ================================
ALTER TABLE students
-- Email must end with '@iut-dhaka.edu' and be unique
ADD CONSTRAINT chk_student_email
CHECK (student_email LIKE '%@iut-dhaka.edu');

ALTER TABLE students
-- Role must be either 'student', 'admin', or 'owner'
ADD CONSTRAINT chk_student_role
CHECK (role IN ('student', 'admin', 'owner'));


-- ================================
-- BORROW REQUESTS: VALID DATE ORDER
-- ================================
ALTER TABLE borrow_requests
ADD CONSTRAINT chk_borrow_dates
CHECK (borrow_end_date IS NULL OR borrow_start_date IS NULL OR borrow_end_date >= borrow_start_date);

ALTER TABLE borrow_requests
ADD CONSTRAINT chk_return_date
CHECK (return_date IS NULL OR borrow_start_date IS NULL OR return_date >= borrow_start_date);

-- ================================
-- FINE REPORTS: CONSISTENCY
-- ================================
ALTER TABLE fine_reports
ADD CONSTRAINT chk_fine_paid_status
CHECK ((fine_status = 'Paid' AND fine_amount >= 0 AND paid_date IS NOT NULL)
    OR (fine_status <> 'Paid'));

-- ================================
-- USAGE STATS: HOURS NON-NEGATIVE
-- ================================
ALTER TABLE usage_stats
ADD CONSTRAINT chk_hours_nonnegative
CHECK (hours_used >= 0);

-- ================================
-- DEVICE OWNERS: NO DUPLICATES
-- ================================
ALTER TABLE device_owners
ADD CONSTRAINT uq_device_owner UNIQUE (owner_id, device_id);

-- ================================
-- DAMAGE REPORTS: VALID ADMIN DECISION
-- ================================
ALTER TABLE damage_reports
ADD CONSTRAINT chk_fine_consistency
CHECK ((fine_amount > 0 AND admin_decision IN ('Borrower_At_Fault','Owner_At_Fault'))
       OR (fine_amount = 0 AND admin_decision IN ('Pending','No_Fault')));
