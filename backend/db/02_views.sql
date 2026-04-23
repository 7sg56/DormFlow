-- ============================================================
-- HOSTEL MANAGEMENT SYSTEM — VIEWS (Simplified)
-- Run AFTER 00_init.sql and 01_index.sql
-- ============================================================

USE hostel_mgmt;

-- ============================================================
-- HELPER: active allocation subquery
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
-- VIEW: hostel full profile  [BCNF backward compat]
-- ============================================================
CREATE OR REPLACE VIEW v_hostel_full AS
SELECT
    h.hostel_id,
    h.hostel_name,
    h.type,
    h.total_floors,
    h.address,
    pl.city,
    pl.state,
    h.pincode,
    h.established_year,
    h.registration_no,
    hw.warden_name,
    hw.warden_phone,
    hw.warden_email,
    h.office_phone,
    h.emergency_phone,
    h.created_at,
    h.updated_at
FROM hostel h
LEFT JOIN pincode_locality pl ON h.pincode = pl.pincode
LEFT JOIN hostel_warden    hw ON h.hostel_id = hw.hostel_id AND hw.is_active = TRUE;

-- ============================================================
-- VIEW: student full profile
-- Now includes guardian info from student table directly
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
    s.guardian_name,
    s.guardian_phone,
    s.guardian_relation,
    pl.city,
    pl.state,
    s.pincode,
    aa.hostel_name,
    aa.hostel_type,
    aa.room_number,
    aa.floor,
    aa.bed_number,
    ms.mess_name
FROM student s
LEFT JOIN pincode_locality    pl ON s.pincode     = pl.pincode
LEFT JOIN v_active_allocation aa ON s.student_id  = aa.student_id
LEFT JOIN mess                ms ON s.mess_id     = ms.mess_id;

-- ============================================================
-- VIEW: room occupancy status
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
    SUM(CASE WHEN b.occupied = TRUE  THEN 1 ELSE 0 END)                AS occupied_beds,
    SUM(CASE WHEN b.occupied = FALSE THEN 1 ELSE 0 END)                AS available_beds,
    ROUND(SUM(CASE WHEN b.occupied = TRUE THEN 1 ELSE 0 END)
          / NULLIF(COUNT(b.bed_id), 0) * 100, 2)                       AS occupancy_percent,
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
    SUM(CASE WHEN f.status = 'Paid'    THEN 1 ELSE 0 END)              AS paid_count,
    SUM(CASE WHEN f.status = 'Pending' THEN 1 ELSE 0 END)              AS pending_count,
    SUM(CASE WHEN f.due_date < CURDATE()
             AND f.paid_amount < f.amount_due THEN 1 ELSE 0 END)       AS overdue_count
FROM student s
LEFT JOIN v_active_allocation aa ON s.student_id  = aa.student_id
LEFT JOIN feepayment f            ON s.student_id  = f.student_id
GROUP BY s.student_id, s.reg_no, s.first_name, s.last_name, aa.hostel_name;

-- ============================================================
-- VIEW: complaint dashboard
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
    GROUP_CONCAT(DISTINCT sp.specialization_name ORDER BY sp.specialization_name SEPARATOR ', ')
                     AS technician_specialization,
    c.created_at
FROM complaint c
JOIN student     s ON c.student_id    = s.student_id
LEFT JOIN room   r ON c.room_id       = r.room_id
LEFT JOIN hostel h ON r.hostel_id     = h.hostel_id
LEFT JOIN technician t ON c.technician_id = t.technician_id
LEFT JOIN technician_specialization ts ON t.technician_id = ts.technician_id
LEFT JOIN specialization sp ON ts.specialization_id = sp.specialization_id
GROUP BY c.complaint_id, s.first_name, s.last_name, s.reg_no,
         h.hostel_name, r.room_number, c.complaint_type, c.priority,
         c.status, c.resolved_at, c.created_at, c.is_resolved,
         c.cost_incurred, t.name;

-- ============================================================
-- VIEW: hostel summary stats
-- ============================================================
CREATE OR REPLACE VIEW v_hostel_stats AS
SELECT
    h.hostel_id,
    h.hostel_name,
    h.type,
    h.total_floors,
    hw.warden_name,
    COUNT(DISTINCT r.room_id)                                           AS total_rooms,
    COUNT(DISTINCT b.bed_id)                                            AS total_beds,
    SUM(CASE WHEN b.occupied = TRUE  THEN 1 ELSE 0 END)                AS occupied_beds,
    SUM(CASE WHEN b.occupied = FALSE THEN 1 ELSE 0 END)                AS available_beds,
    ROUND(SUM(CASE WHEN b.occupied = TRUE THEN 1 ELSE 0 END)
          / NULLIF(COUNT(DISTINCT b.bed_id), 0) * 100, 2)              AS occupancy_rate,
    COUNT(DISTINCT aa.student_id)                                       AS total_students,
    COUNT(DISTINCT CASE WHEN c.is_resolved = FALSE
                        THEN c.complaint_id END)                        AS open_complaints
