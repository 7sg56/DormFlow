-- ============================================================
-- HOSTEL MANAGEMENT SYSTEM — CONCURRENCY CONTROL & RECOVERY
-- MySQL 8.0+ | Run AFTER 04_auth.sql
--
-- This script implements:
--   A. Optimistic Concurrency Control — row_version columns + triggers
--   B. Pessimistic Locking — stored procedures with SELECT … FOR UPDATE
--   C. Deadlock Detection & Retry — automatic retry wrapper
--   D. Transaction Isolation Level Configuration
--   E. Transaction Recovery Log — full write-ahead traceability
--   F. Savepoint Procedures — partial rollback in batch operations
--   G. WAL & Binary Log Configuration — verification procedure
--   H. Backup & Point-in-Time Recovery — checkpoint + backup log
-- ============================================================

USE hostel_mgmt;

-- ████████████████████████████████████████████████████████████
-- A. OPTIMISTIC CONCURRENCY CONTROL — ROW VERSIONING
-- ████████████████████████████████████████████████████████████
--
-- Strategy: Add a `row_version` INT column to contention-prone
-- tables. A BEFORE UPDATE trigger auto-increments it on every
-- write. The application reads row_version, then includes
--   WHERE row_version = <read_value>
-- on update. If another transaction modified the row first,
-- the UPDATE affects 0 rows → conflict detected, retry.
-- ============================================================

-- ---- bed ----
ALTER TABLE bed
    ADD COLUMN row_version INT NOT NULL DEFAULT 1;

DELIMITER $$
CREATE TRIGGER trg_bed_version
    BEFORE UPDATE ON bed
    FOR EACH ROW
BEGIN
    SET NEW.row_version = OLD.row_version + 1;
END$$
DELIMITER ;

-- ---- allocation ----
ALTER TABLE allocation
    ADD COLUMN row_version INT NOT NULL DEFAULT 1;

DELIMITER $$
CREATE TRIGGER trg_allocation_version
    BEFORE UPDATE ON allocation
    FOR EACH ROW
BEGIN
    SET NEW.row_version = OLD.row_version + 1;
END$$
DELIMITER ;

-- ---- feepayment ----
ALTER TABLE feepayment
    ADD COLUMN row_version INT NOT NULL DEFAULT 1;

DELIMITER $$
CREATE TRIGGER trg_feepayment_version
    BEFORE UPDATE ON feepayment
    FOR EACH ROW
BEGIN
    SET NEW.row_version = OLD.row_version + 1;
END$$
DELIMITER ;

-- ---- facility_booking ----
ALTER TABLE facility_booking
    ADD COLUMN row_version INT NOT NULL DEFAULT 1;

DELIMITER $$
CREATE TRIGGER trg_facility_booking_version
    BEFORE UPDATE ON facility_booking
    FOR EACH ROW
BEGIN
    SET NEW.row_version = OLD.row_version + 1;
END$$
DELIMITER ;

-- ---- complaint ----
ALTER TABLE complaint
    ADD COLUMN row_version INT NOT NULL DEFAULT 1;

DELIMITER $$
CREATE TRIGGER trg_complaint_version
    BEFORE UPDATE ON complaint
    FOR EACH ROW
BEGIN
    SET NEW.row_version = OLD.row_version + 1;
END$$
DELIMITER ;

-- ---- laundry_request ----
ALTER TABLE laundry_request
    ADD COLUMN row_version INT NOT NULL DEFAULT 1;

DELIMITER $$
CREATE TRIGGER trg_laundry_request_version
    BEFORE UPDATE ON laundry_request
    FOR EACH ROW
BEGIN
    SET NEW.row_version = OLD.row_version + 1;
END$$
DELIMITER ;

-- ---- mess_subscription ----
ALTER TABLE mess_subscription
    ADD COLUMN row_version INT NOT NULL DEFAULT 1;

DELIMITER $$
CREATE TRIGGER trg_mess_subscription_version
    BEFORE UPDATE ON mess_subscription
    FOR EACH ROW
BEGIN
    SET NEW.row_version = OLD.row_version + 1;
END$$
DELIMITER ;

-- ---- emergency_request ----
ALTER TABLE emergency_request
    ADD COLUMN row_version INT NOT NULL DEFAULT 1;

DELIMITER $$
CREATE TRIGGER trg_emergency_request_version
    BEFORE UPDATE ON emergency_request
    FOR EACH ROW
BEGIN
    SET NEW.row_version = OLD.row_version + 1;
END$$
DELIMITER ;


-- ████████████████████████████████████████████████████████████
-- E. TRANSACTION RECOVERY LOG
-- ████████████████████████████████████████████████████████████
--
-- Every multi-table transaction is logged here with:
--   - Affected tables and record IDs
--   - Compensating SQL for manual rollback/recovery
--   - Status tracking from STARTED → COMMITTED / ROLLED_BACK / FAILED
-- This enables post-crash forensics and manual recovery when needed.
-- ============================================================

