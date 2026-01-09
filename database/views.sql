USE StackShare;

-- ================================
-- 1️⃣ view_active_borrows
-- Shows all active borrows (Borrowed or Overdue) with student and device info
-- ================================
CREATE OR REPLACE VIEW view_active_borrows AS
SELECT br.borrow_id,
       br.student_id,
       s.student_name,
       br.device_id,
       d.device_name,
       br.borrow_start_date,
       br.borrow_end_date,
       br.borrow_status
FROM borrow_requests br
JOIN students s ON br.student_id = s.student_id
JOIN devices d ON br.device_id = d.device_id
WHERE br.borrow_status IN ('Borrowed','Overdue');

-- ================================
-- 2️⃣ view_device_availability
-- Shows all devices with current status and next waiting student if any
-- ================================
CREATE OR REPLACE VIEW view_device_availability AS
SELECT d.device_id,
       d.device_name,
       d.device_category,
       d.device_status,
       d.condition_status,
       d.borrow_count,
       w.student_id AS next_waiting_student,
       s.student_name AS next_waiting_student_name
FROM devices d
LEFT JOIN (
    SELECT w1.device_id, w1.student_id
    FROM waitlist w1
    JOIN (
        SELECT device_id, MIN(request_time) AS min_time
        FROM waitlist
        WHERE status = 'waiting'
        GROUP BY device_id
    ) w2 ON w1.device_id = w2.device_id AND w1.request_time = w2.min_time
) w ON d.device_id = w.device_id
LEFT JOIN students s ON w.student_id = s.student_id;

-- ================================
-- 3️⃣ view_student_reputation
-- Shows students with current reputation, number of active borrows and overdue borrows
-- ================================
CREATE OR REPLACE VIEW view_student_reputation AS
SELECT s.student_id,
       s.student_name,
       s.reputation_score,
       COUNT(CASE WHEN br.borrow_status = 'Borrowed' THEN 1 END) AS active_borrows,
       COUNT(CASE WHEN br.borrow_status = 'Overdue' THEN 1 END) AS overdue_borrows
FROM students s
LEFT JOIN borrow_requests br ON s.student_id = br.student_id
GROUP BY s.student_id, s.student_name, s.reputation_score
ORDER BY s.reputation_score DESC;

-- ================================
-- 4️⃣ view_pending_damages
-- Shows all damage reports currently under review
-- ================================
CREATE OR REPLACE VIEW view_pending_damages AS
SELECT dr.report_id,
       dr.borrow_id,
       dr.device_id,
       d.device_name,
       dr.reported_by,
       s1.student_name AS reported_by_name,
       dr.accused_student,
       s2.student_name AS accused_name,
       dr.report_date,
       dr.damage_description,
       dr.status
FROM damage_reports dr
JOIN students s1 ON dr.reported_by = s1.student_id
JOIN students s2 ON dr.accused_student = s2.student_id
JOIN devices d ON dr.device_id = d.device_id
WHERE dr.status = 'Under_Review'
ORDER BY dr.report_date ASC;

-- ================================
-- 5️⃣ view_top_borrowed_devices
-- Shows top 5 most borrowed devices
-- ================================
CREATE OR REPLACE VIEW view_top_borrowed_devices AS
SELECT device_id, device_name, borrow_count
FROM devices
ORDER BY borrow_count DESC
LIMIT 5;

-- ================================
-- 6️⃣ view_overdue_fines
-- Shows students with overdue fines and amounts
-- ================================
CREATE OR REPLACE VIEW view_overdue_fines AS
SELECT fr.student_id,
       s.student_name,
       SUM(fr.fine_amount) AS overdue_amount,
       COUNT(fr.fine_id) AS overdue_count
FROM fine_reports fr
JOIN students s ON fr.student_id = s.student_id
WHERE fr.fine_status = 'Overdue'
GROUP BY fr.student_id, s.student_name
ORDER BY overdue_amount DESC;

-- ================================
-- 7️⃣ view_pending_notifications
-- Shows all unread notifications
-- ================================
CREATE OR REPLACE VIEW view_pending_notifications AS
SELECT n.notification_id,
       n.user_id,
       s.student_name AS user_name,
       n.related_entity,
       n.related_id,
       n.message,
       n.notification_type,
       n.created_at
FROM notifications n
JOIN students s ON n.user_id = s.student_id
WHERE n.is_read = FALSE
ORDER BY n.created_at ASC;
