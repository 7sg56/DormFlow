-- ============================================================
-- HOSTEL MANAGEMENT SYSTEM — SEED DATA (5NF)
-- MySQL 8.0+ | Matches 5NF schema
-- Changes across normalization levels:
--   BCNF: hostel warden → hostel_warden table
--         hostel/student city,state → pincode_locality table
--         ambulance hospital → hospital table
--   4NF:  technician.specialization → specialization + junction
--         laundry.service_types → laundry_service_type
--         laundry.operating_days → laundry_operating_day
--         facility.operating_days → facility_operating_day
--         mess.timing_* → mess_timing
--   5NF:  maintenance_schedule area_type/area_id → room_id/is_common_area
--         store_purchase items → store_purchase_item
-- ============================================================

USE hostel_mgmt;

SET FOREIGN_KEY_CHECKS = 0;

-- ============================================================
-- pincode_locality  [NEW — BCNF]
-- ============================================================
INSERT INTO pincode_locality (pincode, city, state) VALUES
('600001', 'Chennai',    'Tamil Nadu'),
('600002', 'Chennai',    'Tamil Nadu'),
('641001', 'Coimbatore', 'Tamil Nadu');

-- ============================================================
-- TABLE 1: hostel  (warden cols, city, state removed — BCNF)
-- ============================================================
INSERT INTO hostel (hostel_id, hostel_name, type, total_floors, address, pincode,
    established_year, registration_no, office_phone, emergency_phone) VALUES
('h-0001-0000-0000-000000000001', 'Sunrise Boys Hostel',   'Boys',  5, '12 College Road',        '600001', 2005, 'REG-BH-001', '04400001', '04400911'),
('h-0001-0000-0000-000000000002', 'Moonlight Girls Hostel','Girls', 4, '14 University Avenue',   '600002', 2008, 'REG-GH-002', '04400002', '04400912'),
('h-0001-0000-0000-000000000003', 'Horizon Mixed Hostel',  'Mixed', 6, '8 Campus Lane, Block C', '641001', 2015, 'REG-MH-003', '04200003', '04200913');

-- ============================================================
-- hostel_warden  [NEW — BCNF]
-- ============================================================
INSERT INTO hostel_warden (warden_id, hostel_id, warden_name, warden_phone, warden_email, assigned_date, is_active) VALUES
('hw-001', 'h-0001-0000-0000-000000000001', 'Mr. Ramesh Kumar',   '9841000001', 'ramesh@hostel.edu', '2005-06-01', TRUE),
('hw-002', 'h-0001-0000-0000-000000000002', 'Mrs. Priya Nair',    '9841000002', 'priya@hostel.edu',  '2008-06-01', TRUE),
('hw-003', 'h-0001-0000-0000-000000000003', 'Dr. Anand Selvaraj', '9841000003', 'anand@hostel.edu',  '2015-06-01', TRUE);

-- ============================================================
-- TABLE 2: student  (hostel_id removed 3NF; city, state removed BCNF)
-- ============================================================
INSERT INTO student (student_id, reg_no, first_name, last_name, date_of_birth, gender,
    phone_primary, phone_secondary, email_personal, email_institutional,
    department, course, academic_year, semester, blood_group,
    permanent_address, pincode, admission_date, status) VALUES
('s-0001-0000-0000-000000000001', 'REG2021001', 'Arjun',   'Mehta',        '2003-04-12', 'Male',   '9790100001', NULL,         'arjun.m@gmail.com',   'arjun@college.edu',   'Computer Science', 'B.Tech', 3, 5, 'O+',  '22 MG Road, Salem',            '600001', '2021-07-01', 'Active'),
('s-0001-0000-0000-000000000002', 'REG2021002', 'Divya',   'Krishnamurthy','2003-08-25', 'Female', '9790100002', '9790100012', 'divya.k@gmail.com',   'divya@college.edu',   'Electronics',      'B.Tech', 3, 5, 'A+',  '5 Anna Nagar, Madurai',        '600002', '2021-07-01', 'Active'),
('s-0001-0000-0000-000000000003', 'REG2022001', 'Rohan',   'Verma',        '2004-01-17', 'Male',   '9790100003', NULL,         'rohan.v@gmail.com',   'rohan@college.edu',   'Mechanical',       'B.Tech', 2, 3, 'B+',  '10 Gandhi St, Trichy',         '641001', '2022-07-01', 'Active'),
('s-0001-0000-0000-000000000004', 'REG2022002', 'Sneha',   'Iyer',         '2004-06-05', 'Female', '9790100004', NULL,         'sneha.i@gmail.com',   'sneha@college.edu',   'Civil',            'B.Tech', 2, 3, 'AB+', '7 Nehru Nagar, Vellore',       '600002', '2022-07-01', 'Active'),
('s-0001-0000-0000-000000000005', 'REG2021003', 'Karthik', 'Rajan',        '2003-11-20', 'Male',   '9790100005', '9790100015', 'karthik.r@gmail.com', 'karthik@college.edu', 'Computer Science', 'B.Tech', 3, 5, 'O-',  '3 Kamaraj Ave, Chennai',       '600001', '2021-07-01', 'Active'),
('s-0001-0000-0000-000000000006', 'REG2020001', 'Meera',   'Subramanian',  '2002-03-09', 'Female', '9790100006', NULL,         'meera.s@gmail.com',   'meera@college.edu',   'Information Tech', 'B.Tech', 4, 7, 'A-',  '11 Periyar Salai, Salem',      '600002', '2020-07-01', 'Active'),
('s-0001-0000-0000-000000000007', 'REG2023001', 'Vikram',  'Patel',        '2005-07-30', 'Male',   '9790100007', NULL,         'vikram.p@gmail.com',  'vikram@college.edu',  'Electrical',       'B.Tech', 1, 1, 'B-',  '20 Rajiv Nagar, Coimbatore',   '641001', '2023-07-01', 'Active'),
('s-0001-0000-0000-000000000008', 'REG2023002', 'Lakshmi', 'Venkatesh',    '2005-02-14', 'Female', '9790100008', '9790100018', 'lakshmi.v@gmail.com', 'lakshmi@college.edu', 'Biotechnology',    'B.Tech', 1, 1, 'O+',  '9 Indira Nagar, Vellore',      '600002', '2023-07-01', 'Active'),
('s-0001-0000-0000-000000000009', 'REG2021004', 'Suresh',  'Babu',         '2003-09-01', 'Male',   '9790100009', NULL,         'suresh.b@gmail.com',  'suresh@college.edu',  'Computer Science', 'M.Tech', 3, 5, 'A+',  '15 Cross St, Erode',           '600001', '2021-07-01', 'Active'),
('s-0001-0000-0000-000000000010', 'REG2022003', 'Anjali',  'Sharma',       '2004-05-22', 'Female', '9790100010', NULL,         'anjali.s@gmail.com',  'anjali@college.edu',  'Chemistry',        'B.Sc',  2, 3, 'AB-', '6 Rose Garden, Madurai',       '641001', '2022-07-01', 'Active');

