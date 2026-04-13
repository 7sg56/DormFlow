const { z } = require('zod');

// BCNF: warden_name, warden_phone, warden_email removed → hostel_warden table
// BCNF: city, state removed → pincode_locality table
const createHostelSchema = z.object({
  hostel_name: z.string().min(1).max(100),
  type: z.string().min(1).max(50),
  total_floors: z.number().int().min(1),
  address: z.string().max(255).optional(),
  pincode: z.string().max(10).optional(),
  established_year: z.number().int().min(1900).max(2100).optional(),
  registration_no: z.string().max(100).optional(),
  office_phone: z.string().max(15).optional(),
  emergency_phone: z.string().max(15).optional(),
});

const updateHostelSchema = createHostelSchema.partial();

module.exports = { createHostelSchema, updateHostelSchema };
