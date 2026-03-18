const { Router } = require('express');
const prisma = require('../lib/prisma');
const { authenticate } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const { createCrudRouter } = require('./crud.factory');
const logger = require('../lib/logger');

const router = Router();

// ==========================================
// Restaurant Routes
// ==========================================

// GET /restaurant - Get restaurants (public, no auth required)
router.get('/', authenticate, async (req, res, next) => {
    try {
        const restaurants = await prisma.restaurant.findMany({
            select: {
                restaurant_id: true,
                restaurant_name: true,
                is_operational: true,
                location: true,
                rating: true,
                cuisine_type: true,
                avg_cost_per_meal: true,
                capacity: true,
                timing_open: true,
                timing_close: true,
            },
            orderBy: { rating: 'desc' },
        });

        res.json({ success: true, data: restaurants });
    } catch (err) {
        next(err);
    }
});

// GET /restaurant/:id - Get restaurant by ID (authenticated)
router.get('/:id', authenticate, async (req, res, next) => {
    try {
        const { id } = req.params;

        const restaurant = await prisma.restaurant.findUnique({
            where: { restaurant_id: id },
            select: {
                restaurant_id: true,
                restaurant_name: true,
                is_operational: true,
                location: true,
                rating: true,
                cuisine_type: true,
                avg_cost_per_meal: true,
                capacity: true,
                timing_open: true,
                timing_close: true,
            },
        });

        if (!restaurant) {
            throw new Error('Restaurant not found');
        }

        res.json({ success: true, data: restaurant });
    } catch (err) {
        next(err);
    }
});

module.exports = router;
