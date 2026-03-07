-- ================================
-- STRATEGY 1: QUERY PERFORMANCE INDEXES
-- Targets the most frequent WHERE, JOIN, and ORDER BY columns
-- ================================

-- BorrowerDashboard + OwnerDashboard: most common query
-- WHERE student_id = ? AND borrow_status = ?
CREATE INDEX idx_borrow_student_status 
ON borrow_requests(student_id, borrow_status);

-- AdminDashboard overdue panel:
-- WHERE borrow_status = 'Overdue' ORDER BY borrow_end_date
CREATE INDEX idx_borrow_status_enddate 
ON borrow_requests(borrow_status, borrow_end_date);

-- AdminDashboard approval panel:
-- WHERE approval_status = 'Pending'
CREATE INDEX idx_borrow_approval_status 
ON borrow_requests(approval_status);

-- DeviceBrowser: WHERE device_status = 'Available'
-- Q1 query + view_device_availability
CREATE INDEX idx_device_status 
ON devices(device_status);

-- DeviceBrowser: filter by category
-- Q6 ROLLUP query + device browser category filter
CREATE INDEX idx_device_category 
ON devices(device_category);

-- Fine modal: WHERE student_id = ? AND fine_status IN ('Pending','Overdue')
CREATE INDEX idx_fine_student_status 
ON fine_reports(student_id, fine_status);

-- Notifications bell icon: WHERE user_id = ? AND is_read = FALSE
CREATE INDEX idx_notification_user_read 
ON notifications(user_id, is_read);

-- Waitlist query: WHERE device_id = ? AND status = 'waiting'
CREATE INDEX idx_waitlist_device_status 
ON waitlist(device_id, status);

-- AdminDashboard damage reports:
-- WHERE status = 'Under_Review' ORDER BY report_date
CREATE INDEX idx_damage_status_date 
ON damage_reports(status, report_date);

-- ================================
-- STRATEGY 2: ANALYTICAL & REPORTING INDEXES
-- Targets GROUP BY, ORDER BY, and window function columns
-- used in admin reporting queries Q6-Q12
-- ================================

-- Q9: Monthly trend — GROUP BY DATE_FORMAT(request_date)
-- Q2: ORDER BY request_date DESC
CREATE INDEX idx_borrow_request_date 
ON borrow_requests(request_date);

-- Q10: Running fine total — PARTITION BY student_id ORDER BY imposed_date
CREATE INDEX idx_fine_student_date 
ON fine_reports(student_id, imposed_date);

-- Q8: RANK() by reputation — ORDER BY reputation_score DESC
-- AuthContext hasLowReputation check
CREATE INDEX idx_student_reputation 
ON students(reputation_score);

-- Q12: Damage summary GROUP BY device_category
-- Joins damage_reports → borrow_requests → devices
CREATE INDEX idx_damage_borrow_id 
ON damage_reports(borrow_id);

-- Q3: Overdue borrows with fine subquery
-- Subquery: WHERE borrow_id = br.borrow_id AND fine_status = 'Pending'
CREATE INDEX idx_fine_borrow_status 
ON fine_reports(borrow_id, fine_status);

-- Q11: Devices never borrowed — NOT IN subquery
-- SELECT DISTINCT device_id FROM borrow_requests
CREATE INDEX idx_borrow_device_id 
ON borrow_requests(device_id);

-- Audit log lookups — WHERE table_name = ? AND record_id = ?
CREATE INDEX idx_audit_table_record 
ON audit_logs(table_name, record_id);

-- FULLTEXT search: DeviceBrowser search bar searches device_name
CREATE FULLTEXT INDEX idx_device_fulltext 
ON devices(device_name, device_description);