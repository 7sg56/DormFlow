-- ============================================================
-- HOSTEL MANAGEMENT SYSTEM — VIEWS
-- Run AFTER 01_init.sql and 02_data.sql
--
-- Note: Redundant hostel_id / room_id columns are removed in the main schema
-- from activity tables, these views reconstruct the full
-- picture via proper JOINs — so application queries remain
-- identical to the 1NF version.
-- ============================================================

USE hostel_mgmt;

-- ============================================================
-- HELPER: active allocation subquery used in several views
-- Returns each student's current bed/room/hostel
-- ============================================================
CREATE OR REPLACE VIEW v_active_allocation AS
SELECT
    a.student_id,
    a.allocation_id,
    a.start_date,
    b.bed_id,
    b.bed_number,
    b.occupied,
    r.room_id,
    r.room_number,
    r.floor,
    r.room_type,
    r.monthly_rent,
    h.hostel_id,
    h.hostel_name,
    h.type          AS hostel_type
FROM allocation a
JOIN bed    b ON a.bed_id   = b.bed_id
JOIN room   r ON b.room_id  = r.room_id
JOIN hostel h ON r.hostel_id = h.hostel_id
WHERE a.status = 'Active'
  AND (a.end_date IS NULL OR a.end_date >= CURDATE());

-- ============================================================
-- VIEW: student full profile
-- (replaces 1NF v_student_full_profile)
-- ============================================================
CREATE OR REPLACE VIEW v_student_full_profile AS
SELECT
    s.student_id,
    s.reg_no,
    CONCAT(s.first_name, ' ', s.last_name)          AS full_name,
    TIMESTAMPDIFF(YEAR, s.date_of_birth, CURDATE())  AS age,
    s.gender,
    s.phone_primary,
    s.email_personal,
    s.email_institutional,
    s.department,
    s.course,
    s.academic_year,
    s.semester,
    s.blood_group,
    s.status,
    s.admission_date,
    TIMESTAMPDIFF(YEAR, s.admission_date, CURDATE()) AS years_in_hostel,
    aa.hostel_name,
    aa.hostel_type,
    aa.room_number,
    aa.floor,
    aa.bed_number
FROM student s
LEFT JOIN v_active_allocation aa ON s.student_id = aa.student_id;

-- ============================================================
-- VIEW: room occupancy status
-- (unchanged logic — room.hostel_id was never redundant)
-- ============================================================
CREATE OR REPLACE VIEW v_room_occupancy AS
SELECT
    r.room_id,
    r.room_number,
    r.floor,
    r.room_type,
    r.capacity,
    r.monthly_rent,
    h.hostel_name,
    COUNT(b.bed_id)                                                     AS total_beds,
    SUM(CASE WHEN b.occupied = TRUE  THEN 1 ELSE 0 END)                 AS occupied_beds,
    SUM(CASE WHEN b.occupied = FALSE THEN 1 ELSE 0 END)                 AS available_beds,
    ROUND(SUM(CASE WHEN b.occupied = TRUE THEN 1 ELSE 0 END)
          / NULLIF(COUNT(b.bed_id), 0) * 100, 2)                        AS occupancy_percent,
    CASE
        WHEN SUM(CASE WHEN b.occupied = FALSE THEN 1 ELSE 0 END) = 0   THEN 'Full'
        WHEN SUM(CASE WHEN b.occupied = TRUE  THEN 1 ELSE 0 END) = 0   THEN 'Vacant'
        ELSE 'Available'
    END                                                                  AS occupancy_status
FROM room r
JOIN hostel h  ON r.hostel_id = h.hostel_id
LEFT JOIN bed b ON r.room_id  = b.room_id
GROUP BY r.room_id, r.room_number, r.floor, r.room_type,
         r.capacity, r.monthly_rent, h.hostel_name;

