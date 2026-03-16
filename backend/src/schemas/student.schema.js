const { z } = require('zod');

const createStudentSchema = z.object({
  reg_no: z.string().min(1).max(50),
  first_name: z.string().min(1).max(100),
  last_name: z.string().min(1).max(100),
  date_of_birth: z.coerce.date(),
  gender: z.enum(['Male', 'Female', 'Other']),
  phone_primary: z.string().max(15).optional(),
  phone_secondary: z.string().max(15).optional(),
  email_personal: z.string().email().max(100).optional(),
  email_institutional: z.string().email().max(100).optional(),
  department: z.string().max(100).optional(),
  course: z.string().max(100).optional(),
  academic_year: z.number().int().min(1).max(10).optional(),
  semester: z.number().int().min(1).max(20).optional(),
  blood_group: z.string().max(5).optional(),
  permanent_address: z.string().optional(),
  current_address: z.string().optional(),
  city: z.string().max(100).optional(),
  state: z.string().max(100).optional(),
  pincode: z.string().max(10).optional(),
  admission_date: z.coerce.date().optional(),
  status: z.enum(['Active', 'Inactive', 'Graduated', 'Suspended']).default('Active'),
  photo_url: z.string().url().max(255).optional(),
});

const updateStudentSchema = createStudentSchema.partial();

module.exports = { createStudentSchema, updateStudentSchema };
