-- ============================================================
-- MIGRATION: Add clerk_user_id to link Clerk auth to DB records
-- Run after 03_data.sql
-- ============================================================

USE hostel_mgmt;

-- Student -> Clerk user mapping
ALTER TABLE student
  ADD COLUMN clerk_user_id VARCHAR(64) NULL AFTER student_id,
  ADD UNIQUE INDEX idx_student_clerk_uid (clerk_user_id);

-- Hostel Warden -> Clerk user mapping
ALTER TABLE hostel_warden
  ADD COLUMN clerk_user_id VARCHAR(64) NULL AFTER warden_id,
  ADD UNIQUE INDEX idx_warden_clerk_uid (clerk_user_id);

-- Technician -> Clerk user mapping
ALTER TABLE technician
  ADD COLUMN clerk_user_id VARCHAR(64) NULL AFTER technician_id,
  ADD UNIQUE INDEX idx_tech_clerk_uid (clerk_user_id);
