const { createCrudRoutes } = require('./crud.factory');
const { requireAuth } = require('../plugins/auth');

module.exports = async function routes(fastify) {
  // ── Auth routes (login/logout/me — no auth required) ───────
  await fastify.register(require('./auth.routes'), { prefix: '/auth' });

  // All routes below require auth
  fastify.addHook('preHandler', requireAuth);

  // ── Dashboard (role-specific stats & actions) ──────────────
  await fastify.register(require('./dashboard.routes'), { prefix: '/dashboard' });

  // ── Allocations (custom routes) ────────────────────────────
  await fastify.register(require('./allocation.routes'), { prefix: '/allocations' });

  // ── Generic CRUD Entities ──────────────────────────────────

  await fastify.register(createCrudRoutes({
    table: 'hostel', idColumn: 'hostel_id', label: 'Hostel',
    listQuery: `
      SELECT h.*, pl.city, pl.state,
             hw.warden_name, hw.warden_phone, hw.warden_email
      FROM hostel h
      LEFT JOIN pincode_locality pl ON h.pincode = pl.pincode
      LEFT JOIN hostel_warden hw ON h.hostel_id = hw.hostel_id AND hw.is_active = TRUE
    `,
  }), { prefix: '/hostels' });

  await fastify.register(createCrudRoutes({
    table: 'student', idColumn: 'student_id', label: 'Student',
    listQuery: `
      SELECT s.student_id, s.reg_no, s.first_name, s.last_name,
             CONCAT(s.first_name, ' ', s.last_name) AS full_name,
             s.gender, s.department, s.course, s.academic_year, s.semester,
             s.phone_primary, s.email_institutional, s.status,
             pl.city, pl.state, ms.mess_name
      FROM student s
      LEFT JOIN pincode_locality pl ON s.pincode = pl.pincode
      LEFT JOIN mess ms ON s.mess_id = ms.mess_id
    `,
  }), { prefix: '/students' });

  await fastify.register(createCrudRoutes({
    table: 'room', idColumn: 'room_id', label: 'Room',
    listQuery: `
      SELECT r.*, h.hostel_name
      FROM room r JOIN hostel h ON r.hostel_id = h.hostel_id
    `,
  }), { prefix: '/rooms' });

  await fastify.register(createCrudRoutes({
    table: 'bed', idColumn: 'bed_id', label: 'Bed',
    listQuery: `
      SELECT b.*, r.room_number, r.floor, h.hostel_name
      FROM bed b
      JOIN room r ON b.room_id = r.room_id
      JOIN hostel h ON r.hostel_id = h.hostel_id
    `,
  }), { prefix: '/beds' });

  await fastify.register(createCrudRoutes({
    table: 'feepayment', idColumn: 'payment_id', label: 'Fee Payment',
    listQuery: `
      SELECT f.*, CONCAT(s.first_name, ' ', s.last_name) AS student_name, s.reg_no
      FROM feepayment f JOIN student s ON f.student_id = s.student_id
    `,
  }), { prefix: '/fees' });

  await fastify.register(createCrudRoutes({
    table: 'complaint', idColumn: 'complaint_id', label: 'Complaint',
    listQuery: `
      SELECT c.*,
             CONCAT(s.first_name, ' ', s.last_name) AS student_name, s.reg_no,
             r.room_number, h.hostel_name, t.name AS technician_name
      FROM complaint c
      JOIN student s ON c.student_id = s.student_id
      LEFT JOIN room r ON c.room_id = r.room_id
      LEFT JOIN hostel h ON r.hostel_id = h.hostel_id
      LEFT JOIN technician t ON c.technician_id = t.technician_id
    `,
  }), { prefix: '/complaints' });

  await fastify.register(createCrudRoutes({
    table: 'technician', idColumn: 'technician_id', label: 'Technician',
    listQuery: `
      SELECT t.*, h.hostel_name
      FROM technician t LEFT JOIN hostel h ON t.hostel_id = h.hostel_id
    `,
  }), { prefix: '/technicians' });

  await fastify.register(createCrudRoutes({
    table: 'mess', idColumn: 'mess_id', label: 'Mess',
    listQuery: `
      SELECT ms.*, h.hostel_name
      FROM mess ms JOIN hostel h ON ms.hostel_id = h.hostel_id
    `,
  }), { prefix: '/messes' });

  await fastify.register(createCrudRoutes({
    table: 'laundry', idColumn: 'laundry_id', label: 'Laundry',
    listQuery: `
      SELECT l.*, h.hostel_name
      FROM laundry l JOIN hostel h ON l.hostel_id = h.hostel_id
    `,
  }), { prefix: '/laundries' });

  await fastify.register(createCrudRoutes({
    table: 'visitor_log', idColumn: 'visitor_id', label: 'Visitor Log',
    listQuery: `
      SELECT vl.*,
             CONCAT(s.first_name, ' ', s.last_name) AS student_name, s.reg_no,
             r.room_number, h.hostel_name
      FROM visitor_log vl
      JOIN student s ON vl.student_id = s.student_id
      LEFT JOIN room r ON vl.room_id = r.room_id
      LEFT JOIN hostel h ON r.hostel_id = h.hostel_id
    `,
  }), { prefix: '/visitor-logs' });

  await fastify.register(createCrudRoutes({
    table: 'hostel_warden', idColumn: 'warden_id', label: 'Warden',
    listQuery: `
      SELECT hw.*, h.hostel_name
      FROM hostel_warden hw JOIN hostel h ON hw.hostel_id = h.hostel_id
    `,
  }), { prefix: '/wardens' });
};