-- ============================================================
-- TABLE 3: student_guardian
-- ============================================================
INSERT INTO student_guardian (guardian_id, student_id, guardian_name, relation, phone, email, address, is_emergency_contact) VALUES
('sg-001', 's-0001-0000-0000-000000000001', 'Prakash Mehta',   'Father', '9840200001', 'prakash.m@gmail.com', '22 MG Road, Salem',          TRUE),
('sg-002', 's-0001-0000-0000-000000000001', 'Sunita Mehta',    'Mother', '9840200002', 'sunita.m@gmail.com',  '22 MG Road, Salem',          FALSE),
('sg-003', 's-0001-0000-0000-000000000002', 'Krishnamurthy T', 'Father', '9840200003', NULL,                  '5 Anna Nagar, Madurai',      TRUE),
('sg-004', 's-0001-0000-0000-000000000003', 'Ramesh Verma',    'Father', '9840200004', 'ramesh.v@gmail.com',  '10 Gandhi St, Trichy',       TRUE),
('sg-005', 's-0001-0000-0000-000000000004', 'Suresh Iyer',     'Father', '9840200005', NULL,                  '7 Nehru Nagar, Vellore',     TRUE),
('sg-006', 's-0001-0000-0000-000000000004', 'Meenakshi Iyer',  'Mother', '9840200006', NULL,                  '7 Nehru Nagar, Vellore',     FALSE),
('sg-007', 's-0001-0000-0000-000000000005', 'Rajan K',         'Father', '9840200007', 'rajan.k@gmail.com',   '3 Kamaraj Ave, Chennai',     TRUE),
('sg-008', 's-0001-0000-0000-000000000006', 'Subramanian P',   'Father', '9840200008', NULL,                  '11 Periyar Salai, Salem',    TRUE),
('sg-009', 's-0001-0000-0000-000000000007', 'Dinesh Patel',    'Father', '9840200009', 'dinesh.p@gmail.com',  '20 Rajiv Nagar, Coimbatore', TRUE),
('sg-010', 's-0001-0000-0000-000000000008', 'Venkatesh R',     'Father', '9840200010', NULL,                  '9 Indira Nagar, Vellore',    TRUE),
('sg-011', 's-0001-0000-0000-000000000009', 'Babu S',          'Father', '9840200011', 'babu.s@gmail.com',    '15 Cross St, Erode',         TRUE),
('sg-012', 's-0001-0000-0000-000000000010', 'Rajesh Sharma',   'Father', '9840200012', NULL,                  '6 Rose Garden, Madurai',     TRUE);

-- ============================================================
-- TABLE 4: room
-- ============================================================
INSERT INTO room (room_id, room_number, floor, capacity, room_type, hostel_id, monthly_rent, area_sqft, facing, room_condition) VALUES
('r-0001-0000-0000-000000000001', '101', 1, 2, 'Double', 'h-0001-0000-0000-000000000001', 4500.00, 220.0, 'East',  'Good'),
('r-0001-0000-0000-000000000002', '102', 1, 3, 'Triple', 'h-0001-0000-0000-000000000001', 3800.00, 280.0, 'West',  'Good'),
('r-0001-0000-0000-000000000003', '201', 2, 1, 'Single', 'h-0001-0000-0000-000000000001', 6000.00, 160.0, 'East',  'Excellent'),
('r-0001-0000-0000-000000000004', '101', 1, 2, 'Double', 'h-0001-0000-0000-000000000002', 4500.00, 220.0, 'North', 'Good'),
('r-0001-0000-0000-000000000005', '102', 1, 3, 'Triple', 'h-0001-0000-0000-000000000002', 3800.00, 280.0, 'South', 'Good'),
('r-0001-0000-0000-000000000006', '201', 2, 2, 'Double', 'h-0001-0000-0000-000000000002', 4500.00, 220.0, 'North', 'Good'),
('r-0001-0000-0000-000000000007', '101', 1, 2, 'Double', 'h-0001-0000-0000-000000000003', 5000.00, 230.0, 'East',  'Good'),
('r-0001-0000-0000-000000000008', '102', 1, 3, 'Triple', 'h-0001-0000-0000-000000000003', 4000.00, 290.0, 'West',  'Fair'),
('r-0001-0000-0000-000000000009', '301', 3, 1, 'Single', 'h-0001-0000-0000-000000000003', 6500.00, 170.0, 'East',  'Excellent');

-- ============================================================
-- TABLE 5: bed
-- ============================================================
INSERT INTO bed (bed_id, bed_number, room_id, bed_type, condition_status, occupied) VALUES
('b-001', 'B1', 'r-0001-0000-0000-000000000001', 'Single Cot', 'Good',      TRUE),
('b-002', 'B2', 'r-0001-0000-0000-000000000001', 'Single Cot', 'Good',      TRUE),
('b-003', 'B1', 'r-0001-0000-0000-000000000002', 'Bunk Lower', 'Good',      TRUE),
('b-004', 'B2', 'r-0001-0000-0000-000000000002', 'Bunk Upper', 'Good',      TRUE),
('b-005', 'B3', 'r-0001-0000-0000-000000000002', 'Single Cot', 'Good',      FALSE),
('b-006', 'B1', 'r-0001-0000-0000-000000000003', 'Single Cot', 'Excellent', TRUE),
('b-007', 'B1', 'r-0001-0000-0000-000000000004', 'Single Cot', 'Good',      TRUE),
('b-008', 'B2', 'r-0001-0000-0000-000000000004', 'Single Cot', 'Good',      TRUE),
('b-009', 'B1', 'r-0001-0000-0000-000000000005', 'Bunk Lower', 'Good',      TRUE),
('b-010', 'B2', 'r-0001-0000-0000-000000000005', 'Bunk Upper', 'Fair',      FALSE),
('b-011', 'B3', 'r-0001-0000-0000-000000000005', 'Single Cot', 'Good',      TRUE),
('b-012', 'B1', 'r-0001-0000-0000-000000000006', 'Single Cot', 'Good',      FALSE),
('b-013', 'B2', 'r-0001-0000-0000-000000000006', 'Single Cot', 'Good',      FALSE),
('b-014', 'B1', 'r-0001-0000-0000-000000000007', 'Single Cot', 'Good',      TRUE),
('b-015', 'B2', 'r-0001-0000-0000-000000000007', 'Single Cot', 'Good',      TRUE),
('b-016', 'B1', 'r-0001-0000-0000-000000000008', 'Bunk Lower', 'Fair',      TRUE),
('b-017', 'B2', 'r-0001-0000-0000-000000000008', 'Bunk Upper', 'Good',      FALSE),
('b-018', 'B1', 'r-0001-0000-0000-000000000009', 'Single Cot', 'Excellent', FALSE);

