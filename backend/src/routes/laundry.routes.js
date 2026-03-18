const { Router } = require('express');
const prisma = require('../lib/prisma');
const { authenticate } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const { logger } = require('../lib/logger');

const router = Router();

// GET /laundry - Get laundry services (public)
router.get('/', authenticate, async (req, res, next) => {
    try {
        const laundry = await prisma.laundry.findMany({
            select: {
                laundry_id: true,
                laundry_name: true,
                vendor_name: true,
                price_per_piece: true,
                price_per_kg: true,
                service_types: true,
                operating_days: true,
            },
            orderBy: { laundry_name: 'asc' },
        });

        res.json({ success: true, data: laundry });
    } catch (err) {
        logger.error('Error fetching laundry:', err);
        next(err);
    }
});

// GET /laundry/:id - Get laundry by ID (authenticated)
router.get('/:id', authenticate, async (req, res, next) => {
    try {
        const { id } = req.params;

        const laundry = await prisma.laundry.findUnique({
            where: { laundry_id: id },
            select: {
                laundry_id: true,
                laundry_name: true,
                vendor_name: true,
                vendor_phone: true,
                price_per_piece: true,
                price_per_kg: true,
                service_types: true,
                operating_days: true,
            },
        });

        if (!laundry) {
            throw new Error('Laundry service not found');
        }

        res.json({ success: true, data: laundry });
    } catch (err) {
        logger.error('Error fetching laundry:', err);
        next(err);
    }
});

// POST /laundry - Create laundry service (admin only)
router.post('/', authenticate, authorize('admin'), validate({ body: 'createLaundrySchema' }), async (req, res, next) => {
    try {
        const { laundry_name, vendor_name, vendor_phone, price_per_piece, price_per_kg, service_types, operating_days } = req.body;

        const laundry = await prisma.laundry.create({
            data: {
                laundry_name,
                vendor_name,
                vendor_phone,
                price_per_piece: Number(price_per_piece),
                price_per_kg: Number(price_per_kg),
                service_types,
                operating_days: String(operating_days),
            },
        });

        logger.info('Laundry service created:', laundry.laundry_name);
        res.status(201).json({ success: true, data: laundry });
    } catch (err) {
        logger.error('Error creating laundry:', err);
        next(err);
    }
});

// PUT /laundry/:id - Update laundry service (admin only)
router.put('/:id', authenticate, authorize('admin'), validate({ body: 'updateLaundrySchema' }), async (req, res, next) => {
    try {
        const { id } = req.params;
        const { laundry_name, vendor_name, vendor_phone, price_per_piece, price_per_kg, service_types, operating_days } = req.body;

        const laundry = await prisma.laundry.update({
            where: { laundry_id: id },
            data: {
                laundry_name,
                vendor_name,
                vendor_phone,
                price_per_piece: Number(price_per_piece),
                price_per_kg: Number(price_per_kg),
                service_types,
                operating_days: String(operating_days),
            },
        });

        logger.info('Laundry service updated:', laundry.laundry_name);
        res.json({ success: true, data: laundry });
    } catch (err) {
        logger.error('Error updating laundry:', err);
        next(err);
    }
});

// DELETE /laundry/:id - Delete laundry service (admin only)
router.delete('/:id', authenticate, authorize('admin'), async (req, res, next) => {
    try {
        const { id } = req.params;

        await prisma.laundry.delete({
            where: { laundry_id: id },
        });

        logger.info('Laundry service deleted:', id);
        res.json({ success: true, message: 'Laundry service deleted' });
    } catch (err) {
        logger.error('Error deleting laundry:', err);
        next(err);
    }
});

module.exports = router;
