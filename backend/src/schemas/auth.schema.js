const { z } = require('zod');

const registerSchema = z.object({
  email: z.string().email().max(100),
  password: z.string().min(8).max(128),
  role: z.enum(['admin', 'warden', 'student']).default('student'),
  student_id: z.string().uuid().optional(),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const refreshTokenSchema = z.object({
  refresh_token: z.string().min(1),
});

module.exports = { registerSchema, loginSchema, refreshTokenSchema };
