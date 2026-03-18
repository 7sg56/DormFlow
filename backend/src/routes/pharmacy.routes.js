const { Router } = require('express');
const prisma = require('../lib/prisma');
const { authenticate } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const { authorize } = require('../middleware/auth');
const { AppError } = require('../middleware/errorHandler');
const logger = require('../lib/logger');

const router = Router();

// GET /pharmacy - Get pharmacy data (public, no auth required for basic info)
router.get('/pharmacy', async (req, res, next) => {
    try {
        const pharmacy = await prisma.pharmacy.findFirst({
            select: {
                pharmacy_id: true,
                pharmacy_name: true,
                address: true,
                manager_name: true,
                manager_phone: true,
                pharmacist_name: true,
                pharmacist_phone: true,
                is_24hr_available: true,
            },
        });

        if (!pharmacy) {
            throw new AppError(404, 'Pharmacy not found');
        }

        res.json({ success: true, data: pharmacy });
    } catch (err) {
        next(err);
    }
});

// GET /pharmacy/:id - Get pharmacy by ID (authenticated)
router.get('/pharmacy/:id', authenticate, authorize('admin', 'warden'), async (req, res, next) => {
    try {
        const { id } = req.params;

        const pharmacy = await prisma.pharmacy.findUnique({
            where: { pharmacy_id: id },
            include: {
                medications: {
                    select: {
                        med_id: true,
                        medicine_name: true,
                        stock_quantity: true,
                        dosage_form: true,
                        manufacturer: true,
                        batch_number: true,
                        expiry_date: true,
                    },
                },
            },
        });

        if (!pharmacy) {
            throw new AppError(404, 'Pharmacy not found');
        }

        res.json({ success: true, data: pharmacy });
    } catch (err) {
        next(err);
    }
});

// POST /pharmacy/medicines (admin only) - Add medicine stock
router.post('/pharmacy/medicines', authenticate, authorize('admin'), validate({ body: 'addMedicine' }), async (req, res, next) => {
    try {
        const { pharmacy_id, medicine_name, stock_quantity, dosage_form, manufacturer, batch_number, expiry_date } = req.body;

        const pharmacy = await prisma.pharmacy.findUnique({
            where: { pharmacy_id },
        select: { pharmacy_id: true },
        });

        if (!pharmacy) {
            throw new AppError(404, 'Pharmacy not found');
        }

        const medicine = await prisma.medicine.create({
            data: {
                pharmacy_id: pharmacy_id,
                medicine_name,
                stock_quantity: Number(stock_quantity),
                dosage_form,
                manufacturer,
                batch_number,
                expiry_date: expiry_date ? new Date(expiry_date) : null,
            },
        });

        logger.info('Medicine added:', medicine.medicine_name, 'quantity:', stock_quantity);

        res.status(201).json({ success: true, data: medicine });
    } catch (err) {
        next(err);
    }
});

// PUT /pharmacy/medicines/:medId (admin only) - Update medicine
router.put('/pharmacy/medicines/:medId', authenticate, authorize('admin'), validate({ body: 'updateMedicine' }), async (req, res, next) => {
    try {
        const { medId } = req.params;
        const { stock_quantity, dosage_form, manufacturer, batch_number, expiry_date } = req.body;

        const medicine = await prisma.medicine.findUnique({
            where: { med_id: medId },
        select: { med_id: true, pharmacy_id: true, user_id: true },
        });

        if (!medicine) {
            throw new AppError(404, 'Medicine not found');
        }

        const updated = await prisma.medicine.update({
            where: { med_id },
            data: {
                stock_quantity: stock_quantity !== undefined ? Number(stock_quantity) : undefined,
                dosage_form,
                manufacturer,
                batch_number,
                expiry_date: expiry_date ? new Date(expiry_date) : null,
            },
        },
        });

        logger.info('Medicine updated:', updated.medicine_name);

        res.json({ success: true, data: updated });
    } catch (err) {
        next(err);
    }
});