-- ============================================================
-- specialization  [NEW — 4NF]
-- ============================================================
INSERT INTO specialization (specialization_id, specialization_name) VALUES
('spec-001', 'Plumbing'),
('spec-002', 'Electrical'),
('spec-003', 'Carpentry'),
('spec-004', 'AC & Appliances'),
('spec-005', 'General Maintenance');

-- ============================================================
-- TABLE 6: technician  (specialization removed — 4NF)
-- ============================================================
INSERT INTO technician (technician_id, name, phone, email, availability, joining_date, employment_type, salary, hostel_id) VALUES
('t-001', 'Murugan A',     '9841300001', 'murugan@hostel.edu', 'Mon-Sat 8AM-6PM', '2018-06-01', 'Full-time', 22000.00, 'h-0001-0000-0000-000000000001'),
('t-002', 'Selvam R',      '9841300002', 'selvam@hostel.edu',  'Mon-Fri 9AM-5PM', '2019-03-15', 'Full-time', 20000.00, 'h-0001-0000-0000-000000000002'),
('t-003', 'Balamurugan K', '9841300003', 'bala@hostel.edu',    'On Call',         '2020-01-10', 'Part-time', 15000.00, 'h-0001-0000-0000-000000000003'),
('t-004', 'Shanmugam T',   '9841300004', NULL,                 'Mon-Sat 7AM-7PM', '2017-09-01', 'Full-time', 18000.00, 'h-0001-0000-0000-000000000001');

-- ============================================================
-- technician_specialization  [NEW — 4NF]
-- Murugan: Plumbing + Electrical (was "Plumbing & Electrical")
-- Selvam: Carpentry
-- Balamurugan: AC & Appliances
-- Shanmugam: General Maintenance
-- ============================================================
INSERT INTO technician_specialization (technician_id, specialization_id) VALUES
('t-001', 'spec-001'),
('t-001', 'spec-002'),
('t-002', 'spec-003'),
('t-003', 'spec-004'),
('t-004', 'spec-005');

-- ============================================================
-- TABLE 7: allocation
-- ============================================================
INSERT INTO allocation (allocation_id, student_id, bed_id, start_date, end_date, allocated_by, status) VALUES
('al-001', 's-0001-0000-0000-000000000001', 'b-001', '2021-07-01', NULL, 'Mr. Ramesh Kumar',    'Active'),
('al-002', 's-0001-0000-0000-000000000005', 'b-002', '2021-07-01', NULL, 'Mr. Ramesh Kumar',    'Active'),
('al-003', 's-0001-0000-0000-000000000009', 'b-003', '2021-07-01', NULL, 'Mr. Ramesh Kumar',    'Active'),
('al-004', 's-0001-0000-0000-000000000002', 'b-007', '2021-07-01', NULL, 'Mrs. Priya Nair',     'Active'),
('al-005', 's-0001-0000-0000-000000000004', 'b-008', '2022-07-01', NULL, 'Mrs. Priya Nair',     'Active'),
('al-006', 's-0001-0000-0000-000000000006', 'b-009', '2020-07-01', NULL, 'Mrs. Priya Nair',     'Active'),
('al-007', 's-0001-0000-0000-000000000008', 'b-011', '2023-07-01', NULL, 'Mrs. Priya Nair',     'Active'),
('al-008', 's-0001-0000-0000-000000000003', 'b-014', '2022-07-01', NULL, 'Dr. Anand Selvaraj',  'Active'),
('al-009', 's-0001-0000-0000-000000000007', 'b-015', '2023-07-01', NULL, 'Dr. Anand Selvaraj',  'Active'),
('al-010', 's-0001-0000-0000-000000000010', 'b-016', '2022-07-01', NULL, 'Dr. Anand Selvaraj',  'Active');

-- ============================================================
-- TABLE 8: feepayment
-- ============================================================
INSERT INTO feepayment (payment_id, student_id, amount_due, paid_amount, semester, fee_month, payment_mode, transaction_id, payment_date, due_date, late_fee, receipt_number, status, approved_by) VALUES
('fp-001', 's-0001-0000-0000-000000000001', 4500.00, 4500.00, 'Sem5', 'Jan-2024', 'UPI',         'TXN100001', '2024-01-03 10:15:00', '2024-01-05', 0,      'RCP-001', 'Paid',    'Mr. Ramesh Kumar'),
('fp-002', 's-0001-0000-0000-000000000001', 4500.00, 4500.00, 'Sem5', 'Feb-2024', 'Net Banking', 'TXN100002', '2024-02-04 11:00:00', '2024-02-05', 0,      'RCP-002', 'Paid',    'Mr. Ramesh Kumar'),
('fp-003', 's-0001-0000-0000-000000000001', 4500.00, 4000.00, 'Sem5', 'Mar-2024', 'Cash',        NULL,        '2024-03-10 09:30:00', '2024-03-05', 200.00, 'RCP-003', 'Partial', 'Mr. Ramesh Kumar'),
('fp-004', 's-0001-0000-0000-000000000002', 4500.00, 4500.00, 'Sem5', 'Jan-2024', 'UPI',         'TXN100004', '2024-01-02 14:00:00', '2024-01-05', 0,      'RCP-004', 'Paid',    'Mrs. Priya Nair'),
('fp-005', 's-0001-0000-0000-000000000002', 4500.00, 0.00,    'Sem5', 'Feb-2024', NULL,          NULL,        NULL,                  '2024-02-05', 0,      NULL,      'Pending', 'Mrs. Priya Nair'),
('fp-006', 's-0001-0000-0000-000000000003', 4000.00, 4000.00, 'Sem3', 'Jan-2024', 'Debit Card',  'TXN100006', '2024-01-05 12:00:00', '2024-01-05', 0,      'RCP-006', 'Paid',    'Dr. Anand Selvaraj'),
('fp-007', 's-0001-0000-0000-000000000004', 4500.00, 4500.00, 'Sem3', 'Jan-2024', 'UPI',         'TXN100007', '2024-01-04 09:00:00', '2024-01-05', 0,      'RCP-007', 'Paid',    'Mrs. Priya Nair'),
('fp-008', 's-0001-0000-0000-000000000005', 4500.00, 4500.00, 'Sem5', 'Jan-2024', 'Net Banking', 'TXN100008', '2024-01-06 16:00:00', '2024-01-05', 100.00, 'RCP-008', 'Paid',    'Mr. Ramesh Kumar'),
('fp-009', 's-0001-0000-0000-000000000006', 4500.00, 4500.00, 'Sem7', 'Jan-2024', 'UPI',         'TXN100009', '2024-01-03 13:00:00', '2024-01-05', 0,      'RCP-009', 'Paid',    'Mrs. Priya Nair'),
('fp-010', 's-0001-0000-0000-000000000007', 5000.00, 0.00,    'Sem1', 'Jan-2024', NULL,          NULL,        NULL,                  '2024-01-05', 0,      NULL,      'Pending', 'Dr. Anand Selvaraj'),
('fp-011', 's-0001-0000-0000-000000000009', 4500.00, 4500.00, 'Sem5', 'Jan-2024', 'UPI',         'TXN100011', '2024-01-04 11:30:00', '2024-01-05', 0,      'RCP-011', 'Paid',    'Mr. Ramesh Kumar'),
('fp-012', 's-0001-0000-0000-000000000010', 4000.00, 4000.00, 'Sem3', 'Jan-2024', 'Cash',        NULL,        '2024-01-05 10:00:00', '2024-01-05', 0,      'RCP-012', 'Paid',    'Dr. Anand Selvaraj');

