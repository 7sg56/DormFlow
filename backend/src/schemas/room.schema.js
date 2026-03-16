const { z } = require('zod');

const createRoomSchema = z.object({
  room_number: z.string().min(1).max(20),
  floor: z.number().int().min(0),
  capacity: z.number().int().min(1),
  room_type: z.string().max(50).optional(),
  hostel_id: z.string().uuid(),
  monthly_rent: z.number().min(0).optional(),
  area_sqft: z.number().min(0).optional(),
  facing: z.string().max(20).optional(),
  room_condition: z.enum(['Excellent', 'Good', 'Fair', 'Poor']).default('Good'),
});

const updateRoomSchema = createRoomSchema.partial();

const createBedSchema = z.object({
  bed_number: z.string().min(1).max(20),
  room_id: z.string().uuid(),
  bed_type: z.string().max(50).optional(),
  condition_status: z.enum(['Excellent', 'Good', 'Fair', 'Poor']).default('Good'),
  occupied: z.boolean().default(false),
  purchase_date: z.coerce.date().optional(),
});

const updateBedSchema = createBedSchema.partial();

module.exports = { createRoomSchema, updateRoomSchema, createBedSchema, updateBedSchema };
