-- ============================================================
-- HOSTEL MANAGEMENT SYSTEM — EXTRAPOLATED SEED DATA
-- MySQL 8.0+ | Expanded from original sample
-- Students: 30 | Rooms: 27 | Beds: 60+ | Payments: 50+
-- Complaints: 20 | Visitors: 20 | Technicians: 8
-- ============================================================

USE hostel_mgmt;

SET FOREIGN_KEY_CHECKS = 0;

-- ============================================================
-- pincode_locality
-- ============================================================
INSERT INTO pincode_locality (pincode, city, state) VALUES
('600001', 'Chennai',     'Tamil Nadu'),
('600002', 'Chennai',     'Tamil Nadu'),
('600032', 'Chennai',     'Tamil Nadu'),
('600040', 'Chennai',     'Tamil Nadu'),
('560034', 'Bangalore',   'Karnataka'),
('560001', 'Bangalore',   'Karnataka'),
('110085', 'Delhi',       'Delhi'),
('110001', 'Delhi',       'Delhi'),
('641001', 'Coimbatore',  'Tamil Nadu'),
('625001', 'Madurai',     'Tamil Nadu'),
('620001', 'Trichy',      'Tamil Nadu'),
('636001', 'Salem',       'Tamil Nadu'),
('638001', 'Erode',       'Tamil Nadu'),
('632001', 'Vellore',     'Tamil Nadu'),
('400001', 'Mumbai',      'Maharashtra'),
('500001', 'Hyderabad',   'Telangana');

-- ============================================================
-- hostel
-- ============================================================
INSERT INTO hostel (hostel_id, hostel_name, type, total_floors, address, pincode,
    established_year, registration_no, office_phone, emergency_phone) VALUES
('h-0001-0000-0000-000000000001', 'Sunrise Boys Hostel',    'Boys',  5, '12 College Road',        '600001', 2005, 'REG-BH-001', '04400001', '04400911'),
('h-0001-0000-0000-000000000002', 'Moonlight Girls Hostel', 'Girls', 4, '14 University Avenue',   '600002', 2008, 'REG-GH-002', '04400002', '04400912'),
('h-0001-0000-0000-000000000003', 'Horizon Mixed Hostel',   'Mixed', 6, '8 Campus Lane, Block C', '641001', 2015, 'REG-MH-003', '04200003', '04200913');

-- ============================================================
-- hostel_warden
-- ============================================================
INSERT INTO hostel_warden (warden_id, hostel_id, warden_name, warden_phone, warden_email, assigned_date, is_active) VALUES
('hw-001', 'h-0001-0000-0000-000000000001', 'Mr. Ramesh Kumar',   '9841000001', 'ramesh@hostel.edu',  '2005-06-01', TRUE),
('hw-002', 'h-0001-0000-0000-000000000002', 'Mrs. Priya Nair',    '9841000002', 'priya@hostel.edu',   '2008-06-01', TRUE),
('hw-003', 'h-0001-0000-0000-000000000003', 'Dr. Anand Selvaraj', '9841000003', 'anand@hostel.edu',   '2015-06-01', TRUE),
-- Former warden (inactive) for audit trail
('hw-004', 'h-0001-0000-0000-000000000001', 'Mr. Senthil Raj',    '9841000004', 'senthil@hostel.edu', '2000-06-01', FALSE);

-- ============================================================
-- mess
-- ============================================================
INSERT INTO mess (mess_id, mess_name, mess_type, hostel_id, monthly_fee, capacity, manager_name, manager_phone, hygiene_rating, last_inspection, menu_description) VALUES
('m-001', 'Annapurna Mess',     'Veg',     'h-0001-0000-0000-000000000001', 2500.00, 150, 'Kannan S',   '9841400001', 4.2, '2024-01-10', 'Mon: Idli/Rice/Chapati | Tue: Pongal/Biryani/Roti | Wed: Dosa/Meals/Paneer | Thu: Upma/Sambar Rice/Parotta | Fri: Poori/Curd Rice/Naan'),
('m-002', 'Sakthi Mess',        'Veg',     'h-0001-0000-0000-000000000002', 2500.00, 120, 'Devi R',     '9841400002', 4.5, '2024-01-15', 'Mon: Dosa/Dal Rice/Roti | Tue: Upma/Sambar Rice/Mix Veg | Wed: Idli/Biryani/Chapati | Thu: Pongal/Rasam Rice/Naan | Fri: Poori/Meals/Paneer'),
('m-003', 'Horizon Food Hub',   'Non-Veg', 'h-0001-0000-0000-000000000003', 3000.00, 180, 'Prasad M',   '9841400003', 3.8, '2023-12-20', 'Mon: Puri Bhaji/Chicken Curry/Fish Fry | Tue: Egg Omelette/Mutton Biryani/Grilled Chicken | Wed: Idli/Egg Curry/Prawn Masala | Thu: Dosa/Pepper Chicken/Fish Curry | Fri: Poori/Chicken Biryani/Egg Fry'),
('m-004', 'Green Leaf Mess',    'Veg',     'h-0001-0000-0000-000000000003', 2300.00, 100, 'Nalini K',   '9841400004', 4.0, '2024-02-01', 'Mon: Idli/Dal Fry/Roti | Tue: Dosa/Sambar Rice/Paneer | Wed: Pongal/Curd Rice/Chapati | Thu: Upma/Mix Veg/Naan | Fri: Poori/Biryani/Raita');

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
('m-003', 'Dinner',    '19:00:00', '21:00:00'),
('m-004', 'Breakfast', '07:00:00', '09:00:00'),
('m-004', 'Lunch',     '12:00:00', '14:00:00'),
('m-004', 'Snacks',    '16:30:00', '17:30:00'),
('m-004', 'Dinner',    '19:00:00', '21:00:00');

-- ============================================================
-- student (30 students across 3 hostels)
-- Boys Hostel (h-001): Male students only
-- Girls Hostel (h-002): Female students only
-- Mixed Hostel (h-003): Both
-- ============================================================
INSERT INTO student (student_id, reg_no, first_name, last_name, date_of_birth, gender,
    phone_primary, phone_secondary, email_personal, email_institutional,
    department, course, academic_year, semester, blood_group,
    permanent_address, pincode, admission_date, status,
    guardian_name, guardian_phone, guardian_relation, mess_id) VALUES