-- ============================================================
-- TABLE 9: mess  (timing columns removed — 4NF)
-- ============================================================
INSERT INTO mess (mess_id, mess_name, mess_type, hostel_id, monthly_fee, capacity, manager_name, manager_phone, hygiene_rating, last_inspection) VALUES
('m-001', 'Annapurna Mess',   'Veg',     'h-0001-0000-0000-000000000001', 2500.00, 150, 'Kannan S',  '9841400001', 4.2, '2024-01-10'),
('m-002', 'Sakthi Mess',      'Veg',     'h-0001-0000-0000-000000000002', 2500.00, 120, 'Devi R',    '9841400002', 4.5, '2024-01-15'),
('m-003', 'Horizon Food Hub', 'Non-Veg', 'h-0001-0000-0000-000000000003', 3000.00, 180, 'Prasad M',  '9841400003', 3.8, '2023-12-20');

-- ============================================================
-- mess_timing  [NEW — 4NF]
-- ============================================================
INSERT INTO mess_timing (mess_id, meal_type, time_start, time_end) VALUES
('m-001', 'Breakfast', '07:00:00', '09:00:00'),
('m-001', 'Lunch',     '12:00:00', '14:00:00'),
('m-001', 'Snacks',    '16:30:00', '17:30:00'),
('m-001', 'Dinner',    '19:30:00', '21:30:00'),
('m-002', 'Breakfast', '07:00:00', '09:00:00'),
('m-002', 'Lunch',     '12:00:00', '14:00:00'),
('m-002', 'Snacks',    '17:00:00', '18:00:00'),
('m-002', 'Dinner',    '19:30:00', '21:00:00'),
('m-003', 'Breakfast', '06:30:00', '08:30:00'),
('m-003', 'Lunch',     '12:00:00', '14:30:00'),
('m-003', 'Snacks',    '16:00:00', '17:00:00'),
('m-003', 'Dinner',    '19:00:00', '21:00:00');

-- ============================================================
-- TABLE 10: mess_subscription
-- ============================================================
INSERT INTO mess_subscription (subscription_id, student_id, mess_id, start_date, end_date, meal_plan, monthly_charge, status) VALUES
('ms-001', 's-0001-0000-0000-000000000001', 'm-001', '2021-07-01', NULL,         'Full Day',     2500.00, 'Active'),
('ms-002', 's-0001-0000-0000-000000000005', 'm-001', '2021-07-01', NULL,         'Full Day',     2500.00, 'Active'),
('ms-003', 's-0001-0000-0000-000000000009', 'm-001', '2021-07-01', NULL,         'Lunch+Dinner', 2000.00, 'Active'),
('ms-004', 's-0001-0000-0000-000000000002', 'm-002', '2021-07-01', NULL,         'Full Day',     2500.00, 'Active'),
('ms-005', 's-0001-0000-0000-000000000004', 'm-002', '2022-07-01', NULL,         'Full Day',     2500.00, 'Active'),
('ms-006', 's-0001-0000-0000-000000000006', 'm-002', '2020-07-01', '2023-12-31', 'Full Day',     2500.00, 'Inactive'),
('ms-007', 's-0001-0000-0000-000000000003', 'm-003', '2022-07-01', NULL,         'Full Day',     3000.00, 'Active'),
('ms-008', 's-0001-0000-0000-000000000007', 'm-003', '2023-07-01', NULL,         'Dinner Only',  1200.00, 'Active');

-- ============================================================
-- TABLE 11: menu
-- ============================================================
INSERT INTO menu (menu_id, mess_id, day_of_week, meal_type, item_name, item_category, cuisine_type, is_veg, calories_approx) VALUES
('mn-001', 'm-001', 'Monday',  'Breakfast', 'Idli Sambar',       'South Indian', 'South Indian', TRUE,  250),
('mn-002', 'm-001', 'Monday',  'Lunch',     'Rice Sambar Rasam', 'South Indian', 'South Indian', TRUE,  600),
('mn-003', 'm-001', 'Monday',  'Dinner',    'Chapati Paneer',    'North Indian', 'North Indian', TRUE,  550),
('mn-004', 'm-001', 'Tuesday', 'Breakfast', 'Pongal Chutney',    'South Indian', 'South Indian', TRUE,  300),
('mn-005', 'm-001', 'Tuesday', 'Lunch',     'Veg Biryani',       'Rice',         'South Indian', TRUE,  650),
('mn-006', 'm-002', 'Monday',  'Breakfast', 'Dosa Chutney',      'South Indian', 'South Indian', TRUE,  200),
('mn-007', 'm-002', 'Monday',  'Lunch',     'Rice Dal Fry',      'South Indian', 'South Indian', TRUE,  580),
('mn-008', 'm-002', 'Monday',  'Dinner',    'Roti Mix Veg',      'North Indian', 'North Indian', TRUE,  500),
('mn-009', 'm-002', 'Tuesday', 'Breakfast', 'Upma Sambar',       'South Indian', 'South Indian', TRUE,  220),
('mn-010', 'm-002', 'Tuesday', 'Snacks',    'Bajji Tea',         'Snacks',       'South Indian', TRUE,  180),
('mn-011', 'm-003', 'Monday',  'Breakfast', 'Puri Bhaji',        'North Indian', 'North Indian', TRUE,  400),
('mn-012', 'm-003', 'Monday',  'Lunch',     'Chicken Curry Rice','Non-Veg',      'South Indian', FALSE, 750),
('mn-013', 'm-003', 'Monday',  'Dinner',    'Fish Fry Rice',     'Non-Veg',      'South Indian', FALSE, 700),
('mn-014', 'm-003', 'Tuesday', 'Breakfast', 'Egg Omelette Toast','Non-Veg',      'Continental',  FALSE, 350);

-- ============================================================
-- TABLE 12: laundry  (service_types, operating_days removed — 4NF)
-- ============================================================
INSERT INTO laundry (laundry_id, laundry_name, hostel_id, vendor_name, vendor_phone, price_per_piece, price_per_kg, timing_open, timing_close, contract_start, contract_end) VALUES
('lau-001', 'CleanWash Laundry',  'h-0001-0000-0000-000000000001', 'CleanWash Pvt Ltd', '9841500001', 15.00, 60.00, '08:00:00', '19:00:00', '2023-01-01', '2025-12-31'),
('lau-002', 'FreshLinen Service', 'h-0001-0000-0000-000000000002', 'FreshLinen Co',     '9841500002', 12.00, 50.00, '07:00:00', '20:00:00', '2023-06-01', '2025-05-31');

