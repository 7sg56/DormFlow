# Hostel Management System -- ER Diagram

## Schema: 32 Tables | 3NF | MySQL 8.0+ | UUID v4 Primary Keys

> Redundant hostel_id / room_id columns removed from activity tables (allocation, feepayment, complaint, accesslog, visitor_log, emergency_request). Transitive dependencies eliminated. Derived fields use STORED computed columns.

```mermaid
erDiagram
    hostel {
        CHAR hostel_id PK
        VARCHAR hostel_name
        VARCHAR type
        INT total_floors
        VARCHAR address
        VARCHAR city
        VARCHAR state
        VARCHAR pincode
        YEAR established_year
        VARCHAR registration_no
        VARCHAR warden_name
        VARCHAR warden_phone
        VARCHAR warden_email
        VARCHAR office_phone
        VARCHAR emergency_phone
        DATETIME created_at
        DATETIME updated_at
    }
    student {
        CHAR student_id PK
        VARCHAR reg_no
        VARCHAR first_name
        VARCHAR last_name
        DATE date_of_birth
        VARCHAR gender
        VARCHAR phone_primary
        VARCHAR phone_secondary
        VARCHAR email_personal
        VARCHAR email_institutional
        VARCHAR department
        VARCHAR course
        INT academic_year
        INT semester
        VARCHAR blood_group
        TEXT permanent_address
        TEXT current_address
        VARCHAR city
        VARCHAR state
        VARCHAR pincode
        DATE admission_date
        VARCHAR status
        VARCHAR photo_url
        DATETIME created_at
        DATETIME updated_at
    }
    student_guardian {
        CHAR guardian_id PK
        CHAR student_id FK
        VARCHAR guardian_name
        VARCHAR relation
        VARCHAR phone
        VARCHAR email
        TEXT address
        BOOLEAN is_emergency_contact
    }
    room {
        CHAR room_id PK
        VARCHAR room_number
        INT floor
        INT capacity
        VARCHAR room_type
        CHAR hostel_id FK
        DECIMAL monthly_rent
        DECIMAL area_sqft
        VARCHAR facing
        VARCHAR room_condition
        DATE last_cleaned
        DATE last_maintained
        DATETIME created_at
        DATETIME updated_at
    }
    bed {
        CHAR bed_id PK
        VARCHAR bed_number
        CHAR room_id FK
        VARCHAR bed_type
        VARCHAR condition_status
        BOOLEAN occupied
        DATE purchase_date
        DATE last_replaced
        DATETIME created_at
        DATETIME updated_at
    }
    technician {
        CHAR technician_id PK
        VARCHAR name
        VARCHAR specialization
        VARCHAR phone
        VARCHAR email
        TEXT address
        VARCHAR availability
        DATE joining_date
        VARCHAR employment_type
        DECIMAL salary
        VARCHAR vendor_company
        CHAR hostel_id FK
        DATETIME created_at
        DATETIME updated_at
    }
    allocation {
        CHAR allocation_id PK
        CHAR student_id FK
        CHAR bed_id FK
        DATE start_date
        DATE end_date
        VARCHAR allocated_by
        TEXT reason
        VARCHAR status
        DATETIME created_at
        DATETIME updated_at
    }
    feepayment {
        CHAR payment_id PK
        CHAR student_id FK
        DECIMAL amount_due
        DECIMAL paid_amount
        DECIMAL balance_due "STORED computed"
        VARCHAR semester
        VARCHAR fee_month
        VARCHAR payment_mode
        VARCHAR transaction_id
        DATETIME payment_date
        DATE due_date
        DECIMAL late_fee
        VARCHAR receipt_number
        VARCHAR status
        TEXT remarks
        VARCHAR approved_by
        DATETIME created_at
        DATETIME updated_at
    }
    mess {
        CHAR mess_id PK
        VARCHAR mess_name
        VARCHAR mess_type
        CHAR hostel_id FK
        DECIMAL monthly_fee
        INT capacity
        VARCHAR manager_name
        VARCHAR manager_phone
        DECIMAL hygiene_rating
        DATE last_inspection
        VARCHAR license_number
        DATE license_expiry
        VARCHAR timing_breakfast
        VARCHAR timing_lunch
        VARCHAR timing_snacks
        VARCHAR timing_dinner
        DATETIME created_at
        DATETIME updated_at
    }
    mess_subscription {
        CHAR subscription_id PK
        CHAR student_id FK
        CHAR mess_id FK
        DATE start_date
        DATE end_date
        VARCHAR meal_plan
        DECIMAL monthly_charge
        VARCHAR status
        DATETIME created_at
        DATETIME updated_at
    }
    menu {
        CHAR menu_id PK
        CHAR mess_id FK
        VARCHAR day_of_week
        VARCHAR meal_type
        VARCHAR item_name
        VARCHAR item_category
        VARCHAR cuisine_type
        BOOLEAN is_veg
        INT calories_approx
        DATETIME created_at
        DATETIME updated_at
    }
    laundry {
        CHAR laundry_id PK
        VARCHAR laundry_name
        CHAR hostel_id FK
        VARCHAR vendor_name
        VARCHAR vendor_phone
        VARCHAR vendor_email
        DECIMAL price_per_piece
        DECIMAL price_per_kg
        VARCHAR service_types
        VARCHAR operating_days
        TIME timing_open
        TIME timing_close
        DATE contract_start
        DATE contract_end
        DATETIME created_at
        DATETIME updated_at
    }
    laundry_request {
        CHAR request_id PK
        CHAR student_id FK
        CHAR laundry_id FK
        DATE pickup_date
        DATE delivery_date
        TEXT items_description
        INT total_pieces
        DECIMAL total_weight_kg
        DECIMAL total_charge
        VARCHAR service_type
        VARCHAR status
        VARCHAR payment_status
        DATETIME created_at
        DATETIME updated_at
    }
    accesslog {
        CHAR log_id PK
        CHAR student_id FK
        DATETIME entry_time
        DATETIME exit_time
        INT duration_minutes "STORED computed"
        BOOLEAN is_overnight "STORED computed"
        BOOLEAN is_late_entry
        VARCHAR gate_number
        VARCHAR guard_name
        VARCHAR purpose
        TEXT remarks
        DATETIME created_at
    }
    facility {
        CHAR facility_id PK
        VARCHAR facility_name
        VARCHAR facility_type
        CHAR hostel_id FK
        INT capacity
        VARCHAR operating_days
        TIME timing_open
        TIME timing_close
        VARCHAR in_charge_name
        VARCHAR in_charge_phone
        VARCHAR condition_status
        DATE last_maintained
        BOOLEAN is_operational
        DATETIME created_at
        DATETIME updated_at
    }
    facility_booking {
        CHAR booking_id PK
        CHAR facility_id FK
        CHAR student_id FK
        DATE booking_date
        TIME slot_start
        TIME slot_end
        INT duration_minutes "STORED computed"
        VARCHAR purpose
        VARCHAR status
        DATETIME created_at
    }
    complaint {
        CHAR complaint_id PK
        CHAR student_id FK
        CHAR room_id FK
        CHAR technician_id FK
        TEXT description
        VARCHAR complaint_type
        VARCHAR priority
        VARCHAR status
        DATETIME created_at
        DATETIME updated_at
        DATETIME resolved_at
        BOOLEAN is_resolved "STORED computed"
        TEXT resolution_notes
        DECIMAL cost_incurred
    }
    visitor_log {
        CHAR visitor_id PK
        VARCHAR visitor_name
        VARCHAR visitor_phone
        VARCHAR id_proof_type
        VARCHAR id_proof_number
        CHAR student_id FK
        CHAR room_id FK
        VARCHAR relation_to_student
        TEXT purpose
        DATETIME entry_time
        DATETIME exit_time
        INT visit_duration_minutes "STORED computed"
        VARCHAR guard_name
        VARCHAR gate_number
        VARCHAR approved_by
        DATETIME created_at
    }
    notice_board {
        CHAR notice_id PK
        CHAR hostel_id FK
        VARCHAR title
        TEXT content
        VARCHAR category
        VARCHAR target_audience
        VARCHAR posted_by
        DATETIME posted_at
        DATE expiry_date
        VARCHAR attachment_url
    }
    maintenance_schedule {
        CHAR schedule_id PK
        CHAR hostel_id FK
        VARCHAR area_type
        CHAR area_id
        VARCHAR maintenance_type
        DATE scheduled_date
        DATE completed_date
        CHAR technician_id FK
        VARCHAR status
        TEXT notes
        DECIMAL cost
        DATETIME created_at
    }
    store {
        CHAR store_id PK
        VARCHAR store_name
        CHAR hostel_id FK
        VARCHAR manager_name
        VARCHAR manager_phone
        VARCHAR store_type
        TIME timing_open
        TIME timing_close
        BOOLEAN is_operational
        DATETIME created_at
        DATETIME updated_at
    }
    store_purchase {
        CHAR purchase_id PK
        CHAR student_id FK
        CHAR store_id FK
        TEXT item_description
        INT quantity
        DECIMAL total_amount
        VARCHAR payment_mode
        DATETIME purchase_date
    }
    pharmacy {
        CHAR pharmacy_id PK
        VARCHAR pharmacy_name
        VARCHAR address
        VARCHAR pharmacist_name
        VARCHAR pharmacist_phone
        VARCHAR license_number
        DATE license_expiry
        TIME timing_open
        TIME timing_close
        BOOLEAN is_24hr
        BOOLEAN emergency_available
        DATETIME created_at
        DATETIME updated_at
    }
    pharmacy_visit {
        CHAR visit_id PK
        CHAR student_id FK
        CHAR pharmacy_id FK
        DATETIME visit_date
        TEXT prescription_details
        TEXT medicines_issued
        DECIMAL total_cost
        VARCHAR payment_status
    }
    restaurant {
        CHAR restaurant_id PK
        VARCHAR restaurant_name
        VARCHAR location
        VARCHAR cuisine_type
        VARCHAR manager_name
        VARCHAR manager_phone
        INT capacity
        TIME timing_open
        TIME timing_close
        DECIMAL avg_cost_per_meal
        DECIMAL rating
        BOOLEAN is_operational
        DATETIME created_at
        DATETIME updated_at
    }
    gym {
        CHAR gym_id PK
        VARCHAR gym_name
        VARCHAR location
        VARCHAR trainer_name
        VARCHAR trainer_phone
        INT capacity
        DECIMAL monthly_fee
        TEXT equipment_summary
        TIME timing_open
        TIME timing_close
        BOOLEAN is_operational
        DATETIME created_at
        DATETIME updated_at
    }
    gym_membership {
        CHAR membership_id PK
        CHAR student_id FK
        CHAR gym_id FK
        DATE start_date
        DATE end_date
        DECIMAL fee_paid
        VARCHAR status
        DATETIME created_at
        DATETIME updated_at
    }
    ambulance_service {
        CHAR ambulance_id PK
        VARCHAR vehicle_number
        VARCHAR driver_name
        VARCHAR driver_phone
        VARCHAR hospital_name
        VARCHAR hospital_address
        VARCHAR hospital_phone
        BOOLEAN is_available
        DATE last_service_date
        DATETIME created_at
        DATETIME updated_at
    }
    emergency_request {
        CHAR request_id PK
        CHAR student_id FK
        CHAR ambulance_id FK
        DATETIME request_time
        DATETIME pickup_time
        DATETIME hospital_reached_time
        INT response_minutes "STORED computed"
        VARCHAR emergency_type
        TEXT description
        VARCHAR status
        TEXT notes
        DATETIME created_at
    }
    auth_user {
        CHAR user_id PK
        CHAR student_id FK
        VARCHAR email
        VARCHAR password_hash
        ENUM role "admin | warden | student"
        BOOLEAN is_active
        DATETIME last_login
        VARCHAR refresh_token
        DATETIME created_at
        DATETIME updated_at
    }
    audit_log {
        CHAR log_id PK
        CHAR user_id FK
        VARCHAR table_name
        CHAR record_id
        ENUM action "INSERT | UPDATE | DELETE"
        JSON old_values
        JSON new_values
        VARCHAR ip_address
        VARCHAR user_agent
        DATETIME created_at
    }
    idempotency_key {
        VARCHAR idempotency_key PK
        CHAR user_id FK
        VARCHAR request_path
        VARCHAR request_hash
        INT response_code
        JSON response_body
        DATETIME created_at
        DATETIME expires_at
    }

    %% ---- Relationships (3NF) ----

    %% hostel owns rooms, mess, laundry, facility, store, notices, maintenance
    hostel ||--o{ room : "contains"
    hostel ||--o{ mess : "runs"
    hostel ||--o{ laundry : "provides"
    hostel ||--o{ facility : "offers"
    hostel ||--o{ store : "has"
    hostel ||--o{ notice_board : "posts"
    hostel ||--o{ maintenance_schedule : "plans"
    hostel ||--o{ technician : "employs"

    %% student relationships
    student ||--o{ student_guardian : "has"
    student ||--o{ allocation : "assigned"
    student ||--o{ feepayment : "pays"
    student ||--o{ mess_subscription : "subscribes"
    student ||--o{ laundry_request : "requests"
    student ||--o{ accesslog : "logs"
    student ||--o{ facility_booking : "books"
    student ||--o{ complaint : "raises"
    student ||--o{ visitor_log : "visited_by"
    student ||--o{ store_purchase : "buys"
    student ||--o{ pharmacy_visit : "visits"
    student ||--o{ gym_membership : "enrolls"
    student ||--o{ emergency_request : "calls"

    %% room / bed chain (3NF path: bed -> room -> hostel)
    room ||--o{ bed : "contains"
    bed ||--o{ allocation : "reserved"
    room ||--o{ complaint : "about"
    room ||--o{ visitor_log : "at"

    %% technician
    technician ||--o{ complaint : "resolves"
    technician ||--o{ maintenance_schedule : "executes"

    %% mess / menu
    mess ||--o{ mess_subscription : "has"
    mess ||--o{ menu : "serves"

    %% other service entities
    laundry ||--o{ laundry_request : "receives"
    facility ||--o{ facility_booking : "reserved"
    store ||--o{ store_purchase : "sells"
    pharmacy ||--o{ pharmacy_visit : "records"
    gym ||--o{ gym_membership : "enrolls"
    ambulance_service ||--o{ emergency_request : "dispatched"

    %% auth / audit
    student ||--o| auth_user : "authenticates"
    auth_user ||--o{ audit_log : "performed"
    auth_user ||--o{ idempotency_key : "owns"
```
