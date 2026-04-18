-- ============================================================
-- HOSTEL MANAGEMENT SYSTEM — SEED DATA (Simplified)
-- MySQL 8.0+ | Matches simplified schema
-- ============================================================

USE hostel_mgmt;

SET FOREIGN_KEY_CHECKS = 0;

-- ============================================================
-- pincode_locality
-- ============================================================
INSERT INTO pincode_locality (pincode, city, state) VALUES
('600001', 'Chennai',    'Tamil Nadu'),
('600002', 'Chennai',    'Tamil Nadu'),
('641001', 'Coimbatore', 'Tamil Nadu');

-- ============================================================
-- hostel
-- ============================================================
INSERT INTO hostel (hostel_id, hostel_name, type, total_floors, address, pincode,
    established_year, registration_no, office_phone, emergency_phone) VALUES
('h-0001-0000-0000-000000000001', 'Sunrise Boys Hostel',   'Boys',  5, '12 College Road',        '600001', 2005, 'REG-BH-001', '04400001', '04400911'),
('h-0001-0000-0000-000000000002', 'Moonlight Girls Hostel','Girls', 4, '14 University Avenue',   '600002', 2008, 'REG-GH-002', '04400002', '04400912'),
('h-0001-0000-0000-000000000003', 'Horizon Mixed Hostel',  'Mixed', 6, '8 Campus Lane, Block C', '641001', 2015, 'REG-MH-003', '04200003', '04200913');

-- ============================================================
-- hostel_warden
-- ============================================================
INSERT INTO hostel_warden (warden_id, hostel_id, warden_name, warden_phone, warden_email, assigned_date, is_active) VALUES
('hw-001', 'h-0001-0000-0000-000000000001', 'Mr. Ramesh Kumar',   '9841000001', 'ramesh@hostel.edu', '2005-06-01', TRUE),
('hw-002', 'h-0001-0000-0000-000000000002', 'Mrs. Priya Nair',    '9841000002', 'priya@hostel.edu',  '2008-06-01', TRUE),
('hw-003', 'h-0001-0000-0000-000000000003', 'Dr. Anand Selvaraj', '9841000003', 'anand@hostel.edu',  '2015-06-01', TRUE);

-- ============================================================
-- mess (with menu_description)
-- ============================================================
INSERT INTO mess (mess_id, mess_name, mess_type, hostel_id, monthly_fee, capacity, manager_name, manager_phone, hygiene_rating, last_inspection, menu_description) VALUES
('m-001', 'Annapurna Mess',   'Veg',     'h-0001-0000-0000-000000000001', 2500.00, 150, 'Kannan S',  '9841400001', 4.2, '2024-01-10', 'Mon: Idli/Rice/Chapati | Tue: Pongal/Biryani/Roti | Wed: Dosa/Meals/Paneer | Thu: Upma/Sambar Rice/Parotta | Fri: Poori/Curd Rice/Naan'),
('m-002', 'Sakthi Mess',      'Veg',     'h-0001-0000-0000-000000000002', 2500.00, 120, 'Devi R',    '9841400002', 4.5, '2024-01-15', 'Mon: Dosa/Dal Rice/Roti | Tue: Upma/Sambar Rice/Mix Veg | Wed: Idli/Biryani/Chapati | Thu: Pongal/Rasam Rice/Naan | Fri: Poori/Meals/Paneer'),
('m-003', 'Horizon Food Hub', 'Non-Veg', 'h-0001-0000-0000-000000000003', 3000.00, 180, 'Prasad M',  '9841400003', 3.8, '2023-12-20', 'Mon: Puri Bhaji/Chicken Curry/Fish Fry | Tue: Egg Omelette/Mutton Biryani/Grilled Chicken | Wed: Idli/Egg Curry/Prawn Masala');

-- ============================================================
-- mess_timing
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
-- student (with guardian info and mess_id)
-- ============================================================
INSERT INTO student (student_id, reg_no, first_name, last_name, date_of_birth, gender,
    phone_primary, phone_secondary, email_personal, email_institutional,
    department, course, academic_year, semester, blood_group,
    permanent_address, pincode, admission_date, status,
    guardian_name, guardian_phone, guardian_relation, mess_id) VALUES
