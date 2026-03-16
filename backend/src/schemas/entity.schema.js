const { z } = require('zod');

const createFeeSchema = z.object({
  student_id: z.string().uuid(),
  amount_due: z.number().min(0),
  paid_amount: z.number().min(0).default(0),
  semester: z.string().max(20).optional(),
  fee_month: z.string().max(20).optional(),
  payment_mode: z.string().max(50).optional(),
  transaction_id: z.string().max(100).optional(),
  payment_date: z.coerce.date().optional(),
  due_date: z.coerce.date().optional(),
  late_fee: z.number().min(0).default(0),
  receipt_number: z.string().max(100).optional(),
  status: z.enum(['Pending', 'Paid', 'Partial', 'Overdue']).default('Pending'),
  remarks: z.string().optional(),
  approved_by: z.string().max(100).optional(),
});

const updateFeeSchema = createFeeSchema.partial();

const createComplaintSchema = z.object({
  student_id: z.string().uuid(),
  room_id: z.string().uuid().optional(),
  technician_id: z.string().uuid().optional(),
  description: z.string().min(1),
  complaint_type: z.string().max(100).optional(),
  priority: z.enum(['Low', 'Medium', 'High', 'Critical']).default('Medium'),
  status: z.enum(['Open', 'In Progress', 'Resolved', 'Closed']).default('Open'),
});

const updateComplaintSchema = z.object({
  technician_id: z.string().uuid().optional(),
  priority: z.enum(['Low', 'Medium', 'High', 'Critical']).optional(),
  status: z.enum(['Open', 'In Progress', 'Resolved', 'Closed']).optional(),
  resolved_at: z.coerce.date().optional(),
  resolution_notes: z.string().optional(),
  cost_incurred: z.number().min(0).optional(),
});

const createMessSchema = z.object({
  mess_name: z.string().min(1).max(100),
  mess_type: z.string().max(50).optional(),
  hostel_id: z.string().uuid(),
  monthly_fee: z.number().min(0).optional(),
  capacity: z.number().int().min(1).optional(),
  manager_name: z.string().max(100).optional(),
  manager_phone: z.string().max(15).optional(),
  hygiene_rating: z.number().min(0).max(5).optional(),
  timing_breakfast: z.string().max(50).optional(),
  timing_lunch: z.string().max(50).optional(),
  timing_snacks: z.string().max(50).optional(),
  timing_dinner: z.string().max(50).optional(),
});
const updateMessSchema = createMessSchema.partial();

