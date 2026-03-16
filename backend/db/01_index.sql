-- ============================================================
-- HOSTEL MANAGEMENT SYSTEM — INDEXES
-- MySQL 8.0+ | Run AFTER 01_init.sql
-- Strategy:
--   1. FK columns          → speed up JOIN and ON DELETE lookups
--   2. Filter columns      → WHERE clauses in common queries
--   3. Covering indexes    → avoid table look-ups for hot queries
--   4. Composite indexes   → multi-column WHERE / GROUP BY
-- Indexes on PK (hostel_id, student_id …) are auto-created.
-- ============================================================

USE hostel_mgmt_3nf;

-- ============================================================
-- student
-- ============================================================

-- Lookup by registration number (login, search)
CREATE INDEX idx_student_reg_no
    ON student (reg_no);

-- Filter by department / course / status (reports, dashboards)
CREATE INDEX idx_student_dept_course
    ON student (department, course);

CREATE INDEX idx_student_status
    ON student (status);

-- ============================================================
-- student_guardian
-- ============================================================

-- Join back to student; find emergency contacts fast
CREATE INDEX idx_sg_student
    ON student_guardian (student_id, is_emergency_contact);

-- ============================================================
-- room
-- ============================================================

-- List rooms by hostel; UNIQUE already covers (hostel_id, room_number)
-- but an index on hostel_id alone helps range scans
CREATE INDEX idx_room_hostel
    ON room (hostel_id);

-- Filter vacant / cheap rooms
CREATE INDEX idx_room_type_rent
    ON room (room_type, monthly_rent);

-- ============================================================
-- bed
-- ============================================================

-- FK join + availability filter — most common bed query
CREATE INDEX idx_bed_room_occupied
    ON bed (room_id, occupied);

-- ============================================================
-- allocation
-- ============================================================

-- Active allocation for a student (room-assignment lookup)
CREATE INDEX idx_alloc_student_status
    ON allocation (student_id, status);

-- Active allocations for a bed (prevent double-booking)
CREATE INDEX idx_alloc_bed_status
    ON allocation (bed_id, status);

-- Date-range queries (check-in / check-out reports)
CREATE INDEX idx_alloc_dates
    ON allocation (start_date, end_date);

-- ============================================================
-- feepayment
-- ============================================================

-- All payments for a student
CREATE INDEX idx_fp_student
    ON feepayment (student_id);

-- Overdue detection: due_date + paid vs due comparison
CREATE INDEX idx_fp_due_date_status
    ON feepayment (due_date, status);

-- Monthly roll-up reports
CREATE INDEX idx_fp_month_semester
    ON feepayment (fee_month, semester);

-- ============================================================
-- mess_subscription
-- ============================================================

CREATE INDEX idx_ms_student_status
    ON mess_subscription (student_id, status);

CREATE INDEX idx_ms_mess_status
    ON mess_subscription (mess_id, status);

-- ============================================================
-- menu
-- ============================================================

-- Weekly menu display (mess + day + meal_type)
CREATE INDEX idx_menu_mess_day_meal
    ON menu (mess_id, day_of_week, meal_type);

-- ============================================================
-- laundry_request
-- ============================================================

CREATE INDEX idx_lr_student
    ON laundry_request (student_id);

CREATE INDEX idx_lr_laundry_status
    ON laundry_request (laundry_id, status);

-- Payment status sweep (collect unpaid)
CREATE INDEX idx_lr_payment_status
    ON laundry_request (payment_status);

-- ============================================================
-- accesslog
-- ============================================================

-- Per-student access history (most common query)
CREATE INDEX idx_al_student_entry
    ON accesslog (student_id, entry_time);

-- Late entry audit
CREATE INDEX idx_al_late
    ON accesslog (is_late_entry, entry_time);

-- ============================================================
-- facility_booking
-- ============================================================

-- Slot-conflict check (facility + date + time window)
CREATE INDEX idx_fb_facility_date_slot
    ON facility_booking (facility_id, booking_date, slot_start, slot_end);

-- A student's upcoming bookings
CREATE INDEX idx_fb_student_date
    ON facility_booking (student_id, booking_date);

-- ============================================================
-- complaint
-- ============================================================

-- Technician workload (open + in-progress per tech)
CREATE INDEX idx_comp_tech_status
    ON complaint (technician_id, status);

-- Priority queue (high-priority unresolved)
CREATE INDEX idx_comp_priority_status
    ON complaint (priority, status);

-- ============================================================
-- visitor_log
-- ============================================================

-- A student's visitor history
CREATE INDEX idx_vl_student_entry
    ON visitor_log (student_id, entry_time);

-- ============================================================
-- notice_board
-- ============================================================

-- Active notices for a hostel (expiry filter)
CREATE INDEX idx_nb_hostel_expiry
    ON notice_board (hostel_id, expiry_date);

-- ============================================================
-- maintenance_schedule
-- ============================================================

CREATE INDEX idx_msch_hostel_status
    ON maintenance_schedule (hostel_id, status);

CREATE INDEX idx_msch_tech
    ON maintenance_schedule (technician_id);

CREATE INDEX idx_msch_scheduled_date
    ON maintenance_schedule (scheduled_date);

-- ============================================================
-- store_purchase
-- ============================================================

CREATE INDEX idx_sp_student
    ON store_purchase (student_id);

CREATE INDEX idx_sp_store_date
    ON store_purchase (store_id, purchase_date);

-- ============================================================
-- pharmacy_visit
-- ============================================================

CREATE INDEX idx_pv_student
    ON pharmacy_visit (student_id);

CREATE INDEX idx_pv_payment_status
    ON pharmacy_visit (payment_status);

-- ============================================================
-- gym_membership
-- ============================================================

CREATE INDEX idx_gm_student_status
    ON gym_membership (student_id, status);

CREATE INDEX idx_gm_gym_end_date
    ON gym_membership (gym_id, end_date);

-- ============================================================
-- emergency_request
-- ============================================================

CREATE INDEX idx_er_student
    ON emergency_request (student_id);

CREATE INDEX idx_er_ambulance
    ON emergency_request (ambulance_id);

-- ============================================================
-- END OF INDEXES
-- ============================================================