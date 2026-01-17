-- ================================
-- StackShare Database Schema
-- DBMS: MySQL
-- ================================

DROP DATABASE IF EXISTS StackShare;
CREATE DATABASE StackShare;
USE StackShare;

-- ================================
-- STUDENTS
-- ================================
CREATE TABLE students (
    student_id VARCHAR(10) PRIMARY KEY,
    student_name VARCHAR(30) NOT NULL,
    student_email VARCHAR(50) NOT NULL UNIQUE,
    student_dept VARCHAR(30) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(10) DEFAULT 'student',
    reputation_score INT DEFAULT 100 CHECK (reputation_score >= 0),
    borrow_status VARCHAR(20) DEFAULT 'Active',
    suspended_until DATE
);

-- ================================
-- DEVICES
-- ================================
CREATE TABLE devices (
    device_id INT AUTO_INCREMENT PRIMARY KEY,
    device_name VARCHAR(50) NOT NULL,
    device_category VARCHAR(30) NOT NULL,
    device_status VARCHAR(20) DEFAULT 'Available',
    device_description TEXT,
    condition_status VARCHAR(20) DEFAULT 'Good',
    borrow_count INT DEFAULT 0 CHECK (borrow_count >= 0),
    location VARCHAR(50)
);

-- ================================
-- DEVICE OWNERS (M:N relationship)
-- ================================
CREATE TABLE device_owners (
    owner_id VARCHAR(10) NOT NULL,
    device_id INT NOT NULL,
    PRIMARY KEY (owner_id, device_id),
    FOREIGN KEY (owner_id) REFERENCES students(student_id) ON DELETE CASCADE,
    FOREIGN KEY (device_id) REFERENCES devices(device_id) ON DELETE CASCADE
);

-- ================================
-- BORROW REQUESTS
-- ================================
CREATE TABLE borrow_requests (
    borrow_id INT AUTO_INCREMENT PRIMARY KEY,
    student_id VARCHAR(10) NOT NULL,
    device_id INT NOT NULL,
    request_date DATE NOT NULL,

    approval_status ENUM('Pending','Approved','Rejected') DEFAULT 'Pending',
    borrow_status ENUM('NotStarted','Borrowed','Returned','Overdue') DEFAULT 'NotStarted',

    approved_by VARCHAR(10),
    approved_at DATETIME,

    borrow_start_date DATE,
    borrow_end_date DATE,
    return_date DATE,

    borrow_condition_snapshot VARCHAR(20),

    FOREIGN KEY (student_id) REFERENCES students(student_id) ON DELETE CASCADE,
    FOREIGN KEY (device_id) REFERENCES devices(device_id) ON DELETE CASCADE,
    FOREIGN KEY (approved_by) REFERENCES students(student_id)
);

-- ================================
-- WAITLIST
-- ================================
CREATE TABLE waitlist (
    waitlist_id INT AUTO_INCREMENT PRIMARY KEY,
    device_id INT NOT NULL,
    student_id VARCHAR(10) NOT NULL,
    request_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    priority_level INT DEFAULT 0,
    status ENUM('waiting','notified','expired','fulfilled','cancelled') DEFAULT 'waiting',
    UNIQUE (device_id, student_id),
    FOREIGN KEY (device_id) REFERENCES devices(device_id) ON DELETE CASCADE,
    FOREIGN KEY (student_id) REFERENCES students(student_id) ON DELETE CASCADE
);

-- ================================
-- RETURN LOGS
-- ================================
CREATE TABLE return_logs (
    return_id INT AUTO_INCREMENT PRIMARY KEY,
    borrow_id INT NOT NULL,
    device_id INT NOT NULL,
    returned_at DATE NOT NULL,
    condition_status VARCHAR(20) NOT NULL,
    remarks TEXT,
    FOREIGN KEY (borrow_id) REFERENCES borrow_requests(borrow_id) ON DELETE CASCADE,
    FOREIGN KEY (device_id) REFERENCES devices(device_id) ON DELETE CASCADE
);

