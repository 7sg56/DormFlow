const { Router } = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../lib/prisma');
const logger = require('../lib/logger');
const { validate } = require('../middleware/validate');
const { authLimiter } = require('../middleware/rateLimiter');
const { authenticate } = require('../middleware/auth');
const { AppError } = require('../middleware/errorHandler');
const { registerSchema, loginSchema, refreshTokenSchema } = require('../schemas/auth.schema');

const router = Router();

const JWT_SECRET = process.env.JWT_SECRET || 'dormflow_jwt_secret_change_me';
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

// POST /register
router.post(
  '/register',
  authLimiter,
  validate({ body: registerSchema }),
  async (req, res, next) => {
    try {
      const { email, password, role, student_id } = req.body;

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
          role,
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

// GET /me — Get current user
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
        student: {
          select: {
            student_id: true,
            reg_no: true,
            first_name: true,
            last_name: true,
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