('s-0001-0000-0000-000000000001', 'REG2021001', 'Arjun',   'Mehta',        '2003-04-12', 'Male',   '9790100001', NULL,         'arjun.m@gmail.com',   'arjun@college.edu',   'Computer Science', 'B.Tech', 3, 5, 'O+',  '22 MG Road, Salem',          '600001', '2021-07-01', 'Active', 'Prakash Mehta',   '9840200001', 'Father', 'm-001'),
('s-0001-0000-0000-000000000002', 'REG2021002', 'Divya',   'Krishnamurthy','2003-08-25', 'Female', '9790100002', '9790100012', 'divya.k@gmail.com',   'divya@college.edu',   'Electronics',      'B.Tech', 3, 5, 'A+',  '5 Anna Nagar, Madurai',      '600002', '2021-07-01', 'Active', 'Krishnamurthy T', '9840200003', 'Father', 'm-002'),
('s-0001-0000-0000-000000000003', 'REG2022001', 'Rohan',   'Verma',        '2004-01-17', 'Male',   '9790100003', NULL,         'rohan.v@gmail.com',   'rohan@college.edu',   'Mechanical',       'B.Tech', 2, 3, 'B+',  '10 Gandhi St, Trichy',       '641001', '2022-07-01', 'Active', 'Ramesh Verma',    '9840200004', 'Father', 'm-003'),
('s-0001-0000-0000-000000000004', 'REG2022002', 'Sneha',   'Iyer',         '2004-06-05', 'Female', '9790100004', NULL,         'sneha.i@gmail.com',   'sneha@college.edu',   'Civil',            'B.Tech', 2, 3, 'AB+', '7 Nehru Nagar, Vellore',     '600002', '2022-07-01', 'Active', 'Suresh Iyer',     '9840200005', 'Father', 'm-002'),
('s-0001-0000-0000-000000000005', 'REG2021003', 'Karthik', 'Rajan',        '2003-11-20', 'Male',   '9790100005', '9790100015', 'karthik.r@gmail.com', 'karthik@college.edu', 'Computer Science', 'B.Tech', 3, 5, 'O-',  '3 Kamaraj Ave, Chennai',     '600001', '2021-07-01', 'Active', 'Rajan K',         '9840200007', 'Father', 'm-001'),
('s-0001-0000-0000-000000000006', 'REG2020001', 'Meera',   'Subramanian',  '2002-03-09', 'Female', '9790100006', NULL,         'meera.s@gmail.com',   'meera@college.edu',   'Information Tech', 'B.Tech', 4, 7, 'A-',  '11 Periyar Salai, Salem',    '600002', '2020-07-01', 'Active', 'Subramanian P',   '9840200008', 'Father', NULL),
('s-0001-0000-0000-000000000007', 'REG2023001', 'Vikram',  'Patel',        '2005-07-30', 'Male',   '9790100007', NULL,         'vikram.p@gmail.com',  'vikram@college.edu',  'Electrical',       'B.Tech', 1, 1, 'B-',  '20 Rajiv Nagar, Coimbatore', '641001', '2023-07-01', 'Active', 'Dinesh Patel',    '9840200009', 'Father', 'm-003'),
('s-0001-0000-0000-000000000008', 'REG2023002', 'Lakshmi', 'Venkatesh',    '2005-02-14', 'Female', '9790100008', '9790100018', 'lakshmi.v@gmail.com', 'lakshmi@college.edu', 'Biotechnology',    'B.Tech', 1, 1, 'O+',  '9 Indira Nagar, Vellore',    '600002', '2023-07-01', 'Active', 'Venkatesh R',     '9840200010', 'Father', NULL),
('s-0001-0000-0000-000000000009', 'REG2021004', 'Suresh',  'Babu',         '2003-09-01', 'Male',   '9790100009', NULL,         'suresh.b@gmail.com',  'suresh@college.edu',  'Computer Science', 'M.Tech', 3, 5, 'A+',  '15 Cross St, Erode',         '600001', '2021-07-01', 'Active', 'Babu S',          '9840200011', 'Father', 'm-001'),
('s-0001-0000-0000-000000000010', 'REG2022003', 'Anjali',  'Sharma',       '2004-05-22', 'Female', '9790100010', NULL,         'anjali.s@gmail.com',  'anjali@college.edu',  'Chemistry',        'B.Sc',  2, 3, 'AB-', '6 Rose Garden, Madurai',     '641001', '2022-07-01', 'Active', 'Rajesh Sharma',   '9840200012', 'Father', NULL);

-- ============================================================
-- room
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
-- bed
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
-- specialization
-- ============================================================
INSERT INTO specialization (specialization_id, specialization_name) VALUES
('spec-001', 'Plumbing'),
('spec-002', 'Electrical'),
('spec-003', 'Carpentry'),
('spec-004', 'AC & Appliances'),
('spec-005', 'General Maintenance');

