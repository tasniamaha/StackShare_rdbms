
DELIMITER $$

-- 1.Check if user exists

create function user_exists(p_email varchar(50))
returns boolean 
DETERMINISTIC
BEGIN
    declare cnt int;
    select count(*) into cnt from students where student_email = p_email and p_email like '%iut-dhaka.edu';
    return cnt>0;
end$$

-- 2. Get Student Reputation

create function get_student_reputation(p_student_id varchar(10))
returns int
DETERMINISTIC
begin
    declare rep int;
    select reputation_score into rep from students where student_id = p_student_id;
    
    return rep;
end$$

-- 3. Check Device Availability

create function is_device_available(p_device_id int)
returns boolean
DETERMINISTIC
BEGIN
    declare status_val varchar(20);

    select device_status into status_val from devices where device_id = p_device_id;

    return status_val = 'Available';
END$$

-- 4. Count Active Borrows of a Student

create function active_borrow_count(p_student_id varchar(10))
returns int
DETERMINISTIC
BEGIN
    declare cnt int;

    select count(*) in into cnt from borrow_requests where student_id = p_student_id and borrow_status in ('Borrowed', 'Overdue');

    return cnt;
END$$

-- 5. Get Total Fines of a Student

create total_fine_amount(p_student_id varchar(10))
returns decimal(10,2)
DETERMINISTIC
BEGIN
    declare total decimal(10,2);

    select sum(fine_amount) into total from fine_reports where student_id = p_student_id and fine_status in ('Pending', 'Overdue');

    return ifnull(total, 0);
END$$
DELIMITER ;