FROM hostel h
LEFT JOIN hostel_warden hw ON h.hostel_id = hw.hostel_id AND hw.is_active = TRUE
LEFT JOIN room       r  ON h.hostel_id  = r.hostel_id
LEFT JOIN bed        b  ON r.room_id    = b.room_id
LEFT JOIN v_active_allocation aa ON h.hostel_id = aa.hostel_id
LEFT JOIN complaint  c  ON r.room_id    = c.room_id
GROUP BY h.hostel_id, h.hostel_name, h.type, h.total_floors, hw.warden_name;

-- ============================================================
-- VIEW: technician workload
-- ============================================================
CREATE OR REPLACE VIEW v_technician_workload AS
SELECT
    t.technician_id,
    t.name,
    GROUP_CONCAT(DISTINCT sp.specialization_name ORDER BY sp.specialization_name SEPARATOR ', ')
                                                                        AS specialization,
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
LEFT JOIN technician_specialization ts ON t.technician_id = ts.technician_id
LEFT JOIN specialization sp ON ts.specialization_id = sp.specialization_id
LEFT JOIN complaint c ON t.technician_id = c.technician_id
GROUP BY t.technician_id, t.name, t.employment_type;

-- ============================================================
-- VIEW: mess full profile  [4NF backward compat]
-- ============================================================
CREATE OR REPLACE VIEW v_mess_full AS
SELECT
    ms.mess_id,
    ms.mess_name,
    ms.mess_type,
    h.hostel_name,
    ms.monthly_fee,
    ms.capacity,
    ms.manager_name,
    ms.manager_phone,
    ms.hygiene_rating,
    ms.last_inspection,
    ms.menu_description,
    MAX(CASE WHEN mt.meal_type = 'Breakfast'
             THEN CONCAT(mt.time_start, '-', mt.time_end) END)         AS timing_breakfast,
    MAX(CASE WHEN mt.meal_type = 'Lunch'
             THEN CONCAT(mt.time_start, '-', mt.time_end) END)         AS timing_lunch,
    MAX(CASE WHEN mt.meal_type = 'Snacks'
             THEN CONCAT(mt.time_start, '-', mt.time_end) END)         AS timing_snacks,
    MAX(CASE WHEN mt.meal_type = 'Dinner'
             THEN CONCAT(mt.time_start, '-', mt.time_end) END)         AS timing_dinner
FROM mess ms
JOIN hostel h ON ms.hostel_id = h.hostel_id
LEFT JOIN mess_timing mt ON ms.mess_id = mt.mess_id
GROUP BY ms.mess_id, ms.mess_name, ms.mess_type, h.hostel_name,
         ms.monthly_fee, ms.capacity, ms.manager_name, ms.manager_phone,
         ms.hygiene_rating, ms.last_inspection, ms.menu_description;

-- ============================================================
-- VIEW: laundry full profile  [4NF backward compat]
-- ============================================================
CREATE OR REPLACE VIEW v_laundry_full AS
SELECT
    l.laundry_id,
    l.laundry_name,
    h.hostel_name,
    l.vendor_name,
    l.vendor_phone,
    l.price_per_piece,
    l.price_per_kg,
    GROUP_CONCAT(DISTINCT lst.service_type ORDER BY lst.service_type SEPARATOR ', ')
                                                                        AS service_types,
    GROUP_CONCAT(DISTINCT lod.day_of_week
        ORDER BY FIELD(lod.day_of_week,'Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday')
        SEPARATOR ', ')                                                 AS operating_days,
    l.timing_open,
    l.timing_close,
    l.contract_start,
    l.contract_end
FROM laundry l
JOIN hostel h ON l.hostel_id = h.hostel_id
LEFT JOIN laundry_service_type lst ON l.laundry_id = lst.laundry_id
LEFT JOIN laundry_operating_day lod ON l.laundry_id = lod.laundry_id
GROUP BY l.laundry_id, l.laundry_name, h.hostel_name,
         l.vendor_name, l.vendor_phone, l.price_per_piece, l.price_per_kg,
         l.timing_open, l.timing_close, l.contract_start, l.contract_end;

-- ============================================================
-- VIEW: visitor log with hostel context
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