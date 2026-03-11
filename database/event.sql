USE StackShare;

-- Make sure the event scheduler is enabled (run once, usually in your setup script)
SET GLOBAL event_scheduler = ON;

-- ================================
-- Advance waitlist: expire old offers and move to next person
-- Runs every hour
-- ================================
DELIMITER $$

CREATE EVENT evt_advance_waitlist
ON SCHEDULE EVERY 1 HOUR
STARTS CURRENT_TIMESTAMP
DO
BEGIN
    DECLARE v_device_id INT;
    DECLARE v_waitlist_id INT;
    DECLARE v_student_id VARCHAR(10);
    DECLARE done INT DEFAULT FALSE;

    DECLARE cur CURSOR FOR
        SELECT device_id, waitlist_id, student_id
        FROM waitlist
        WHERE status = 'offered'
          AND expires_at < NOW();

    DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = TRUE;

    OPEN cur;

    read_loop: LOOP
        FETCH cur INTO v_device_id, v_waitlist_id, v_student_id;
        IF done THEN
            LEAVE read_loop;
        END IF;

        -- 1. Expire this offer
        UPDATE waitlist 
        SET status = 'waitlist_expired',
            updated_at = NOW()
        WHERE waitlist_id = v_waitlist_id;

        -- 2. Notify the user that their offer expired
        INSERT INTO notifications (
            user_id, 
            title, 
            related_entity, 
            related_id, 
            message, 
            notification_type,
            created_at
        ) VALUES (
            v_student_id,
            'Waitlist Offer Expired',
            'device',
            v_device_id,
            'Your offer to borrow this device has expired. You have been moved back in the queue.',
            'waitlist_expired',
            NOW()
        );

        -- 3. Automatically offer to the next person
        CALL process_waitlist_next(v_device_id);

    END LOOP;

    CLOSE cur;
END$$

DELIMITER ;
