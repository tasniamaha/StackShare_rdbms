show databases;
create database StackShare;
USE StackShare;

create table students(
	student_id varchar(10) primary key,
    student_name varchar(30) not null,
    student_email varchar(30) not null,
    student_dept varchar(30) not null,
    password_hash varchar(255) not null,
    reputation_score int default 100 check (reputation_score >= 0),
	borrow_status varchar(20) default 'Active',
    suspended_until date
);

create table devices(
    device_id int auto_increment primary key,
    device_name varchar(50) not null,
    device_category varchar(30) not null,
    device_status varchar(20) default 'Available',
    device_description text,
    condition_status varchar(20) default 'Good',
    borrow_count int default 0 check (borrow_count >= 0),
    location varchar(50)
);

create table device_owners(
    owner_id varchar(10) not null,
    device_id int not null,
    primary key (owner_id, device_id),
    
    foreign key (owner_id) references students(student_id) on delete cascade,
    foreign key (device_id) references devices(device_id) on delete cascade
);

create table borrow_requests (
    borrow_id int auto_increment primary key,

    student_id varchar(10) not null,
    device_id int not null,

    request_date date not null,

    approval_status varchar(20) default 'Pending' check (approval_status in ('Pending','Approved','Rejected','Borrowed','Returned','Cancelled')),

    approved_by varchar(10),
    approved_at datetime,

    borrow_start_date date,
    borrow_end_date date,
    return_date date,

    borrow_condition_snapshot varchar(20),

    foreign key (student_id) references students(student_id) on delete cascade,
    foreign key (device_id) references devices(device_id) on delete cascade,
    foreign key (approved_by) references students(student_id)
);

create table waitlist (
    waitlist_id int auto_increment primary key,

    device_id int not null,
    student_id varchar(10) not null,

    request_time datetime default current_timestamp,

    priority_level int default 0,

    status enum('waiting','notified','expired','fulfilled','cancelled') default 'waiting',

    foreign key (device_id) references devices(device_id) on delete cascade,
    foreign key (student_id) references students(student_id) on delete cascade,
    unique (device_id, student_id)
);

create table return_logs(
    return_id int auto_increment primary key,
    borrow_id int not null,
    device_id int not null,
    returned_at date not null,
    condition_status varchar(20) not null,
    remarks text,

    foreign key (borrow_id) references borrow_requests(borrow_id) on delete cascade
    foreign key (device_id) references devices(device_id) on delete cascade
);

CREATE TABLE damage_reports (
    report_id INT AUTO_INCREMENT PRIMARY KEY,
    borrow_id INT NOT NULL,
    device_id INT NOT NULL,
    reported_by VARCHAR(10) NOT NULL,
    reported_by_role ENUM('OWNER', 'ADMIN') NOT NULL,
    accused_student VARCHAR(10) NOT NULL,
    report_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    damage_description TEXT NOT NULL,
    status ENUM('Reported','Under_Review','Confirmed','Rejected','Resolved') DEFAULT 'Reported',
    admin_decision ENUM('Pending', 'Borrower_At_Fault','Owner_At_Fault','No_Fault') DEFAULT 'Pending',
    fine_amount DECIMAL(10,2) DEFAULT 0,
    fine_paid BOOLEAN DEFAULT FALSE,

    resolution_date DATETIME,

    FOREIGN KEY (borrow_id) REFERENCES borrow_requests(borrow_id) ON DELETE CASCADE,
    FOREIGN KEY (device_id) REFERENCES devices(device_id) ON DELETE CASCADE,
    FOREIGN KEY (reported_by) REFERENCES students(student_id),
    FOREIGN KEY (accused_student) REFERENCES students(student_id)
);
CREATE TABLE broadcast_requests (
    broadcast_id INT AUTO_INCREMENT PRIMARY KEY,
    requester_id VARCHAR(10) NOT NULL,
    item_type VARCHAR(50) NOT NULL,
    description TEXT,
    urgency_level ENUM('Low', 'Medium', 'High') DEFAULT 'Low',
    status ENUM('Open', 'Fulfilled', 'Expired', 'Cancelled') DEFAULT 'Open',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (requester_id) REFERENCES students(student_id) ON DELETE CASCADE
);
CREATE TABLE broadcast_responses (
    response_id INT AUTO_INCREMENT PRIMARY KEY,
    broadcast_id INT NOT NULL,
    responder_id VARCHAR(10) NOT NULL,
    device_id INT,
    response_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    status ENUM('Pending', 'Accepted', 'Rejected') DEFAULT 'Pending',
    FOREIGN KEY (broadcast_id) REFERENCES broadcast_requests(broadcast_id),
    FOREIGN KEY (responder_id) REFERENCES students(student_id),
    FOREIGN KEY (device_id) REFERENCES devices(device_id)
);
CREATE TABLE fine_reports (
    fine_id INT AUTO_INCREMENT PRIMARY KEY,
    borrow_id INT NOT NULL,
    student_id VARCHAR(10) NOT NULL,
    reason VARCHAR(255) NOT NULL,
    fine_amount DECIMAL(10,2) NOT NULL CHECK (fine_amount >= 0),
    fine_status ENUM('Pending', 'Paid', 'Overdue', 'Waived') DEFAULT 'Pending',
    imposed_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    due_date DATE,
    paid_date DATE,
    imposed_by VARCHAR(10),   -- admin or owner who imposed fine
    remarks TEXT,
    FOREIGN KEY (borrow_id) REFERENCES borrow_requests(borrow_id) ON DELETE CASCADE,
    FOREIGN KEY (student_id) REFERENCES students(student_id) ON DELETE CASCADE,
    FOREIGN KEY (imposed_by)REFERENCES students(student_id)
);
CREATE TABLE notifications (
    notification_id INT AUTO_INCREMENT PRIMARY KEY,

    user_id VARCHAR(10) NOT NULL,        -- receiver of the notification
    related_entity VARCHAR(50),          -- e.g., 'borrow_request', 'damage_report', 'fine'
    related_id INT,                      -- ID of the related record

    message TEXT NOT NULL,
    notification_type VARCHAR(30) CHECK (notification_type IN ('Info', 'Warning', 'Alert', 'Reminder')),

    is_read BOOLEAN DEFAULT FALSE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id) REFERENCES students(student_id) ON DELETE CASCADE
);
CREATE TABLE usage_stats (
    usage_id INT AUTO_INCREMENT PRIMARY KEY,
    student_id VARCHAR(10) NOT NULL,
    device_id INT NOT NULL,
    hours_used FLOAT DEFAULT 0,
    last_used DATETIME,
    FOREIGN KEY (student_id) REFERENCES students(student_id),
    FOREIGN KEY (device_id) REFERENCES devices(device_id)
);
CREATE TABLE audit_logs (
    audit_id INT AUTO_INCREMENT PRIMARY KEY,
    table_name VARCHAR(50),
    record_id INT,
    action ENUM('INSERT','UPDATE','DELETE'),
    performed_by VARCHAR(10),
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (performed_by) REFERENCES students(student_id)
);