-- ── Boys Hostel students (Male) ─────────────────────────────
('s-0001-0000-0000-000000000001', 'REG2021001', 'Arjun',     'Mehta',        '2003-04-12', 'Male',   '9790100001', NULL,         'arjun.m@gmail.com',     'arjun@college.edu',     'Computer Science', 'B.Tech', 3, 5, 'O+',  '22 MG Road, Salem',              '636001', '2021-07-01', 'Active',    'Prakash Mehta',     '9840200001', 'Father', 'm-001'),
('s-0001-0000-0000-000000000005', 'REG2021003', 'Karthik',   'Rajan',        '2003-11-20', 'Male',   '9790100005', '9790100015', 'karthik.r@gmail.com',   'karthik@college.edu',   'Computer Science', 'B.Tech', 3, 5, 'O-',  '3 Kamaraj Ave, Chennai',         '600001', '2021-07-01', 'Active',    'Rajan K',           '9840200007', 'Father', 'm-001'),
('s-0001-0000-0000-000000000009', 'REG2021004', 'Suresh',    'Babu',         '2003-09-01', 'Male',   '9790100009', NULL,         'suresh.b@gmail.com',    'suresh@college.edu',    'Computer Science', 'M.Tech', 3, 5, 'A+',  '15 Cross St, Erode',             '638001', '2021-07-01', 'Active',    'Babu S',            '9840200011', 'Father', 'm-001'),
('s-0001-0000-0000-000000000003', 'REG2022001', 'Rohan',     'Verma',        '2004-01-17', 'Male',   '9790100003', NULL,         'rohan.v@gmail.com',     'rohan@college.edu',     'Mechanical',       'B.Tech', 2, 3, 'B+',  '10 Gandhi St, Trichy',           '620001', '2022-07-01', 'Active',    'Ramesh Verma',      '9840200004', 'Father', 'm-001'),
('s-0001-0000-0000-000000000007', 'REG2023001', 'Vikram',    'Patel',        '2005-07-30', 'Male',   '9790100007', NULL,         'vikram.p@gmail.com',    'vikram@college.edu',    'Electrical',       'B.Tech', 1, 1, 'B-',  '20 Rajiv Nagar, Coimbatore',    '641001', '2023-07-01', 'Active',    'Dinesh Patel',      '9840200009', 'Father', 'm-001'),
('s-0001-0000-0000-000000000011', 'REG2021005', 'Praveen',   'Natarajan',    '2003-06-15', 'Male',   '9790100011', NULL,         'praveen.n@gmail.com',   'praveen@college.edu',   'Civil',            'B.Tech', 3, 5, 'A+',  '45 Nehru Nagar, Madurai',        '625001', '2021-07-01', 'Active',    'Natarajan P',       '9840200013', 'Father', 'm-001'),
('s-0001-0000-0000-000000000012', 'REG2022004', 'Harish',    'Balaji',       '2004-03-22', 'Male',   '9790100012', '9790100022', 'harish.b@gmail.com',    'harish@college.edu',    'Electronics',      'B.Tech', 2, 3, 'O+',  '7 Sakthi Nagar, Salem',          '636001', '2022-07-01', 'Active',    'Balaji H',          '9840200014', 'Father', 'm-001'),
('s-0001-0000-0000-000000000013', 'REG2023003', 'Deepak',    'Sundaram',     '2005-09-10', 'Male',   '9790100013', NULL,         'deepak.s@gmail.com',    'deepak@college.edu',    'Computer Science', 'B.Tech', 1, 1, 'B+',  '18 Periyar St, Chennai',         '600032', '2023-07-01', 'Active',    'Sundaram D',        '9840200015', 'Father', NULL),
('s-0001-0000-0000-000000000014', 'REG2020002', 'Arun',      'Krishnaswamy', '2002-12-05', 'Male',   '9790100014', NULL,         'arun.k@gmail.com',      'arun@college.edu',      'Information Tech', 'B.Tech', 4, 7, 'AB+', '32 Gandhi Salai, Vellore',        '632001', '2020-07-01', 'Active',    'Krishnaswamy A',    '9840200016', 'Father', 'm-001'),
('s-0001-0000-0000-000000000015', 'REG2022005', 'Senthil',   'Murugesan',    '2004-07-18', 'Male',   '9790100015', '9790100025', 'senthil.m@gmail.com',   'senthil@college.edu',   'Mechanical',       'B.Tech', 2, 3, 'O-',  '9 Anna Salai, Coimbatore',       '641001', '2022-07-01', 'Inactive',  'Murugesan S',       '9840200017', 'Father', NULL),
-- ── Girls Hostel students (Female) ──────────────────────────
('s-0001-0000-0000-000000000002', 'REG2021002', 'Divya',     'Krishnamurthy','2003-08-25', 'Female', '9790100002', '9790100012', 'divya.k@gmail.com',     'divya@college.edu',     'Electronics',      'B.Tech', 3, 5, 'A+',  '5 Anna Nagar, Madurai',          '625001', '2021-07-01', 'Active',    'Krishnamurthy T',   '9840200003', 'Father', 'm-002'),
('s-0001-0000-0000-000000000004', 'REG2022002', 'Sneha',     'Iyer',         '2004-06-05', 'Female', '9790100004', NULL,         'sneha.i@gmail.com',     'sneha@college.edu',     'Civil',            'B.Tech', 2, 3, 'AB+', '7 Nehru Nagar, Vellore',         '632001', '2022-07-01', 'Active',    'Suresh Iyer',       '9840200005', 'Father', 'm-002'),
('s-0001-0000-0000-000000000006', 'REG2020001', 'Meera',     'Subramanian',  '2002-03-09', 'Female', '9790100006', NULL,         'meera.s@gmail.com',     'meera@college.edu',     'Information Tech', 'B.Tech', 4, 7, 'A-',  '11 Periyar Salai, Salem',        '636001', '2020-07-01', 'Active',    'Subramanian P',     '9840200008', 'Father', NULL),
('s-0001-0000-0000-000000000008', 'REG2023002', 'Lakshmi',   'Venkatesh',    '2005-02-14', 'Female', '9790100008', '9790100018', 'lakshmi.v@gmail.com',   'lakshmi@college.edu',   'Biotechnology',    'B.Tech', 1, 1, 'O+',  '9 Indira Nagar, Vellore',        '632001', '2023-07-01', 'Active',    'Venkatesh R',       '9840200010', 'Father', NULL),
('s-0001-0000-0000-000000000016', 'REG2021006', 'Priya',     'Ramalingam',   '2003-05-14', 'Female', '9790100016', NULL,         'priya.r@gmail.com',     'priya@college.edu',     'Chemistry',        'B.Sc',  3, 5, 'O+',  '2 Kamarajar Nagar, Trichy',      '620001', '2021-07-01', 'Active',    'Ramalingam V',      '9840200018', 'Father', 'm-002'),
('s-0001-0000-0000-000000000017', 'REG2022006', 'Kavitha',   'Sundarajan',   '2004-10-30', 'Female', '9790100017', NULL,         'kavitha.s@gmail.com',   'kavitha@college.edu',   'Computer Science', 'B.Tech', 2, 3, 'B+',  '14 Greenfield Ave, Chennai',     '600040', '2022-07-01', 'Active',    'Sundarajan K',      '9840200019', 'Mother', 'm-002'),
('s-0001-0000-0000-000000000018', 'REG2023004', 'Nithya',    'Annamalai',    '2005-04-08', 'Female', '9790100018', '9790100028', 'nithya.a@gmail.com',    'nithya@college.edu',    'Electronics',      'B.Tech', 1, 1, 'AB-', '6 West Masi St, Madurai',        '625001', '2023-07-01', 'Active',    'Annamalai N',       '9840200020', 'Father', 'm-002'),
('s-0001-0000-0000-000000000019', 'REG2020003', 'Ramya',     'Gopalan',      '2002-07-22', 'Female', '9790100019', NULL,         'ramya.g@gmail.com',     'ramya@college.edu',     'Biotechnology',    'M.Sc',  4, 7, 'A+',  '30 Ramanathapuram, Coimbatore', '641001', '2020-07-01', 'Active',    'Gopalan R',         '9840200021', 'Father', NULL),
('s-0001-0000-0000-000000000020', 'REG2022007', 'Sangeetha', 'Pillai',       '2004-01-11', 'Female', '9790100020', NULL,         'sangeetha.p@gmail.com', 'sangeetha@college.edu', 'Mathematics',      'B.Sc',  2, 3, 'O-',  '17 Nehru Colony, Chennai',       '600032', '2022-07-01', 'Inactive',  'Pillai S',          '9840200022', 'Father', NULL),
-- ── Mixed Hostel students ────────────────────────────────────
('s-0001-0000-0000-000000000010', 'REG2022003', 'Anjali',    'Sharma',       '2004-05-22', 'Female', '9790100010', NULL,         'anjali.s@gmail.com',    'anjali@college.edu',    'Chemistry',        'B.Sc',  2, 3, 'AB-', '6 Rose Garden, Madurai',         '625001', '2022-07-01', 'Active',    'Rajesh Sharma',     '9840200012', 'Father', NULL),
('s-0001-0000-0000-000000000021', 'REG2021007', 'Vishnu',    'Prabhakaran',  '2003-02-28', 'Male',   '9790100021', NULL,         'vishnu.p@gmail.com',    'vishnu@college.edu',    'Electrical',       'B.Tech', 3, 5, 'B+',  '40 Rajaji St, Salem',            '636001', '2021-07-01', 'Active',    'Prabhakaran V',     '9840200023', 'Father', 'm-003'),
('s-0001-0000-0000-000000000022', 'REG2022008', 'Tamilselvi','Arumugam',     '2004-08-16', 'Female', '9790100022', '9790100032', 'tamils.a@gmail.com',    'tamilselvi@college.edu','Information Tech', 'B.Tech', 2, 3, 'O+',  '21 Palani Nagar, Erode',         '638001', '2022-07-01', 'Active',    'Arumugam T',        '9840200024', 'Father', 'm-004'),
('s-0001-0000-0000-000000000023', 'REG2023005', 'Siva',      'Shankar',      '2005-11-03', 'Male',   '9790100023', NULL,         'siva.s@gmail.com',      'siva@college.edu',      'Mechanical',       'B.Tech', 1, 1, 'A-',  '5 Raja Nagar, Trichy',           '620001', '2023-07-01', 'Active',    'Shankar S',         '9840200025', 'Father', 'm-003'),
('s-0001-0000-0000-000000000024', 'REG2020004', 'Deepika',   'Mohan',        '2002-06-19', 'Female', '9790100024', NULL,         'deepika.m@gmail.com',   'deepika@college.edu',   'Computer Science', 'M.Tech', 4, 7, 'B-',  '13 Avinashi Road, Coimbatore',  '641001', '2020-07-01', 'Active',    'Mohan D',           '9840200026', 'Father', 'm-004'),
('s-0001-0000-0000-000000000025', 'REG2021008', 'Balaji',    'Selvakumar',   '2003-03-07', 'Male',   '9790100025', '9790100035', 'balaji.sk@gmail.com',   'balaji@college.edu',    'Computer Science', 'B.Tech', 3, 5, 'O+',  '55 Bharathi Nagar, Vellore',     '632001', '2021-07-01', 'Active',    'Selvakumar B',      '9840200027', 'Father', 'm-003'),
('s-0001-0000-0000-000000000026', 'REG2022009', 'Geetha',    'Chandrasekaran','2004-09-25','Female', '9790100026', NULL,         'geetha.c@gmail.com',    'geetha@college.edu',    'Physics',          'B.Sc',  2, 3, 'A+',  '8 Srinivasa Nagar, Chennai',     '600040', '2022-07-01', 'Active',    'Chandrasekaran G',  '9840200028', 'Father', 'm-004'),
('s-0001-0000-0000-000000000027', 'REG2023006', 'Prashanth', 'Raj',          '2005-01-14', 'Male',   '9790100027', NULL,         'prashanth.r@gmail.com', 'prashanth@college.edu', 'Electrical',       'B.Tech', 1, 1, 'AB+', '27 Mahalingapuram, Chennai',     '600034', '2023-07-01', 'Active',    'Raj P',             '9840200029', 'Father', NULL),
('s-0001-0000-0000-000000000028', 'REG2020005', 'Saranya',   'Venkataramani','2002-10-31', 'Female', '9790100028', '9790100038', 'saranya.v@gmail.com',   'saranya@college.edu',   'Biotechnology',    'M.Sc',  4, 7, 'O-',  '3 Mettur Road, Salem',           '636001', '2020-07-01', 'Active',    'Venkataramani S',   '9840200030', 'Father', 'm-004'),
('s-0001-0000-0000-000000000029', 'REG2022010', 'Murugan',   'Palaniswamy',  '2004-04-02', 'Male',   '9790100029', NULL,         'murugan.p@gmail.com',   'muruganp@college.edu',  'Civil',            'B.Tech', 2, 3, 'B+',  '16 Sathy Road, Coimbatore',     '641001', '2022-07-01', 'Active',    'Palaniswamy M',     '9840200031', 'Father', 'm-003'),
('s-0001-0000-0000-000000000030', 'REG2023007', 'Keerthana', 'Ravi',         '2005-06-20', 'Female', '9790100030', NULL,         'keerthana.r@gmail.com', 'keerthana@college.edu', 'Mathematics',      'B.Sc',  1, 1, 'A-',  '11 Usman Road, Chennai',         '600017', '2023-07-01', 'Active',    'Ravi K',            '9840200032', 'Mother', NULL);

