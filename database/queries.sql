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
FROM view_top_borrowed_devices LIMIT 5;

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


--Available Devices with Owner Info

SELECT 
    d.device_id,
    d.device_name,
    d.device_category,
    d.condition_status,
    d.borrow_count,
    d.device_status,
    d.price_per_day,
    s.student_name   AS owner_name,
    s.whatsapp_number AS owner_contact
FROM devices d
JOIN device_owners do2 ON d.device_id   = do2.device_id
JOIN students s        ON do2.owner_id  = s.student_id
WHERE d.device_status = 'Available'
ORDER BY d.borrow_count DESC;

-- Q2: Full Borrow History of a Student
-- Replace 'STU001' with actual student_id
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
WHERE br.student_id = 'STU001'   -- replace with actual student_id
ORDER BY br.request_date DESC;

-- Overdue Borrows with Fine Calculation
-- Multi-table join + nested subquery
-- AdminDashboard overdue panel
-- ================================
SELECT 
    br.borrow_id,
    s.student_name,
    s.student_email,
    d.device_name,
    br.borrow_end_date,
    DATEDIFF(CURDATE(), br.borrow_end_date) AS days_overdue,
    (
        SELECT IFNULL(SUM(fr.fine_amount), 0)
        FROM fine_reports fr
        WHERE fr.borrow_id = br.borrow_id
          AND fr.fine_status = 'Pending'
    ) AS pending_fine_amount
FROM borrow_requests br
JOIN students s ON br.student_id = s.student_id
JOIN devices d  ON br.device_id  = d.device_id
WHERE br.borrow_status = 'Overdue'
ORDER BY days_overdue DESC;

-- Q5: Student Fine Summary with Unpaid Breakdown
-- Multi-table join + nested subquery
-- BorrowerDashboard fines modal
-- ================================
SELECT 
    s.student_id,
    s.student_name,
    s.reputation_score,
    s.is_restricted,
    COUNT(fr.fine_id)                                           AS total_fines,
    SUM(fr.fine_amount)                                         AS total_fine_amount,
    SUM(CASE WHEN fr.fine_status = 'Pending' 
             THEN fr.fine_amount ELSE 0 END)                    AS pending_amount,
    SUM(CASE WHEN fr.fine_status = 'Paid'    
             THEN fr.fine_amount ELSE 0 END)                    AS paid_amount,
    (
        SELECT COUNT(*) FROM damage_reports dr 
        WHERE dr.accused_student = s.student_id 
          AND dr.status NOT IN ('Rejected','Resolved')
    )                                                           AS active_damage_reports
FROM students s
LEFT JOIN fine_reports fr ON s.student_id = fr.student_id
GROUP BY s.student_id, s.student_name, s.reputation_score, s.is_restricted
HAVING total_fine_amount > 0
ORDER BY pending_amount DESC;

-- ================================
-- Q6: Device Borrow Frequency by Category
-- ROLLUP for category subtotals
-- AdminDashboard analytics
-- ================================
SELECT 
    IFNULL(d.device_category, 'ALL CATEGORIES') AS category,
    COUNT(br.borrow_id)                          AS total_borrows,
    COUNT(DISTINCT br.student_id)                AS unique_borrowers,
    AVG(DATEDIFF(br.return_date, br.borrow_start_date)) AS avg_borrow_days,
    SUM(CASE WHEN br.borrow_status = 'Overdue' 
             THEN 1 ELSE 0 END)                  AS overdue_count
FROM devices d
LEFT JOIN borrow_requests br ON d.device_id = br.device_id
GROUP BY d.device_category WITH ROLLUP
ORDER BY total_borrows DESC;

-- Q7: Fine and Damage Summary by Category and Status
-- GROUPING SETS
-- AdminDashboard revenue/penalty analytics
-- ================================
SELECT 
    d.device_category,
    fr.fine_status,
    COUNT(fr.fine_id)       AS fine_count,
    SUM(fr.fine_amount)     AS total_amount
FROM fine_reports fr
JOIN borrow_requests br ON fr.borrow_id   = br.borrow_id
JOIN devices d          ON br.device_id   = d.device_id
GROUP BY GROUPING SETS (
    (d.device_category, fr.fine_status),  -- per category per status
    (d.device_category),                  -- per category total
    (fr.fine_status),                     -- per status total
    ()                                    -- grand total
)
ORDER BY d.device_category, fr.fine_status;