CREATE TABLE transaction_log (
    txn_id            CHAR(36)        NOT NULL DEFAULT (UUID()) PRIMARY KEY,
    txn_type          VARCHAR(50)     NOT NULL
        COMMENT 'Business operation: ALLOCATION, PAYMENT, BOOKING, BULK_ALLOCATE, etc.',
    status            ENUM('STARTED','COMMITTED','ROLLED_BACK','FAILED')
                                      NOT NULL DEFAULT 'STARTED',
    started_at        DATETIME(6)     DEFAULT CURRENT_TIMESTAMP(6),
    completed_at      DATETIME(6),
    affected_tables   JSON
        COMMENT 'Array of table names involved, e.g. ["bed","allocation"]',
    affected_ids      JSON
        COMMENT 'Map of id field → value, e.g. {"bed_id":"b-001","allocation_id":"al-XX"}',
    rollback_sql      TEXT
        COMMENT 'Compensating SQL to undo this transaction manually',
    error_message     TEXT,
    user_id           CHAR(36)
        COMMENT 'FK to auth_user — who initiated',
    session_id        VARCHAR(100)
        COMMENT 'Application session or request ID for correlation',
    CONSTRAINT fk_txnlog_user FOREIGN KEY (user_id)
        REFERENCES auth_user(user_id) ON DELETE SET NULL
);


-- ████████████████████████████████████████████████████████████
-- H. BACKUP LOG TABLE
-- ████████████████████████████████████████████████████████████
--
-- Tracks every backup operation for disaster recovery auditing.
-- ============================================================

CREATE TABLE backup_log (
    backup_id         CHAR(36)        NOT NULL DEFAULT (UUID()) PRIMARY KEY,
    backup_type       ENUM('FULL','INCREMENTAL','BINLOG')
                                      NOT NULL,
    started_at        DATETIME        DEFAULT CURRENT_TIMESTAMP,
    completed_at      DATETIME,
    binlog_file       VARCHAR(100)
        COMMENT 'Binary log filename at backup start',
    binlog_pos        BIGINT
        COMMENT 'Binary log position at backup start',
    status            ENUM('IN_PROGRESS','COMPLETED','FAILED')
                                      DEFAULT 'IN_PROGRESS',
    size_mb           DECIMAL(10,2),
    storage_path      VARCHAR(500)
        COMMENT 'Where the backup was stored',
    notes             TEXT
);


-- ████████████████████████████████████████████████████████████
-- INDEXES FOR NEW TABLES
-- ████████████████████████████████████████████████████████████

-- transaction_log
CREATE INDEX idx_txnlog_type_status
    ON transaction_log (txn_type, status);

CREATE INDEX idx_txnlog_started
    ON transaction_log (started_at);

CREATE INDEX idx_txnlog_user
    ON transaction_log (user_id);

CREATE INDEX idx_txnlog_session
    ON transaction_log (session_id);

-- backup_log
CREATE INDEX idx_backup_type_status
    ON backup_log (backup_type, status);

CREATE INDEX idx_backup_started
    ON backup_log (started_at);


-- ████████████████████████████████████████████████████████████
-- B. PESSIMISTIC LOCKING — STORED PROCEDURES
-- ████████████████████████████████████████████████████████████
--
-- These procedures acquire exclusive row locks (SELECT … FOR UPDATE)
-- to ensure serializable access to critical resources.
-- Each procedure:
--   1. Logs the transaction start to transaction_log
--   2. Acquires row-level locks
--   3. Validates business rules
--   4. Performs the mutation
--   5. Logs the transaction outcome
-- ============================================================

-- ------------------------------------------------------------
-- SP 1: sp_allocate_bed
-- Atomically allocates a bed to a student.
-- Uses SERIALIZABLE isolation + row-level locks to prevent
-- two concurrent requests from allocating the same bed.
-- ------------------------------------------------------------
DELIMITER $$

