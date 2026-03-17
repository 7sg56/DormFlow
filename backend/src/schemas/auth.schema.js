const { z } = require('zod');

const registerSchema = z.object({
  email: z.string().email().max(100),
  password: z.string().min(8).max(128),
  confirm_password: z.string().min(1).optional(),
  // Only 'student' role allowed for registration; admin/warden set by existing admins
  role: z.enum(['student']).default('student'),
  student_id: z.string().uuid().optional(),
}).refine((data) => !data.confirm_password || data.password === data.confirm_password, {
  message: "Passwords do not match",
  path: ["confirm_password"],
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const refreshTokenSchema = z.object({
  refresh_token: z.string().min(1),
});

module.exports = { registerSchema, loginSchema, refreshTokenSchema };
