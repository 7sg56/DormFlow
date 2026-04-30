const { query } = require('../lib/db');

module.exports = async function authRoutes(fastify) {
  /**
   * POST /api/auth/login
   * Body: { role: 'student'|'warden'|'technician'|'admin', identifier: string, password: string }
   *
   * SQL: role-based SELECT with WHERE on identifier + password
   */
  fastify.post('/login', async (request, reply) => {
    const { role, identifier, password } = request.body || {};

    if (!role || !identifier || !password) {
      return reply.status(400).send({
        success: false,
        error: 'role, identifier, and password are required',
      });
    }

    // ── Admin: hardcoded from .env ────────────────────────────
    if (role === 'admin') {
      const adminUser = process.env.ADMIN_USERNAME || 'admin';
      const adminPass = process.env.ADMIN_PASSWORD || 'admin123';

      if (identifier === adminUser && password === adminPass) {
        request.session.user = {
          id: 'admin',
          role: 'admin',
          name: 'Administrator',
        };
        return { success: true, data: request.session.user };
      }
      return reply.status(401).send({ success: false, error: 'Invalid admin credentials' });
    }

    // ── Student: SELECT ... WHERE reg_no = ? AND password = ? ─
    if (role === 'student') {
      const [rows] = await query(
        `SELECT student_id, reg_no, CONCAT(first_name, ' ', last_name) AS name
         FROM student WHERE reg_no = ? AND password = ?`,
        [identifier, password]
      );
      if (!rows.length) {
        return reply.status(401).send({ success: false, error: 'Invalid student credentials' });
      }
      request.session.user = {
        id: rows[0].student_id,
        role: 'student',
        name: rows[0].name,
        reg_no: rows[0].reg_no,
      };
      return { success: true, data: request.session.user };
    }

    // ── Warden: SELECT ... WHERE warden_id = ? AND password = ?
    if (role === 'warden') {
      const [rows] = await query(
        `SELECT hw.warden_id, hw.warden_name AS name, hw.hostel_id, h.hostel_name
         FROM hostel_warden hw
         JOIN hostel h ON hw.hostel_id = h.hostel_id
         WHERE hw.warden_id = ? AND hw.password = ? AND hw.is_active = TRUE`,
        [identifier, password]
      );
      if (!rows.length) {
        return reply.status(401).send({ success: false, error: 'Invalid warden credentials' });
      }
      request.session.user = {
        id: rows[0].warden_id,
        role: 'warden',
        name: rows[0].name,
        hostel_id: rows[0].hostel_id,
        hostel_name: rows[0].hostel_name,
      };
      return { success: true, data: request.session.user };
    }

    // ── Technician: SELECT ... WHERE technician_id = ? AND password = ?
    if (role === 'technician') {
      const [rows] = await query(
        `SELECT t.technician_id, t.name, t.hostel_id, h.hostel_name,
                GROUP_CONCAT(DISTINCT sp.specialization_name ORDER BY sp.specialization_name SEPARATOR ', ') AS specializations
         FROM technician t
         LEFT JOIN hostel h ON t.hostel_id = h.hostel_id
         LEFT JOIN technician_specialization ts ON t.technician_id = ts.technician_id
         LEFT JOIN specialization sp ON ts.specialization_id = sp.specialization_id
         WHERE t.technician_id = ? AND t.password = ?
         GROUP BY t.technician_id, t.name, t.hostel_id, h.hostel_name`,
        [identifier, password]
      );
      if (!rows.length) {
        return reply.status(401).send({ success: false, error: 'Invalid technician credentials' });
      }
      request.session.user = {
        id: rows[0].technician_id,
        role: 'technician',
        name: rows[0].name,
        hostel_id: rows[0].hostel_id,
        hostel_name: rows[0].hostel_name,
        specializations: rows[0].specializations,
      };
      return { success: true, data: request.session.user };
    }

    return reply.status(400).send({ success: false, error: 'Invalid role' });
  });

  /**
   * GET /api/auth/me
   * Returns current session user or 401
   */
  fastify.get('/me', async (request, reply) => {
    if (!request.session || !request.session.user) {
      return reply.status(401).send({ success: false, error: 'Not authenticated' });
    }
    return { success: true, data: request.session.user };
  });

  /**
   * POST /api/auth/logout
   * Destroys session
   */
  fastify.post('/logout', async (request) => {
    request.session.delete();
    return { success: true, message: 'Logged out' };
  });
};