-- ============================================================
-- laundry_service_type  [NEW — 4NF]
-- ============================================================
INSERT INTO laundry_service_type (laundry_id, service_type) VALUES
('lau-001', 'Wash'),
('lau-001', 'Iron'),
('lau-001', 'Dry Clean'),
('lau-002', 'Wash'),
('lau-002', 'Iron');

-- ============================================================
-- laundry_operating_day  [NEW — 4NF]
-- ============================================================
INSERT INTO laundry_operating_day (laundry_id, day_of_week) VALUES
('lau-001', 'Monday'),
('lau-001', 'Tuesday'),
('lau-001', 'Wednesday'),
('lau-001', 'Thursday'),
('lau-001', 'Friday'),
('lau-001', 'Saturday'),
('lau-002', 'Monday'),
('lau-002', 'Tuesday'),
('lau-002', 'Wednesday'),
('lau-002', 'Thursday'),
('lau-002', 'Friday'),
('lau-002', 'Saturday'),
('lau-002', 'Sunday');

-- ============================================================
-- TABLE 13: laundry_request
-- ============================================================
INSERT INTO laundry_request (request_id, student_id, laundry_id, pickup_date, delivery_date, items_description, total_pieces, total_weight_kg, total_charge, service_type, status, payment_status) VALUES
('lr-001', 's-0001-0000-0000-000000000001', 'lau-001', '2024-01-08', '2024-01-10', '3 shirts, 2 trousers, 2 innerwear', 7,    NULL, 105.00, 'Wash & Iron', 'Delivered', 'Paid'),
('lr-002', 's-0001-0000-0000-000000000005', 'lau-001', '2024-01-08', '2024-01-10', '4 shirts, 1 trouser',               5,    NULL,  75.00, 'Wash Only',   'Delivered', 'Paid'),
('lr-003', 's-0001-0000-0000-000000000009', 'lau-001', '2024-01-15', '2024-01-17', '5 shirts, 3 trousers',              8,    NULL, 120.00, 'Wash & Iron', 'Ready',     'Unpaid'),
('lr-004', 's-0001-0000-0000-000000000002', 'lau-002', '2024-01-09', '2024-01-11', '2 salwar sets, 3 dupatta',          5,    NULL,  60.00, 'Wash Only',   'Delivered', 'Paid'),
('lr-005', 's-0001-0000-0000-000000000006', 'lau-002', '2024-01-16', NULL,         '1 blazer, 2 trousers',              3,    NULL,  60.00, 'Dry Clean',   'Processing','Unpaid'),
('lr-006', 's-0001-0000-0000-000000000004', 'lau-002', '2024-01-16', '2024-01-18', '3 kurtis, 2 jeans',                5,    2.50,  60.00, 'Wash & Iron', 'Delivered', 'Paid');

-- ============================================================
-- TABLE 14: accesslog
-- ============================================================
INSERT INTO accesslog (log_id, student_id, entry_time, exit_time, is_late_entry, gate_number, guard_name, purpose) VALUES
('ac-001', 's-0001-0000-0000-000000000001', '2024-01-15 08:00:00', '2024-01-15 17:30:00', FALSE, 'G1', 'Murugan', 'College'),
('ac-002', 's-0001-0000-0000-000000000001', '2024-01-15 22:45:00', '2024-01-16 07:00:00', TRUE,  'G1', 'Rajan',   'Movie Outing'),
('ac-003', 's-0001-0000-0000-000000000005', '2024-01-15 09:00:00', '2024-01-15 18:00:00', FALSE, 'G1', 'Murugan', 'College'),
('ac-004', 's-0001-0000-0000-000000000002', '2024-01-15 08:30:00', '2024-01-15 17:00:00', FALSE, 'G2', 'Sumathi', 'College'),
('ac-005', 's-0001-0000-0000-000000000004', '2024-01-15 09:15:00', '2024-01-15 18:30:00', FALSE, 'G2', 'Sumathi', 'College'),
('ac-006', 's-0001-0000-0000-000000000006', '2024-01-16 07:30:00', '2024-01-16 19:00:00', FALSE, 'G2', 'Sumathi', 'Library'),
('ac-007', 's-0001-0000-0000-000000000003', '2024-01-15 08:00:00', '2024-01-15 17:00:00', FALSE, 'G3', 'Babu',    'College'),
('ac-008', 's-0001-0000-0000-000000000007', '2024-01-15 10:00:00', NULL,                  FALSE, 'G3', 'Babu',    'Canteen'),
('ac-009', 's-0001-0000-0000-000000000009', '2024-01-16 08:15:00', '2024-01-16 20:00:00', FALSE, 'G1', 'Murugan', 'Project Work'),
('ac-010', 's-0001-0000-0000-000000000010', '2024-01-16 23:10:00', '2024-01-17 07:00:00', TRUE,  'G3', 'Ravi',    'Family Function');

-- ============================================================
-- TABLE 15: facility  (operating_days removed — 4NF)
-- ============================================================
INSERT INTO facility (facility_id, facility_name, facility_type, hostel_id, capacity, timing_open, timing_close, in_charge_name, condition_status, is_operational) VALUES
('fac-001', 'Study Hall A',     'Study Room',  'h-0001-0000-0000-000000000001', 40, '06:00:00', '23:00:00', 'Mr. Ramesh Kumar',   'Good',      TRUE),
('fac-002', 'Indoor Games Room','Recreation',  'h-0001-0000-0000-000000000001', 20, '08:00:00', '22:00:00', 'Mr. Ramesh Kumar',   'Good',      TRUE),
('fac-003', 'Study Hall B',     'Study Room',  'h-0001-0000-0000-000000000002', 35, '06:00:00', '23:00:00', 'Mrs. Priya Nair',    'Excellent', TRUE),
('fac-004', 'TV Lounge',        'Recreation',  'h-0001-0000-0000-000000000002', 30, '17:00:00', '22:00:00', 'Mrs. Priya Nair',    'Good',      TRUE),
('fac-005', 'Conference Room',  'Meeting Room','h-0001-0000-0000-000000000003', 25, '09:00:00', '18:00:00', 'Dr. Anand Selvaraj', 'Good',      TRUE);

