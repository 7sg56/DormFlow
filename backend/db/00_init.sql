-- ============================================================
-- HOSTEL MANAGEMENT SYSTEM — 3NF SCHEMA
-- MySQL 8.0+ | UUID Primary Keys | 29 Tables
-- Changes from 1NF version:
--   1. student.hostel_id           REMOVED  (derive via allocation)
--   2. student.full_name           REMOVED  (transitive: first+last → full)
--   3. allocation.hostel_id        REMOVED  (derive via bed→room→hostel)
--   4. allocation.room_id          REMOVED  (derive via bed→room)
--   5. feepayment.hostel_id        REMOVED  (derive via student→hostel)
--   6. complaint.hostel_id         REMOVED  (derive via student→hostel)
--   7. visitor_log.hostel_id       REMOVED  (derive via student→hostel)
--   8. accesslog.hostel_id         REMOVED  (derive via student→hostel)
--   9. emergency_request.hostel_id REMOVED  (derive via student→hostel)
--  10. bed.is_available            REMOVED  (exact inverse of occupied)
-- All removed hostel_id FKs are restored in views (03_views.sql)
-- ============================================================

DROP DATABASE IF EXISTS hostel_mgmt;
CREATE DATABASE IF NOT EXISTS hostel_mgmt
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE hostel_mgmt;