-- ================================
-- DAMAGE REPORTS
-- ================================
CREATE TABLE damage_reports (
    report_id INT AUTO_INCREMENT PRIMARY KEY,
    borrow_id INT NOT NULL,
    device_id INT NOT NULL,
    reported_by VARCHAR(10) NOT NULL,
    reported_by_role ENUM('OWNER','ADMIN') NOT NULL,
    accused_student VARCHAR(10) NOT NULL,
    report_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    damage_description TEXT NOT NULL,
    status ENUM('Reported','Under_Review','Confirmed','Rejected','Resolved') DEFAULT 'Reported',
    admin_decision ENUM('Pending','Borrower_At_Fault','Owner_At_Fault','No_Fault') DEFAULT 'Pending',
    fine_amount DECIMAL(10,2) DEFAULT 0,
    fine_paid BOOLEAN DEFAULT FALSE,
    resolution_date DATETIME,

    FOREIGN KEY (borrow_id) REFERENCES borrow_requests(borrow_id) ON DELETE CASCADE,
    FOREIGN KEY (device_id) REFERENCES devices(device_id) ON DELETE CASCADE,
    FOREIGN KEY (reported_by) REFERENCES students(student_id),
    FOREIGN KEY (accused_student) REFERENCES students(student_id)
);

-- ================================
-- BROADCAST REQUESTS
-- ================================
CREATE TABLE broadcast_requests (
    broadcast_id INT AUTO_INCREMENT PRIMARY KEY,
    requester_id VARCHAR(10) NOT NULL,
    item_type VARCHAR(50) NOT NULL,
    description TEXT,
    urgency_level ENUM('Low','Medium','High') DEFAULT 'Low',
    status ENUM('Open','Fulfilled','Expired','Cancelled') DEFAULT 'Open',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (requester_id) REFERENCES students(student_id) ON DELETE CASCADE
);

-- ================================
-- BROADCAST RESPONSES
-- ================================
CREATE TABLE broadcast_responses (
    response_id INT AUTO_INCREMENT PRIMARY KEY,
    broadcast_id INT NOT NULL,
    responder_id VARCHAR(10) NOT NULL,
    device_id INT,
    response_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    status ENUM('Pending','Accepted','Rejected') DEFAULT 'Pending',
    FOREIGN KEY (broadcast_id) REFERENCES broadcast_requests(broadcast_id),
    FOREIGN KEY (responder_id) REFERENCES students(student_id),
    FOREIGN KEY (device_id) REFERENCES devices(device_id)
);

-- ================================
-- FINE REPORTS
-- ================================
CREATE TABLE fine_reports (
    fine_id INT AUTO_INCREMENT PRIMARY KEY,
    borrow_id INT NOT NULL,
    student_id VARCHAR(10) NOT NULL,
    reason VARCHAR(255) NOT NULL,
    fine_amount DECIMAL(10,2) NOT NULL CHECK (fine_amount >= 0),
    fine_status ENUM('Pending','Paid','Overdue','Waived') DEFAULT 'Pending',
    imposed_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    due_date DATE,
    paid_date DATE,
    imposed_by VARCHAR(10),
    remarks TEXT,

    FOREIGN KEY (borrow_id) REFERENCES borrow_requests(borrow_id) ON DELETE CASCADE,
    FOREIGN KEY (student_id) REFERENCES students(student_id) ON DELETE CASCADE,
    FOREIGN KEY (imposed_by) REFERENCES students(student_id)
);

-- ================================
-- NOTIFICATIONS
-- ================================
CREATE TABLE notifications (
    notification_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id VARCHAR(10) NOT NULL,
    related_entity VARCHAR(50),
    related_id INT,
    message TEXT NOT NULL,
    notification_type ENUM('Info','Warning','Alert','Reminder'),
    is_read BOOLEAN DEFAULT FALSE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES students(student_id) ON DELETE CASCADE
);

-- ================================
-- USAGE STATISTICS
-- ================================
CREATE TABLE usage_stats (
    usage_id INT AUTO_INCREMENT PRIMARY KEY,
    student_id VARCHAR(10) NOT NULL,
    device_id INT NOT NULL,
    hours_used FLOAT DEFAULT 0,
    last_used DATETIME,
    FOREIGN KEY (student_id) REFERENCES students(student_id),
    FOREIGN KEY (device_id) REFERENCES devices(device_id)
);

-- ================================
-- AUDIT LOGS
-- ================================
CREATE TABLE audit_logs (
    audit_id INT AUTO_INCREMENT PRIMARY KEY,
    table_name VARCHAR(50),
    record_id INT,
    action ENUM('INSERT','UPDATE','DELETE'),
    performed_by VARCHAR(10),
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (performed_by) REFERENCES students(student_id)
);

-- ================================
-- INSERT DEFAULT ADMIN
-- Password: admin123 (hashed with bcrypt)
-- ================================
INSERT INTO students (student_id, student_name, student_email, student_dept, password_hash, role)
VALUES (
    'ADM001', 
    'System Admin', 
    'admin@stackshare.com', 
    'Administration',
    '$2a$10$vI8aWBnW3fID.ZQ4/zo1G.q1lRps.9cGLcZEiGDMVr5yUP1KUOYTa',
    'admin'
);
