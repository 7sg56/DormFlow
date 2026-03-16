const { Router } = require('express');
const prisma = require('../lib/prisma');
const logger = require('../lib/logger');
const { validate } = require('../middleware/validate');
const { cacheMiddleware, invalidateCache } = require('../middleware/cache');
const { bookingLimiter } = require('../middleware/rateLimiter');
const { idempotency } = require('../middleware/idempotency');
const { acquireLock } = require('../lib/redis');
const { AppError } = require('../middleware/errorHandler');
const { paginationQuery, idParam } = require('../schemas/common.schema');
const { createAllocationSchema, updateAllocationSchema } = require('../schemas/allocation.schema');

const router = Router();

// GET / — List allocations
router.get(
  '/',
  cacheMiddleware('allocations', 120),
  validate({ query: paginationQuery }),
  async (req, res, next) => {
    try {
      const { page, limit } = req.query;
      const skip = (page - 1) * limit;

      const [data, total] = await Promise.all([
        prisma.allocation.findMany({
          skip,
          take: limit,
          orderBy: { created_at: 'desc' },
          include: {
            student: { select: { student_id: true, reg_no: true, first_name: true, last_name: true } },
            bed: {
              include: {
                room: {
                  include: {
                    hostel: { select: { hostel_id: true, hostel_name: true } },
                  },
                },
              },
            },
          },
        }),
        prisma.allocation.count(),
      ]);

      res.json({
        success: true,
        data,
        pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
      });
    } catch (err) {
      next(err);
    }
  }
);

// GET /:id — Single allocation
router.get(
  '/:id',
  cacheMiddleware('allocations', 120),
  validate({ params: idParam }),
  async (req, res, next) => {
    try {
      const record = await prisma.allocation.findUnique({
        where: { allocation_id: req.params.id },
        include: {
          student: true,
          bed: { include: { room: { include: { hostel: true } } } },
        },
      });
      if (!record) throw new AppError(404, 'Allocation not found');
      res.json({ success: true, data: record });
    } catch (err) {
      next(err);
    }
  }
);

// POST / — Create allocation with distributed lock (prevents double-booking)
router.post(
  '/',
  bookingLimiter,
  idempotency,
  validate({ body: createAllocationSchema }),
  async (req, res, next) => {
    const { bed_id, student_id } = req.body;

    // Acquire distributed lock on the bed to prevent race conditions
    const unlock = await acquireLock(`bed:${bed_id}`, 15000);
    if (!unlock) {
      return res.status(429).json({
        success: false,
        error: 'Bed is currently being processed by another request. Please retry.',
      });
    }

    try {
      // Check bed availability inside the lock
      const bed = await prisma.bed.findUnique({ where: { bed_id } });
      if (!bed) {
        throw new AppError(404, 'Bed not found');
      }
      if (bed.occupied) {
        throw new AppError(409, 'Bed is already occupied');
      }

      // Check student doesn't already have an active allocation
      const existingAllocation = await prisma.allocation.findFirst({
        where: { student_id, status: 'Active' },
      });
      if (existingAllocation) {
        throw new AppError(409, 'Student already has an active allocation');
      }

      // Atomic transaction: create allocation + mark bed occupied
      const result = await prisma.$transaction([
        prisma.allocation.create({
          data: req.body,
          include: {
            student: { select: { student_id: true, reg_no: true, first_name: true, last_name: true } },
            bed: { include: { room: { include: { hostel: true } } } },
          },
        }),
        prisma.bed.update({
          where: { bed_id },
          data: { occupied: true },
        }),
      ]);

      await invalidateCache('allocations');
      await invalidateCache('beds');
      await invalidateCache('rooms');

      logger.info('Allocation created', {
        allocation_id: result[0].allocation_id,
        student_id,
        bed_id,
      });

      res.status(201).json({ success: true, data: result[0] });
    } catch (err) {
      next(err);
    } finally {
      await unlock();
    }
  }
);

// PUT /:id — Update allocation (e.g., vacate)
router.put(
  '/:id',
  validate({ params: idParam, body: updateAllocationSchema }),
  async (req, res, next) => {
    try {
      const existing = await prisma.allocation.findUnique({
        where: { allocation_id: req.params.id },
      });
      if (!existing) throw new AppError(404, 'Allocation not found');

      // If status changed to non-Active, free up the bed
      if (req.body.status && req.body.status !== 'Active' && existing.status === 'Active') {
        await prisma.$transaction([
          prisma.allocation.update({
            where: { allocation_id: req.params.id },
            data: req.body,
          }),
          prisma.bed.update({
            where: { bed_id: existing.bed_id },
            data: { occupied: false },
          }),
        ]);
      } else {
        await prisma.allocation.update({
          where: { allocation_id: req.params.id },
          data: req.body,
        });
      }

      await invalidateCache('allocations');
      await invalidateCache('beds');

      const updated = await prisma.allocation.findUnique({
        where: { allocation_id: req.params.id },
        include: {
          student: { select: { student_id: true, reg_no: true, first_name: true, last_name: true } },
          bed: { include: { room: { include: { hostel: true } } } },
        },
      });

      res.json({ success: true, data: updated });
    } catch (err) {
      next(err);
    }
  }
);

// DELETE /:id — Delete allocation and free bed
router.delete(
  '/:id',
  validate({ params: idParam }),
  async (req, res, next) => {
    try {
      const existing = await prisma.allocation.findUnique({
        where: { allocation_id: req.params.id },
      });
      if (!existing) throw new AppError(404, 'Allocation not found');

      await prisma.$transaction([
        prisma.allocation.delete({
          where: { allocation_id: req.params.id },
        }),
        prisma.bed.update({
          where: { bed_id: existing.bed_id },
          data: { occupied: false },
        }),
      ]);

      await invalidateCache('allocations');
      await invalidateCache('beds');

      res.json({ success: true, message: 'Allocation deleted and bed freed' });
    } catch (err) {
      next(err);
    }
  }
);

module.exports = router;