-- ============================================================
-- TABLE 1: hostel
-- (unchanged — no violations here)
-- ============================================================
CREATE TABLE hostel (
    hostel_id           CHAR(36)        NOT NULL DEFAULT (UUID()) PRIMARY KEY,
    hostel_name         VARCHAR(100)    NOT NULL,
    type                VARCHAR(50)     NOT NULL,
    total_floors        INT             NOT NULL,
    address             VARCHAR(255),
    city                VARCHAR(100),
    state               VARCHAR(100),
    pincode             VARCHAR(10),
    established_year    YEAR,
    registration_no     VARCHAR(100)    UNIQUE,
    warden_name         VARCHAR(100),
    warden_phone        VARCHAR(15),
    warden_email        VARCHAR(100),
    office_phone        VARCHAR(15),
    emergency_phone     VARCHAR(15),
    created_at          DATETIME        DEFAULT CURRENT_TIMESTAMP,
    updated_at          DATETIME        DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ============================================================
-- TABLE 2: student
-- REMOVED: hostel_id  (student's hostel is determined by allocation)
-- REMOVED: full_name  (first_name + last_name → full_name is transitive)
-- ============================================================
CREATE TABLE student (
    student_id          CHAR(36)        NOT NULL DEFAULT (UUID()) PRIMARY KEY,
    reg_no              VARCHAR(50)     NOT NULL UNIQUE,
    first_name          VARCHAR(100)    NOT NULL,
    last_name           VARCHAR(100)    NOT NULL,
    date_of_birth       DATE            NOT NULL,
    gender              VARCHAR(10)     NOT NULL,
    phone_primary       VARCHAR(15),
    phone_secondary     VARCHAR(15),
    email_personal      VARCHAR(100),
    email_institutional VARCHAR(100),
    department          VARCHAR(100),
    course              VARCHAR(100),
    academic_year       INT,
    semester            INT,
    blood_group         VARCHAR(5),
    permanent_address   TEXT,
    current_address     TEXT,
    city                VARCHAR(100),
    state               VARCHAR(100),
    pincode             VARCHAR(10),
    admission_date      DATE,
    status              VARCHAR(20)     DEFAULT 'Active',
    photo_url           VARCHAR(255),
    created_at          DATETIME        DEFAULT CURRENT_TIMESTAMP,
    updated_at          DATETIME        DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ============================================================
-- TABLE 3: student_guardian
-- (unchanged)
-- ============================================================
CREATE TABLE student_guardian (
    guardian_id         CHAR(36)        NOT NULL DEFAULT (UUID()) PRIMARY KEY,
    student_id          CHAR(36)        NOT NULL,
    guardian_name       VARCHAR(100)    NOT NULL,
    relation            VARCHAR(50)     NOT NULL,
    phone               VARCHAR(15),
    email               VARCHAR(100),
    address             TEXT,
    is_emergency_contact BOOLEAN        DEFAULT FALSE,
    CONSTRAINT fk_sg_student FOREIGN KEY (student_id) REFERENCES student(student_id) ON DELETE CASCADE
);

-- ============================================================
-- TABLE 4: room
-- (unchanged — hostel_id here is a direct attribute, not transitive)
-- ============================================================
CREATE TABLE room (
    room_id             CHAR(36)        NOT NULL DEFAULT (UUID()) PRIMARY KEY,
    room_number         VARCHAR(20)     NOT NULL,
    floor               INT             NOT NULL,
    capacity            INT             NOT NULL,
    room_type           VARCHAR(50),
    hostel_id           CHAR(36)        NOT NULL,
    monthly_rent        DECIMAL(10,2),
    area_sqft           DECIMAL(8,2),
    facing              VARCHAR(20),
    room_condition      VARCHAR(50)     DEFAULT 'Good',
    last_cleaned        DATE,
    last_maintained     DATE,
    created_at          DATETIME        DEFAULT CURRENT_TIMESTAMP,
    updated_at          DATETIME        DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE (hostel_id, room_number),
    CONSTRAINT fk_room_hostel FOREIGN KEY (hostel_id) REFERENCES hostel(hostel_id) ON DELETE CASCADE
);

-- ============================================================
-- TABLE 5: bed
-- REMOVED: is_available  (NOT occupied is trivially derived — storing it
--                         creates a transitive dependency: bed_id → occupied
--                         → is_available, and risks the two columns
--                         getting out of sync)
-- ============================================================
CREATE TABLE bed (
    bed_id              CHAR(36)        NOT NULL DEFAULT (UUID()) PRIMARY KEY,
    bed_number          VARCHAR(20)     NOT NULL,
    room_id             CHAR(36)        NOT NULL,
    bed_type            VARCHAR(50),
    condition_status    VARCHAR(50)     DEFAULT 'Good',
    occupied            BOOLEAN         DEFAULT FALSE,
    purchase_date       DATE,
    last_replaced       DATE,
    created_at          DATETIME        DEFAULT CURRENT_TIMESTAMP,
    updated_at          DATETIME        DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE (room_id, bed_number),
    CONSTRAINT fk_bed_room FOREIGN KEY (room_id) REFERENCES room(room_id) ON DELETE CASCADE
);

-- ============================================================
-- TABLE 6: technician
-- (unchanged)
-- ============================================================
CREATE TABLE technician (
    technician_id       CHAR(36)        NOT NULL DEFAULT (UUID()) PRIMARY KEY,
    name                VARCHAR(100)    NOT NULL,
    specialization      VARCHAR(100),
    phone               VARCHAR(15),
    email               VARCHAR(100),
    address             TEXT,
    availability        VARCHAR(100),
    joining_date        DATE,
    employment_type     VARCHAR(30),
    salary              DECIMAL(10,2),
    vendor_company      VARCHAR(100),
    hostel_id           CHAR(36),
    created_at          DATETIME        DEFAULT CURRENT_TIMESTAMP,
    updated_at          DATETIME        DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_tech_hostel FOREIGN KEY (hostel_id) REFERENCES hostel(hostel_id) ON DELETE SET NULL
);

-- ============================================================
-- TABLE 7: allocation
-- REMOVED: hostel_id  (bed → room → hostel, so hostel_id is transitive)
-- REMOVED: room_id    (bed → room, so room_id is transitive via bed_id)
-- To get room/hostel for an allocation: JOIN bed → room → hostel
-- ============================================================
CREATE TABLE allocation (
    allocation_id       CHAR(36)        NOT NULL DEFAULT (UUID()) PRIMARY KEY,
    student_id          CHAR(36)        NOT NULL,
    bed_id              CHAR(36)        NOT NULL,
    start_date          DATE            NOT NULL,
    end_date            DATE,
    allocated_by        VARCHAR(100),
    reason              TEXT,
    status              VARCHAR(20)     DEFAULT 'Active',
    created_at          DATETIME        DEFAULT CURRENT_TIMESTAMP,
    updated_at          DATETIME        DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_alloc_student FOREIGN KEY (student_id) REFERENCES student(student_id),
    CONSTRAINT fk_alloc_bed     FOREIGN KEY (bed_id)     REFERENCES bed(bed_id)
);

-- ============================================================
-- TABLE 8: feepayment
-- REMOVED: hostel_id  (student_id → hostel_id via student table,
--                      so storing it here is a transitive dependency)
-- ============================================================
CREATE TABLE feepayment (
    payment_id          CHAR(36)        NOT NULL DEFAULT (UUID()) PRIMARY KEY,
    student_id          CHAR(36)        NOT NULL,
    amount_due          DECIMAL(10,2)   NOT NULL,
    paid_amount         DECIMAL(10,2)   DEFAULT 0,
    balance_due         DECIMAL(10,2)   AS (amount_due - IFNULL(paid_amount, 0)) STORED,
    semester            VARCHAR(20),
    fee_month           VARCHAR(20),
    payment_mode        VARCHAR(50),
    transaction_id      VARCHAR(100),
    payment_date        DATETIME,
    due_date            DATE,
    late_fee            DECIMAL(10,2)   DEFAULT 0,
    receipt_number      VARCHAR(100),
    status              VARCHAR(20)     DEFAULT 'Pending',
    remarks             TEXT,
    approved_by         VARCHAR(100),
    created_at          DATETIME        DEFAULT CURRENT_TIMESTAMP,
    updated_at          DATETIME        DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_fp_student FOREIGN KEY (student_id) REFERENCES student(student_id)
);

-- ============================================================
-- TABLE 9: mess
-- (unchanged)
-- ============================================================
CREATE TABLE mess (
    mess_id             CHAR(36)        NOT NULL DEFAULT (UUID()) PRIMARY KEY,
    mess_name           VARCHAR(100)    NOT NULL,
    mess_type           VARCHAR(50),
    hostel_id           CHAR(36)        NOT NULL,
    monthly_fee         DECIMAL(10,2),
    capacity            INT,
    manager_name        VARCHAR(100),
    manager_phone       VARCHAR(15),
    hygiene_rating      DECIMAL(3,1),
    last_inspection     DATE,
    license_number      VARCHAR(100),
    license_expiry      DATE,
    timing_breakfast    VARCHAR(50),
    timing_lunch        VARCHAR(50),
    timing_snacks       VARCHAR(50),
    timing_dinner       VARCHAR(50),
    created_at          DATETIME        DEFAULT CURRENT_TIMESTAMP,
    updated_at          DATETIME        DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_mess_hostel FOREIGN KEY (hostel_id) REFERENCES hostel(hostel_id)
);

-- ============================================================
-- TABLE 10: mess_subscription
-- (unchanged)
-- ============================================================
CREATE TABLE mess_subscription (
    subscription_id     CHAR(36)        NOT NULL DEFAULT (UUID()) PRIMARY KEY,
    student_id          CHAR(36)        NOT NULL,
    mess_id             CHAR(36)        NOT NULL,
    start_date          DATE            NOT NULL,
    end_date            DATE,
    meal_plan           VARCHAR(50),
    monthly_charge      DECIMAL(10,2),
    status              VARCHAR(20)     DEFAULT 'Active',
    created_at          DATETIME        DEFAULT CURRENT_TIMESTAMP,
    updated_at          DATETIME        DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_ms_student FOREIGN KEY (student_id) REFERENCES student(student_id),
    CONSTRAINT fk_ms_mess    FOREIGN KEY (mess_id)    REFERENCES mess(mess_id)
);

-- ============================================================
-- TABLE 11: menu
-- (unchanged)
-- ============================================================
CREATE TABLE menu (
    menu_id             CHAR(36)        NOT NULL DEFAULT (UUID()) PRIMARY KEY,
    mess_id             CHAR(36)        NOT NULL,
    day_of_week         VARCHAR(10)     NOT NULL,
    meal_type           VARCHAR(20)     NOT NULL,
    item_name           VARCHAR(100)    NOT NULL,
    item_category       VARCHAR(50),
    cuisine_type        VARCHAR(50),
    is_veg              BOOLEAN         DEFAULT TRUE,
    calories_approx     INT,
    created_at          DATETIME        DEFAULT CURRENT_TIMESTAMP,
    updated_at          DATETIME        DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_menu_mess FOREIGN KEY (mess_id) REFERENCES mess(mess_id) ON DELETE CASCADE
);

-- ============================================================
-- TABLE 12: laundry
-- (unchanged)
-- ============================================================
CREATE TABLE laundry (
    laundry_id          CHAR(36)        NOT NULL DEFAULT (UUID()) PRIMARY KEY,
    laundry_name        VARCHAR(100)    NOT NULL,
    hostel_id           CHAR(36)        NOT NULL,
    vendor_name         VARCHAR(100),
    vendor_phone        VARCHAR(15),
    vendor_email        VARCHAR(100),
    price_per_piece     DECIMAL(8,2),
    price_per_kg        DECIMAL(8,2),
    service_types       VARCHAR(255),
    operating_days      VARCHAR(100),
    timing_open         TIME,
    timing_close        TIME,
    contract_start      DATE,
    contract_end        DATE,
    created_at          DATETIME        DEFAULT CURRENT_TIMESTAMP,
    updated_at          DATETIME        DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_lau_hostel FOREIGN KEY (hostel_id) REFERENCES hostel(hostel_id)
);

-- ============================================================
-- TABLE 13: laundry_request
-- (unchanged)
-- ============================================================
CREATE TABLE laundry_request (
    request_id          CHAR(36)        NOT NULL DEFAULT (UUID()) PRIMARY KEY,
    student_id          CHAR(36)        NOT NULL,
    laundry_id          CHAR(36)        NOT NULL,
    pickup_date         DATE            NOT NULL,
    delivery_date       DATE,
    items_description   TEXT,
    total_pieces        INT,
    total_weight_kg     DECIMAL(8,2),
    total_charge        DECIMAL(10,2),
    service_type        VARCHAR(50),
    status              VARCHAR(30)     DEFAULT 'Pending',
    payment_status      VARCHAR(20)     DEFAULT 'Unpaid',
    created_at          DATETIME        DEFAULT CURRENT_TIMESTAMP,
    updated_at          DATETIME        DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_lr_student FOREIGN KEY (student_id) REFERENCES student(student_id),
    CONSTRAINT fk_lr_laundry FOREIGN KEY (laundry_id) REFERENCES laundry(laundry_id)
);

-- ============================================================
-- TABLE 14: accesslog
-- REMOVED: hostel_id  (student_id → hostel_id via active allocation,
--                      storing it here is transitive)
-- ============================================================
CREATE TABLE accesslog (
    log_id              CHAR(36)        NOT NULL DEFAULT (UUID()) PRIMARY KEY,
    student_id          CHAR(36)        NOT NULL,
    entry_time          DATETIME        NOT NULL,
    exit_time           DATETIME,
    duration_minutes    INT             AS (IF(exit_time IS NOT NULL, TIMESTAMPDIFF(MINUTE, entry_time, exit_time), NULL)) STORED,
    is_overnight        BOOLEAN         AS (exit_time IS NOT NULL AND DATE(exit_time) > DATE(entry_time)) STORED,
    is_late_entry       BOOLEAN         DEFAULT FALSE,
    gate_number         VARCHAR(20),
    guard_name          VARCHAR(100),
    purpose             VARCHAR(100),
    remarks             TEXT,
    created_at          DATETIME        DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_al_student FOREIGN KEY (student_id) REFERENCES student(student_id)
);

-- ============================================================
-- TABLE 15: facility
-- (unchanged)
-- ============================================================
CREATE TABLE facility (
    facility_id         CHAR(36)        NOT NULL DEFAULT (UUID()) PRIMARY KEY,
    facility_name       VARCHAR(100)    NOT NULL,
    facility_type       VARCHAR(50),
    hostel_id           CHAR(36)        NOT NULL,
    capacity            INT,
    operating_days      VARCHAR(100),
    timing_open         TIME,
    timing_close        TIME,
    in_charge_name      VARCHAR(100),
    in_charge_phone     VARCHAR(15),
    condition_status    VARCHAR(50)     DEFAULT 'Good',
    last_maintained     DATE,
    is_operational      BOOLEAN         DEFAULT TRUE,
    created_at          DATETIME        DEFAULT CURRENT_TIMESTAMP,
    updated_at          DATETIME        DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_fac_hostel FOREIGN KEY (hostel_id) REFERENCES hostel(hostel_id)
);

-- ============================================================
-- TABLE 16: facility_booking
-- (unchanged)
-- ============================================================
CREATE TABLE facility_booking (
    booking_id          CHAR(36)        NOT NULL DEFAULT (UUID()) PRIMARY KEY,
    facility_id         CHAR(36)        NOT NULL,
    student_id          CHAR(36)        NOT NULL,
    booking_date        DATE            NOT NULL,
    slot_start          TIME            NOT NULL,
    slot_end            TIME            NOT NULL,
    duration_minutes    INT             AS (TIMESTAMPDIFF(MINUTE, slot_start, slot_end)) STORED,
    purpose             VARCHAR(100),
    status              VARCHAR(20)     DEFAULT 'Confirmed',
    created_at          DATETIME        DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_fb_facility FOREIGN KEY (facility_id) REFERENCES facility(facility_id),
    CONSTRAINT fk_fb_student  FOREIGN KEY (student_id)  REFERENCES student(student_id)
);

-- ============================================================
-- TABLE 17: complaint
-- REMOVED: hostel_id  (student_id → hostel via allocation; also
--                      room_id → hostel via room.hostel_id — both
--                      paths make hostel_id here transitive)
-- ============================================================
CREATE TABLE complaint (
    complaint_id        CHAR(36)        NOT NULL DEFAULT (UUID()) PRIMARY KEY,
    student_id          CHAR(36)        NOT NULL,
    room_id             CHAR(36),
    technician_id       CHAR(36),
    description         TEXT            NOT NULL,
    complaint_type      VARCHAR(100),
    priority            VARCHAR(20)     DEFAULT 'Medium',
    status              VARCHAR(30)     DEFAULT 'Open',
    created_at          DATETIME        DEFAULT CURRENT_TIMESTAMP,
    updated_at          DATETIME        DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    resolved_at         DATETIME,
    is_resolved         BOOLEAN         AS (status IN ('Resolved', 'Closed')) STORED,
    resolution_notes    TEXT,
    cost_incurred       DECIMAL(10,2)   DEFAULT 0,
    CONSTRAINT fk_comp_student FOREIGN KEY (student_id)    REFERENCES student(student_id),
    CONSTRAINT fk_comp_room    FOREIGN KEY (room_id)       REFERENCES room(room_id)            ON DELETE SET NULL,
    CONSTRAINT fk_comp_tech    FOREIGN KEY (technician_id) REFERENCES technician(technician_id) ON DELETE SET NULL
);

-- ============================================================
-- TABLE 18: visitor_log
-- REMOVED: hostel_id  (student_id → hostel via allocation — transitive)
-- ============================================================
CREATE TABLE visitor_log (
    visitor_id          CHAR(36)        NOT NULL DEFAULT (UUID()) PRIMARY KEY,
    visitor_name        VARCHAR(100)    NOT NULL,
    visitor_phone       VARCHAR(15),
    id_proof_type       VARCHAR(50),
    id_proof_number     VARCHAR(100),
    student_id          CHAR(36)        NOT NULL,
    room_id             CHAR(36),
    relation_to_student VARCHAR(50),
    purpose             TEXT,
    entry_time          DATETIME        NOT NULL,
    exit_time           DATETIME,
    visit_duration_minutes INT          AS (IF(exit_time IS NOT NULL, TIMESTAMPDIFF(MINUTE, entry_time, exit_time), NULL)) STORED,
    guard_name          VARCHAR(100),
    gate_number         VARCHAR(20),
    approved_by         VARCHAR(100),
    created_at          DATETIME        DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_vl_student FOREIGN KEY (student_id) REFERENCES student(student_id),
    CONSTRAINT fk_vl_room    FOREIGN KEY (room_id)    REFERENCES room(room_id) ON DELETE SET NULL
);

-- ============================================================
-- TABLE 19: notice_board
-- (unchanged)
-- ============================================================
CREATE TABLE notice_board (
    notice_id           CHAR(36)        NOT NULL DEFAULT (UUID()) PRIMARY KEY,
    hostel_id           CHAR(36)        NOT NULL,
    title               VARCHAR(255)    NOT NULL,
    content             TEXT,
    category            VARCHAR(50),
    target_audience     VARCHAR(50),
    posted_by           VARCHAR(100),
    posted_at           DATETIME        DEFAULT CURRENT_TIMESTAMP,
    expiry_date         DATE,
    attachment_url      VARCHAR(255),
    CONSTRAINT fk_nb_hostel FOREIGN KEY (hostel_id) REFERENCES hostel(hostel_id)
);

-- ============================================================
-- TABLE 20: maintenance_schedule
-- (unchanged)
-- ============================================================
CREATE TABLE maintenance_schedule (
    schedule_id         CHAR(36)        NOT NULL DEFAULT (UUID()) PRIMARY KEY,
    hostel_id           CHAR(36)        NOT NULL,
    area_type           VARCHAR(50),
    area_id             CHAR(36),
    maintenance_type    VARCHAR(100),
    scheduled_date      DATE            NOT NULL,
    completed_date      DATE,
    technician_id       CHAR(36),
    status              VARCHAR(20)     DEFAULT 'Scheduled',
    notes               TEXT,
    cost                DECIMAL(10,2),
    created_at          DATETIME        DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_msch_hostel FOREIGN KEY (hostel_id)     REFERENCES hostel(hostel_id),
    CONSTRAINT fk_msch_tech   FOREIGN KEY (technician_id) REFERENCES technician(technician_id) ON DELETE SET NULL
);

-- ============================================================
-- TABLE 21: store
-- (unchanged)
-- ============================================================
CREATE TABLE store (
    store_id            CHAR(36)        NOT NULL DEFAULT (UUID()) PRIMARY KEY,
    store_name          VARCHAR(100)    NOT NULL,
    hostel_id           CHAR(36)        NOT NULL,
    manager_name        VARCHAR(100),
    manager_phone       VARCHAR(15),
    store_type          VARCHAR(50),
    timing_open         TIME,
    timing_close        TIME,
    is_operational      BOOLEAN         DEFAULT TRUE,
    created_at          DATETIME        DEFAULT CURRENT_TIMESTAMP,
    updated_at          DATETIME        DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_store_hostel FOREIGN KEY (hostel_id) REFERENCES hostel(hostel_id)
);

-- ============================================================
-- TABLE 22: store_purchase
-- (unchanged)
-- ============================================================
CREATE TABLE store_purchase (
    purchase_id         CHAR(36)        NOT NULL DEFAULT (UUID()) PRIMARY KEY,
    student_id          CHAR(36)        NOT NULL,
    store_id            CHAR(36)        NOT NULL,
    item_description    TEXT            NOT NULL,
    quantity            INT             DEFAULT 1,
    total_amount        DECIMAL(10,2)   NOT NULL,
    payment_mode        VARCHAR(50),
    purchase_date       DATETIME        DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_sp_student FOREIGN KEY (student_id) REFERENCES student(student_id),
    CONSTRAINT fk_sp_store   FOREIGN KEY (store_id)   REFERENCES store(store_id)
);

-- ============================================================
-- TABLE 23: pharmacy
-- (unchanged)
-- ============================================================
CREATE TABLE pharmacy (
    pharmacy_id         CHAR(36)        NOT NULL DEFAULT (UUID()) PRIMARY KEY,
    pharmacy_name       VARCHAR(100)    NOT NULL,
    address             VARCHAR(255),
    pharmacist_name     VARCHAR(100),
    pharmacist_phone    VARCHAR(15),
    license_number      VARCHAR(100),
    license_expiry      DATE,
    timing_open         TIME,
    timing_close        TIME,
    is_24hr             BOOLEAN         DEFAULT FALSE,
    emergency_available BOOLEAN         DEFAULT TRUE,
    created_at          DATETIME        DEFAULT CURRENT_TIMESTAMP,
    updated_at          DATETIME        DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ============================================================
-- TABLE 24: pharmacy_visit
-- (unchanged)
-- ============================================================
CREATE TABLE pharmacy_visit (
    visit_id            CHAR(36)        NOT NULL DEFAULT (UUID()) PRIMARY KEY,
    student_id          CHAR(36)        NOT NULL,
    pharmacy_id         CHAR(36)        NOT NULL,
    visit_date          DATETIME        DEFAULT CURRENT_TIMESTAMP,
    prescription_details TEXT,
    medicines_issued    TEXT,
    total_cost          DECIMAL(10,2),
    payment_status      VARCHAR(20)     DEFAULT 'Paid',
    CONSTRAINT fk_pv_student  FOREIGN KEY (student_id)  REFERENCES student(student_id),
    CONSTRAINT fk_pv_pharmacy FOREIGN KEY (pharmacy_id) REFERENCES pharmacy(pharmacy_id)
);

-- ============================================================
-- TABLE 25: restaurant
-- (unchanged)
-- ============================================================
CREATE TABLE restaurant (
    restaurant_id       CHAR(36)        NOT NULL DEFAULT (UUID()) PRIMARY KEY,
    restaurant_name     VARCHAR(100)    NOT NULL,
    location            VARCHAR(255),
    cuisine_type        VARCHAR(100),
    manager_name        VARCHAR(100),
    manager_phone       VARCHAR(15),
    capacity            INT,
    timing_open         TIME,
    timing_close        TIME,
    avg_cost_per_meal   DECIMAL(8,2),
    rating              DECIMAL(3,1),
    is_operational      BOOLEAN         DEFAULT TRUE,
    created_at          DATETIME        DEFAULT CURRENT_TIMESTAMP,
    updated_at          DATETIME        DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ============================================================
-- TABLE 26: gym
-- (unchanged)
-- ============================================================
CREATE TABLE gym (
    gym_id              CHAR(36)        NOT NULL DEFAULT (UUID()) PRIMARY KEY,
    gym_name            VARCHAR(100)    NOT NULL,
    location            VARCHAR(255),
    trainer_name        VARCHAR(100),
    trainer_phone       VARCHAR(15),
    capacity            INT,
    monthly_fee         DECIMAL(10,2),
    equipment_summary   TEXT,
    timing_open         TIME,
    timing_close        TIME,
    is_operational      BOOLEAN         DEFAULT TRUE,
    created_at          DATETIME        DEFAULT CURRENT_TIMESTAMP,
    updated_at          DATETIME        DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ============================================================
-- TABLE 27: gym_membership
-- (unchanged)
-- ============================================================
CREATE TABLE gym_membership (
    membership_id       CHAR(36)        NOT NULL DEFAULT (UUID()) PRIMARY KEY,
    student_id          CHAR(36)        NOT NULL,
    gym_id              CHAR(36)        NOT NULL,
    start_date          DATE            NOT NULL,
    end_date            DATE,
    fee_paid            DECIMAL(10,2),
    status              VARCHAR(20)     DEFAULT 'Active',
    created_at          DATETIME        DEFAULT CURRENT_TIMESTAMP,
    updated_at          DATETIME        DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_gm_student FOREIGN KEY (student_id) REFERENCES student(student_id),
    CONSTRAINT fk_gm_gym     FOREIGN KEY (gym_id)     REFERENCES gym(gym_id)
);

-- ============================================================
-- TABLE 28: ambulance_service
-- (unchanged)
-- ============================================================
CREATE TABLE ambulance_service (
    ambulance_id        CHAR(36)        NOT NULL DEFAULT (UUID()) PRIMARY KEY,
    vehicle_number      VARCHAR(20)     NOT NULL UNIQUE,
    driver_name         VARCHAR(100),
    driver_phone        VARCHAR(15),
    hospital_name       VARCHAR(100),
    hospital_address    VARCHAR(255),
    hospital_phone      VARCHAR(15),
    is_available        BOOLEAN         DEFAULT TRUE,
    last_service_date   DATE,
    created_at          DATETIME        DEFAULT CURRENT_TIMESTAMP,
    updated_at          DATETIME        DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ============================================================
-- TABLE 29: emergency_request
-- REMOVED: hostel_id  (student_id → hostel via allocation — transitive)
-- ============================================================
CREATE TABLE emergency_request (
    request_id          CHAR(36)        NOT NULL DEFAULT (UUID()) PRIMARY KEY,
    student_id          CHAR(36)        NOT NULL,
    ambulance_id        CHAR(36),
    request_time        DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    pickup_time         DATETIME,
    hospital_reached_time DATETIME,
    response_minutes    INT             AS (IF(pickup_time IS NOT NULL, TIMESTAMPDIFF(MINUTE, request_time, pickup_time), NULL)) STORED,
    emergency_type      VARCHAR(100),
    description         TEXT,
    status              VARCHAR(30)     DEFAULT 'Requested',
    notes               TEXT,
    created_at          DATETIME        DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_er_student   FOREIGN KEY (student_id)   REFERENCES student(student_id),
    CONSTRAINT fk_er_ambulance FOREIGN KEY (ambulance_id) REFERENCES ambulance_service(ambulance_id) ON DELETE SET NULL
);