USE StackShare;

-- ================================
-- Alter students table for constraints
-- ================================
ALTER TABLE students
-- Email must end with '@iut-dhaka.edu' and be unique
ADD CONSTRAINT chk_student_email
CHECK (student_email LIKE '%@iut-dhaka.edu');

ALTER TABLE students
ADD CONSTRAINT chk_student_role
CHECK (role IN ('student', 'admin'));


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
CHECK (
    (fine_status = 'Paid' AND paid_date IS NOT NULL)
    OR (fine_status <> 'Paid')
);

-- ================================
-- USAGE STATS: HOURS NON-NEGATIVE
-- ================================
ALTER TABLE usage_stats
ADD CONSTRAINT chk_hours_nonnegative
CHECK (hours_used >= 0);

-- ================================
-- DAMAGE REPORTS: VALID ADMIN DECISION
-- ================================
ALTER TABLE damage_reports
ADD CONSTRAINT chk_fine_consistency
CHECK (
    -- Decisions that can have a fine amount
    (admin_decision IN ('Borrower_At_Fault', 'Owner_At_Fault', 'Split_Cost') 
     AND fine_amount >= 0)
    OR
    -- Decisions that should have no fine
    (admin_decision IN ('Pending', 'No_Fault', 'Request_More_Info') 
     AND fine_amount = 0)
);