const createMenuSchema = z.object({
  mess_id: z.string().uuid(),
  day_of_week: z.enum(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']),
  meal_type: z.enum(['Breakfast', 'Lunch', 'Snacks', 'Dinner']),
  item_name: z.string().min(1).max(100),
  item_category: z.string().max(50).optional(),
  cuisine_type: z.string().max(50).optional(),
  is_veg: z.boolean().default(true),
  calories_approx: z.number().int().min(0).optional(),
});
const updateMenuSchema = createMenuSchema.partial();

const createFacilitySchema = z.object({
  facility_name: z.string().min(1).max(100),
  facility_type: z.string().max(50).optional(),
  hostel_id: z.string().uuid(),
  capacity: z.number().int().min(1).optional(),
  operating_days: z.string().max(100).optional(),
  timing_open: z.string().optional(),
  timing_close: z.string().optional(),
  in_charge_name: z.string().max(100).optional(),
  in_charge_phone: z.string().max(15).optional(),
  condition_status: z.string().max(50).default('Good'),
  is_operational: z.boolean().default(true),
});
const updateFacilitySchema = createFacilitySchema.partial();

const createFacilityBookingSchema = z.object({
  facility_id: z.string().uuid(),
  student_id: z.string().uuid(),
  booking_date: z.coerce.date(),
  slot_start: z.string(),
  slot_end: z.string(),
  purpose: z.string().max(100).optional(),
  status: z.enum(['Confirmed', 'Cancelled', 'Completed']).default('Confirmed'),
});
const updateFacilityBookingSchema = createFacilityBookingSchema.partial();

const createAccessLogSchema = z.object({
  student_id: z.string().uuid(),
  entry_time: z.coerce.date(),
  exit_time: z.coerce.date().optional(),
  is_late_entry: z.boolean().default(false),
  gate_number: z.string().max(20).optional(),
  guard_name: z.string().max(100).optional(),
  purpose: z.string().max(100).optional(),
  remarks: z.string().optional(),
});

const createVisitorLogSchema = z.object({
  visitor_name: z.string().min(1).max(100),
  visitor_phone: z.string().max(15).optional(),
  id_proof_type: z.string().max(50).optional(),
  id_proof_number: z.string().max(100).optional(),
  student_id: z.string().uuid(),
  room_id: z.string().uuid().optional(),
  relation_to_student: z.string().max(50).optional(),
  purpose: z.string().optional(),
  entry_time: z.coerce.date(),
  exit_time: z.coerce.date().optional(),
  guard_name: z.string().max(100).optional(),
  gate_number: z.string().max(20).optional(),
  approved_by: z.string().max(100).optional(),
});
const updateVisitorLogSchema = z.object({
  exit_time: z.coerce.date().optional(),
});

const createLaundrySchema = z.object({
  laundry_name: z.string().min(1).max(100),
  hostel_id: z.string().uuid(),
  vendor_name: z.string().max(100).optional(),
  vendor_phone: z.string().max(15).optional(),
  vendor_email: z.string().email().max(100).optional(),
  price_per_piece: z.number().min(0).optional(),
  price_per_kg: z.number().min(0).optional(),
  service_types: z.string().max(255).optional(),
  operating_days: z.string().max(100).optional(),
});
const updateLaundrySchema = createLaundrySchema.partial();

const createLaundryRequestSchema = z.object({
  student_id: z.string().uuid(),
  laundry_id: z.string().uuid(),
  pickup_date: z.coerce.date(),
  delivery_date: z.coerce.date().optional(),
  items_description: z.string().optional(),
  total_pieces: z.number().int().min(1).optional(),
  total_weight_kg: z.number().min(0).optional(),
  total_charge: z.number().min(0).optional(),
  service_type: z.string().max(50).optional(),
  status: z.enum(['Pending', 'Processing', 'Ready', 'Delivered']).default('Pending'),
  payment_status: z.enum(['Unpaid', 'Paid']).default('Unpaid'),
});
const updateLaundryRequestSchema = createLaundryRequestSchema.partial();

const createStoreSchema = z.object({
  store_name: z.string().min(1).max(100),
  hostel_id: z.string().uuid(),
  manager_name: z.string().max(100).optional(),
  manager_phone: z.string().max(15).optional(),
  store_type: z.string().max(50).optional(),
  is_operational: z.boolean().default(true),
});
const updateStoreSchema = createStoreSchema.partial();

const createStorePurchaseSchema = z.object({
  student_id: z.string().uuid(),
  store_id: z.string().uuid(),
  item_description: z.string().min(1),
  quantity: z.number().int().min(1).default(1),
  total_amount: z.number().min(0),
  payment_mode: z.string().max(50).optional(),
});

const createPharmacySchema = z.object({
  pharmacy_name: z.string().min(1).max(100),
  address: z.string().max(255).optional(),
  pharmacist_name: z.string().max(100).optional(),
  pharmacist_phone: z.string().max(15).optional(),
  license_number: z.string().max(100).optional(),
  is_24hr: z.boolean().default(false),
  emergency_available: z.boolean().default(true),
});
const updatePharmacySchema = createPharmacySchema.partial();

const createPharmacyVisitSchema = z.object({
  student_id: z.string().uuid(),
  pharmacy_id: z.string().uuid(),
  prescription_details: z.string().optional(),
  medicines_issued: z.string().optional(),
  total_cost: z.number().min(0).optional(),
  payment_status: z.enum(['Paid', 'Pending']).default('Paid'),
});

const createGymSchema = z.object({
  gym_name: z.string().min(1).max(100),
  location: z.string().max(255).optional(),
  trainer_name: z.string().max(100).optional(),
  trainer_phone: z.string().max(15).optional(),
  capacity: z.number().int().min(1).optional(),
  monthly_fee: z.number().min(0).optional(),
  equipment_summary: z.string().optional(),
  is_operational: z.boolean().default(true),
});
const updateGymSchema = createGymSchema.partial();

const createGymMembershipSchema = z.object({
  student_id: z.string().uuid(),
  gym_id: z.string().uuid(),
  start_date: z.coerce.date(),
  end_date: z.coerce.date().optional(),
  fee_paid: z.number().min(0).optional(),
  status: z.enum(['Active', 'Expired', 'Cancelled']).default('Active'),
});
const updateGymMembershipSchema = createGymMembershipSchema.partial();

const createEmergencyRequestSchema = z.object({
  student_id: z.string().uuid(),
  ambulance_id: z.string().uuid().optional(),
  emergency_type: z.string().max(100).optional(),
  description: z.string().optional(),
  status: z.enum(['Requested', 'Dispatched', 'Completed', 'Cancelled']).default('Requested'),
});
const updateEmergencyRequestSchema = z.object({
  ambulance_id: z.string().uuid().optional(),
  pickup_time: z.coerce.date().optional(),
  hospital_reached_time: z.coerce.date().optional(),
  status: z.enum(['Requested', 'Dispatched', 'Completed', 'Cancelled']).optional(),
  notes: z.string().optional(),
});

const createAmbulanceSchema = z.object({
  vehicle_number: z.string().min(1).max(20),
  driver_name: z.string().max(100).optional(),
  driver_phone: z.string().max(15).optional(),
  hospital_name: z.string().max(100).optional(),
  hospital_address: z.string().max(255).optional(),
  hospital_phone: z.string().max(15).optional(),
  is_available: z.boolean().default(true),
});
const updateAmbulanceSchema = createAmbulanceSchema.partial();

const createNoticeSchema = z.object({
  hostel_id: z.string().uuid(),
  title: z.string().min(1).max(255),
  content: z.string().optional(),
  category: z.string().max(50).optional(),
  target_audience: z.string().max(50).optional(),
  posted_by: z.string().max(100).optional(),
  expiry_date: z.coerce.date().optional(),
  attachment_url: z.string().url().max(255).optional(),
});
const updateNoticeSchema = createNoticeSchema.partial();

const createMaintenanceSchema = z.object({
  hostel_id: z.string().uuid(),
  area_type: z.string().max(50).optional(),
  area_id: z.string().uuid().optional(),
  maintenance_type: z.string().max(100).optional(),
  scheduled_date: z.coerce.date(),
  technician_id: z.string().uuid().optional(),
  status: z.enum(['Scheduled', 'In Progress', 'Completed', 'Cancelled']).default('Scheduled'),
  notes: z.string().optional(),
  cost: z.number().min(0).optional(),
});
const updateMaintenanceSchema = z.object({
  completed_date: z.coerce.date().optional(),
  technician_id: z.string().uuid().optional(),
  status: z.enum(['Scheduled', 'In Progress', 'Completed', 'Cancelled']).optional(),
  notes: z.string().optional(),
  cost: z.number().min(0).optional(),
});

const createMessSubscriptionSchema = z.object({
  student_id: z.string().uuid(),
  mess_id: z.string().uuid(),
  start_date: z.coerce.date(),
  end_date: z.coerce.date().optional(),
  meal_plan: z.string().max(50).optional(),
  monthly_charge: z.number().min(0).optional(),
  status: z.enum(['Active', 'Inactive']).default('Active'),
});
const updateMessSubscriptionSchema = createMessSubscriptionSchema.partial();

const createGuardianSchema = z.object({
  student_id: z.string().uuid(),
  guardian_name: z.string().min(1).max(100),
  relation: z.string().min(1).max(50),
  phone: z.string().max(15).optional(),
  email: z.string().email().max(100).optional(),
  address: z.string().optional(),
  is_emergency_contact: z.boolean().default(false),
});
const updateGuardianSchema = createGuardianSchema.partial();

const createTechnicianSchema = z.object({
  name: z.string().min(1).max(100),
  specialization: z.string().max(100).optional(),
  phone: z.string().max(15).optional(),
  email: z.string().email().max(100).optional(),
  address: z.string().optional(),
  availability: z.string().max(100).optional(),
  joining_date: z.coerce.date().optional(),
  employment_type: z.string().max(30).optional(),
  salary: z.number().min(0).optional(),
  vendor_company: z.string().max(100).optional(),
  hostel_id: z.string().uuid().optional(),
});
const updateTechnicianSchema = createTechnicianSchema.partial();

const createRestaurantSchema = z.object({
  restaurant_name: z.string().min(1).max(100),
  location: z.string().max(255).optional(),
  cuisine_type: z.string().max(100).optional(),
  manager_name: z.string().max(100).optional(),
  manager_phone: z.string().max(15).optional(),
  capacity: z.number().int().min(1).optional(),
  avg_cost_per_meal: z.number().min(0).optional(),
  rating: z.number().min(0).max(5).optional(),
  is_operational: z.boolean().default(true),
});
const updateRestaurantSchema = createRestaurantSchema.partial();

module.exports = {
  createFeeSchema, updateFeeSchema,
  createComplaintSchema, updateComplaintSchema,
  createMessSchema, updateMessSchema,
  createMenuSchema, updateMenuSchema,
  createFacilitySchema, updateFacilitySchema,
  createFacilityBookingSchema, updateFacilityBookingSchema,
  createAccessLogSchema,
  createVisitorLogSchema, updateVisitorLogSchema,
  createLaundrySchema, updateLaundrySchema,
  createLaundryRequestSchema, updateLaundryRequestSchema,
  createStoreSchema, updateStoreSchema,
  createStorePurchaseSchema,
  createPharmacySchema, updatePharmacySchema,
  createPharmacyVisitSchema,
  createGymSchema, updateGymSchema,
  createGymMembershipSchema, updateGymMembershipSchema,
  createEmergencyRequestSchema, updateEmergencyRequestSchema,
  createAmbulanceSchema, updateAmbulanceSchema,
  createNoticeSchema, updateNoticeSchema,
  createMaintenanceSchema, updateMaintenanceSchema,
  createMessSubscriptionSchema, updateMessSubscriptionSchema,
  createGuardianSchema, updateGuardianSchema,
  createTechnicianSchema, updateTechnicianSchema,
  createRestaurantSchema, updateRestaurantSchema,
};
