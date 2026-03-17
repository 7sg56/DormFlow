const { Router } = require('express');
const prisma = require('../lib/prisma');
const { authenticate, authorize } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const { logger } = require('../lib/logger');
const { paginationQuery, idParam } = require('../schemas/common.schema');

const router = Router();

// Get mess subscriptions (student and warden can view)
router.get('/', authenticate, authorize('student', 'warden'), async (req, res, next) => {
    try {
        const { userId, role } = req.user;

        // Students see only their own hostel's mess
        const where = role === 'student'
            ? { student_id: userId, status: 'Active' }
            : { hostel_id: req.user.assigned_hostel_id || null, status: 'Active' };

        const messes = await prisma.mess_subscription.findMany({
            where,
            include: {
                mess: {
                    select: {
                        mess_id: true,
                        mess_name: true,
                        status: true,
                    },
                    menu: {
                        select: {
                            mess_id: true,
                            day_of_week: true,
                            item_name: true,
                            item_category: true,
                            is_veg: true,
                            calories_approx: true,
                        },
                },
            },
            orderBy: { month: 'desc', year: 'desc' },
        });

        res.json({ success: true, data: messes });
    } catch (err) {
        next(err);
    }
});

// Get menu items for a specific mess (student/warden view)
router.get('/menu/:messId', authenticate, async (req, res, next) => {
    try {
        const messId = req.params.messId;
        const { userId, role } = req.user;

        const menuItems = await prisma.menu.findMany({
            where: {
                mess_id: messId,
                item_category: { not: 'All' } }, // Filter by category if provided
            select: {
                item_id: true,
                item_name: true,
                item_category: true,
                is_veg: true,
                calories_approx: true,
            },
            orderBy: { day_of_week: 'asc' },
        });

        res.json({ success: true, data: menuItems });
    } catch (err) {
        next(err);
    }
});