-- ============================================================
-- technician
-- ============================================================
INSERT INTO technician (technician_id, name, phone, email, availability, joining_date, employment_type, salary, hostel_id) VALUES
('t-001', 'Murugan A',     '9841300001', 'murugan@hostel.edu', 'Mon-Sat 8AM-6PM', '2018-06-01', 'Full-time', 22000.00, 'h-0001-0000-0000-000000000001'),
('t-002', 'Selvam R',      '9841300002', 'selvam@hostel.edu',  'Mon-Fri 9AM-5PM', '2019-03-15', 'Full-time', 20000.00, 'h-0001-0000-0000-000000000002'),
('t-003', 'Balamurugan K', '9841300003', 'bala@hostel.edu',    'On Call',         '2020-01-10', 'Part-time', 15000.00, 'h-0001-0000-0000-000000000003'),
('t-004', 'Shanmugam T',   '9841300004', NULL,                 'Mon-Sat 7AM-7PM', '2017-09-01', 'Full-time', 18000.00, 'h-0001-0000-0000-000000000001');

-- ============================================================
-- technician_specialization
-- ============================================================
INSERT INTO technician_specialization (technician_id, specialization_id) VALUES
('t-001', 'spec-001'),
('t-001', 'spec-002'),
('t-002', 'spec-003'),
('t-003', 'spec-004'),
('t-004', 'spec-005');

-- ============================================================
-- allocation
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
-- feepayment
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
-- laundry
-- ============================================================
INSERT INTO laundry (laundry_id, laundry_name, hostel_id, vendor_name, vendor_phone, price_per_piece, price_per_kg, timing_open, timing_close, contract_start, contract_end) VALUES
('lau-001', 'CleanWash Laundry',  'h-0001-0000-0000-000000000001', 'CleanWash Pvt Ltd', '9841500001', 15.00, 60.00, '08:00:00', '19:00:00', '2023-01-01', '2025-12-31'),
('lau-002', 'FreshLinen Service', 'h-0001-0000-0000-000000000002', 'FreshLinen Co',     '9841500002', 12.00, 50.00, '07:00:00', '20:00:00', '2023-06-01', '2025-05-31');

-- ============================================================
-- laundry_service_type
-- ============================================================
INSERT INTO laundry_service_type (laundry_id, service_type) VALUES
('lau-001', 'Wash'),
('lau-001', 'Iron'),
('lau-001', 'Dry Clean'),
('lau-002', 'Wash'),
('lau-002', 'Iron');

-- ============================================================
-- laundry_operating_day
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
-- complaint
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
-- visitor_log
-- ============================================================
INSERT INTO visitor_log (visitor_id, visitor_name, visitor_phone, id_proof_type, id_proof_number, student_id, room_id, relation_to_student, purpose, entry_time, exit_time, guard_name, gate_number, approved_by) VALUES
('vl-001', 'Prakash Mehta',   '9840200001', 'Aadhaar',  'XXXX-XXXX-0001', 's-0001-0000-0000-000000000001', 'r-0001-0000-0000-000000000001', 'Father', 'Monthly Visit',     '2024-01-13 10:00:00', '2024-01-13 13:00:00', 'Murugan', 'G1', 'Mr. Ramesh Kumar'),
('vl-002', 'Sunita Mehta',    '9840200002', 'Aadhaar',  'XXXX-XXXX-0002', 's-0001-0000-0000-000000000001', 'r-0001-0000-0000-000000000001', 'Mother', 'Monthly Visit',     '2024-01-13 10:00:00', '2024-01-13 13:00:00', 'Murugan', 'G1', 'Mr. Ramesh Kumar'),
('vl-003', 'Krishnamurthy T', '9840200003', 'Voter ID', 'VOTER-TN-0003',  's-0001-0000-0000-000000000002', 'r-0001-0000-0000-000000000004', 'Father', 'Fee Discussion',    '2024-01-14 11:30:00', '2024-01-14 13:00:00', 'Sumathi', 'G2', 'Mrs. Priya Nair'),
('vl-004', 'Ankit Mehta',     '9840299001', 'College ID','COLL-001',      's-0001-0000-0000-000000000001', NULL,                           'Friend', 'Group Study',       '2024-01-15 14:00:00', '2024-01-15 17:00:00', 'Rajan',   'G1', 'Mr. Ramesh Kumar'),
('vl-005', 'Ramesh Verma',    '9840200004', 'Aadhaar',  'XXXX-XXXX-0004', 's-0001-0000-0000-000000000003', 'r-0001-0000-0000-000000000007', 'Father', 'Festival Visit',    '2024-01-16 09:00:00', '2024-01-16 18:00:00', 'Babu',    'G3', 'Dr. Anand Selvaraj'),
('vl-006', 'Priya Sharma',    '9840299002', 'Aadhaar',  'XXXX-XXXX-0006', 's-0001-0000-0000-000000000010', 'r-0001-0000-0000-000000000008', 'Sister', 'Document Delivery', '2024-01-17 15:00:00', '2024-01-17 15:45:00', 'Ravi',    'G3', 'Dr. Anand Selvaraj');

SET FOREIGN_KEY_CHECKS = 1;