-- ============================================================
-- HOSTEL MANAGEMENT SYSTEM — AUTH, AUDIT & IDEMPOTENCY TABLES
-- MySQL 8.0+ | UUID v4 Primary Keys
-- Run AFTER 00_init.sql
-- ============================================================

USE hostel_mgmt;

-- ============================================================
-- TABLE 30: auth_user
-- Login credentials, password hashes, roles
-- ============================================================
CREATE TABLE auth_user (
    user_id             CHAR(36)        NOT NULL DEFAULT (UUID()) PRIMARY KEY,
    student_id          CHAR(36)        UNIQUE,
    email               VARCHAR(100)    NOT NULL UNIQUE,
    password_hash       VARCHAR(255)    NOT NULL,
    role                ENUM('admin','warden','student','technician') NOT NULL DEFAULT 'student',
    is_active           BOOLEAN         DEFAULT TRUE,
    last_login          DATETIME,
    refresh_token       VARCHAR(500),
    assigned_hostel_id  CHAR(36),
    technician_id       CHAR(36)        UNIQUE,
    created_at          DATETIME        DEFAULT CURRENT_TIMESTAMP,
    updated_at          DATETIME        DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_auth_student FOREIGN KEY (student_id)
        REFERENCES student(student_id) ON DELETE SET NULL,
    CONSTRAINT fk_auth_hostel FOREIGN KEY (assigned_hostel_id)
        REFERENCES hostel(hostel_id) ON DELETE SET NULL,
    CONSTRAINT fk_auth_technician FOREIGN KEY (technician_id)
        REFERENCES technician(technician_id) ON DELETE SET NULL
);

-- ============================================================
-- TABLE 31: audit_log
-- Immutable change log — who changed what and when
-- ============================================================
CREATE TABLE audit_log (
    log_id          CHAR(36)        NOT NULL DEFAULT (UUID()) PRIMARY KEY,
    user_id         CHAR(36),
    table_name      VARCHAR(50)     NOT NULL,
    record_id       CHAR(36)        NOT NULL,
    action          ENUM('INSERT','UPDATE','DELETE') NOT NULL,
    old_values      JSON,
    new_values      JSON,
    ip_address      VARCHAR(45),
    user_agent      VARCHAR(255),
    created_at      DATETIME        DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_audit_user FOREIGN KEY (user_id)
        REFERENCES auth_user(user_id) ON DELETE SET NULL
);

-- ============================================================
-- TABLE 32: idempotency_key
-- Prevent duplicate writes on retries
-- ============================================================
CREATE TABLE idempotency_key (
    idempotency_key VARCHAR(255)    NOT NULL PRIMARY KEY,
    user_id         CHAR(36),
    request_path    VARCHAR(255)    NOT NULL,
    request_hash    VARCHAR(64)     NOT NULL,
    response_code   INT,
    response_body   JSON,
    created_at      DATETIME        DEFAULT CURRENT_TIMESTAMP,
    expires_at      DATETIME        NOT NULL,
    CONSTRAINT fk_idem_user FOREIGN KEY (user_id)
        REFERENCES auth_user(user_id) ON DELETE SET NULL
);

-- ============================================================
-- INDEXES for new tables
-- ============================================================

-- auth_user
CREATE INDEX idx_auth_email      ON auth_user (email);
CREATE INDEX idx_auth_role       ON auth_user (role, is_active);
CREATE INDEX idx_auth_student    ON auth_user (student_id);
CREATE INDEX idx_auth_hostel     ON auth_user (assigned_hostel_id);
CREATE INDEX idx_auth_technician ON auth_user (technician_id);

-- audit_log
CREATE INDEX idx_audit_table_record ON audit_log (table_name, record_id);
CREATE INDEX idx_audit_user         ON audit_log (user_id);
CREATE INDEX idx_audit_created      ON audit_log (created_at);
CREATE INDEX idx_audit_action       ON audit_log (action, table_name);

-- idempotency_key
CREATE INDEX idx_idem_expires    ON idempotency_key (expires_at);
CREATE INDEX idx_idem_user       ON idempotency_key (user_id);

-- ============================================================
-- SEED: default admin user (password: admin123 — bcrypt hash)
-- ============================================================
INSERT INTO auth_user (user_id, email, password_hash, role, is_active) VALUES
('u-0001-0000-0000-000000000001', 'admin@dormflow.edu', '$2b$10$LqPvEz0JxK2RqH8xZ7e6y.rJ1s9VqOBhFG2xVHNyM0kJv4V4XJWXS', 'admin', TRUE);