-- ============================================================
-- facility_operating_day  [NEW — 4NF]
-- ============================================================
INSERT INTO facility_operating_day (facility_id, day_of_week) VALUES
('fac-001', 'Monday'), ('fac-001', 'Tuesday'), ('fac-001', 'Wednesday'), ('fac-001', 'Thursday'), ('fac-001', 'Friday'), ('fac-001', 'Saturday'), ('fac-001', 'Sunday'),
('fac-002', 'Monday'), ('fac-002', 'Tuesday'), ('fac-002', 'Wednesday'), ('fac-002', 'Thursday'), ('fac-002', 'Friday'), ('fac-002', 'Saturday'), ('fac-002', 'Sunday'),
('fac-003', 'Monday'), ('fac-003', 'Tuesday'), ('fac-003', 'Wednesday'), ('fac-003', 'Thursday'), ('fac-003', 'Friday'), ('fac-003', 'Saturday'), ('fac-003', 'Sunday'),
('fac-004', 'Monday'), ('fac-004', 'Tuesday'), ('fac-004', 'Wednesday'), ('fac-004', 'Thursday'), ('fac-004', 'Friday'), ('fac-004', 'Saturday'), ('fac-004', 'Sunday'),
('fac-005', 'Monday'), ('fac-005', 'Tuesday'), ('fac-005', 'Wednesday'), ('fac-005', 'Thursday'), ('fac-005', 'Friday');

-- ============================================================
-- TABLE 16: facility_booking
-- ============================================================
INSERT INTO facility_booking (booking_id, facility_id, student_id, booking_date, slot_start, slot_end, purpose, status) VALUES
('fb-001', 'fac-001', 's-0001-0000-0000-000000000001', '2024-01-15', '18:00:00', '20:00:00', 'Exam Prep',           'Confirmed'),
('fb-002', 'fac-001', 's-0001-0000-0000-000000000005', '2024-01-15', '20:00:00', '22:00:00', 'Assignment Work',     'Confirmed'),
('fb-003', 'fac-002', 's-0001-0000-0000-000000000009', '2024-01-14', '17:00:00', '18:00:00', 'Table Tennis',        'Confirmed'),
('fb-004', 'fac-003', 's-0001-0000-0000-000000000002', '2024-01-15', '19:00:00', '21:00:00', 'Group Study',         'Confirmed'),
('fb-005', 'fac-003', 's-0001-0000-0000-000000000006', '2024-01-16', '06:00:00', '08:00:00', 'Exam Prep',           'Confirmed'),
('fb-006', 'fac-004', 's-0001-0000-0000-000000000008', '2024-01-15', '20:00:00', '21:00:00', 'Movie Night',         'Confirmed'),
('fb-007', 'fac-005', 's-0001-0000-0000-000000000003', '2024-01-17', '10:00:00', '11:00:00', 'Project Presentation','Confirmed'),
('fb-008', 'fac-001', 's-0001-0000-0000-000000000001', '2024-01-16', '10:00:00', '12:00:00', 'Research Work',       'Cancelled');

-- ============================================================
-- TABLE 17: complaint
-- ============================================================
INSERT INTO complaint (complaint_id, student_id, room_id, technician_id, description, complaint_type, priority, status, resolved_at, resolution_notes, cost_incurred) VALUES
('cp-001', 's-0001-0000-0000-000000000001', 'r-0001-0000-0000-000000000001', 't-001', 'Water leaking from bathroom pipe',    'Plumbing',   'High',   'Resolved',    '2024-01-12 14:00:00', 'Pipe joint replaced',   350.00),
('cp-002', 's-0001-0000-0000-000000000005', 'r-0001-0000-0000-000000000001', 't-004', 'Ceiling fan making noise',            'Electrical', 'Medium', 'Resolved',    '2024-01-14 11:00:00', 'Fan bearing replaced',  200.00),
('cp-003', 's-0001-0000-0000-000000000002', 'r-0001-0000-0000-000000000004', 't-002', 'Door latch broken',                   'Carpentry',  'Low',    'Resolved',    '2024-01-13 16:00:00', 'Latch repaired',         80.00),
('cp-004', 's-0001-0000-0000-000000000006', 'r-0001-0000-0000-000000000005', NULL,    'Window glass cracked',                'Maintenance','Medium', 'Open',        NULL,                  NULL,                      0.00),
('cp-005', 's-0001-0000-0000-000000000003', 'r-0001-0000-0000-000000000007', 't-003', 'AC not cooling properly',             'Electrical', 'High',   'In Progress', NULL,                  'Technician inspecting',   0.00),
('cp-006', 's-0001-0000-0000-000000000009', 'r-0001-0000-0000-000000000002', 't-001', 'Hot water not available in morning',  'Plumbing',   'Medium', 'Open',        NULL,                  NULL,                      0.00),
('cp-007', 's-0001-0000-0000-000000000007', 'r-0001-0000-0000-000000000007', 't-003', 'Room light flickering intermittently','Electrical', 'Low',    'Resolved',    '2024-01-16 10:00:00', 'Light tube replaced',    60.00);

-- ============================================================
-- TABLE 18: visitor_log
-- ============================================================
INSERT INTO visitor_log (visitor_id, visitor_name, visitor_phone, id_proof_type, id_proof_number, student_id, room_id, relation_to_student, purpose, entry_time, exit_time, guard_name, gate_number, approved_by) VALUES
('vl-001', 'Prakash Mehta',   '9840200001', 'Aadhaar',  'XXXX-XXXX-0001', 's-0001-0000-0000-000000000001', 'r-0001-0000-0000-000000000001', 'Father', 'Monthly Visit',     '2024-01-13 10:00:00', '2024-01-13 13:00:00', 'Murugan', 'G1', 'Mr. Ramesh Kumar'),
('vl-002', 'Sunita Mehta',    '9840200002', 'Aadhaar',  'XXXX-XXXX-0002', 's-0001-0000-0000-000000000001', 'r-0001-0000-0000-000000000001', 'Mother', 'Monthly Visit',     '2024-01-13 10:00:00', '2024-01-13 13:00:00', 'Murugan', 'G1', 'Mr. Ramesh Kumar'),
('vl-003', 'Krishnamurthy T', '9840200003', 'Voter ID', 'VOTER-TN-0003',  's-0001-0000-0000-000000000002', 'r-0001-0000-0000-000000000004', 'Father', 'Fee Discussion',    '2024-01-14 11:30:00', '2024-01-14 13:00:00', 'Sumathi', 'G2', 'Mrs. Priya Nair'),
('vl-004', 'Ankit Mehta',     '9840299001', 'College ID','COLL-001',      's-0001-0000-0000-000000000001', NULL,                           'Friend', 'Group Study',       '2024-01-15 14:00:00', '2024-01-15 17:00:00', 'Rajan',   'G1', 'Mr. Ramesh Kumar'),
('vl-005', 'Ramesh Verma',    '9840200004', 'Aadhaar',  'XXXX-XXXX-0004', 's-0001-0000-0000-000000000003', 'r-0001-0000-0000-000000000007', 'Father', 'Festival Visit',    '2024-01-16 09:00:00', '2024-01-16 18:00:00', 'Babu',    'G3', 'Dr. Anand Selvaraj'),
('vl-006', 'Priya Sharma',    '9840299002', 'Aadhaar',  'XXXX-XXXX-0006', 's-0001-0000-0000-000000000010', 'r-0001-0000-0000-000000000008', 'Sister', 'Document Delivery', '2024-01-17 15:00:00', '2024-01-17 15:45:00', 'Ravi',    'G3', 'Dr. Anand Selvaraj');