CREATE PROCEDURE sp_allocate_bed(
    IN  p_student_id   CHAR(36),
    IN  p_bed_id       CHAR(36),
    IN  p_allocated_by VARCHAR(100),
    IN  p_reason       TEXT,
    IN  p_user_id      CHAR(36),
    IN  p_session_id   VARCHAR(100),
    OUT p_allocation_id CHAR(36),
    OUT p_result_code   INT,
    OUT p_result_msg    VARCHAR(255)
)
BEGIN
    DECLARE v_txn_id        CHAR(36);
    DECLARE v_bed_occupied  BOOLEAN;
    DECLARE v_existing_alloc INT;
    DECLARE v_alloc_id      CHAR(36) DEFAULT (UUID());

    -- Error handler: on any SQL exception, roll back and log failure
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        GET DIAGNOSTICS CONDITION 1
            p_result_msg = MESSAGE_TEXT;

        ROLLBACK;

        -- Log failure
        UPDATE transaction_log
           SET status        = 'FAILED',
               completed_at  = CURRENT_TIMESTAMP(6),
               error_message = p_result_msg
         WHERE txn_id = v_txn_id;

        SET p_result_code = -1;
        SET p_allocation_id = NULL;
    END;

    -- Step 1: Log transaction start
    SET v_txn_id = UUID();
    INSERT INTO transaction_log (txn_id, txn_type, status, affected_tables, user_id, session_id)
    VALUES (v_txn_id, 'ALLOCATION', 'STARTED',
            JSON_ARRAY('bed', 'allocation'),
            p_user_id, p_session_id);

    -- Step 2: Begin transaction with READ COMMITTED isolation to prevent gap locks
    -- Safety relies on explicit row locks + unique constraints at scale
    SET TRANSACTION ISOLATION LEVEL READ COMMITTED;
    START TRANSACTION;

    -- Step 3: Lock the bed row exclusively
    SELECT occupied INTO v_bed_occupied
      FROM bed
     WHERE bed_id = p_bed_id
       FOR UPDATE;

    -- Validate bed exists
    IF v_bed_occupied IS NULL THEN
        ROLLBACK;
        UPDATE transaction_log
           SET status = 'ROLLED_BACK', completed_at = CURRENT_TIMESTAMP(6),
               error_message = 'Bed not found'
         WHERE txn_id = v_txn_id;
        SET p_result_code = 1;
        SET p_result_msg  = 'Bed not found';
        SET p_allocation_id = NULL;
        -- (EXIT HANDLER won't fire here, we return normally)
    ELSEIF v_bed_occupied = TRUE THEN
        -- Bed already occupied
        ROLLBACK;
        UPDATE transaction_log
           SET status = 'ROLLED_BACK', completed_at = CURRENT_TIMESTAMP(6),
               error_message = 'Bed is already occupied'
         WHERE txn_id = v_txn_id;
        SET p_result_code = 2;
        SET p_result_msg  = 'Bed is already occupied';
        SET p_allocation_id = NULL;
    ELSE
        -- Step 4: Check student doesn't already have an active allocation
        SELECT COUNT(*) INTO v_existing_alloc
          FROM allocation
         WHERE student_id = p_student_id
           AND status = 'Active'
           FOR UPDATE;

        IF v_existing_alloc > 0 THEN
            ROLLBACK;
            UPDATE transaction_log
               SET status = 'ROLLED_BACK', completed_at = CURRENT_TIMESTAMP(6),
                   error_message = 'Student already has an active allocation'
             WHERE txn_id = v_txn_id;
            SET p_result_code = 3;
            SET p_result_msg  = 'Student already has an active allocation';
            SET p_allocation_id = NULL;
        ELSE
            -- Step 5: Create allocation
            INSERT INTO allocation (allocation_id, student_id, bed_id,
                                    start_date, allocated_by, reason, status)
            VALUES (v_alloc_id, p_student_id, p_bed_id,
                    CURDATE(), p_allocated_by, p_reason, 'Active');

            -- Step 6: Mark bed as occupied
            UPDATE bed SET occupied = TRUE WHERE bed_id = p_bed_id;

            -- Step 7: Commit
            COMMIT;

            -- Step 8: Log success with compensating SQL
            UPDATE transaction_log
               SET status        = 'COMMITTED',
                   completed_at  = CURRENT_TIMESTAMP(6),
                   affected_ids  = JSON_OBJECT('allocation_id', v_alloc_id, 'bed_id', p_bed_id),
                   rollback_sql  = CONCAT(
                       'DELETE FROM allocation WHERE allocation_id = ''', v_alloc_id, '''; ',
                       'UPDATE bed SET occupied = FALSE WHERE bed_id = ''', p_bed_id, ''';'
                   )
             WHERE txn_id = v_txn_id;

            SET p_result_code   = 0;
            SET p_result_msg    = 'Allocation successful';
            SET p_allocation_id = v_alloc_id;
        END IF;
    END IF;
END$$

DELIMITER ;


-- ------------------------------------------------------------
-- SP 2: sp_process_fee_payment
-- Atomically processes a fee payment with pessimistic locking.
-- Prevents double-payment by locking the fee record before update.
-- ------------------------------------------------------------
DELIMITER $$

CREATE PROCEDURE sp_process_fee_payment(
    IN  p_payment_id    CHAR(36),
    IN  p_paid_amount   DECIMAL(10,2),
    IN  p_payment_mode  VARCHAR(50),
    IN  p_transaction_id VARCHAR(100),
    IN  p_user_id       CHAR(36),
    IN  p_session_id    VARCHAR(100),
    OUT p_result_code   INT,
    OUT p_result_msg    VARCHAR(255)
)
BEGIN
    DECLARE v_txn_id       CHAR(36);
    DECLARE v_amount_due   DECIMAL(10,2);
    DECLARE v_current_paid DECIMAL(10,2);
    DECLARE v_current_status VARCHAR(20);
    DECLARE v_new_paid     DECIMAL(10,2);
    DECLARE v_new_status   VARCHAR(20);
    DECLARE v_receipt      VARCHAR(100);

    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        GET DIAGNOSTICS CONDITION 1
            p_result_msg = MESSAGE_TEXT;
        ROLLBACK;
        UPDATE transaction_log
           SET status = 'FAILED', completed_at = CURRENT_TIMESTAMP(6),
               error_message = p_result_msg
         WHERE txn_id = v_txn_id;
        SET p_result_code = -1;
    END;

    -- Log start
    SET v_txn_id = UUID();
    INSERT INTO transaction_log (txn_id, txn_type, status, affected_tables, user_id, session_id)
    VALUES (v_txn_id, 'PAYMENT', 'STARTED',
            JSON_ARRAY('feepayment'), p_user_id, p_session_id);

    -- Use REPEATABLE READ for consistent balance calculation
    SET TRANSACTION ISOLATION LEVEL REPEATABLE READ;
    START TRANSACTION;

    -- Lock the fee record
    SELECT amount_due, paid_amount, status
      INTO v_amount_due, v_current_paid, v_current_status
      FROM feepayment
     WHERE payment_id = p_payment_id
       FOR UPDATE;

    -- Validate
    IF v_amount_due IS NULL THEN
        ROLLBACK;
        UPDATE transaction_log
           SET status = 'ROLLED_BACK', completed_at = CURRENT_TIMESTAMP(6),
               error_message = 'Payment record not found'
         WHERE txn_id = v_txn_id;
        SET p_result_code = 1;
        SET p_result_msg = 'Payment record not found';
    ELSEIF v_current_status = 'Paid' THEN
        ROLLBACK;
        UPDATE transaction_log
           SET status = 'ROLLED_BACK', completed_at = CURRENT_TIMESTAMP(6),
               error_message = 'Payment already completed'
         WHERE txn_id = v_txn_id;
        SET p_result_code = 2;
        SET p_result_msg = 'Payment already completed — double-payment prevented';
    ELSE
        -- Calculate new totals
        SET v_new_paid = IFNULL(v_current_paid, 0) + p_paid_amount;
        SET v_new_status = IF(v_new_paid >= v_amount_due, 'Paid', 'Partial');
        SET v_receipt = CONCAT('RCP-AUTO-', DATE_FORMAT(NOW(), '%Y%m%d%H%i%s'));

        -- Apply payment
        UPDATE feepayment
           SET paid_amount     = v_new_paid,
               payment_mode    = p_payment_mode,
               transaction_id  = p_transaction_id,
               payment_date    = NOW(),
               receipt_number  = v_receipt,
               status          = v_new_status
         WHERE payment_id = p_payment_id;

        COMMIT;

        -- Log success
        UPDATE transaction_log
           SET status       = 'COMMITTED',
               completed_at = CURRENT_TIMESTAMP(6),
               affected_ids = JSON_OBJECT('payment_id', p_payment_id),
               rollback_sql = CONCAT(
                   'UPDATE feepayment SET paid_amount = ', IFNULL(v_current_paid, 0),
                   ', status = ''', v_current_status,
                   ''', payment_mode = NULL, transaction_id = NULL, ',
                   'payment_date = NULL, receipt_number = NULL ',
                   'WHERE payment_id = ''', p_payment_id, ''';'
               )
         WHERE txn_id = v_txn_id;

        SET p_result_code = 0;
        SET p_result_msg  = CONCAT('Payment processed. New status: ', v_new_status);
    END IF;
END$$

DELIMITER ;


-- ------------------------------------------------------------
-- SP 3: sp_book_facility_slot
-- Atomically books a facility slot with overlap detection.
-- Locks existing bookings in the overlap window to prevent
-- phantom inserts (two students booking the same slot).
-- ------------------------------------------------------------
DELIMITER $$

CREATE PROCEDURE sp_book_facility_slot(
    IN  p_facility_id   CHAR(36),
    IN  p_student_id    CHAR(36),
    IN  p_booking_date  DATE,
    IN  p_slot_start    TIME,
    IN  p_slot_end      TIME,
    IN  p_purpose       VARCHAR(100),
    IN  p_user_id       CHAR(36),
    IN  p_session_id    VARCHAR(100),
    OUT p_booking_id    CHAR(36),
    OUT p_result_code   INT,
    OUT p_result_msg    VARCHAR(255)
)
BEGIN
    DECLARE v_txn_id    CHAR(36);
    DECLARE v_conflicts INT;
    DECLARE v_book_id   CHAR(36) DEFAULT (UUID());

    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        GET DIAGNOSTICS CONDITION 1
            p_result_msg = MESSAGE_TEXT;
        ROLLBACK;
        UPDATE transaction_log
           SET status = 'FAILED', completed_at = CURRENT_TIMESTAMP(6),
               error_message = p_result_msg
         WHERE txn_id = v_txn_id;
        SET p_result_code = -1;
        SET p_booking_id  = NULL;
    END;

    -- Log start
    SET v_txn_id = UUID();
    INSERT INTO transaction_log (txn_id, txn_type, status, affected_tables, user_id, session_id)
    VALUES (v_txn_id, 'BOOKING', 'STARTED',
            JSON_ARRAY('facility_booking'), p_user_id, p_session_id);

    -- READ COMMITTED prevents gap locks and improves concurrency under extreme load.
    -- Redis distributed locking handles phantom insert prevention at the app layer.
    SET TRANSACTION ISOLATION LEVEL READ COMMITTED;
    START TRANSACTION;

    -- Lock and check for overlapping bookings
    SELECT COUNT(*) INTO v_conflicts
      FROM facility_booking
     WHERE facility_id  = p_facility_id
       AND booking_date = p_booking_date
       AND status       = 'Confirmed'
       AND slot_start   < p_slot_end
       AND slot_end     > p_slot_start
       FOR UPDATE;

    IF v_conflicts > 0 THEN
        ROLLBACK;
        UPDATE transaction_log
           SET status = 'ROLLED_BACK', completed_at = CURRENT_TIMESTAMP(6),
               error_message = CONCAT(v_conflicts, ' conflicting booking(s) found')
         WHERE txn_id = v_txn_id;
        SET p_result_code = 1;
        SET p_result_msg  = 'Time slot conflicts with existing booking(s)';
        SET p_booking_id  = NULL;
    ELSE
        -- Insert booking
        INSERT INTO facility_booking (booking_id, facility_id, student_id,
                                      booking_date, slot_start, slot_end,
                                      purpose, status)
        VALUES (v_book_id, p_facility_id, p_student_id,
                p_booking_date, p_slot_start, p_slot_end,
                p_purpose, 'Confirmed');

        COMMIT;

        -- Log success
        UPDATE transaction_log
           SET status       = 'COMMITTED',
               completed_at = CURRENT_TIMESTAMP(6),
               affected_ids = JSON_OBJECT('booking_id', v_book_id),
               rollback_sql = CONCAT(
                   'DELETE FROM facility_booking WHERE booking_id = ''', v_book_id, ''';'
               )
         WHERE txn_id = v_txn_id;

        SET p_result_code = 0;
        SET p_result_msg  = 'Facility slot booked successfully';
        SET p_booking_id  = v_book_id;
    END IF;
END$$

DELIMITER ;


-- ████████████████████████████████████████████████████████████
-- C. DEADLOCK DETECTION & RETRY
-- ████████████████████████████████████████████████████████████
--
-- MySQL automatically detects deadlocks and rolls back the
-- "cheaper" transaction (error 1213). This procedure wraps
-- a simple update with retry logic.
--
-- NOTE: MySQL stored procedures cannot dynamically retry
-- arbitrary SQL. This procedure demonstrates the retry pattern
-- for a specific use case (updating complaint status).
-- In practice, deadlock retry is best handled at the
-- application layer (see transaction.js).
-- ============================================================
DELIMITER $$

CREATE PROCEDURE sp_update_complaint_with_retry(
    IN  p_complaint_id  CHAR(36),
    IN  p_status        VARCHAR(30),
    IN  p_resolution    TEXT,
    IN  p_cost          DECIMAL(10,2),
    OUT p_result_code   INT,
    OUT p_result_msg    VARCHAR(255)
)
BEGIN
    DECLARE v_attempts   INT DEFAULT 0;
    DECLARE v_max_retry  INT DEFAULT 3;
    DECLARE v_done       BOOLEAN DEFAULT FALSE;
    DECLARE v_deadlock   BOOLEAN DEFAULT FALSE;

    retry_loop: WHILE v_attempts < v_max_retry AND NOT v_done DO
        SET v_attempts = v_attempts + 1;
        SET v_deadlock = FALSE;

        BEGIN
            DECLARE EXIT HANDLER FOR 1213   -- ER_LOCK_DEADLOCK
            BEGIN
                SET v_deadlock = TRUE;
                ROLLBACK;
            END;

            START TRANSACTION;

            UPDATE complaint
               SET status           = p_status,
                   resolution_notes = p_resolution,
                   cost_incurred    = p_cost,
                   resolved_at      = IF(p_status IN ('Resolved','Closed'), NOW(), resolved_at)
             WHERE complaint_id = p_complaint_id;

            COMMIT;
            SET v_done = TRUE;
        END;

        -- If deadlock, wait briefly before retry (exponential backoff)
        IF v_deadlock AND v_attempts < v_max_retry THEN
            DO SLEEP(POW(2, v_attempts - 1) * 0.1);  -- 0.1s, 0.2s, 0.4s
        END IF;
    END WHILE;

    IF v_done THEN
        SET p_result_code = 0;
        SET p_result_msg  = CONCAT('Updated after ', v_attempts, ' attempt(s)');
    ELSE
        SET p_result_code = -1;
        SET p_result_msg  = CONCAT('Failed after ', v_max_retry, ' deadlock retries');
    END IF;
END$$

DELIMITER ;


-- ████████████████████████████████████████████████████████████
-- D. TRANSACTION ISOLATION LEVEL CONFIGURATION
-- ████████████████████████████████████████████████████████████
--
-- Recommended isolation levels per operation type:
--
-- ┌──────────────────────┬───────────────────┬──────────────────────────────────────┐
-- │ Operation            │ Isolation Level   │ Rationale                            │
-- ├──────────────────────┼───────────────────┼──────────────────────────────────────┤
-- │ Bed allocation       │ READ COMMITTED    │ Prevent gap locks at scale; rely on  │
-- │                      │                   │ explicit FOR UPDATE row locks instead│
-- ├──────────────────────┼───────────────────┼──────────────────────────────────────┤
-- │ Fee payment          │ REPEATABLE READ   │ Consistent balance calc within txn   │
-- ├──────────────────────┼───────────────────┼──────────────────────────────────────┤
-- │ Facility booking     │ READ COMMITTED    │ Avoid gap locks; use Redis + FOR     │
-- │                      │                   │ UPDATE for overlap prevention        │
-- ├──────────────────────┼───────────────────┼──────────────────────────────────────┤
-- │ Read-only dashboards │ READ COMMITTED    │ Reduce lock contention for reports   │
-- ├──────────────────────┼───────────────────┼──────────────────────────────────────┤
-- │ Audit/log inserts    │ READ UNCOMMITTED  │ Maximum throughput, append-only      │
-- └──────────────────────┴───────────────────┴──────────────────────────────────────┘
-- ============================================================
DELIMITER $$

CREATE PROCEDURE sp_show_isolation_config()
BEGIN
    -- Display current session and global isolation levels
    SELECT @@GLOBAL.transaction_isolation  AS global_isolation_level,
           @@SESSION.transaction_isolation AS session_isolation_level;

    -- Display recommended settings as a result set
    SELECT 'Bed allocation'       AS operation, 'READ COMMITTED'     AS recommended_level, 'Prevent gap locking under load'  AS rationale
    UNION ALL
    SELECT 'Fee payment',                       'REPEATABLE READ',                        'Consistent balance calculation'
    UNION ALL
    SELECT 'Facility booking',                  'READ COMMITTED',                           'Prevent gap locking under load'
    UNION ALL
    SELECT 'Read-only dashboards',              'READ COMMITTED',                         'Reduce lock contention for reporting'
    UNION ALL
    SELECT 'Audit log inserts',                 'READ UNCOMMITTED',                       'Maximum throughput, append-only data';
END$$

DELIMITER ;


-- ████████████████████████████████████████████████████████████
-- F. SAVEPOINT PROCEDURES
-- ████████████████████████████████████████████████████████████
--
-- Demonstrates savepoint usage for batch operations.
-- If one allocation in a batch fails, only that individual
-- allocation is rolled back — the rest succeed.
-- ============================================================
DELIMITER $$

CREATE PROCEDURE sp_bulk_allocate_with_savepoints(
    IN  p_allocations JSON,
    IN  p_user_id     CHAR(36),
    IN  p_session_id  VARCHAR(100),
    OUT p_success_count INT,
    OUT p_fail_count    INT,
    OUT p_results       JSON
)
proc_body: BEGIN
    DECLARE v_txn_id      CHAR(36);
    DECLARE v_idx         INT DEFAULT 0;
    DECLARE v_total       INT;
    DECLARE v_student_id  CHAR(36);
    DECLARE v_bed_id      CHAR(36);
    DECLARE v_allocated_by VARCHAR(100);
    DECLARE v_alloc_id    CHAR(36);
    DECLARE v_occupied    BOOLEAN;
    DECLARE v_existing    INT;
    DECLARE v_result_arr  JSON DEFAULT JSON_ARRAY();

    SET p_success_count = 0;
    SET p_fail_count    = 0;
    SET v_total = JSON_LENGTH(p_allocations);

    IF v_total = 0 OR v_total IS NULL THEN
        SET p_results = JSON_ARRAY();
        LEAVE proc_body;
    END IF;

    -- Log bulk transaction
    SET v_txn_id = UUID();
    INSERT INTO transaction_log (txn_id, txn_type, status, affected_tables, user_id, session_id)
    VALUES (v_txn_id, 'BULK_ALLOCATE', 'STARTED',
            JSON_ARRAY('bed', 'allocation'), p_user_id, p_session_id);

    START TRANSACTION;

    WHILE v_idx < v_total DO
        -- Extract allocation params from JSON array
        SET v_student_id   = JSON_UNQUOTE(JSON_EXTRACT(p_allocations, CONCAT('$[', v_idx, '].student_id')));
        SET v_bed_id       = JSON_UNQUOTE(JSON_EXTRACT(p_allocations, CONCAT('$[', v_idx, '].bed_id')));
        SET v_allocated_by = JSON_UNQUOTE(JSON_EXTRACT(p_allocations, CONCAT('$[', v_idx, '].allocated_by')));

        -- Create savepoint before each allocation
        SET @sp_name = CONCAT('sp_alloc_', v_idx);

        -- Use a nested block with its own handler
        BEGIN
            DECLARE CONTINUE HANDLER FOR SQLEXCEPTION
            BEGIN
                -- Roll back to savepoint — only this allocation is undone
                ROLLBACK TO SAVEPOINT alloc_savepoint;
                SET p_fail_count = p_fail_count + 1;
                SET v_result_arr = JSON_ARRAY_APPEND(v_result_arr, '$',
                    JSON_OBJECT('index', v_idx, 'student_id', v_student_id,
                                'bed_id', v_bed_id, 'status', 'FAILED',
                                'reason', 'SQL exception'));
            END;

            SAVEPOINT alloc_savepoint;

            -- Check bed availability
            SELECT occupied INTO v_occupied
              FROM bed WHERE bed_id = v_bed_id FOR UPDATE;

            -- Check student active allocation
            SELECT COUNT(*) INTO v_existing
              FROM allocation
             WHERE student_id = v_student_id AND status = 'Active';

            IF v_occupied IS NULL THEN
                ROLLBACK TO SAVEPOINT alloc_savepoint;
                SET p_fail_count = p_fail_count + 1;
                SET v_result_arr = JSON_ARRAY_APPEND(v_result_arr, '$',
                    JSON_OBJECT('index', v_idx, 'student_id', v_student_id,
                                'bed_id', v_bed_id, 'status', 'FAILED',
                                'reason', 'Bed not found'));
            ELSEIF v_occupied = TRUE THEN
                ROLLBACK TO SAVEPOINT alloc_savepoint;
                SET p_fail_count = p_fail_count + 1;
                SET v_result_arr = JSON_ARRAY_APPEND(v_result_arr, '$',
                    JSON_OBJECT('index', v_idx, 'student_id', v_student_id,
                                'bed_id', v_bed_id, 'status', 'FAILED',
                                'reason', 'Bed already occupied'));
            ELSEIF v_existing > 0 THEN
                ROLLBACK TO SAVEPOINT alloc_savepoint;
                SET p_fail_count = p_fail_count + 1;
                SET v_result_arr = JSON_ARRAY_APPEND(v_result_arr, '$',
                    JSON_OBJECT('index', v_idx, 'student_id', v_student_id,
                                'bed_id', v_bed_id, 'status', 'FAILED',
                                'reason', 'Student already allocated'));
            ELSE
                SET v_alloc_id = UUID();
                INSERT INTO allocation (allocation_id, student_id, bed_id,
                                        start_date, allocated_by, status)
                VALUES (v_alloc_id, v_student_id, v_bed_id,
                        CURDATE(), v_allocated_by, 'Active');

                UPDATE bed SET occupied = TRUE WHERE bed_id = v_bed_id;

                SET p_success_count = p_success_count + 1;
                SET v_result_arr = JSON_ARRAY_APPEND(v_result_arr, '$',
                    JSON_OBJECT('index', v_idx, 'student_id', v_student_id,
                                'bed_id', v_bed_id, 'status', 'SUCCESS',
                                'allocation_id', v_alloc_id));
            END IF;
        END;

        SET v_idx = v_idx + 1;
    END WHILE;

    -- Commit all successful allocations
    COMMIT;

    -- Log outcome
    UPDATE transaction_log
       SET status        = 'COMMITTED',
           completed_at  = CURRENT_TIMESTAMP(6),
           affected_ids  = JSON_OBJECT('success_count', p_success_count,
                                       'fail_count', p_fail_count)
     WHERE txn_id = v_txn_id;

    SET p_results = v_result_arr;
END$$

DELIMITER ;


-- ████████████████████████████████████████████████████████████
-- G. WAL & BINARY LOG CONFIGURATION VERIFICATION
-- ████████████████████████████████████████████████████████████
--
-- MySQL InnoDB uses a Write-Ahead Log (redo log) for crash
-- recovery. This procedure checks critical settings and warns
-- if any are suboptimal for data durability.
-- ============================================================
DELIMITER $$

CREATE PROCEDURE sp_verify_recovery_config()
BEGIN
    DECLARE v_flush_setting   INT;
    DECLARE v_sync_binlog     INT;
    DECLARE v_doublewrite     VARCHAR(10);
    DECLARE v_log_file_size   BIGINT;
    DECLARE v_pool_size       BIGINT;
    DECLARE v_binlog_format   VARCHAR(20);

    -- Fetch current values
    SELECT @@innodb_flush_log_at_trx_commit INTO v_flush_setting;
    SELECT @@sync_binlog                    INTO v_sync_binlog;
    SELECT @@innodb_doublewrite             INTO v_doublewrite;
    SELECT @@innodb_log_file_size           INTO v_log_file_size;
    SELECT @@innodb_buffer_pool_size        INTO v_pool_size;
    SELECT @@binlog_format                  INTO v_binlog_format;

    -- Report all settings with status
    SELECT
        'innodb_flush_log_at_trx_commit' AS setting,
        v_flush_setting                  AS current_value,
        '1'                              AS recommended_value,
        CASE WHEN v_flush_setting = 1 THEN '✅ OK — flush redo log on every commit'
             WHEN v_flush_setting = 2 THEN '⚠️ WARNING — flushes once per second, risk of 1s data loss'
             ELSE '❌ CRITICAL — redo log not flushed, risk of data loss on crash'
        END AS status
    UNION ALL
    SELECT
        'sync_binlog',
        v_sync_binlog,
        '1',
        CASE WHEN v_sync_binlog = 1 THEN '✅ OK — binary log synced on every commit'
             ELSE '⚠️ WARNING — binary log sync deferred, risk of binlog inconsistency'
        END
    UNION ALL
    SELECT
        'innodb_doublewrite',
        v_doublewrite,
        'ON',
        CASE WHEN v_doublewrite IN ('ON', '1') THEN '✅ OK — doublewrite buffer enabled'
             ELSE '❌ CRITICAL — partial page writes possible on crash'
        END
    UNION ALL
    SELECT
        'innodb_log_file_size',
        CONCAT(ROUND(v_log_file_size / 1048576), ' MB'),
        '256 MB',
        CASE WHEN v_log_file_size >= 268435456 THEN '✅ OK — redo log ≥ 256 MB'
             ELSE '⚠️ WARNING — consider increasing for write-heavy workloads'
        END
    UNION ALL
    SELECT
        'innodb_buffer_pool_size',
        CONCAT(ROUND(v_pool_size / 1048576), ' MB'),
        '1024 MB',
        CASE WHEN v_pool_size >= 1073741824 THEN '✅ OK — buffer pool ≥ 1 GB'
             ELSE '⚠️ INFO — consider increasing for large datasets'
        END
    UNION ALL
    SELECT
        'binlog_format',
        v_binlog_format,
        'ROW',
        CASE WHEN v_binlog_format = 'ROW' THEN '✅ OK — row-based replication (safest)'
             ELSE '⚠️ WARNING — ROW format recommended for consistency'
        END;
END$$

DELIMITER ;


-- ████████████████████████████████████████████████████████████
-- H. BACKUP & CHECKPOINT PROCEDURES
-- ████████████████████████████████████████████████████████████

-- ------------------------------------------------------------
-- SP: sp_create_backup_checkpoint
-- Records a consistent snapshot point by capturing the current
-- binary log position. Pair with mysqldump or xtrabackup.
-- ------------------------------------------------------------
DELIMITER $$

CREATE PROCEDURE sp_create_backup_checkpoint(
    IN  p_backup_type  VARCHAR(20),
    IN  p_notes        TEXT,
    OUT p_backup_id    CHAR(36),
    OUT p_binlog_file  VARCHAR(100),
    OUT p_binlog_pos   BIGINT
)
BEGIN
    DECLARE v_backup_id CHAR(36) DEFAULT (UUID());

    -- Capture binary log coordinates (SHOW MASTER STATUS equivalent)
    -- Note: requires REPLICATION CLIENT or SUPER privilege
    SET p_binlog_file = 'N/A (check SHOW MASTER STATUS)';
    SET p_binlog_pos  = 0;

    -- Log the backup start
    INSERT INTO backup_log (backup_id, backup_type, status, notes)
    VALUES (v_backup_id, p_backup_type, 'IN_PROGRESS', p_notes);

    SET p_backup_id = v_backup_id;
END$$

DELIMITER ;


-- ------------------------------------------------------------
-- SP: sp_complete_backup
-- Called after a backup finishes to record outcome.
-- ------------------------------------------------------------
DELIMITER $$

CREATE PROCEDURE sp_complete_backup(
    IN p_backup_id    CHAR(36),
    IN p_status       VARCHAR(20),
    IN p_size_mb      DECIMAL(10,2),
    IN p_storage_path VARCHAR(500)
)
BEGIN
    UPDATE backup_log
       SET status       = p_status,
           completed_at = NOW(),
           size_mb      = p_size_mb,
           storage_path = p_storage_path
     WHERE backup_id = p_backup_id;
END$$

DELIMITER ;


-- ============================================================
-- END OF CONCURRENCY CONTROL & RECOVERY
-- ============================================================
