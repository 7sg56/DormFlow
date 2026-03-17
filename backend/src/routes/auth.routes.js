const { Router } = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../lib/prisma');
const logger = require('../lib/logger');
const { validate } = require('../middleware/validate');
const { authLimiter } = require('../middleware/rateLimiter');
const { authenticate, authorize, JWT_SECRET } = require('../middleware/auth');
const { AppError } = require('../middleware/errorHandler');
const { registerSchema, loginSchema, refreshTokenSchema } = require('../schemas/auth.schema');

const router = Router();

const ACCESS_TOKEN_EXPIRY = '1h';
const REFRESH_TOKEN_EXPIRY = '7d';

function generateTokens(user) {
  const accessToken = jwt.sign(
    { userId: user.user_id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: ACCESS_TOKEN_EXPIRY }
  );

  const refreshToken = jwt.sign(
    { userId: user.user_id, type: 'refresh' },
    JWT_SECRET,
    { expiresIn: REFRESH_TOKEN_EXPIRY }
  );

  return { accessToken, refreshToken };
}

// ==========================================
// Admin Endpoints
// ==========================================

// POST /admin/create-user - Create admin/warden/technician accounts
router.post(
  '/admin/create-user',
  authenticate,
  authorize('admin'),
  authLimiter,
  async (req, res, next) => {
    try {
      const { email, password, role, student_id, technician_id, hostel_id } = req.body;

      // Validate role
      if (!['admin', 'warden', 'technician'].includes(role)) {
        throw new AppError(400, 'Invalid role. Must be admin, warden, or technician.');
      }

      // Check existing
      const existing = await prisma.auth_user.findUnique({ where: { email } });
      if (existing) {
        throw new AppError(409, 'Email already registered');
      }

      const password_hash = await bcrypt.hash(password, 12);

      // Prepare data
      const userData = {
        email,
        password_hash,
        role,
        student_id: student_id || null,
        technician_id: technician_id || null,
        assigned_hostel_id: hostel_id || null,
        is_active: true,
      };

      const user = await prisma.auth_user.create({
        data: userData,
        select: {
          user_id: true,
          email: true,
          role: true,
          created_at: true,
        },
      });

      logger.info('User created by admin', { userId: user.user_id, email, role });

      res.status(201).json({
        success: true,
        data: user,
      });
    } catch (err) {
      next(err);
    }
  }
);

// PUT /admin/warden/:userId/:hostelId - Assign warden to hostel
router.put(
  '/admin/warden/:userId/:hostelId',
  authenticate,
  authorize('admin'),
  async (req, res, next) => {
    try {
      const { userId, hostelId } = req.params;

      // Check if hostel exists
      const hostel = await prisma.hostel.findUnique({
        where: { hostel_id: hostelId },
      });
      if (!hostel) {
        throw new AppError(404, 'Hostel not found');
      }

      // Check if user exists and is a warden
      const user = await prisma.auth_user.findUnique({
        where: { user_id: userId },
        select: { role: true },
      });
      if (!user) {
        throw new AppError(404, 'User not found');
      }
      if (user.role !== 'warden') {
        throw new AppError(400, 'User is not a warden');
      }

      // Update warden's assigned hostel
      const updatedUser = await prisma.auth_user.update({
        where: { user_id: userId },
        data: { assigned_hostel_id: hostelId },
        select: {
          user_id: true,
          email: true,
          role: true,
          assigned_hostel_id: true,
        },
      });

      logger.info('Warden assigned to hostel', { userId, hostelId });

      res.json({ success: true, data: updatedUser });
    } catch (err) {
      next(err);
    }
  }
);

// PUT /admin/technician/:technicianId/:hostelId - Assign technician to hostel
router.put(
  '/admin/technician/:technicianId/:hostelId',
  authenticate,
  authorize('admin'),
  async (req, res, next) => {
    try {
      const { technicianId, hostelId } = req.params;

      // Check if hostel exists
      const hostel = await prisma.hostel.findUnique({
        where: { hostel_id: hostelId },
      });
      if (!hostel) {
        throw new AppError(404, 'Hostel not found');
      }

      // Check if technician exists
      const technician = await prisma.technician.findUnique({
        where: { technician_id: technicianId },
      });
      if (!technician) {
        throw new AppError(404, 'Technician not found');
      }

      // Update technician's assigned hostel
      const updated = await prisma.technician.update({
        where: { technician_id: technicianId },
        data: { hostel_id: hostelId },
        select: {
          technician_id: true,
          name: true,
          hostel_id: true,
        },
      });

      logger.info('Technician assigned to hostel', { technicianId, hostelId });

      res.json({ success: true, data: updated });
    } catch (err) {
      next(err);
    }
  }
);

// ==========================================
// Warden Endpoints
// ==========================================

