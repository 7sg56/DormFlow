-- ============================================================
-- HOSTEL MANAGEMENT SYSTEM — SIMPLIFIED SCHEMA
-- MySQL 8.0+ | UUID Primary Keys | ~18 Tables
--
-- Removed (not core):
--   ambulance_service, emergency_request, hospital,
--   pharmacy, pharmacy_visit, gym, gym_membership,
--   restaurant, store, store_purchase, store_purchase_item,
--   notice_board, accesslog, facility, facility_operating_day,
--   facility_booking, menu, mess_subscription, laundry_request,
--   maintenance_schedule, student_guardian, audit_log,
--   idempotency_key
--
-- Merged into existing tables:
--   student_guardian → guardian columns in student
--   mess_subscription → mess_id FK in student
--   menu → menu_description column in mess
-- ============================================================

DROP DATABASE IF EXISTS hostel_mgmt;
CREATE DATABASE IF NOT EXISTS hostel_mgmt
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE hostel_mgmt;

-- ============================================================
-- TABLE: pincode_locality  [BCNF]
-- Resolves: pincode → {city, state} determinant
-- ============================================================
CREATE TABLE pincode_locality (
    pincode             VARCHAR(10)     NOT NULL PRIMARY KEY,
    city                VARCHAR(100)    NOT NULL,
    state               VARCHAR(100)    NOT NULL
);

-- ============================================================
-- TABLE: hostel
-- ============================================================
CREATE TABLE hostel (
    hostel_id           CHAR(36)        NOT NULL DEFAULT (UUID()) PRIMARY KEY,
    hostel_name         VARCHAR(100)    NOT NULL,
    type                VARCHAR(50)     NOT NULL,
    total_floors        INT             NOT NULL,
    address             VARCHAR(255),
    pincode             VARCHAR(10),
    established_year    YEAR,
    registration_no     VARCHAR(100)    UNIQUE,
    office_phone        VARCHAR(15),
    emergency_phone     VARCHAR(15),
    created_at          DATETIME        DEFAULT CURRENT_TIMESTAMP,
    updated_at          DATETIME        DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_hostel_pincode FOREIGN KEY (pincode) REFERENCES pincode_locality(pincode) ON UPDATE CASCADE
);

-- ============================================================
-- TABLE: hostel_warden  [BCNF]
-- Resolves: warden_name → {warden_phone, warden_email}
-- ============================================================
CREATE TABLE hostel_warden (
    warden_id           CHAR(36)        NOT NULL DEFAULT (UUID()) PRIMARY KEY,
    clerk_user_id       VARCHAR(64)     NULL,
    hostel_id           CHAR(36)        NOT NULL,
    warden_name         VARCHAR(100)    NOT NULL,
    warden_phone        VARCHAR(15),
    warden_email        VARCHAR(100),
    assigned_date       DATE,
    is_active           BOOLEAN         DEFAULT TRUE,
    created_at          DATETIME        DEFAULT CURRENT_TIMESTAMP,
    updated_at          DATETIME        DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_hw_hostel FOREIGN KEY (hostel_id) REFERENCES hostel(hostel_id) ON DELETE CASCADE,
    UNIQUE INDEX idx_warden_clerk_uid (clerk_user_id)
);

-- ============================================================
-- TABLE: mess
-- Added: menu_description (replaces separate menu table)
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
    menu_description    TEXT,
    created_at          DATETIME        DEFAULT CURRENT_TIMESTAMP,
    updated_at          DATETIME        DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_mess_hostel FOREIGN KEY (hostel_id) REFERENCES hostel(hostel_id)
);

-- ============================================================
-- TABLE: mess_timing  [4NF]
-- Resolves: mess_id ↠ {meal_type, timing}
-- ============================================================
CREATE TABLE mess_timing (
    mess_id             CHAR(36)        NOT NULL,
    meal_type           VARCHAR(20)     NOT NULL,
    time_start          TIME            NOT NULL,
    time_end            TIME            NOT NULL,
    PRIMARY KEY (mess_id, meal_type),
    CONSTRAINT fk_mt_mess FOREIGN KEY (mess_id) REFERENCES mess(mess_id) ON DELETE CASCADE
);

