-- ============================================================
-- HOSTEL MANAGEMENT SYSTEM — VIEWS (5NF)
-- Run AFTER 00_init.sql and 01_index.sql
--
-- These views reconstruct denormalized convenience columns that
-- were removed during BCNF / 4NF / 5NF normalization, so that
-- application queries remain backward-compatible.
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
-- VIEW: hostel full profile  [NEW — BCNF backward compat]
-- Reconstructs warden & city/state from extracted tables
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
-- Reconstructs full_name (1NF), hostel (3NF), city/state (BCNF)
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
    pl.city,
    pl.state,
    s.pincode,
    aa.hostel_name,
    aa.hostel_type,
    aa.room_number,
    aa.floor,
    aa.bed_number
FROM student s
LEFT JOIN pincode_locality    pl ON s.pincode     = pl.pincode
LEFT JOIN v_active_allocation aa ON s.student_id  = aa.student_id;

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
-- hostel derived via room → hostel
-- technician specializations reconstructed via GROUP_CONCAT [4NF]
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
-- Uses hostel_warden for warden info [BCNF]
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
                        THEN c.complaint_id END)                        AS open_complaints,
    COUNT(DISTINCT f.facility_id)                                       AS total_facilities
FROM hostel h
LEFT JOIN hostel_warden hw ON h.hostel_id = hw.hostel_id AND hw.is_active = TRUE
LEFT JOIN room       r  ON h.hostel_id  = r.hostel_id
LEFT JOIN bed        b  ON r.room_id    = b.room_id
LEFT JOIN v_active_allocation aa ON h.hostel_id = aa.hostel_id
LEFT JOIN complaint  c  ON r.room_id    = c.room_id
LEFT JOIN facility   f  ON h.hostel_id  = f.hostel_id
GROUP BY h.hostel_id, h.hostel_name, h.type, h.total_floors, hw.warden_name;

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
-- Reconstructs specialization from junction table [4NF]
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
-- VIEW: weekly mess menu
-- Reconstructs meal timings from mess_timing table [4NF]
-- ============================================================
CREATE OR REPLACE VIEW v_mess_menu_weekly AS
SELECT
    m.mess_id,
    ms.mess_name,
    m.day_of_week,
    m.meal_type,
    mt.time_start                                                       AS timing_start,
    mt.time_end                                                         AS timing_end,
    GROUP_CONCAT(m.item_name ORDER BY m.item_name SEPARATOR ', ')       AS items,
    SUM(m.calories_approx)                                              AS total_calories_approx
FROM menu m
JOIN mess ms ON m.mess_id = ms.mess_id
LEFT JOIN mess_timing mt ON ms.mess_id = mt.mess_id AND m.meal_type = mt.meal_type
GROUP BY m.mess_id, ms.mess_name, m.day_of_week, m.meal_type,
         mt.time_start, mt.time_end
ORDER BY m.mess_id,
    FIELD(m.day_of_week,'Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'),
    FIELD(m.meal_type,'Breakfast','Lunch','Snacks','Dinner');

-- ============================================================
-- VIEW: mess full profile  [NEW — 4NF backward compat]
-- Reconstructs the four timing columns as a single row
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
         ms.hygiene_rating, ms.last_inspection;

-- ============================================================
-- VIEW: laundry full profile  [NEW — 4NF backward compat]
-- Reconstructs service_types and operating_days
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
-- VIEW: facility full profile  [NEW — 4NF backward compat]
-- Reconstructs operating_days
-- ============================================================
CREATE OR REPLACE VIEW v_facility_full AS
SELECT
    f.facility_id,
    f.facility_name,
    f.facility_type,
    h.hostel_name,
    f.capacity,
    GROUP_CONCAT(DISTINCT fod.day_of_week
        ORDER BY FIELD(fod.day_of_week,'Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday')
        SEPARATOR ', ')                                                 AS operating_days,
    f.timing_open,
    f.timing_close,
    f.in_charge_name,
    f.in_charge_phone,
    f.condition_status,
    f.is_operational
FROM facility f
JOIN hostel h ON f.hostel_id = h.hostel_id
LEFT JOIN facility_operating_day fod ON f.facility_id = fod.facility_id
GROUP BY f.facility_id, f.facility_name, f.facility_type, h.hostel_name,
         f.capacity, f.timing_open, f.timing_close, f.in_charge_name,
         f.in_charge_phone, f.condition_status, f.is_operational;

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
-- hospital reconstructed via ambulance → hospital [BCNF]
-- ============================================================
CREATE OR REPLACE VIEW v_emergency_request AS
SELECT
    er.request_id,
    CONCAT(s.first_name, ' ', s.last_name)  AS student_name,
    s.reg_no,
    aa.hostel_name,
    amb.vehicle_number,
    amb.driver_name,
    hosp.hospital_name,
    hosp.hospital_address,
    hosp.hospital_phone,
    er.request_time,
    er.pickup_time,
    er.hospital_reached_time,
    er.response_minutes,
    er.emergency_type,
    er.description,
    er.status
FROM emergency_request er
JOIN student              s    ON er.student_id   = s.student_id
LEFT JOIN ambulance_service amb ON er.ambulance_id = amb.ambulance_id
LEFT JOIN hospital         hosp ON amb.hospital_id = hosp.hospital_id
LEFT JOIN v_active_allocation aa ON s.student_id  = aa.student_id;

-- ============================================================
-- VIEW: store purchase with items  [NEW — 5NF backward compat]
-- Reconstructs item_description from store_purchase_item
-- ============================================================
CREATE OR REPLACE VIEW v_store_purchase_full AS
SELECT
    sp.purchase_id,
    CONCAT(s.first_name, ' ', s.last_name)   AS student_name,
    s.reg_no,
    st.store_name,
    GROUP_CONCAT(
        CONCAT(spi.item_name, ' x', spi.quantity)
        ORDER BY spi.item_name SEPARATOR ', '
    )                                         AS item_description,
    SUM(spi.quantity)                         AS total_quantity,
    sp.total_amount,
    sp.payment_mode,
    sp.purchase_date
FROM store_purchase sp
JOIN student s ON sp.student_id = s.student_id
JOIN store st ON sp.store_id = st.store_id
LEFT JOIN store_purchase_item spi ON sp.purchase_id = spi.purchase_id
GROUP BY sp.purchase_id, s.first_name, s.last_name, s.reg_no,
         st.store_name, sp.total_amount, sp.payment_mode, sp.purchase_date;

-- ============================================================
-- VIEW: maintenance schedule full  [NEW — 5NF backward compat]
-- Reconstructs area_type from room_id/is_common_area
-- ============================================================
CREATE OR REPLACE VIEW v_maintenance_full AS
SELECT
    ms.schedule_id,
    h.hostel_name,
    CASE
        WHEN ms.is_common_area = TRUE THEN 'Common Area'
        WHEN ms.room_id IS NOT NULL   THEN 'Room'
        ELSE 'Other'
    END                                       AS area_type,
    r.room_number,
    ms.maintenance_type,
    ms.scheduled_date,
    ms.completed_date,
    t.name                                    AS technician_name,
    ms.status,
    ms.notes,
    ms.cost
FROM maintenance_schedule ms
JOIN hostel h ON ms.hostel_id = h.hostel_id
LEFT JOIN room r ON ms.room_id = r.room_id
LEFT JOIN technician t ON ms.technician_id = t.technician_id;