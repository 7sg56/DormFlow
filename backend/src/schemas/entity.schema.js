const { z } = require('zod');

// ── Fee Payment ────────────────────────────────────────────
const createFeeSchema = z.object({
  student_id: z.string().min(1),
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
  status: z.enum(['Pending', 'Paid', 'Partial', 'Overdue', 'Waived']).default('Pending'),
  remarks: z.string().optional(),
  approved_by: z.string().max(100).optional(),
});
const updateFeeSchema = createFeeSchema.partial();

// ── Complaint ──────────────────────────────────────────────
const createComplaintSchema = z.object({
  student_id: z.string().min(1),
  room_id: z.string().min(1).optional(),
  technician_id: z.string().min(1).optional(),
  description: z.string().min(1),
  complaint_type: z.string().max(100).optional(),
  priority: z.enum(['Low', 'Medium', 'High', 'Critical']).default('Medium'),
  status: z.enum(['Open', 'In Progress', 'Resolved', 'Closed']).default('Open'),
});
const updateComplaintSchema = z.object({
  technician_id: z.string().min(1).optional(),
  priority: z.enum(['Low', 'Medium', 'High', 'Critical']).optional(),
  status: z.enum(['Open', 'In Progress', 'Resolved', 'Closed']).optional(),
  resolution_notes: z.string().optional(),
  cost_incurred: z.number().min(0).optional(),
});

// ── Mess ───────────────────────────────────────────────────
const createMessSchema = z.object({
  mess_name: z.string().min(1).max(100),
  mess_type: z.string().max(50).optional(),
  hostel_id: z.string().min(1),
  monthly_fee: z.number().min(0).optional(),
  capacity: z.number().int().min(1).optional(),
  manager_name: z.string().max(100).optional(),
  manager_phone: z.string().max(15).optional(),
  hygiene_rating: z.number().min(0).max(5).optional(),
  menu_description: z.string().optional(),
});
const updateMessSchema = createMessSchema.partial();

// ── Visitor Log ────────────────────────────────────────────
const createVisitorLogSchema = z.object({
  visitor_name: z.string().min(1).max(100),
  visitor_phone: z.string().max(15).optional(),
  id_proof_type: z.string().max(50).optional(),
  id_proof_number: z.string().max(100).optional(),
  student_id: z.string().min(1),
  room_id: z.string().min(1).optional(),
  relation_to_student: z.string().max(50).optional(),
  purpose: z.string().optional(),
  entry_time: z.coerce.date(),
  exit_time: z.coerce.date().optional(),
  guard_name: z.string().max(100).optional(),
  gate_number: z.string().max(20).optional(),
  approved_by: z.string().max(100).optional(),
});
const updateVisitorLogSchema = createVisitorLogSchema.partial();

// ── Laundry ────────────────────────────────────────────────
const createLaundrySchema = z.object({
  laundry_name: z.string().min(1).max(100),
  hostel_id: z.string().min(1),
  vendor_name: z.string().max(100).optional(),
  vendor_phone: z.string().max(15).optional(),
  vendor_email: z.string().email().max(100).optional(),
  price_per_piece: z.number().min(0).optional(),
  price_per_kg: z.number().min(0).optional(),
});
const updateLaundrySchema = createLaundrySchema.partial();

// ── Technician ─────────────────────────────────────────────
const createTechnicianSchema = z.object({
  name: z.string().min(1).max(100),
  phone: z.string().max(15).optional(),
  email: z.string().email().max(100).optional(),
  address: z.string().optional(),
  availability: z.string().max(100).optional(),
  joining_date: z.coerce.date().optional(),
  employment_type: z.string().max(30).optional(),
  salary: z.number().min(0).optional(),
  vendor_company: z.string().max(100).optional(),
  hostel_id: z.string().min(1).optional(),
});
const updateTechnicianSchema = createTechnicianSchema.partial();

module.exports = {
  createFeeSchema, updateFeeSchema,
  createComplaintSchema, updateComplaintSchema,
  createMessSchema, updateMessSchema,
  createVisitorLogSchema, updateVisitorLogSchema,
  createLaundrySchema, updateLaundrySchema,
  createTechnicianSchema, updateTechnicianSchema,
};