// DELETE /pharmacy/medicines/:medId (admin only) - Delete medicine
router.delete('/pharmacy/medicines/:medId', authenticate, authorize('admin'), async (req, res, next) => {
    try {
        const { medId } = req.params;

        const medicine = await prisma.medicine.findUnique({
            where: { med_id: medId },
            select: { med_id: true, pharmacy_id: true, user_id: true },
        });

        if (!medicine) {
            throw new AppError(404, 'Medicine not found');
        }

        await prisma.medicine.delete({
            where: { med_id },
        });

        logger.info('Medicine deleted:', medId);

        res.json({ success: true, message: 'Medicine deleted' });
    } catch (err) {
        next(err);
    }
});

// GET /pharmacy/medicines - Get medicines for a pharmacy
router.get('/pharmacy/medicines', authenticate, authorize('admin', 'warden', 'technician'), async (req, res, next) => {
    try {
        const { role, userId } = req.user;
        let whereClause = {};

        if (role === 'student' || role === 'technician') {
            // Students/Technicians only see their assigned pharmacy
            whereClause = { pharmacy_id: req.params.pharmacy_id || null };
        } else if (role === 'warden') {
            // Wardens see their assigned pharmacy
            whereClause = { assigned_hostel_id: req.user.assigned_hostel_id };
        } else if (role === 'admin') {
            // Admins see all pharmacies
            // No filter - admins can see all
        }

        const medicines = await prisma.medicine.findMany({
            where: whereClause,
            select: {
                med_id: true,
                pharmacy_id: true,
                medicine_name: true,
                stock_quantity: true,
                dosage_form: true,
                manufacturer: true,
                batch_number: true,
                expiry_date: true,
            },
            orderBy: { created_at: 'desc' },
        });

        res.json({ success: true, data: medicines });
    } catch (err) {
        next(err);
    }
});

// GET /pharmacy/medicines/:medId - Get specific medicine
router.get('/pharmacy/medicines/:medId', authenticate, authorize('admin', 'warden', 'technician'), async (req, res, next) => {
    try {
        const { medId, role, userId } = req.params;
        const medicine = await prisma.medicine.findUnique({
            where: { med_id: medId },
            select: {
                med_id: true,
                pharmacy_id: true,
                medicine_name: true,
                stock_quantity: true,
                dosage_form: true,
                manufacturer: true,
                batch_number: true,
                expiry_date: true,
            },
            include: {
                pharmacy: {
                    select: {
                        pharmacy_id: true,
                        pharmacy_name: true,
                    },
                },
            },
        });

        if (!medicine) {
            throw new AppError(404, 'Medicine not found');
        }

        res.json({ success: true, data: medicine });
    } catch (err) {
        next(err);
    }
});

// GET /pharmacy/visits - Get pharmacy visits (admin only)
router.get('/pharmacy/visits', authenticate, authorize('admin'), async (req, res, next) => {
    try {
        const visits = await prisma.pharmacy_visit.findMany({
            orderBy: { created_at: 'desc' },
            include: {
                student: {
                    select: {
                        student_id: true,
                        reg_no: true,
                        first_name: true,
                        last_name: true,
                    },
                },
                visitor: {
                    select: {
                        visitor_name: true,
                        id_proof_type: true,
                        id_proof_number: true,
                        student_id: true,
                    },
                },
            },
        });

        res.json({ success: true, data: visits });
    } catch (err) {
        next(err);
    }
});

// POST /pharmacy/visits (admin only) - Create pharmacy visit
router.post('/pharmacy/visits', authenticate, authorize('admin'), validate({ body: 'createVisit' }), async (req, res, next) => {
    try {
        const { pharmacy_id, visitor_name, id_proof_type, id_proof_number, student_id } = req.body;

        const student = await prisma.student.findUnique({
            where: { student_id },
            select: { reg_no: true, hostel_id: true },
        });

        if (!student) {
            throw new AppError(404, 'Student not found');
        }

        const visit = await prisma.pharmacy_visit.create({
            data: {
                pharmacy_id,
                visitor_name,
                id_proof_type,
                id_proof_number,
                student_id,
                visit_date: new Date(),
            },
        });

        logger.info('Pharmacy visit created:', visit_id, 'for student:', student_id);

        res.status(201).json({ success: true, data: visit });
    } catch (err) {
        next(err);
    }
});

module.exports = router;
