const { Router } = require('express');
const prisma = require('../lib/prisma');
const { authenticate, authorize } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const logger = require('../lib/logger');
const { paginationQuery, idParam } = require('../schemas/common.schema');

const router = Router();

// ==========================================
// Gym Routes
// ==========================================

// GET /gym - Get gym data
router.get('/', authenticate, async (req, res, next) => {
    try {
        const { role, userId } = req.user;

        // Students and technicians can see gym data
        if (!['student', 'technician'].includes(role)) {
            return res.status(403).json({
                success: false,
                error: 'You don\'t have permission to access gym facilities',
            });
        }

        // Get gym data for student or their technician
        const gym = await prisma.gym.findFirst({
            where: role === 'technician'
                ? { technician_id: userId }
                : { student_id: userId },
            select: {
                gym_id: true,
                gym_name: true,
                location: true,
                specialization: true,
                manager_name: true,
                capacity: true,
                monthly_fee: true,
                timing_open: true,
                timing_close: true,
                is_available: true,
                technician: {
                    technician_id: true,
                    name: true,
                    specialization: true,
                    hostel_id: true,
                },
            },
        });

        if (!gym) {
            return res.status(404).json({
                success: false,
                error: 'Gym facility not found',
            });
        }

        res.json({ success: true, data: gym });
    } catch (err) {
        next(err);
    }
});

// POST /gym/subscription - Student can subscribe (student only)
router.post('/subscription', authenticate, authorize('student'), validate({ body: 'createGymSubscriptionSchema' }), async (req, res, next) => {
    try {
        const { userId } = req.user;

        // Check if student has already subscribed
        const existing = await prisma.gym_membership.findFirst({
            where: { student_id: userId, status: 'Active' },
        });

        if (existing) {
            return res.status(400).json({
                success: false,
                error: 'You already have an active gym membership',
            });
        }

        const gym = await prisma.gym.findFirst({
            where: { gym_id: req.body.gym_id },
        });

        if (!gym) {
            return res.status(404).json({
                success: false,
                error: 'Gym not found',
            });
        }

        if (!gym.is_available) {
            return res.status(400).json({
                success: false,
                error: 'This gym is currently unavailable',
            });
        }

        // Create gym membership
        const membership = await prisma.gym_membership.create({
            data: {
                student_id: userId,
                gym_id: req.body.gym_id,
                status: 'Active',
                start_date: new Date(),
            },
        });

        logger.info('Gym subscription created:', membership.gym_membership_id);

        res.status(201).json({
            success: true,
            data: membership,
        });
    } catch (err) {
        next(err);
    }
});

// PUT /gym/subscription/:id - Update subscription status (admin only)
router.put('/subscription/:id', authenticate, authorize('admin'), validate({ body: 'updateGymMembershipSchema' }), async (req, res, next) => {
    try {
        const { id } = req.params.id;

        const membership = await prisma.gym_membership.findFirst({
            where: { gym_membership_id: id },
        });

        if (!membership) {
            return res.status(404).json({
                success: false,
                error: 'Gym membership not found',
            });
        }

        const updated = await prisma.gym_membership.update({
            where: { gym_membership_id: id },
            data: { status: req.body.status },
        });

        res.json({ success: true, data: updated });
    } catch (err) {
        next(err);
    }
});

module.exports = router;