-- ============================================================
-- room (9 original + 18 new = 27 total)
-- ============================================================
INSERT INTO room (room_id, room_number, floor, capacity, room_type, hostel_id, monthly_rent, area_sqft, facing, room_condition) VALUES
-- Boys Hostel
('r-0001-0000-0000-000000000001', '101', 1, 2, 'Double', 'h-0001-0000-0000-000000000001', 4500.00, 220.0, 'East',  'Good'),
('r-0001-0000-0000-000000000002', '102', 1, 3, 'Triple', 'h-0001-0000-0000-000000000001', 3800.00, 280.0, 'West',  'Good'),
('r-0001-0000-0000-000000000003', '201', 2, 1, 'Single', 'h-0001-0000-0000-000000000001', 6000.00, 160.0, 'East',  'Excellent'),
('r-0001-0000-0000-000000000010', '103', 1, 3, 'Triple', 'h-0001-0000-0000-000000000001', 3800.00, 285.0, 'East',  'Good'),
('r-0001-0000-0000-000000000011', '104', 1, 2, 'Double', 'h-0001-0000-0000-000000000001', 4500.00, 220.0, 'West',  'Fair'),
('r-0001-0000-0000-000000000012', '202', 2, 2, 'Double', 'h-0001-0000-0000-000000000001', 4500.00, 220.0, 'East',  'Good'),
('r-0001-0000-0000-000000000013', '203', 2, 1, 'Single', 'h-0001-0000-0000-000000000001', 6000.00, 165.0, 'West',  'Good'),
('r-0001-0000-0000-000000000014', '301', 3, 3, 'Triple', 'h-0001-0000-0000-000000000001', 3800.00, 285.0, 'East',  'Good'),
('r-0001-0000-0000-000000000015', '302', 3, 2, 'Double', 'h-0001-0000-0000-000000000001', 4500.00, 220.0, 'West',  'Excellent'),
-- Girls Hostel
('r-0001-0000-0000-000000000004', '101', 1, 2, 'Double', 'h-0001-0000-0000-000000000002', 4500.00, 220.0, 'North', 'Good'),
('r-0001-0000-0000-000000000005', '102', 1, 3, 'Triple', 'h-0001-0000-0000-000000000002', 3800.00, 280.0, 'South', 'Good'),
('r-0001-0000-0000-000000000006', '201', 2, 2, 'Double', 'h-0001-0000-0000-000000000002', 4500.00, 220.0, 'North', 'Good'),
('r-0001-0000-0000-000000000016', '103', 1, 3, 'Triple', 'h-0001-0000-0000-000000000002', 3800.00, 280.0, 'South', 'Good'),
('r-0001-0000-0000-000000000017', '104', 1, 2, 'Double', 'h-0001-0000-0000-000000000002', 4500.00, 220.0, 'North', 'Fair'),
('r-0001-0000-0000-000000000018', '202', 2, 1, 'Single', 'h-0001-0000-0000-000000000002', 5800.00, 160.0, 'South', 'Good'),
('r-0001-0000-0000-000000000019', '203', 2, 3, 'Triple', 'h-0001-0000-0000-000000000002', 3800.00, 280.0, 'North', 'Excellent'),
-- Mixed Hostel
('r-0001-0000-0000-000000000007', '101', 1, 2, 'Double', 'h-0001-0000-0000-000000000003', 5000.00, 230.0, 'East',  'Good'),
('r-0001-0000-0000-000000000008', '102', 1, 3, 'Triple', 'h-0001-0000-0000-000000000003', 4000.00, 290.0, 'West',  'Fair'),
('r-0001-0000-0000-000000000009', '301', 3, 1, 'Single', 'h-0001-0000-0000-000000000003', 6500.00, 170.0, 'East',  'Excellent'),
('r-0001-0000-0000-000000000020', '103', 1, 2, 'Double', 'h-0001-0000-0000-000000000003', 5000.00, 230.0, 'West',  'Good'),
('r-0001-0000-0000-000000000021', '201', 2, 3, 'Triple', 'h-0001-0000-0000-000000000003', 4000.00, 290.0, 'East',  'Good'),
('r-0001-0000-0000-000000000022', '202', 2, 2, 'Double', 'h-0001-0000-0000-000000000003', 5000.00, 230.0, 'West',  'Good'),
('r-0001-0000-0000-000000000023', '302', 3, 1, 'Single', 'h-0001-0000-0000-000000000003', 6500.00, 170.0, 'West',  'Good'),
('r-0001-0000-0000-000000000024', '303', 3, 3, 'Triple', 'h-0001-0000-0000-000000000003', 4000.00, 295.0, 'East',  'Fair'),
('r-0001-0000-0000-000000000025', '401', 4, 2, 'Double', 'h-0001-0000-0000-000000000003', 5200.00, 235.0, 'East',  'Excellent'),
('r-0001-0000-0000-000000000026', '402', 4, 1, 'Single', 'h-0001-0000-0000-000000000003', 6800.00, 175.0, 'West',  'Excellent'),
('r-0001-0000-0000-000000000027', '403', 4, 3, 'Triple', 'h-0001-0000-0000-000000000003', 4000.00, 290.0, 'East',  'Good');