-- ============================================================
-- VIEW: fee payment summary
-- hostel derived via student → active_allocation → hostel
-- ============================================================
CREATE OR REPLACE VIEW v_fee_summary AS
SELECT
    s.student_id,
    s.reg_no,
    CONCAT(s.first_name, ' ', s.last_name)                              AS full_name,
    aa.hostel_name,
    COUNT(f.payment_id)                                                  AS total_payments,
    SUM(f.amount_due)                                                    AS total_due,
    SUM(f.paid_amount)                                                   AS total_paid,
    SUM(f.balance_due)                                                   AS total_balance,
    SUM(CASE WHEN f.status = 'Paid'    THEN 1 ELSE 0 END)               AS paid_count,
    SUM(CASE WHEN f.status = 'Pending' THEN 1 ELSE 0 END)               AS pending_count,
    SUM(CASE WHEN f.due_date < CURDATE()
             AND f.paid_amount < f.amount_due THEN 1 ELSE 0 END)        AS overdue_count
FROM student s
LEFT JOIN v_active_allocation aa ON s.student_id  = aa.student_id
LEFT JOIN feepayment f            ON s.student_id  = f.student_id
GROUP BY s.student_id, s.reg_no, s.first_name, s.last_name, aa.hostel_name;

-- ============================================================
-- VIEW: complaint dashboard
-- hostel derived via room → hostel (room_id is still on complaint)
-- ============================================================
CREATE OR REPLACE VIEW v_complaint_dashboard AS
SELECT
    c.complaint_id,
    CONCAT(s.first_name, ' ', s.last_name)          AS student_name,
    s.reg_no,
    h.hostel_name,
    r.room_number,
    c.complaint_type,
    c.priority,
    c.status,
    IF(c.resolved_at IS NOT NULL,
       DATEDIFF(c.resolved_at, c.created_at),
       DATEDIFF(CURDATE(), c.created_at))            AS days_open,
    c.is_resolved,
    c.cost_incurred,
    t.name           AS technician_name,
    t.specialization AS technician_specialization,
    c.created_at
FROM complaint c
JOIN student     s ON c.student_id    = s.student_id
LEFT JOIN room   r ON c.room_id       = r.room_id
LEFT JOIN hostel h ON r.hostel_id     = h.hostel_id
LEFT JOIN technician t ON c.technician_id = t.technician_id;

-- ============================================================
-- VIEW: hostel summary stats
-- ============================================================
CREATE OR REPLACE VIEW v_hostel_stats AS
SELECT
    h.hostel_id,
    h.hostel_name,
    h.type,
    h.total_floors,
    COUNT(DISTINCT r.room_id)                                           AS total_rooms,
    COUNT(DISTINCT b.bed_id)                                            AS total_beds,
    SUM(CASE WHEN b.occupied = TRUE  THEN 1 ELSE 0 END)                AS occupied_beds,
    SUM(CASE WHEN b.occupied = FALSE THEN 1 ELSE 0 END)                AS available_beds,
    ROUND(SUM(CASE WHEN b.occupied = TRUE THEN 1 ELSE 0 END)
          / NULLIF(COUNT(DISTINCT b.bed_id), 0) * 100, 2)              AS occupancy_rate,
    COUNT(DISTINCT aa.student_id)                                       AS total_students,
    COUNT(DISTINCT CASE WHEN c.is_resolved = FALSE
                        THEN c.complaint_id END)                        AS open_complaints,
    COUNT(DISTINCT f.facility_id)                                       AS total_facilities
FROM hostel h
LEFT JOIN room       r  ON h.hostel_id  = r.hostel_id
LEFT JOIN bed        b  ON r.room_id    = b.room_id
LEFT JOIN v_active_allocation aa ON h.hostel_id = aa.hostel_id
LEFT JOIN complaint  c  ON r.room_id    = c.room_id
LEFT JOIN facility   f  ON h.hostel_id  = f.hostel_id
GROUP BY h.hostel_id, h.hostel_name, h.type, h.total_floors;

-- ============================================================
-- VIEW: daily access log
-- hostel derived via student → active_allocation → hostel
-- ============================================================
CREATE OR REPLACE VIEW v_daily_access AS
SELECT
    al.log_id,
    DATE(al.entry_time)                              AS log_date,
    CONCAT(s.first_name, ' ', s.last_name)           AS student_name,
    s.reg_no,
    aa.hostel_name,
    al.entry_time,
    al.exit_time,
    al.duration_minutes,
    al.is_overnight,
    al.is_late_entry,
    al.purpose,
    al.gate_number,
    al.guard_name