-- ============================================================
-- TABLE 19: notice_board
-- ============================================================
INSERT INTO notice_board (notice_id, hostel_id, title, content, category, target_audience, posted_by, posted_at, expiry_date) VALUES
('nb-001', 'h-0001-0000-0000-000000000001', 'Water Supply Interruption', 'Water supply will be off on 20-Jan-2024 from 10AM to 2PM for pipeline maintenance.', 'Maintenance', 'All Students', 'Mr. Ramesh Kumar',   '2024-01-17 09:00:00', '2024-01-21'),
('nb-002', 'h-0001-0000-0000-000000000001', 'Fee Payment Reminder',      'Last date for January fee payment is 25-Jan-2024. Late fee of Rs 200 will apply.',  'Finance',     'All Students', 'Mr. Ramesh Kumar',   '2024-01-15 10:00:00', '2024-01-26'),
('nb-003', 'h-0001-0000-0000-000000000002', 'Cultural Event Night',      'Annual Cultural Night on 26-Jan-2024 at 6PM in the main hall. All are welcome.',     'Event',       'All Students', 'Mrs. Priya Nair',    '2024-01-16 11:00:00', '2024-01-27'),
('nb-004', 'h-0001-0000-0000-000000000002', 'New Mess Menu',             'Updated mess menu effective from February 2024 is available at the mess notice board.','Mess',       'All Students', 'Mrs. Priya Nair',    '2024-01-18 08:00:00', '2024-02-28'),
('nb-005', 'h-0001-0000-0000-000000000003', 'Guest Policy Reminder',     'Visitors allowed only between 9AM-7PM. All visitors must sign at the security desk.', 'Rules',      'All Students', 'Dr. Anand Selvaraj', '2024-01-10 09:00:00', '2024-04-30'),
('nb-006', 'h-0001-0000-0000-000000000003', 'Laundry Service Expansion', 'Laundry pickup now available on Sundays. Contact the store desk for details.',        'Services',   'All Students', 'Dr. Anand Selvaraj', '2024-01-19 10:00:00', '2024-03-31');

-- ============================================================
-- TABLE 20: maintenance_schedule  (area_type, area_id → room_id, is_common_area — 5NF)
-- ============================================================
INSERT INTO maintenance_schedule (schedule_id, hostel_id, room_id, is_common_area, maintenance_type, scheduled_date, completed_date, technician_id, status, cost) VALUES
('msch-001', 'h-0001-0000-0000-000000000001', NULL,                           TRUE,  'Monthly Cleaning',      '2024-01-20', '2024-01-20', 't-004', 'Completed', 500.00),
('msch-002', 'h-0001-0000-0000-000000000001', 'r-0001-0000-0000-000000000002', FALSE, 'Electrical Inspection', '2024-01-22', NULL,         't-001', 'Scheduled', 0.00),
('msch-003', 'h-0001-0000-0000-000000000002', NULL,                           TRUE,  'Pest Control',          '2024-01-25', NULL,         't-002', 'Scheduled', 1200.00),
('msch-004', 'h-0001-0000-0000-000000000003', 'r-0001-0000-0000-000000000008', FALSE, 'Plumbing Check',        '2024-01-18', '2024-01-18', 't-003', 'Completed', 300.00),
('msch-005', 'h-0001-0000-0000-000000000003', NULL,                           TRUE,  'Generator Servicing',   '2024-01-30', NULL,         't-003', 'Scheduled', 2500.00);

-- ============================================================
-- TABLE 21: store
-- ============================================================
INSERT INTO store (store_id, store_name, hostel_id, manager_name, manager_phone, store_type, timing_open, timing_close, is_operational) VALUES
('st-001', 'Sunrise Convenience Store', 'h-0001-0000-0000-000000000001', 'Ravi S',    '9841600001', 'Convenience', '07:00:00', '22:00:00', TRUE),
('st-002', 'Moonlight Mini Mart',       'h-0001-0000-0000-000000000002', 'Kavitha M', '9841600002', 'Convenience', '07:00:00', '21:00:00', TRUE),
('st-003', 'Horizon Stationery Hub',    'h-0001-0000-0000-000000000003', 'Gopal K',   '9841600003', 'Stationery',  '08:00:00', '20:00:00', TRUE);

-- ============================================================
-- TABLE 22: store_purchase  (item_description, quantity removed — 5NF)
-- ============================================================
INSERT INTO store_purchase (purchase_id, student_id, store_id, total_amount, payment_mode, purchase_date) VALUES
('sp-001', 's-0001-0000-0000-000000000001', 'st-001',  85.00, 'Cash', '2024-01-10 16:30:00'),
('sp-002', 's-0001-0000-0000-000000000005', 'st-001', 120.00, 'UPI',  '2024-01-11 18:00:00'),
('sp-003', 's-0001-0000-0000-000000000009', 'st-001',  95.00, 'Cash', '2024-01-12 09:00:00'),
('sp-004', 's-0001-0000-0000-000000000002', 'st-002', 110.00, 'UPI',  '2024-01-10 17:00:00'),
('sp-005', 's-0001-0000-0000-000000000006', 'st-002', 135.00, 'Cash', '2024-01-13 08:30:00'),
('sp-006', 's-0001-0000-0000-000000000008', 'st-002',  90.00, 'UPI',  '2024-01-15 21:00:00'),
('sp-007', 's-0001-0000-0000-000000000003', 'st-003',  75.00, 'Cash', '2024-01-11 10:00:00'),
('sp-008', 's-0001-0000-0000-000000000010', 'st-003', 145.00, 'UPI',  '2024-01-14 14:30:00');

-- ============================================================
-- store_purchase_item  [NEW — 5NF]
-- ============================================================
INSERT INTO store_purchase_item (item_id, purchase_id, item_name, quantity, unit_price) VALUES
('spi-001', 'sp-001', 'Biscuits',      2, 25.00),
('spi-002', 'sp-001', 'Water bottle',  1, 35.00),
('spi-003', 'sp-002', 'Shampoo',       1, 80.00),
('spi-004', 'sp-002', 'Soap',          1, 40.00),
('spi-005', 'sp-003', 'Notebook',      1, 40.00),
('spi-006', 'sp-003', 'Pen',           5,  5.00),
('spi-007', 'sp-003', 'Eraser',        1, 30.00),
('spi-008', 'sp-004', 'Sanitary pads', 1, 60.00),
('spi-009', 'sp-004', 'Chocolates',    1, 50.00),
('spi-010', 'sp-005', 'Toothpaste',    1, 60.00),
('spi-011', 'sp-005', 'Shampoo',       1, 75.00),
('spi-012', 'sp-006', 'Energy drink',  1, 40.00),
('spi-013', 'sp-006', 'Chips',         2, 25.00),
('spi-014', 'sp-007', 'Graph notebook',1, 35.00),
('spi-015', 'sp-007', 'Pen',           1, 10.00),
('spi-016', 'sp-007', 'Scale',         1, 30.00),
('spi-017', 'sp-008', 'Stapler',       1, 60.00),
('spi-018', 'sp-008', 'A4 Sheets',     1, 50.00),
('spi-019', 'sp-008', 'Highlighter',   1, 35.00);