-- ============================================================
-- bed (60 beds, ~2.2 avg per room, realistic vacancy mix)
-- ============================================================
INSERT INTO bed (bed_id, bed_number, room_id, bed_type, condition_status, occupied) VALUES
-- Boys Hostel: r-001 (Double)
('b-001', 'B1', 'r-0001-0000-0000-000000000001', 'Single Cot', 'Good',      TRUE),
('b-002', 'B2', 'r-0001-0000-0000-000000000001', 'Single Cot', 'Good',      TRUE),
-- Boys Hostel: r-002 (Triple)
('b-003', 'B1', 'r-0001-0000-0000-000000000002', 'Bunk Lower', 'Good',      TRUE),
('b-004', 'B2', 'r-0001-0000-0000-000000000002', 'Bunk Upper', 'Good',      TRUE),
('b-005', 'B3', 'r-0001-0000-0000-000000000002', 'Single Cot', 'Good',      FALSE),
-- Boys Hostel: r-003 (Single)
('b-006', 'B1', 'r-0001-0000-0000-000000000003', 'Single Cot', 'Excellent', TRUE),
-- Boys Hostel: r-010 (Triple)
('b-019', 'B1', 'r-0001-0000-0000-000000000010', 'Bunk Lower', 'Good',      TRUE),
('b-020', 'B2', 'r-0001-0000-0000-000000000010', 'Bunk Upper', 'Good',      TRUE),
('b-021', 'B3', 'r-0001-0000-0000-000000000010', 'Single Cot', 'Fair',      FALSE),
-- Boys Hostel: r-011 (Double)
('b-022', 'B1', 'r-0001-0000-0000-000000000011', 'Single Cot', 'Fair',      TRUE),
('b-023', 'B2', 'r-0001-0000-0000-000000000011', 'Single Cot', 'Good',      FALSE),
-- Boys Hostel: r-012 (Double)
('b-024', 'B1', 'r-0001-0000-0000-000000000012', 'Single Cot', 'Good',      TRUE),
('b-025', 'B2', 'r-0001-0000-0000-000000000012', 'Single Cot', 'Good',      FALSE),
-- Boys Hostel: r-013 (Single)
('b-026', 'B1', 'r-0001-0000-0000-000000000013', 'Single Cot', 'Good',      TRUE),
-- Boys Hostel: r-014 (Triple)
('b-027', 'B1', 'r-0001-0000-0000-000000000014', 'Bunk Lower', 'Good',      TRUE),
('b-028', 'B2', 'r-0001-0000-0000-000000000014', 'Bunk Upper', 'Good',      TRUE),
('b-029', 'B3', 'r-0001-0000-0000-000000000014', 'Single Cot', 'Good',      FALSE),
-- Boys Hostel: r-015 (Double)
('b-030', 'B1', 'r-0001-0000-0000-000000000015', 'Single Cot', 'Excellent', FALSE),
('b-031', 'B2', 'r-0001-0000-0000-000000000015', 'Single Cot', 'Excellent', FALSE),
-- Girls Hostel: r-004 (Double)
('b-007', 'B1', 'r-0001-0000-0000-000000000004', 'Single Cot', 'Good',      TRUE),
('b-008', 'B2', 'r-0001-0000-0000-000000000004', 'Single Cot', 'Good',      TRUE),
-- Girls Hostel: r-005 (Triple)
('b-009', 'B1', 'r-0001-0000-0000-000000000005', 'Bunk Lower', 'Good',      TRUE),
('b-010', 'B2', 'r-0001-0000-0000-000000000005', 'Bunk Upper', 'Fair',      FALSE),
('b-011', 'B3', 'r-0001-0000-0000-000000000005', 'Single Cot', 'Good',      TRUE),
-- Girls Hostel: r-006 (Double)
('b-012', 'B1', 'r-0001-0000-0000-000000000006', 'Single Cot', 'Good',      FALSE),
('b-013', 'B2', 'r-0001-0000-0000-000000000006', 'Single Cot', 'Good',      FALSE),
-- Girls Hostel: r-016 (Triple)
('b-032', 'B1', 'r-0001-0000-0000-000000000016', 'Bunk Lower', 'Good',      TRUE),
('b-033', 'B2', 'r-0001-0000-0000-000000000016', 'Bunk Upper', 'Good',      TRUE),
('b-034', 'B3', 'r-0001-0000-0000-000000000016', 'Single Cot', 'Good',      TRUE),
-- Girls Hostel: r-017 (Double)
('b-035', 'B1', 'r-0001-0000-0000-000000000017', 'Single Cot', 'Fair',      TRUE),
('b-036', 'B2', 'r-0001-0000-0000-000000000017', 'Single Cot', 'Good',      FALSE),
-- Girls Hostel: r-018 (Single)
('b-037', 'B1', 'r-0001-0000-0000-000000000018', 'Single Cot', 'Good',      TRUE),
-- Girls Hostel: r-019 (Triple)
('b-038', 'B1', 'r-0001-0000-0000-000000000019', 'Bunk Lower', 'Excellent', TRUE),
('b-039', 'B2', 'r-0001-0000-0000-000000000019', 'Bunk Upper', 'Excellent', TRUE),
('b-040', 'B3', 'r-0001-0000-0000-000000000019', 'Single Cot', 'Good',      FALSE),
-- Mixed Hostel: r-007 (Double)
('b-014', 'B1', 'r-0001-0000-0000-000000000007', 'Single Cot', 'Good',      TRUE),
('b-015', 'B2', 'r-0001-0000-0000-000000000007', 'Single Cot', 'Good',      TRUE),
-- Mixed Hostel: r-008 (Triple)
('b-016', 'B1', 'r-0001-0000-0000-000000000008', 'Bunk Lower', 'Fair',      TRUE),
('b-017', 'B2', 'r-0001-0000-0000-000000000008', 'Bunk Upper', 'Good',      FALSE),
('b-041', 'B3', 'r-0001-0000-0000-000000000008', 'Single Cot', 'Good',      TRUE),
-- Mixed Hostel: r-009 (Single)
('b-018', 'B1', 'r-0001-0000-0000-000000000009', 'Single Cot', 'Excellent', FALSE),
-- Mixed Hostel: r-020 (Double)
('b-042', 'B1', 'r-0001-0000-0000-000000000020', 'Single Cot', 'Good',      TRUE),
('b-043', 'B2', 'r-0001-0000-0000-000000000020', 'Single Cot', 'Good',      TRUE),
-- Mixed Hostel: r-021 (Triple)
('b-044', 'B1', 'r-0001-0000-0000-000000000021', 'Bunk Lower', 'Good',      TRUE),
('b-045', 'B2', 'r-0001-0000-0000-000000000021', 'Bunk Upper', 'Good',      TRUE),
('b-046', 'B3', 'r-0001-0000-0000-000000000021', 'Single Cot', 'Good',      FALSE),
-- Mixed Hostel: r-022 (Double)
('b-047', 'B1', 'r-0001-0000-0000-000000000022', 'Single Cot', 'Good',      TRUE),
('b-048', 'B2', 'r-0001-0000-0000-000000000022', 'Single Cot', 'Fair',      FALSE),
-- Mixed Hostel: r-023 (Single)
('b-049', 'B1', 'r-0001-0000-0000-000000000023', 'Single Cot', 'Good',      TRUE),
-- Mixed Hostel: r-024 (Triple)
('b-050', 'B1', 'r-0001-0000-0000-000000000024', 'Bunk Lower', 'Fair',      TRUE),
('b-051', 'B2', 'r-0001-0000-0000-000000000024', 'Bunk Upper', 'Good',      FALSE),
('b-052', 'B3', 'r-0001-0000-0000-000000000024', 'Single Cot', 'Fair',      FALSE),
-- Mixed Hostel: r-025 (Double)
('b-053', 'B1', 'r-0001-0000-0000-000000000025', 'Single Cot', 'Excellent', TRUE),
('b-054', 'B2', 'r-0001-0000-0000-000000000025', 'Single Cot', 'Excellent', TRUE),
-- Mixed Hostel: r-026 (Single)
('b-055', 'B1', 'r-0001-0000-0000-000000000026', 'Single Cot', 'Excellent', TRUE),
-- Mixed Hostel: r-027 (Triple)
('b-056', 'B1', 'r-0001-0000-0000-000000000027', 'Bunk Lower', 'Good',      TRUE),
('b-057', 'B2', 'r-0001-0000-0000-000000000027', 'Bunk Upper', 'Good',      TRUE),
('b-058', 'B3', 'r-0001-0000-0000-000000000027', 'Single Cot', 'Good',      FALSE);

-- ============================================================
-- specialization
-- ============================================================
INSERT INTO specialization (specialization_id, specialization_name) VALUES
('spec-001', 'Plumbing'),
('spec-002', 'Electrical'),
('spec-003', 'Carpentry'),
('spec-004', 'AC & Appliances'),
('spec-005', 'General Maintenance'),
('spec-006', 'Pest Control'),
('spec-007', 'Painting & Masonry');

-- ============================================================
-- technician (8 technicians)
-- ============================================================
INSERT INTO technician (technician_id, name, phone, email, availability, joining_date, employment_type, salary, hostel_id) VALUES
('t-001', 'Murugan A',     '9841300001', 'murugan@hostel.edu',  'Mon-Sat 8AM-6PM', '2018-06-01', 'Full-time', 22000.00, 'h-0001-0000-0000-000000000001'),
('t-002', 'Selvam R',      '9841300002', 'selvam@hostel.edu',   'Mon-Fri 9AM-5PM', '2019-03-15', 'Full-time', 20000.00, 'h-0001-0000-0000-000000000002'),
('t-003', 'Balamurugan K', '9841300003', 'bala@hostel.edu',     'On Call',         '2020-01-10', 'Part-time', 15000.00, 'h-0001-0000-0000-000000000003'),
('t-004', 'Shanmugam T',   '9841300004', NULL,                  'Mon-Sat 7AM-7PM', '2017-09-01', 'Full-time', 18000.00, 'h-0001-0000-0000-000000000001'),
('t-005', 'Ravi Kumar',    '9841300005', 'ravi@hostel.edu',     'Mon-Fri 8AM-5PM', '2021-05-01', 'Full-time', 19000.00, 'h-0001-0000-0000-000000000002'),
('t-006', 'Pandian S',     '9841300006', 'pandian@hostel.edu',  'Mon-Sat 9AM-6PM', '2022-02-01', 'Full-time', 17000.00, 'h-0001-0000-0000-000000000003'),
('t-007', 'Gopal R',       '9841300007', 'gopal@hostel.edu',    'On Call',         '2020-11-15', 'Part-time', 12000.00, 'h-0001-0000-0000-000000000001'),
('t-008', 'Sugumar V',     '9841300008', 'sugumar@hostel.edu',  'Mon-Fri 8AM-4PM', '2023-01-10', 'Full-time', 16000.00, 'h-0001-0000-0000-000000000003');