FROM accesslog al
JOIN student s              ON al.student_id = s.student_id
LEFT JOIN v_active_allocation aa ON s.student_id = aa.student_id;

-- ============================================================
-- VIEW: technician workload
-- (unchanged — technician table untouched)
-- ============================================================
CREATE OR REPLACE VIEW v_technician_workload AS
SELECT
    t.technician_id,
    t.name,
    t.specialization,
    t.employment_type,
    COUNT(c.complaint_id)                                               AS total_assigned,
    SUM(CASE WHEN c.is_resolved = TRUE  THEN 1 ELSE 0 END)             AS total_resolved,
    SUM(CASE WHEN c.is_resolved = FALSE THEN 1 ELSE 0 END)             AS pending,
    ROUND(SUM(CASE WHEN c.is_resolved = TRUE THEN 1 ELSE 0 END)
          / NULLIF(COUNT(c.complaint_id), 0) * 100, 2)                 AS resolution_rate_pct,
    ROUND(AVG(CASE WHEN c.is_resolved = TRUE
              THEN DATEDIFF(c.resolved_at, c.created_at) END), 1)      AS avg_days_to_resolve,
    SUM(c.cost_incurred)                                                AS total_cost_incurred
FROM technician t
LEFT JOIN complaint c ON t.technician_id = c.technician_id
GROUP BY t.technician_id, t.name, t.specialization, t.employment_type;

-- ============================================================
-- VIEW: weekly mess menu
-- (unchanged)
-- ============================================================
CREATE OR REPLACE VIEW v_mess_menu_weekly AS
SELECT
    m.mess_id,
    ms.mess_name,
    m.day_of_week,
    m.meal_type,
    GROUP_CONCAT(m.item_name ORDER BY m.item_name SEPARATOR ', ') AS items,
    SUM(m.calories_approx)                                         AS total_calories_approx
FROM menu m
JOIN mess ms ON m.mess_id = ms.mess_id
GROUP BY m.mess_id, ms.mess_name, m.day_of_week, m.meal_type
ORDER BY m.mess_id,
    FIELD(m.day_of_week,'Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'),
    FIELD(m.meal_type,'Breakfast','Lunch','Snacks','Dinner');

-- ============================================================
-- VIEW: visitor log with hostel context
-- hostel derived via room → hostel
-- ============================================================
CREATE OR REPLACE VIEW v_visitor_log AS
SELECT
    vl.visitor_id,
    vl.visitor_name,
    vl.visitor_phone,
    vl.relation_to_student,
    vl.purpose,
    CONCAT(s.first_name, ' ', s.last_name)   AS student_name,
    s.reg_no,
    h.hostel_name,
    r.room_number,
    vl.entry_time,
    vl.exit_time,
    vl.visit_duration_minutes,
    vl.guard_name,
    vl.gate_number,
    vl.approved_by
FROM visitor_log vl
JOIN student      s  ON vl.student_id = s.student_id
LEFT JOIN room    r  ON vl.room_id    = r.room_id
LEFT JOIN hostel  h  ON r.hostel_id   = h.hostel_id;

-- ============================================================
-- VIEW: emergency request with hostel context
-- hostel derived via student → active_allocation → hostel
-- ============================================================
CREATE OR REPLACE VIEW v_emergency_request AS
SELECT
    er.request_id,
    CONCAT(s.first_name, ' ', s.last_name)  AS student_name,
    s.reg_no,
    aa.hostel_name,
    amb.vehicle_number,
    amb.driver_name,
    amb.hospital_name,
    er.request_time,
    er.pickup_time,
    er.hospital_reached_time,
    er.response_minutes,
    er.emergency_type,
    er.description,
    er.status
FROM emergency_request er
JOIN student              s   ON er.student_id   = s.student_id
LEFT JOIN ambulance_service amb ON er.ambulance_id = amb.ambulance_id
LEFT JOIN v_active_allocation aa ON s.student_id  = aa.student_id;