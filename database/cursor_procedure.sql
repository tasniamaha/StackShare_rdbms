DELIMITER $$
create procedure send_return_reminders()
begin
    declare done INT DEFAULT FALSE;
    declare v_borrow_id  INT;
    declare v_student_id VARCHAR(10);
    declare v_device_name VARCHAR(50);

    declareE cur cursor for
        select br.borrow_id, br.student_id, d.device_name from borrow_requests br join devices d on br.device_id = d.device_id where br.borrow_status = 'Borrowed'
        and br.borrow_end_date = DATE_ADD(CURDATE(), INTERVAL 1 DAY);

    decalre continue handler for not found set done=TRUE;
    open cur;
    read_loop: loop
        fetch cur into v_borrow_id, v_student_id, v_device_name;
            if done then leave read_loop; 
        end if;

        insert into notifications(user_id, related_entity, related_id, message, notification_type)
        values (v_student_id, 'borrow_request', v_borrow_id,
                CONCAT('Reminder: Please return "', v_device_name, '" tomorrow.'),
                'Reminder');
    end loop;
    close cur;
END$$
DELIMITER ;