-- ============================================================
-- technician_specialization
-- ============================================================
INSERT INTO technician_specialization (technician_id, specialization_id) VALUES
('t-001', 'spec-001'),
('t-001', 'spec-002'),
('t-002', 'spec-003'),
('t-002', 'spec-007'),
('t-003', 'spec-004'),
('t-003', 'spec-002'),
('t-004', 'spec-005'),
('t-004', 'spec-001'),
('t-005', 'spec-002'),
('t-005', 'spec-004'),
('t-006', 'spec-005'),
('t-006', 'spec-006'),
('t-007', 'spec-003'),
('t-007', 'spec-007'),
('t-008', 'spec-001'),
('t-008', 'spec-005');

-- ============================================================
-- allocation (30 students, 10 unallocated/inactive to reflect reality)
-- ============================================================
INSERT INTO allocation (allocation_id, student_id, bed_id, start_date, end_date, allocated_by, status) VALUES
-- Boys Hostel
('al-001', 's-0001-0000-0000-000000000001', 'b-001', '2021-07-01', NULL,         'Mr. Ramesh Kumar',   'Active'),
('al-002', 's-0001-0000-0000-000000000005', 'b-002', '2021-07-01', NULL,         'Mr. Ramesh Kumar',   'Active'),
('al-003', 's-0001-0000-0000-000000000009', 'b-003', '2021-07-01', NULL,         'Mr. Ramesh Kumar',   'Active'),
('al-011', 's-0001-0000-0000-000000000011', 'b-019', '2021-07-01', NULL,         'Mr. Ramesh Kumar',   'Active'),
('al-012', 's-0001-0000-0000-000000000012', 'b-004', '2022-07-01', NULL,         'Mr. Ramesh Kumar',   'Active'),
('al-013', 's-0001-0000-0000-000000000003', 'b-020', '2022-07-01', NULL,         'Mr. Ramesh Kumar',   'Active'),
('al-014', 's-0001-0000-0000-000000000014', 'b-006', '2020-07-01', NULL,         'Mr. Ramesh Kumar',   'Active'),
('al-015', 's-0001-0000-0000-000000000007', 'b-022', '2023-07-01', NULL,         'Mr. Ramesh Kumar',   'Active'),
('al-016', 's-0001-0000-0000-000000000013', 'b-024', '2023-07-01', NULL,         'Mr. Ramesh Kumar',   'Active'),
('al-017', 's-0001-0000-0000-000000000026', 'b-027', '2022-07-01', NULL,         'Mr. Ramesh Kumar',   'Active'),
-- Inactive allocation (student left)
('al-018', 's-0001-0000-0000-000000000015', 'b-028', '2022-07-01', '2024-01-15', 'Mr. Ramesh Kumar',   'Inactive'),
-- Girls Hostel
('al-004', 's-0001-0000-0000-000000000002', 'b-007', '2021-07-01', NULL,         'Mrs. Priya Nair',    'Active'),
('al-005', 's-0001-0000-0000-000000000004', 'b-008', '2022-07-01', NULL,         'Mrs. Priya Nair',    'Active'),
('al-006', 's-0001-0000-0000-000000000006', 'b-009', '2020-07-01', NULL,         'Mrs. Priya Nair',    'Active'),
('al-007', 's-0001-0000-0000-000000000008', 'b-011', '2023-07-01', NULL,         'Mrs. Priya Nair',    'Active'),
('al-019', 's-0001-0000-0000-000000000016', 'b-032', '2021-07-01', NULL,         'Mrs. Priya Nair',    'Active'),
('al-020', 's-0001-0000-0000-000000000017', 'b-033', '2022-07-01', NULL,         'Mrs. Priya Nair',    'Active'),
('al-021', 's-0001-0000-0000-000000000018', 'b-034', '2023-07-01', NULL,         'Mrs. Priya Nair',    'Active'),
('al-022', 's-0001-0000-0000-000000000019', 'b-037', '2020-07-01', NULL,         'Mrs. Priya Nair',    'Active'),
('al-023', 's-0001-0000-0000-000000000030', 'b-038', '2023-07-01', NULL,         'Mrs. Priya Nair',    'Active'),
('al-024', 's-0001-0000-0000-000000000028', 'b-039', '2020-07-01', NULL,         'Mrs. Priya Nair',    'Active'),
-- Inactive allocation (student left)
('al-025', 's-0001-0000-0000-000000000020', 'b-035', '2022-07-01', '2023-11-30', 'Mrs. Priya Nair',    'Inactive'),
-- Mixed Hostel
('al-008', 's-0001-0000-0000-000000000003', 'b-014', '2022-07-01', NULL,         'Dr. Anand Selvaraj', 'Active'),
('al-009', 's-0001-0000-0000-000000000007', 'b-015', '2023-07-01', NULL,         'Dr. Anand Selvaraj', 'Active'),
('al-010', 's-0001-0000-0000-000000000010', 'b-016', '2022-07-01', NULL,         'Dr. Anand Selvaraj', 'Active'),
('al-026', 's-0001-0000-0000-000000000021', 'b-042', '2021-07-01', NULL,         'Dr. Anand Selvaraj', 'Active'),
('al-027', 's-0001-0000-0000-000000000022', 'b-044', '2022-07-01', NULL,         'Dr. Anand Selvaraj', 'Active'),
('al-028', 's-0001-0000-0000-000000000023', 'b-041', '2023-07-01', NULL,         'Dr. Anand Selvaraj', 'Active'),
('al-029', 's-0001-0000-0000-000000000024', 'b-055', '2020-07-01', NULL,         'Dr. Anand Selvaraj', 'Active'),
('al-030', 's-0001-0000-0000-000000000025', 'b-043', '2021-07-01', NULL,         'Dr. Anand Selvaraj', 'Active'),
('al-031', 's-0001-0000-0000-000000000029', 'b-045', '2022-07-01', NULL,         'Dr. Anand Selvaraj', 'Active'),
('al-032', 's-0001-0000-0000-000000000027', 'b-053', '2023-07-01', NULL,         'Dr. Anand Selvaraj', 'Active'),
('al-033', 's-0001-0000-0000-000000000026', 'b-056', '2022-07-01', NULL,         'Dr. Anand Selvaraj', 'Active'),
('al-034', 's-0001-0000-0000-000000000028', 'b-054', '2020-07-01', NULL,         'Dr. Anand Selvaraj', 'Active');