-- ============================================================
-- TABLE: student
-- 1NF:  full_name split → first_name + last_name
-- 3NF:  hostel_id REMOVED (derive via allocation)
-- BCNF: city, state REMOVED → derive via pincode_locality
-- Added: guardian_name, guardian_phone, guardian_relation
--        (replaces student_guardian table)
-- Added: mess_id FK (replaces mess_subscription table)
-- ============================================================
CREATE TABLE student (
    student_id          CHAR(36)        NOT NULL DEFAULT (UUID()) PRIMARY KEY,
    clerk_user_id       VARCHAR(64)     NULL,
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
    pincode             VARCHAR(10),
    admission_date      DATE,
    status              VARCHAR(20)     DEFAULT 'Active',
    photo_url           VARCHAR(255),
    guardian_name       VARCHAR(100),
    guardian_phone      VARCHAR(15),
    guardian_relation   VARCHAR(50),
    mess_id             CHAR(36),
    created_at          DATETIME        DEFAULT CURRENT_TIMESTAMP,
    updated_at          DATETIME        DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_student_pincode FOREIGN KEY (pincode) REFERENCES pincode_locality(pincode) ON UPDATE CASCADE,
    CONSTRAINT fk_student_mess    FOREIGN KEY (mess_id) REFERENCES mess(mess_id) ON DELETE SET NULL,
    UNIQUE INDEX idx_student_clerk_uid (clerk_user_id)
);

-- ============================================================
-- TABLE: room
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
-- TABLE: bed
-- 3NF: is_available REMOVED (NOT occupied is trivially derived)
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
-- TABLE: specialization  [4NF]
-- Lookup table for technician specializations
-- ============================================================
CREATE TABLE specialization (
    specialization_id   CHAR(36)        NOT NULL DEFAULT (UUID()) PRIMARY KEY,
    specialization_name VARCHAR(100)    NOT NULL UNIQUE
);

-- ============================================================
-- TABLE: technician
-- 4NF: specialization REMOVED → technician_specialization junction
-- ============================================================
CREATE TABLE technician (
    technician_id       CHAR(36)        NOT NULL DEFAULT (UUID()) PRIMARY KEY,
    clerk_user_id       VARCHAR(64)     NULL,
    name                VARCHAR(100)    NOT NULL,
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
    CONSTRAINT fk_tech_hostel FOREIGN KEY (hostel_id) REFERENCES hostel(hostel_id) ON DELETE SET NULL,
    UNIQUE INDEX idx_tech_clerk_uid (clerk_user_id)
);

-- ============================================================
-- TABLE: technician_specialization  [4NF]
-- Junction table: technician ↔ specialization (M:N)
-- ============================================================
CREATE TABLE technician_specialization (
    technician_id       CHAR(36)        NOT NULL,
    specialization_id   CHAR(36)        NOT NULL,
    PRIMARY KEY (technician_id, specialization_id),
    CONSTRAINT fk_ts_tech FOREIGN KEY (technician_id) REFERENCES technician(technician_id) ON DELETE CASCADE,
    CONSTRAINT fk_ts_spec FOREIGN KEY (specialization_id) REFERENCES specialization(specialization_id) ON DELETE CASCADE
);

-- ============================================================
-- TABLE: allocation
-- 3NF: hostel_id, room_id REMOVED (bed → room → hostel)
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
-- TABLE: feepayment
-- 3NF: hostel_id REMOVED (student → allocation → hostel)
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
-- TABLE: laundry
-- 4NF: service_types REMOVED → laundry_service_type
-- 4NF: operating_days REMOVED → laundry_operating_day
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
    timing_open         TIME,
    timing_close        TIME,
    contract_start      DATE,
    contract_end        DATE,
    created_at          DATETIME        DEFAULT CURRENT_TIMESTAMP,
    updated_at          DATETIME        DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_lau_hostel FOREIGN KEY (hostel_id) REFERENCES hostel(hostel_id)
);

-- ============================================================
-- TABLE: laundry_service_type  [4NF]
-- Resolves: laundry_id ↠ service_type
-- ============================================================
CREATE TABLE laundry_service_type (
    laundry_id          CHAR(36)        NOT NULL,
    service_type        VARCHAR(50)     NOT NULL,
    PRIMARY KEY (laundry_id, service_type),
    CONSTRAINT fk_lst_laundry FOREIGN KEY (laundry_id) REFERENCES laundry(laundry_id) ON DELETE CASCADE
);

-- ============================================================
-- TABLE: laundry_operating_day  [4NF]
-- Resolves: laundry_id ↠ operating_day
-- ============================================================
CREATE TABLE laundry_operating_day (
    laundry_id          CHAR(36)        NOT NULL,
    day_of_week         VARCHAR(10)     NOT NULL,
    PRIMARY KEY (laundry_id, day_of_week),
    CONSTRAINT fk_lod_laundry FOREIGN KEY (laundry_id) REFERENCES laundry(laundry_id) ON DELETE CASCADE
);

-- ============================================================
-- TABLE: complaint
-- 3NF: hostel_id REMOVED (room → hostel; student → allocation → hostel)
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
-- TABLE: visitor_log
-- 3NF: hostel_id REMOVED (student → allocation → hostel)
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