// GET /warden/my-hostel - Get assigned hostel
router.get(
  '/warden/my-hostel',
  authenticate,
  authorize('warden'),
  async (req, res, next) => {
    try {
      const user = await prisma.auth_user.findUnique({
        where: { user_id: req.user.userId },
        select: {
          user_id: true,
          email: true,
          role: true,
          assigned_hostel_id: true,
          hostel: {
            include: {
              rooms: {
                select: { room_id: true, room_number: true, floor: true, capacity: true },
              },
            },
          },
        },
      });

      if (!user?.assigned_hostel_id) {
        throw new AppError(404, 'No hostel assigned');
      }

      res.json({ success: true, data: user });
    } catch (err) {
      next(err);
    }
  }
);

// ==========================================
// Technician Endpoints
// ==========================================

// GET /technician/my-tasks - Get assigned tasks and limits
router.get(
  '/technician/my-tasks',
  authenticate,
  authorize('technician'),
  async (req, res, next) => {
    try {
      const user = await prisma.auth_user.findUnique({
        where: { user_id: req.user.userId },
        select: {
          user_id: true,
          email: true,
          role: true,
          technician_id: true,
          technician: {
            select: {
              name: true,
              specialization: true,
              hostel_id: true,
            },
          },
        },
      });

      if (!user?.technician_id) {
        throw new AppError(404, 'Technician not found');
      }

      const technicianId = user.technician_id;

      // Get today's date range
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      // Get this week's date range
      const weekStart = new Date(today);
      weekStart.setDate(weekStart.getDate() - weekStart.getDay());
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 7);

      // Get complaints assigned to this technician
      const complaints = await prisma.complaint.findMany({
        where: {
          technician_id: technicianId,
          status: { in: ['Open', 'In Progress'] },
        },
        orderBy: { created_at: 'desc' },
        include: {
          student: { select: { student_id: true, reg_no: true, first_name: true, last_name: true } },
          room: { select: { room_id: true, room_number: true } },
        },
      });

      // Get maintenance schedules for this technician
      const maintenance = await prisma.maintenance_schedule.findMany({
        where: {
          technician_id: technicianId,
          status: { in: ['Scheduled', 'In Progress'] },
        },
        orderBy: { scheduled_date: 'asc' },
        include: {
          hostel: { select: { hostel_id: true, hostel_name: true } },
        },
      });

      // Count today's completed tasks
      const dailyCompleted = await prisma.complaint.count({
        where: {
          technician_id: technicianId,
          status: 'Resolved',
          resolved_at: { gte: today },
        },
      }) + await prisma.maintenance_schedule.count({
        where: {
          technician_id: technicianId,
          status: 'Completed',
          completed_date: { gte: today },
        },
      });

      // Count weekly completed tasks
      const weeklyCompleted = await prisma.complaint.count({
        where: {
          technician_id: technicianId,
          status: 'Resolved',
          resolved_at: { gte: weekStart },
        },
      }) + await prisma.maintenance_schedule.count({
        where: {
          technician_id: technicianId,
          status: 'Completed',
          completed_date: { gte: weekStart },
        },
      });

      res.json({
        success: true,
        data: {
          technician: user.technician,
          complaints,
          maintenance,
          stats: {
            dailyCompleted,
            weeklyCompleted,
            dailyLimit: 10,
            weeklyLimit: 50,
          },
        },
      });
    } catch (err) {
      next(err);
    }
  }
);

// PUT /technician/claim-task/:complaintId - Claim a complaint task
router.put(
  '/technician/claim-task/:complaintId',
  authenticate,
  authorize('technician'),
  async (req, res, next) => {
    try {
      const { complaintId } = req.params;

      const user = await prisma.auth_user.findUnique({
        where: { user_id: req.user.userId },
        select: { technician_id: true },
      });

      if (!user?.technician_id) {
        throw new AppError(404, 'Technician not found');
      }

      const complaint = await prisma.complaint.update({
        where: { complaint_id: complaintId },
        data: {
          technician_id: user.technician_id,
          status: 'In Progress',
        },
        include: {
          student: { select: { student_id: true, reg_no: true, first_name: true, last_name: true } },
        },
      });

      logger.info('Technician claimed complaint', { complaintId, technicianId: user.technician_id });

      res.json({ success: true, data: complaint });
    } catch (err) {
      next(err);
    }
  }
);

// PUT /technician/complete-task/:complaintId - Complete a complaint task
router.put(
  '/technician/complete-task/:complaintId',
  authenticate,
  authorize('technician'),
  async (req, res, next) => {
    try {
      const { complaintId } = req.params;
      const { resolution_notes, cost_incurred } = req.body;

      const user = await prisma.auth_user.findUnique({
        where: { user_id: req.user.userId },
        select: { technician_id: true },
      });

      if (!user?.technician_id) {
        throw new AppError(404, 'Technician not found');
      }

      const complaint = await prisma.complaint.update({
        where: { complaint_id: complaintId },
        data: {
          status: 'Resolved',
          resolved_at: new Date(),
          resolution_notes: resolution_notes || null,
          cost_incurred: cost_incurred || 0,
          is_resolved: true,
        },
        include: {
          student: { select: { student_id: true, reg_no: true, first_name: true, last_name: true } },
        },
      });

      logger.info('Technician completed complaint', { complaintId, technicianId: user.technician_id });

      res.json({ success: true, data: complaint });
    } catch (err) {
      next(err);
    }
  }
);