-- ============================================================
-- TABLE 23: pharmacy
-- ============================================================
INSERT INTO pharmacy (pharmacy_id, pharmacy_name, address, pharmacist_name, pharmacist_phone, license_number, license_expiry, timing_open, timing_close, is_24hr, emergency_available) VALUES
('ph-001', 'Campus Health Pharmacy', 'Ground Floor, Health Center, College Campus', 'Dr. Nalini R', '9841700001', 'PH-LIC-2023-001', '2025-12-31', '08:00:00', '21:00:00', FALSE, TRUE);

-- ============================================================
-- TABLE 24: pharmacy_visit
-- ============================================================
INSERT INTO pharmacy_visit (visit_id, student_id, pharmacy_id, visit_date, prescription_details, medicines_issued, total_cost, payment_status) VALUES
('pv-001', 's-0001-0000-0000-000000000001', 'ph-001', '2024-01-10 10:30:00', 'Fever, cold',        'Paracetamol 500mg x10, Cetirizine x5',       55.00,  'Paid'),
('pv-002', 's-0001-0000-0000-000000000004', 'ph-001', '2024-01-11 14:00:00', 'Stomach ache',       'Omeprazole x7, ORS sachets x3',              80.00,  'Paid'),
('pv-003', 's-0001-0000-0000-000000000006', 'ph-001', '2024-01-12 09:00:00', 'Headache, migraine', 'Ibuprofen 400mg x6, B-complex x10',          65.00,  'Paid'),
('pv-004', 's-0001-0000-0000-000000000007', 'ph-001', '2024-01-13 17:00:00', 'Sprain — ankle',     'Diclofenac gel, Crepe bandage',              95.00,  'Paid'),
('pv-005', 's-0001-0000-0000-000000000003', 'ph-001', '2024-01-14 11:00:00', 'Skin allergy',       'Hydrocortisone cream, Antihistamine x5',      75.00,  'Paid'),
('pv-006', 's-0001-0000-0000-000000000009', 'ph-001', '2024-01-16 16:00:00', 'Eye irritation',     'Eye drops (Tobramycin), Vitamin A capsules', 120.00, 'Pending');

-- ============================================================
-- TABLE 25: restaurant
-- ============================================================
INSERT INTO restaurant (restaurant_id, restaurant_name, location, cuisine_type, manager_name, manager_phone, capacity, timing_open, timing_close, avg_cost_per_meal, rating, is_operational) VALUES
('rs-001', 'Campus Bites',     'Near Main Gate, College Campus', 'Multi-cuisine', 'Balaji R',  '9841800001', 80, '08:00:00', '22:00:00', 120.00, 4.1, TRUE),
('rs-002', 'The Spice Garden', 'Block B, Academic Complex',      'South Indian',  'Vignesh P', '9841800002', 60, '07:30:00', '21:30:00',  90.00, 4.3, TRUE);

-- ============================================================
-- TABLE 26: gym
-- ============================================================
INSERT INTO gym (gym_id, gym_name, location, trainer_name, trainer_phone, capacity, monthly_fee, equipment_summary, timing_open, timing_close, is_operational) VALUES
('gym-001', 'Campus Fitness Center', 'Sports Complex, Ground Floor', 'Senthil Kumar', '9841900001', 50, 500.00, 'Treadmill x3, Elliptical x2, Bench Press, Dumbbells (5-50kg), Pull-up bar, Cycling x2', '05:30:00', '22:00:00', TRUE);

-- ============================================================
-- TABLE 27: gym_membership
-- ============================================================
INSERT INTO gym_membership (membership_id, student_id, gym_id, start_date, end_date, fee_paid, status) VALUES
('gm-001', 's-0001-0000-0000-000000000001', 'gym-001', '2024-01-01', '2024-03-31', 1500.00, 'Active'),
('gm-002', 's-0001-0000-0000-000000000005', 'gym-001', '2024-01-01', '2024-01-31',  500.00, 'Active'),
('gm-003', 's-0001-0000-0000-000000000003', 'gym-001', '2023-10-01', '2023-12-31', 1500.00, 'Expired'),
('gm-004', 's-0001-0000-0000-000000000007', 'gym-001', '2024-01-01', '2024-06-30', 3000.00, 'Active'),
('gm-005', 's-0001-0000-0000-000000000009', 'gym-001', '2024-01-01', '2024-03-31', 1500.00, 'Active');

-- ============================================================
-- hospital  [NEW — BCNF]
-- ============================================================
INSERT INTO hospital (hospital_id, hospital_name, hospital_address, hospital_phone) VALUES
('hosp-001', 'Govt General Hospital',   '1 Hospital Rd, Chennai',         '04444000100'),
('hosp-002', 'Sri Ramachandra Hospital', 'No 1 Ramachandra Nagar, Chennai','04444000200');

-- ============================================================
-- TABLE 28: ambulance_service  (hospital cols → hospital_id FK — BCNF)
-- ============================================================
INSERT INTO ambulance_service (ambulance_id, vehicle_number, driver_name, driver_phone, hospital_id, is_available, last_service_date) VALUES
('amb-001', 'TN-09-AB-1234', 'Mani D',     '9842000001', 'hosp-001', TRUE,  '2023-12-15'),
('amb-002', 'TN-09-CD-5678', 'Selvakumar', '9842000002', 'hosp-002', FALSE, '2024-01-05');

-- ============================================================
-- TABLE 29: emergency_request
-- ============================================================
INSERT INTO emergency_request (request_id, student_id, ambulance_id, request_time, pickup_time, hospital_reached_time, emergency_type, description, status) VALUES
('er-001', 's-0001-0000-0000-000000000006', 'amb-001', '2023-11-10 02:15:00', '2023-11-10 02:28:00', '2023-11-10 02:50:00', 'Medical', 'High fever with convulsions',              'Completed'),
('er-002', 's-0001-0000-0000-000000000003', 'amb-001', '2024-01-05 23:45:00', '2024-01-05 23:58:00', '2024-01-06 00:20:00', 'Injury',  'Fell from bunk bed, suspected fracture',   'Completed'),
('er-003', 's-0001-0000-0000-000000000008', NULL,      '2024-01-17 18:30:00', NULL,                  NULL,                  'Medical', 'Allergic reaction, mild breathing difficulty','Requested'),
('er-004', 's-0001-0000-0000-000000000001', 'amb-001', '2024-01-10 03:00:00', '2024-01-10 03:12:00', '2024-01-10 03:35:00', 'Medical', 'Severe stomach pain',                      'Completed');

SET FOREIGN_KEY_CHECKS = 1;