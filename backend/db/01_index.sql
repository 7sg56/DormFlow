-- ============================================================
-- HOSTEL MANAGEMENT SYSTEM — INDEXES (Simplified)
-- MySQL 8.0+ | Run AFTER 00_init.sql
-- ============================================================

USE hostel_mgmt;

-- hostel
CREATE INDEX idx_hostel_pincode ON hostel (pincode);

-- hostel_warden
CREATE INDEX idx_hw_hostel_active ON hostel_warden (hostel_id, is_active);

-- student
CREATE INDEX idx_student_reg_no ON student (reg_no);
CREATE INDEX idx_student_dept_course ON student (department, course);
CREATE INDEX idx_student_status ON student (status);
CREATE INDEX idx_student_pincode ON student (pincode);
CREATE INDEX idx_student_mess ON student (mess_id);

-- room
CREATE INDEX idx_room_hostel ON room (hostel_id);
CREATE INDEX idx_room_type_rent ON room (room_type, monthly_rent);

-- bed
CREATE INDEX idx_bed_room_occupied ON bed (room_id, occupied);

-- technician_specialization  [4NF]
CREATE INDEX idx_ts_specialization ON technician_specialization (specialization_id);

-- allocation
CREATE INDEX idx_alloc_student_status ON allocation (student_id, status);
CREATE INDEX idx_alloc_bed_status ON allocation (bed_id, status);
CREATE INDEX idx_alloc_dates ON allocation (start_date, end_date);

-- feepayment
CREATE INDEX idx_fp_student ON feepayment (student_id);
CREATE INDEX idx_fp_due_date_status ON feepayment (due_date, status);
CREATE INDEX idx_fp_month_semester ON feepayment (fee_month, semester);

-- laundry_request removed — no indexes needed

-- complaint
CREATE INDEX idx_comp_tech_status ON complaint (technician_id, status);
CREATE INDEX idx_comp_priority_status ON complaint (priority, status);

-- visitor_log
CREATE INDEX idx_vl_student_entry ON visitor_log (student_id, entry_time);