// ==========================================
// User Endpoints
// ==========================================

// POST /register
router.post(
  '/register',
  authLimiter,
  validate({ body: registerSchema }),
  async (req, res, next) => {
    try {
      const { email, password, role, student_id } = req.body;

      // Security: Only allow 'student' role during registration
      // Admin/warden roles should be set by existing admins only
      if (role && role !== 'student') {
        throw new AppError(403, 'Invalid role. Only student accounts can be created via registration.');
      }

      // Check existing
      const existing = await prisma.auth_user.findUnique({ where: { email } });
      if (existing) {
        throw new AppError(409, 'Email already registered');
      }

      const password_hash = await bcrypt.hash(password, 12);

      const user = await prisma.auth_user.create({
        data: {
          email,
          password_hash,
          role: role || 'student',
          student_id: student_id || null,
        },
        select: {
          user_id: true,
          email: true,
          role: true,
          created_at: true,
        },
      });

      const tokens = generateTokens(user);

      // Store refresh token
      await prisma.auth_user.update({
        where: { user_id: user.user_id },
        data: { refresh_token: tokens.refreshToken },
      });

      logger.info('User registered', { userId: user.user_id, email });

      res.status(201).json({
        success: true,
        data: {
          user,
          access_token: tokens.accessToken,
          refresh_token: tokens.refreshToken,
        },
      });
    } catch (err) {
      next(err);
    }
  }
);

// POST /login
router.post(
  '/login',
  authLimiter,
  validate({ body: loginSchema }),
  async (req, res, next) => {
    try {
      const { email, password } = req.body;

      const user = await prisma.auth_user.findUnique({ where: { email } });
      if (!user || !user.is_active) {
        throw new AppError(401, 'Invalid credentials');
      }

      const valid = await bcrypt.compare(password, user.password_hash);
      if (!valid) {
        throw new AppError(401, 'Invalid credentials');
      }

      const tokens = generateTokens(user);

      // Update last login and refresh token
      await prisma.auth_user.update({
        where: { user_id: user.user_id },
        data: {
          last_login: new Date(),
          refresh_token: tokens.refreshToken,
        },
      });

      logger.info('User logged in', { userId: user.user_id, email });

      res.json({
        success: true,
        data: {
          user: {
            user_id: user.user_id,
            email: user.email,
            role: user.role,
          },
          access_token: tokens.accessToken,
          refresh_token: tokens.refreshToken,
        },
      });
    } catch (err) {
      next(err);
    }
  }
);

// POST /refresh
router.post(
  '/refresh',
  validate({ body: refreshTokenSchema }),
  async (req, res, next) => {
    try {
      const { refresh_token } = req.body;

      let decoded;
      try {
        decoded = jwt.verify(refresh_token, JWT_SECRET);
      } catch (err) {
        throw new AppError(401, 'Invalid or expired refresh token');
      }

      if (decoded.type !== 'refresh') {
        throw new AppError(401, 'Invalid token type');
      }

      const user = await prisma.auth_user.findUnique({
        where: { user_id: decoded.userId },
      });

      if (!user || !user.is_active || user.refresh_token !== refresh_token) {
        throw new AppError(401, 'Invalid refresh token');
      }

      const tokens = generateTokens(user);

      await prisma.auth_user.update({
        where: { user_id: user.user_id },
        data: { refresh_token: tokens.refreshToken },
      });

      res.json({
        success: true,
        data: {
          access_token: tokens.accessToken,
          refresh_token: tokens.refreshToken,
        },
      });
    } catch (err) {
      next(err);
    }
  }
);

// GET /me - Get current user with expanded info
router.get('/me', authenticate, async (req, res, next) => {
  try {
    const user = await prisma.auth_user.findUnique({
      where: { user_id: req.user.userId },
      select: {
        user_id: true,
        email: true,
        role: true,
        is_active: true,
        last_login: true,
        created_at: true,
        assigned_hostel_id: true,
        technician_id: true,
        student: {
          select: {
            student_id: true,
            reg_no: true,
            first_name: true,
            last_name: true,
          },
        },
        technician: {
          select: {
            technician_id: true,
            name: true,
            specialization: true,
            hostel_id: true,
          },
        },
      },
    });

    if (!user) throw new AppError(404, 'User not found');

    res.json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
});

// POST /logout
router.post('/logout', authenticate, async (req, res, next) => {
  try {
    await prisma.auth_user.update({
      where: { user_id: req.user.userId },
      data: { refresh_token: null },
    });

    res.json({ success: true, message: 'Logged out' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