-- ============================================================
-- feepayment (50+ records — multiple months, mixed statuses)
-- ============================================================
INSERT INTO feepayment (payment_id, student_id, amount_due, paid_amount, semester, fee_month, payment_mode, transaction_id, payment_date, due_date, late_fee, receipt_number, status, approved_by) VALUES
-- Arjun Mehta (s-001) — Sem5, Jan–Apr, partial in Mar
('fp-001',  's-0001-0000-0000-000000000001', 4500.00, 4500.00, 'Sem5', 'Jan-2024', 'UPI',         'TXN100001', '2024-01-03 10:15:00', '2024-01-05', 0,      'RCP-001', 'Paid',    'Mr. Ramesh Kumar'),
('fp-002',  's-0001-0000-0000-000000000001', 4500.00, 4500.00, 'Sem5', 'Feb-2024', 'Net Banking', 'TXN100002', '2024-02-04 11:00:00', '2024-02-05', 0,      'RCP-002', 'Paid',    'Mr. Ramesh Kumar'),
('fp-003',  's-0001-0000-0000-000000000001', 4500.00, 4000.00, 'Sem5', 'Mar-2024', 'Cash',        NULL,        '2024-03-10 09:30:00', '2024-03-05', 200.00, 'RCP-003', 'Partial', 'Mr. Ramesh Kumar'),
('fp-051',  's-0001-0000-0000-000000000001', 4500.00, 0.00,    'Sem5', 'Apr-2024', NULL,          NULL,        NULL,                  '2024-04-05', 0,      NULL,      'Pending', 'Mr. Ramesh Kumar'),
-- Divya Krishnamurthy (s-002) — Sem5, Jan–Apr
('fp-004',  's-0001-0000-0000-000000000002', 4500.00, 4500.00, 'Sem5', 'Jan-2024', 'UPI',         'TXN100004', '2024-01-02 14:00:00', '2024-01-05', 0,      'RCP-004', 'Paid',    'Mrs. Priya Nair'),
('fp-005',  's-0001-0000-0000-000000000002', 4500.00, 0.00,    'Sem5', 'Feb-2024', NULL,          NULL,        NULL,                  '2024-02-05', 0,      NULL,      'Pending', 'Mrs. Priya Nair'),
('fp-052',  's-0001-0000-0000-000000000002', 4500.00, 4500.00, 'Sem5', 'Mar-2024', 'UPI',         'TXN100052', '2024-03-07 10:00:00', '2024-03-05', 100.00, 'RCP-052', 'Paid',    'Mrs. Priya Nair'),
('fp-053',  's-0001-0000-0000-000000000002', 4500.00, 4500.00, 'Sem5', 'Apr-2024', 'Net Banking', 'TXN100053', '2024-04-04 09:00:00', '2024-04-05', 0,      'RCP-053', 'Paid',    'Mrs. Priya Nair'),
-- Rohan Verma (s-003) — Mixed hostel, Sem3
('fp-006',  's-0001-0000-0000-000000000003', 4000.00, 4000.00, 'Sem3', 'Jan-2024', 'Debit Card',  'TXN100006', '2024-01-05 12:00:00', '2024-01-05', 0,      'RCP-006', 'Paid',    'Dr. Anand Selvaraj'),
('fp-054',  's-0001-0000-0000-000000000003', 4000.00, 4000.00, 'Sem3', 'Feb-2024', 'UPI',         'TXN100054', '2024-02-03 08:00:00', '2024-02-05', 0,      'RCP-054', 'Paid',    'Dr. Anand Selvaraj'),
('fp-055',  's-0001-0000-0000-000000000003', 4000.00, 0.00,    'Sem3', 'Mar-2024', NULL,          NULL,        NULL,                  '2024-03-05', 0,      NULL,      'Pending', 'Dr. Anand Selvaraj'),
-- Sneha Iyer (s-004)
('fp-007',  's-0001-0000-0000-000000000004', 4500.00, 4500.00, 'Sem3', 'Jan-2024', 'UPI',         'TXN100007', '2024-01-04 09:00:00', '2024-01-05', 0,      'RCP-007', 'Paid',    'Mrs. Priya Nair'),
('fp-056',  's-0001-0000-0000-000000000004', 4500.00, 4500.00, 'Sem3', 'Feb-2024', 'Cash',        NULL,        '2024-02-05 10:00:00', '2024-02-05', 0,      'RCP-056', 'Paid',    'Mrs. Priya Nair'),
('fp-057',  's-0001-0000-0000-000000000004', 4500.00, 4000.00, 'Sem3', 'Mar-2024', 'UPI',         'TXN100057', '2024-03-14 15:00:00', '2024-03-05', 200.00, 'RCP-057', 'Partial', 'Mrs. Priya Nair'),
-- Karthik Rajan (s-005)
('fp-008',  's-0001-0000-0000-000000000005', 4500.00, 4500.00, 'Sem5', 'Jan-2024', 'Net Banking', 'TXN100008', '2024-01-06 16:00:00', '2024-01-05', 100.00, 'RCP-008', 'Paid',    'Mr. Ramesh Kumar'),
('fp-058',  's-0001-0000-0000-000000000005', 4500.00, 4500.00, 'Sem5', 'Feb-2024', 'UPI',         'TXN100058', '2024-02-04 14:00:00', '2024-02-05', 0,      'RCP-058', 'Paid',    'Mr. Ramesh Kumar'),
('fp-059',  's-0001-0000-0000-000000000005', 4500.00, 4500.00, 'Sem5', 'Mar-2024', 'UPI',         'TXN100059', '2024-03-04 11:00:00', '2024-03-05', 0,      'RCP-059', 'Paid',    'Mr. Ramesh Kumar'),
-- Meera Subramanian (s-006)
('fp-009',  's-0001-0000-0000-000000000006', 4500.00, 4500.00, 'Sem7', 'Jan-2024', 'UPI',         'TXN100009', '2024-01-03 13:00:00', '2024-01-05', 0,      'RCP-009', 'Paid',    'Mrs. Priya Nair'),
('fp-060',  's-0001-0000-0000-000000000006', 4500.00, 4500.00, 'Sem7', 'Feb-2024', 'Net Banking', 'TXN100060', '2024-02-05 09:00:00', '2024-02-05', 0,      'RCP-060', 'Paid',    'Mrs. Priya Nair'),
-- Vikram Patel (s-007) — Pending (new student)
('fp-010',  's-0001-0000-0000-000000000007', 5000.00, 0.00,    'Sem1', 'Jan-2024', NULL,          NULL,        NULL,                  '2024-01-05', 0,      NULL,      'Pending', 'Dr. Anand Selvaraj'),
('fp-061',  's-0001-0000-0000-000000000007', 5000.00, 0.00,    'Sem1', 'Feb-2024', NULL,          NULL,        NULL,                  '2024-02-05', 0,      NULL,      'Pending', 'Dr. Anand Selvaraj'),
-- Lakshmi Venkatesh (s-008)
('fp-062',  's-0001-0000-0000-000000000008', 4500.00, 4500.00, 'Sem1', 'Jan-2024', 'UPI',         'TXN100062', '2024-01-04 12:00:00', '2024-01-05', 0,      'RCP-062', 'Paid',    'Mrs. Priya Nair'),
('fp-063',  's-0001-0000-0000-000000000008', 4500.00, 4500.00, 'Sem1', 'Feb-2024', 'Cash',        NULL,        '2024-02-05 10:00:00', '2024-02-05', 0,      'RCP-063', 'Paid',    'Mrs. Priya Nair'),
-- Suresh Babu (s-009)
('fp-011',  's-0001-0000-0000-000000000009', 4500.00, 4500.00, 'Sem5', 'Jan-2024', 'UPI',         'TXN100011', '2024-01-04 11:30:00', '2024-01-05', 0,      'RCP-011', 'Paid',    'Mr. Ramesh Kumar'),
('fp-064',  's-0001-0000-0000-000000000009', 4500.00, 4500.00, 'Sem5', 'Feb-2024', 'Net Banking', 'TXN100064', '2024-02-03 10:00:00', '2024-02-05', 0,      'RCP-064', 'Paid',    'Mr. Ramesh Kumar'),
('fp-065',  's-0001-0000-0000-000000000009', 4500.00, 4500.00, 'Sem5', 'Mar-2024', 'UPI',         'TXN100065', '2024-03-05 08:30:00', '2024-03-05', 0,      'RCP-065', 'Paid',    'Mr. Ramesh Kumar'),
-- Anjali Sharma (s-010)
('fp-012',  's-0001-0000-0000-000000000010', 4000.00, 4000.00, 'Sem3', 'Jan-2024', 'Cash',        NULL,        '2024-01-05 10:00:00', '2024-01-05', 0,      'RCP-012', 'Paid',    'Dr. Anand Selvaraj'),
('fp-066',  's-0001-0000-0000-000000000010', 4000.00, 4000.00, 'Sem3', 'Feb-2024', 'UPI',         'TXN100066', '2024-02-04 09:30:00', '2024-02-05', 0,      'RCP-066', 'Paid',    'Dr. Anand Selvaraj'),
-- Praveen Natarajan (s-011)
('fp-067',  's-0001-0000-0000-000000000011', 4500.00, 4500.00, 'Sem5', 'Jan-2024', 'UPI',         'TXN100067', '2024-01-04 10:00:00', '2024-01-05', 0,      'RCP-067', 'Paid',    'Mr. Ramesh Kumar'),
('fp-068',  's-0001-0000-0000-000000000011', 4500.00, 4500.00, 'Sem5', 'Feb-2024', 'UPI',         'TXN100068', '2024-02-05 09:00:00', '2024-02-05', 0,      'RCP-068', 'Paid',    'Mr. Ramesh Kumar'),
('fp-069',  's-0001-0000-0000-000000000011', 4500.00, 0.00,    'Sem5', 'Mar-2024', NULL,          NULL,        NULL,                  '2024-03-05', 0,      NULL,      'Pending', 'Mr. Ramesh Kumar'),
-- Harish Balaji (s-012)
('fp-070',  's-0001-0000-0000-000000000012', 4500.00, 4500.00, 'Sem3', 'Jan-2024', 'Debit Card',  'TXN100070', '2024-01-05 14:00:00', '2024-01-05', 0,      'RCP-070', 'Paid',    'Mr. Ramesh Kumar'),
('fp-071',  's-0001-0000-0000-000000000012', 4500.00, 4500.00, 'Sem3', 'Feb-2024', 'UPI',         'TXN100071', '2024-02-04 13:00:00', '2024-02-05', 0,      'RCP-071', 'Paid',    'Mr. Ramesh Kumar'),
-- Priya Ramalingam (s-016)
('fp-072',  's-0001-0000-0000-000000000016', 4500.00, 4500.00, 'Sem5', 'Jan-2024', 'UPI',         'TXN100072', '2024-01-03 11:00:00', '2024-01-05', 0,      'RCP-072', 'Paid',    'Mrs. Priya Nair'),
('fp-073',  's-0001-0000-0000-000000000016', 4500.00, 4500.00, 'Sem5', 'Feb-2024', 'Net Banking', 'TXN100073', '2024-02-04 10:00:00', '2024-02-05', 0,      'RCP-073', 'Paid',    'Mrs. Priya Nair'),
-- Vishnu Prabhakaran (s-021)
('fp-074',  's-0001-0000-0000-000000000021', 5000.00, 5000.00, 'Sem5', 'Jan-2024', 'UPI',         'TXN100074', '2024-01-04 09:30:00', '2024-01-05', 0,      'RCP-074', 'Paid',    'Dr. Anand Selvaraj'),
('fp-075',  's-0001-0000-0000-000000000021', 5000.00, 5000.00, 'Sem5', 'Feb-2024', 'UPI',         'TXN100075', '2024-02-05 08:00:00', '2024-02-05', 0,      'RCP-075', 'Paid',    'Dr. Anand Selvaraj'),
-- Balaji Selvakumar (s-025)
('fp-076',  's-0001-0000-0000-000000000025', 5000.00, 5000.00, 'Sem5', 'Jan-2024', 'Cash',        NULL,        '2024-01-04 15:00:00', '2024-01-05', 0,      'RCP-076', 'Paid',    'Dr. Anand Selvaraj'),
('fp-077',  's-0001-0000-0000-000000000025', 5000.00, 4500.00, 'Sem5', 'Feb-2024', 'Cash',        NULL,        '2024-02-10 14:00:00', '2024-02-05', 200.00, 'RCP-077', 'Partial', 'Dr. Anand Selvaraj'),
-- Deepika Mohan (s-024) — senior student
('fp-078',  's-0001-0000-0000-000000000024', 6500.00, 6500.00, 'Sem7', 'Jan-2024', 'Net Banking', 'TXN100078', '2024-01-03 10:00:00', '2024-01-05', 0,      'RCP-078', 'Paid',    'Dr. Anand Selvaraj'),
('fp-079',  's-0001-0000-0000-000000000024', 6500.00, 6500.00, 'Sem7', 'Feb-2024', 'Net Banking', 'TXN100079', '2024-02-04 10:00:00', '2024-02-05', 0,      'RCP-079', 'Paid',    'Dr. Anand Selvaraj');

