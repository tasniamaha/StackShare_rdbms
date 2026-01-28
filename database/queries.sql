USE StackShare;

-- ================================
-- Available Devices
-- List devices that are currently available
-- ================================
SELECT device_id, device_name, device_category, condition_status, borrow_count, device_status
FROM view_device_availability
WHERE device_status = 'Available';

-- ================================
-- Borrow History of a Student

-- ================================
SELECT *
FROM view_active_borrows
WHERE student_id = 'STU001'
ORDER BY borrow_start_date DESC;

-- ================================

-- Show all borrow requests that are overdue
-- ================================
SELECT *
FROM view_active_borrows
WHERE borrow_status = 'Overdue'
ORDER BY borrow_end_date ASC;

-- ================================
--  Waitlist Priority
-- Shows students in waitlist for a device, sorted by priority_level and request_time
-- Replace 101 with actual device_id
-- ================================
SELECT w.waitlist_id, w.student_id, s.student_name, w.priority_level, w.request_time, w.status
FROM waitlist w
JOIN students s ON w.student_id = s.student_id
WHERE w.device_id = 101
ORDER BY w.priority_level DESC, w.request_time ASC;

-- ================================
-- Fine Calculation
-- Total fines per student and outstanding fines
-- ================================
SELECT student_id, student_name, 
       SUM(overdue_amount) AS total_overdue_fines
FROM view_overdue_fines
GROUP BY student_id, student_name
ORDER BY total_overdue_fines DESC;

-- ================================
-- Damage Reports Pending Review
-- Shows damage reports that have not yet been reviewed by admin
-- ================================
SELECT *
FROM view_pending_damages
ORDER BY report_date ASC;

-- ================================
--  Optional: Top 5 Most Borrowed Devices
-- ================================
SELECT *
FROM view_top_borrowed_devices;

-- Students with Active Borrows

SELECT student_id, student_name, active_borrows
FROM view_student_reputation
WHERE active_borrows > 0
ORDER BY active_borrows DESC;

-- ================================
-- Optional: Pending Notifications
-- Shows all unread notifications
-- ================================
SELECT *
FROM view_pending_notifications;
