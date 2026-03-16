const { z } = require('zod');

const createAllocationSchema = z.object({
  student_id: z.string().uuid(),
  bed_id: z.string().uuid(),
  start_date: z.coerce.date(),
  end_date: z.coerce.date().optional(),
  allocated_by: z.string().max(100).optional(),
  reason: z.string().optional(),
  status: z.enum(['Active', 'Inactive', 'Transferred', 'Vacated']).default('Active'),
});

const updateAllocationSchema = z.object({
  end_date: z.coerce.date().optional(),
  status: z.enum(['Active', 'Inactive', 'Transferred', 'Vacated']).optional(),
  reason: z.string().optional(),
});

module.exports = { createAllocationSchema, updateAllocationSchema };