-- ============================================================
-- laundry
-- ============================================================
INSERT INTO laundry (laundry_id, laundry_name, hostel_id, vendor_name, vendor_phone, price_per_piece, price_per_kg, timing_open, timing_close, contract_start, contract_end) VALUES
('lau-001', 'CleanWash Laundry',    'h-0001-0000-0000-000000000001', 'CleanWash Pvt Ltd',  '9841500001', 15.00, 60.00, '08:00:00', '19:00:00', '2023-01-01', '2025-12-31'),
('lau-002', 'FreshLinen Service',   'h-0001-0000-0000-000000000002', 'FreshLinen Co',      '9841500002', 12.00, 50.00, '07:00:00', '20:00:00', '2023-06-01', '2025-05-31'),
('lau-003', 'Horizon Quick Wash',   'h-0001-0000-0000-000000000003', 'QuickWash Services', '9841500003', 14.00, 55.00, '07:30:00', '19:30:00', '2024-01-01', '2025-12-31');

-- ============================================================
-- laundry_service_type
-- ============================================================
INSERT INTO laundry_service_type (laundry_id, service_type) VALUES
('lau-001', 'Wash'),
('lau-001', 'Iron'),
('lau-001', 'Dry Clean'),
('lau-002', 'Wash'),
('lau-002', 'Iron'),
('lau-003', 'Wash'),
('lau-003', 'Iron'),
('lau-003', 'Dry Clean');

-- ============================================================
-- laundry_operating_day
-- ============================================================
INSERT INTO laundry_operating_day (laundry_id, day_of_week) VALUES
('lau-001', 'Monday'), ('lau-001', 'Tuesday'), ('lau-001', 'Wednesday'),
('lau-001', 'Thursday'), ('lau-001', 'Friday'), ('lau-001', 'Saturday'),
('lau-002', 'Monday'), ('lau-002', 'Tuesday'), ('lau-002', 'Wednesday'),
('lau-002', 'Thursday'), ('lau-002', 'Friday'), ('lau-002', 'Saturday'), ('lau-002', 'Sunday'),
('lau-003', 'Monday'), ('lau-003', 'Tuesday'), ('lau-003', 'Wednesday'),
('lau-003', 'Thursday'), ('lau-003', 'Friday'), ('lau-003', 'Saturday');

-- ============================================================
-- complaint (20 complaints — all types, priorities, statuses)
-- ============================================================
INSERT INTO complaint (complaint_id, student_id, room_id, technician_id, description, complaint_type, priority, status, resolved_at, resolution_notes, cost_incurred) VALUES
('cp-001', 's-0001-0000-0000-000000000001', 'r-0001-0000-0000-000000000001', 't-001', 'Water leaking from bathroom pipe',             'Plumbing',     'High',   'Resolved',    '2024-01-12 14:00:00', 'Pipe joint replaced',               350.00),
('cp-002', 's-0001-0000-0000-000000000005', 'r-0001-0000-0000-000000000001', 't-004', 'Ceiling fan making noise',                     'Electrical',   'Medium', 'Resolved',    '2024-01-14 11:00:00', 'Fan bearing replaced',              200.00),
('cp-003', 's-0001-0000-0000-000000000002', 'r-0001-0000-0000-000000000004', 't-002', 'Door latch broken',                            'Carpentry',    'Low',    'Resolved',    '2024-01-13 16:00:00', 'Latch repaired',                     80.00),
('cp-004', 's-0001-0000-0000-000000000006', 'r-0001-0000-0000-000000000005', NULL,    'Window glass cracked',                         'Maintenance',  'Medium', 'Open',        NULL,                  NULL,                                  0.00),
('cp-005', 's-0001-0000-0000-000000000003', 'r-0001-0000-0000-000000000007', 't-003', 'AC not cooling properly',                      'AC & Appliances','High', 'In Progress', NULL,                  'Gas refill scheduled',                0.00),
('cp-006', 's-0001-0000-0000-000000000009', 'r-0001-0000-0000-000000000002', 't-001', 'Hot water not available in morning',           'Plumbing',     'Medium', 'Open',        NULL,                  NULL,                                  0.00),
('cp-007', 's-0001-0000-0000-000000000007', 'r-0001-0000-0000-000000000007', 't-003', 'Room light flickering intermittently',         'Electrical',   'Low',    'Resolved',    '2024-01-16 10:00:00', 'Light tube replaced',                60.00),
('cp-008', 's-0001-0000-0000-000000000011', 'r-0001-0000-0000-000000000010', 't-004', 'Washroom tap dripping continuously',           'Plumbing',     'Low',    'Resolved',    '2024-01-18 15:00:00', 'Washer replaced',                    40.00),
('cp-009', 's-0001-0000-0000-000000000012', 'r-0001-0000-0000-000000000011', 't-005', 'Power socket sparking near desk',              'Electrical',   'High',   'Resolved',    '2024-01-19 09:00:00', 'Socket replaced, wiring checked',   450.00),
('cp-010', 's-0001-0000-0000-000000000016', 'r-0001-0000-0000-000000000016', 't-002', 'Wardrobe door hinge broken',                   'Carpentry',    'Low',    'Resolved',    '2024-01-20 14:00:00', 'Hinge replaced',                     60.00),
('cp-011', 's-0001-0000-0000-000000000017', 'r-0001-0000-0000-000000000017', NULL,    'Ceiling paint peeling off',                    'Maintenance',  'Low',    'Open',        NULL,                  NULL,                                  0.00),
('cp-012', 's-0001-0000-0000-000000000004', 'r-0001-0000-0000-000000000004', 't-005', 'Bathroom drain choked',                        'Plumbing',     'High',   'Resolved',    '2024-01-22 11:00:00', 'Drain unclogged, cleaned',          120.00),
('cp-013', 's-0001-0000-0000-000000000021', 'r-0001-0000-0000-000000000020', 't-006', 'Cockroach infestation reported in room',       'Maintenance',  'High',   'Resolved',    '2024-01-24 16:00:00', 'Pest control sprayed',              300.00),
('cp-014', 's-0001-0000-0000-000000000022', 'r-0001-0000-0000-000000000021', 't-003', 'AC remote not working',                        'AC & Appliances','Low',  'Resolved',    '2024-01-25 10:00:00', 'Batteries replaced',                 20.00),
('cp-015', 's-0001-0000-0000-000000000025', 'r-0001-0000-0000-000000000007', 't-008', 'Water seepage from ceiling after rain',        'Maintenance',  'High',   'In Progress', NULL,                  'Roof assessment pending',             0.00),
('cp-016', 's-0001-0000-0000-000000000029', 'r-0001-0000-0000-000000000021', 't-006', 'Mosquito menace in common corridor',           'Maintenance',  'Medium', 'Resolved',    '2024-02-01 14:00:00', 'Fogging done in corridor',          250.00),
('cp-017', 's-0001-0000-0000-000000000014', 'r-0001-0000-0000-000000000003', 't-001', 'Geyser not heating water',                     'Electrical',   'Medium', 'Resolved',    '2024-02-03 11:00:00', 'Heating element replaced',          550.00),
('cp-018', 's-0001-0000-0000-000000000019', 'r-0001-0000-0000-000000000018', 't-005', 'Window latch stuck, cannot open',              'Carpentry',    'Low',    'Resolved',    '2024-02-05 09:30:00', 'Latch oiled and adjusted',           30.00),
('cp-019', 's-0001-0000-0000-000000000024', 'r-0001-0000-0000-000000000026', 't-008', 'Main door lock cylinder jammed',               'Carpentry',    'High',   'Resolved',    '2024-02-08 10:00:00', 'Lock cylinder replaced',            280.00),
('cp-020', 's-0001-0000-0000-000000000028', 'r-0001-0000-0000-000000000025', NULL,    'Study table surface cracked, needs replacement','Carpentry',   'Low',    'Open',        NULL,                  NULL,                                  0.00);

