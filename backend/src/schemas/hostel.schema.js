const { z } = require('zod');

const createHostelSchema = z.object({
  hostel_name: z.string().min(1).max(100),
  type: z.string().min(1).max(50),
  total_floors: z.number().int().min(1),
  address: z.string().max(255).optional(),
  city: z.string().max(100).optional(),
  state: z.string().max(100).optional(),
  pincode: z.string().max(10).optional(),
  established_year: z.number().int().min(1900).max(2100).optional(),
  registration_no: z.string().max(100).optional(),
  warden_name: z.string().max(100).optional(),
  warden_phone: z.string().max(15).optional(),
  warden_email: z.string().email().max(100).optional(),
  office_phone: z.string().max(15).optional(),
  emergency_phone: z.string().max(15).optional(),
});

const updateHostelSchema = createHostelSchema.partial();

module.exports = { createHostelSchema, updateHostelSchema };