-- ================================
-- Q8: Student Borrow Ranking by Reputation
-- Analytical — RANK + window function
-- AdminDashboard student stats table
-- ================================
SELECT 
    s.student_id,
    s.student_name,
    s.student_dept,
    s.reputation_score,
    s.is_restricted,
    COUNT(br.borrow_id)                              AS total_borrows,
    RANK()     OVER (ORDER BY s.reputation_score DESC)         AS reputation_rank,
    RANK()     OVER (PARTITION BY s.student_dept 
                    ORDER BY s.reputation_score DESC)          AS dept_reputation_rank,
    PERCENT_RANK() OVER (ORDER BY s.reputation_score DESC)     AS reputation_percentile
FROM students s
LEFT JOIN borrow_requests br ON s.student_id = br.student_id
WHERE s.role = 'student'
GROUP BY s.student_id, s.student_name, s.student_dept, 
         s.reputation_score, s.is_restricted
ORDER BY reputation_rank;

-- ================================
-- Q9: Monthly Borrow Trend
-- Analytical — LAG window function
-- AdminDashboard usage trend chart
-- ================================
SELECT 
    DATE_FORMAT(br.request_date, '%Y-%m')           AS borrow_month,
    COUNT(br.borrow_id)                             AS total_requests,
    SUM(CASE WHEN br.approval_status = 'Approved' 
             THEN 1 ELSE 0 END)                     AS approved,
    SUM(CASE WHEN br.borrow_status = 'Overdue'  
             THEN 1 ELSE 0 END)                     AS overdue,
    LAG(COUNT(br.borrow_id)) 
        OVER (ORDER BY DATE_FORMAT(br.request_date, '%Y-%m')) AS prev_month_requests,
    COUNT(br.borrow_id) - 
        LAG(COUNT(br.borrow_id)) 
        OVER (ORDER BY DATE_FORMAT(br.request_date, '%Y-%m')) AS month_over_month_change
FROM borrow_requests br
GROUP BY borrow_month
ORDER BY borrow_month;

-- ================================
-- Q10: Running Fine Total per Student
-- Analytical — SUM() running total window function
-- BorrowerDashboard fine history timeline
-- ================================
SELECT 
    fr.fine_id,
    s.student_name,
    fr.reason,
    fr.fine_amount,
    fr.fine_status,
    fr.imposed_date,
    SUM(fr.fine_amount) 
        OVER (PARTITION BY fr.student_id 
              ORDER BY fr.imposed_date 
              ROWS UNBOUNDED PRECEDING)             AS running_total,
    AVG(fr.fine_amount) 
        OVER (PARTITION BY fr.student_id)           AS avg_fine_for_student
FROM fine_reports fr
JOIN students s ON fr.student_id = s.student_id
ORDER BY fr.student_id, fr.imposed_date;

-- ================================
-- Q11: Devices Never Borrowed
-- Nested subquery
-- AdminDashboard underutilised devices report
-- ================================
SELECT 
    d.device_id,
    d.device_name,
    d.device_category,
    d.device_status,
    d.condition_status,
    s.student_name AS owner_name
FROM devices d
JOIN device_owners do2 ON d.device_id  = do2.device_id
JOIN students s        ON do2.owner_id = s.student_id
WHERE d.device_id NOT IN (
    SELECT DISTINCT device_id 
    FROM borrow_requests
    WHERE borrow_status IN ('Borrowed','Returned','Overdue')
)
ORDER BY d.device_category;

-- ================================
-- Q12: Damage Report Resolution Summary
-- Multi-table join + CASE breakdown
-- AdminDashboard complaint resolution stats
-- ================================
SELECT 
    d.device_category,
    COUNT(dr.report_id)                                          AS total_reports,
    SUM(CASE WHEN dr.admin_decision = 'Borrower_At_Fault' 
             THEN 1 ELSE 0 END)                                  AS borrower_fault,
    SUM(CASE WHEN dr.admin_decision = 'Owner_At_Fault'    
             THEN 1 ELSE 0 END)                                  AS owner_fault,
    SUM(CASE WHEN dr.admin_decision = 'Split_Cost'        
             THEN 1 ELSE 0 END)                                  AS split_cost,
    SUM(CASE WHEN dr.admin_decision = 'No_Fault'          
             THEN 1 ELSE 0 END)                                  AS no_fault,
    SUM(CASE WHEN dr.admin_decision = 'Pending'           
             THEN 1 ELSE 0 END)                                  AS still_pending,
    IFNULL(SUM(dr.fine_amount), 0)                               AS total_fines_issued,
    AVG(DATEDIFF(dr.resolution_date, dr.report_date))            AS avg_resolution_days
FROM damage_reports dr
JOIN devices d ON dr.device_id = d.device_id
GROUP BY d.device_category
ORDER BY total_reports DESC;