-- ============================================================
-- visitor_log (20 visitors, varied purposes, guard names)
-- ============================================================
INSERT INTO visitor_log (visitor_id, visitor_name, visitor_phone, id_proof_type, id_proof_number, student_id, room_id, relation_to_student, purpose, entry_time, exit_time, guard_name, gate_number, approved_by) VALUES
('vl-001', 'Prakash Mehta',       '9840200001', 'Aadhaar',   'XXXX-XXXX-0001', 's-0001-0000-0000-000000000001', 'r-0001-0000-0000-000000000001', 'Father',  'Monthly Visit',          '2024-01-13 10:00:00', '2024-01-13 13:00:00', 'Murugan',  'G1', 'Mr. Ramesh Kumar'),
('vl-002', 'Sunita Mehta',        '9840200002', 'Aadhaar',   'XXXX-XXXX-0002', 's-0001-0000-0000-000000000001', 'r-0001-0000-0000-000000000001', 'Mother',  'Monthly Visit',          '2024-01-13 10:00:00', '2024-01-13 13:00:00', 'Murugan',  'G1', 'Mr. Ramesh Kumar'),
('vl-003', 'Krishnamurthy T',     '9840200003', 'Voter ID',  'VOTER-TN-0003',  's-0001-0000-0000-000000000002', 'r-0001-0000-0000-000000000004', 'Father',  'Fee Discussion',         '2024-01-14 11:30:00', '2024-01-14 13:00:00', 'Sumathi',  'G2', 'Mrs. Priya Nair'),
('vl-004', 'Ankit Mehta',         '9840299001', 'College ID','COLL-001',       's-0001-0000-0000-000000000001', NULL,                           'Friend',  'Group Study',            '2024-01-15 14:00:00', '2024-01-15 17:00:00', 'Rajan',    'G1', 'Mr. Ramesh Kumar'),
('vl-005', 'Ramesh Verma',        '9840200004', 'Aadhaar',   'XXXX-XXXX-0004', 's-0001-0000-0000-000000000003', 'r-0001-0000-0000-000000000007', 'Father',  'Festival Visit',         '2024-01-16 09:00:00', '2024-01-16 18:00:00', 'Babu',     'G3', 'Dr. Anand Selvaraj'),
('vl-006', 'Priya Sharma',        '9840299002', 'Aadhaar',   'XXXX-XXXX-0006', 's-0001-0000-0000-000000000010', 'r-0001-0000-0000-000000000008', 'Sister',  'Document Delivery',      '2024-01-17 15:00:00', '2024-01-17 15:45:00', 'Ravi',     'G3', 'Dr. Anand Selvaraj'),
('vl-007', 'Natarajan P',         '9840200013', 'Aadhaar',   'XXXX-XXXX-0013', 's-0001-0000-0000-000000000011', 'r-0001-0000-0000-000000000010', 'Father',  'Health Check-in',        '2024-01-18 10:00:00', '2024-01-18 12:00:00', 'Murugan',  'G1', 'Mr. Ramesh Kumar'),
('vl-008', 'Balaji H',            '9840200014', 'Voter ID',  'VOTER-TN-0014',  's-0001-0000-0000-000000000012', 'r-0001-0000-0000-000000000011', 'Father',  'Monthly Visit',          '2024-01-19 11:00:00', '2024-01-19 14:00:00', 'Rajan',    'G1', 'Mr. Ramesh Kumar'),
('vl-009', 'Suresh Iyer',         '9840200005', 'Aadhaar',   'XXXX-XXXX-0005', 's-0001-0000-0000-000000000004', 'r-0001-0000-0000-000000000004', 'Father',  'Fee Payment Support',    '2024-01-20 14:30:00', '2024-01-20 16:00:00', 'Sumathi',  'G2', 'Mrs. Priya Nair'),
('vl-010', 'Ramalingam V',        '9840200018', 'Aadhaar',   'XXXX-XXXX-0018', 's-0001-0000-0000-000000000016', 'r-0001-0000-0000-000000000016', 'Father',  'Monthly Visit',          '2024-01-21 09:30:00', '2024-01-21 12:30:00', 'Sumathi',  'G2', 'Mrs. Priya Nair'),
('vl-011', 'Gopalan R',           '9840200021', 'Passport',  'PASS-IN-00021',  's-0001-0000-0000-000000000019', 'r-0001-0000-0000-000000000018', 'Father',  'Document Collection',    '2024-01-22 15:00:00', '2024-01-22 15:30:00', 'Sumathi',  'G2', 'Mrs. Priya Nair'),
('vl-012', 'Prabhakaran V',       '9840200023', 'Aadhaar',   'XXXX-XXXX-0023', 's-0001-0000-0000-000000000021', 'r-0001-0000-0000-000000000020', 'Father',  'Complaint Followup',     '2024-01-24 11:00:00', '2024-01-24 12:30:00', 'Babu',     'G3', 'Dr. Anand Selvaraj'),
('vl-013', 'Selvakumar B',        '9840200027', 'Voter ID',  'VOTER-TN-0027',  's-0001-0000-0000-000000000025', 'r-0001-0000-0000-000000000007', 'Father',  'Monthly Visit',          '2024-01-25 10:00:00', '2024-01-25 13:00:00', 'Ravi',     'G3', 'Dr. Anand Selvaraj'),
('vl-014', 'Mohan D',             '9840200026', 'Aadhaar',   'XXXX-XXXX-0026', 's-0001-0000-0000-000000000024', 'r-0001-0000-0000-000000000026', 'Father',  'Monthly Visit',          '2024-01-26 09:00:00', '2024-01-26 13:00:00', 'Babu',     'G3', 'Dr. Anand Selvaraj'),
('vl-015', 'Rajan K',             '9840200007', 'College ID','COLL-002',       's-0001-0000-0000-000000000005', 'r-0001-0000-0000-000000000001', 'Father',  'Festival Visit',         '2024-02-01 09:00:00', '2024-02-01 18:00:00', 'Murugan',  'G1', 'Mr. Ramesh Kumar'),
('vl-016', 'Anand Kumar',         '9840299010', 'College ID','COLL-003',       's-0001-0000-0000-000000000013', NULL,                           'Friend',  'Project Work',           '2024-02-02 13:00:00', '2024-02-02 17:00:00', 'Rajan',    'G1', 'Mr. Ramesh Kumar'),
('vl-017', 'Venkataramani S',     '9840200030', 'Passport',  'PASS-IN-00030',  's-0001-0000-0000-000000000028', 'r-0001-0000-0000-000000000025', 'Father',  'Emergency Visit',        '2024-02-04 08:00:00', '2024-02-04 10:00:00', 'Babu',     'G3', 'Dr. Anand Selvaraj'),
('vl-018', 'Sundarajan K',        '9840200019', 'Aadhaar',   'XXXX-XXXX-0019', 's-0001-0000-0000-000000000017', 'r-0001-0000-0000-000000000016', 'Mother',  'Monthly Visit',          '2024-02-06 10:00:00', '2024-02-06 13:30:00', 'Sumathi',  'G2', 'Mrs. Priya Nair'),
('vl-019', 'Babu S',              '9840200011', 'Voter ID',  'VOTER-TN-0011',  's-0001-0000-0000-000000000009', 'r-0001-0000-0000-000000000002', 'Father',  'Fee Payment',            '2024-02-07 14:00:00', '2024-02-07 15:30:00', 'Murugan',  'G1', 'Mr. Ramesh Kumar'),
('vl-020', 'Ravi K',              '9840200032', 'Aadhaar',   'XXXX-XXXX-0032', 's-0001-0000-0000-000000000030', 'r-0001-0000-0000-000000000019', 'Father',  'Monthly Visit',          '2024-02-10 10:30:00', '2024-02-10 13:00:00', 'Sumathi',  'G2', 'Mrs. Priya Nair');

SET FOREIGN_KEY_CHECKS = 1;