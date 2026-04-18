const { query, getConnection } = require('../lib/db');
const logger = require('../lib/logger');

module.exports = async function allocationRoutes(fastify) {
  // Stricter rate limit for booking endpoints
  await fastify.register(require('@fastify/rate-limit'), {
    max: 5,
    timeWindow: '10 seconds',
    errorResponseBuilder: () => ({
      success: false,
      error: 'Booking rate limit exceeded, try again shortly',
    }),
  });

  // ── LIST ─────────────────────────────────────────────────
  fastify.get('/', async (request) => {
    const page = Math.max(1, parseInt(request.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(request.query.limit) || 20));
    const offset = (page - 1) * limit;

    const [rows] = await query(`
      SELECT a.*,
             CONCAT(s.first_name, ' ', s.last_name) AS student_name, s.reg_no,
             b.bed_number, r.room_number, r.floor, h.hostel_name
      FROM allocation a
      JOIN student s ON a.student_id = s.student_id
      JOIN bed b ON a.bed_id = b.bed_id
      JOIN room r ON b.room_id = r.room_id
      JOIN hostel h ON r.hostel_id = h.hostel_id
      ORDER BY a.created_at DESC
      LIMIT ? OFFSET ?
    `, [limit, offset]);

    const [[{ total }]] = await query('SELECT COUNT(*) AS total FROM allocation');

    return {
      success: true,
      data: rows,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  });

  // ── GET BY ID ────────────────────────────────────────────
  fastify.get('/:id', async (request, reply) => {
    const [rows] = await query(`
      SELECT a.*,
             CONCAT(s.first_name, ' ', s.last_name) AS student_name, s.reg_no,
             b.bed_number, r.room_number, r.floor, h.hostel_name
      FROM allocation a
      JOIN student s ON a.student_id = s.student_id
      JOIN bed b ON a.bed_id = b.bed_id
      JOIN room r ON b.room_id = r.room_id
      JOIN hostel h ON r.hostel_id = h.hostel_id
      WHERE a.allocation_id = ?
    `, [request.params.id]);

    if (!rows.length) {
      return reply.status(404).send({ success: false, error: 'Allocation not found' });
    }
    return { success: true, data: rows[0] };
  });

  // ── CREATE (with MySQL named lock for concurrency) ───────
  fastify.post('/', async (request, reply) => {
    const { student_id, bed_id, start_date, allocated_by, reason, status } = request.body;

    if (!student_id || !bed_id || !start_date) {
      return reply.status(400).send({
        success: false,
        error: 'student_id, bed_id, and start_date are required',
      });
    }

    const lockName = `bed_lock_${bed_id}`;
    const conn = await getConnection();

    try {
      // Acquire named lock (10 second timeout)
      const [[{ locked }]] = await conn.execute(
        `SELECT GET_LOCK(?, 10) AS locked`, [lockName]
      );

      if (!locked) {
        conn.release();
        return reply.status(429).send({
          success: false,
          error: 'Bed is being processed by another request. Try again shortly.',
        });
      }

      await conn.beginTransaction();

      // Check bed availability
      const [[bed]] = await conn.execute(
        'SELECT occupied FROM bed WHERE bed_id = ?', [bed_id]
      );
      if (!bed) {
        await conn.rollback();
        await conn.execute('SELECT RELEASE_LOCK(?)', [lockName]);
        conn.release();
        return reply.status(404).send({ success: false, error: 'Bed not found' });
      }
      if (bed.occupied) {
        await conn.rollback();
        await conn.execute('SELECT RELEASE_LOCK(?)', [lockName]);
        conn.release();
        return reply.status(409).send({ success: false, error: 'Bed is already occupied' });
      }

      // Check student doesn't already have an active allocation
      const [[existing]] = await conn.execute(
        `SELECT allocation_id FROM allocation
         WHERE student_id = ? AND status = 'Active'
         AND (end_date IS NULL OR end_date >= CURDATE())`,
        [student_id]
      );
      if (existing) {
        await conn.rollback();
        await conn.execute('SELECT RELEASE_LOCK(?)', [lockName]);
        conn.release();
        return reply.status(409).send({ success: false, error: 'Student already has an active allocation' });
      }

      // Create allocation
      const allocationId = require('crypto').randomUUID();
      await conn.execute(
        `INSERT INTO allocation (allocation_id, student_id, bed_id, start_date, allocated_by, reason, status)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [allocationId, student_id, bed_id, start_date, allocated_by || null, reason || null, status || 'Active']
      );

      // Mark bed as occupied
      await conn.execute('UPDATE bed SET occupied = TRUE WHERE bed_id = ?', [bed_id]);

      await conn.commit();
      await conn.execute('SELECT RELEASE_LOCK(?)', [lockName]);
      conn.release();

      // Fetch the created allocation with joins
      const [rows] = await query(`
        SELECT a.*,
               CONCAT(s.first_name, ' ', s.last_name) AS student_name,
               b.bed_number, r.room_number, h.hostel_name
        FROM allocation a
        JOIN student s ON a.student_id = s.student_id
        JOIN bed b ON a.bed_id = b.bed_id
        JOIN room r ON b.room_id = r.room_id
        JOIN hostel h ON r.hostel_id = h.hostel_id
        WHERE a.allocation_id = ?
      `, [allocationId]);

      logger.info('Allocation created', { allocationId, student_id, bed_id });
      return reply.status(201).send({ success: true, data: rows[0] });
    } catch (err) {
      try { await conn.rollback(); } catch (_) {}
      try { await conn.execute('SELECT RELEASE_LOCK(?)', [lockName]); } catch (_) {}
      conn.release();
      throw err;
    }
  });

  // ── UPDATE ───────────────────────────────────────────────
  fastify.put('/:id', async (request, reply) => {
    const { status, end_date, ...rest } = request.body;

    // If vacating, free the bed
    if (status === 'Vacated' || status === 'Cancelled') {
      const [allocs] = await query(
        'SELECT bed_id FROM allocation WHERE allocation_id = ?', [request.params.id]
      );
      if (!allocs.length) {
        return reply.status(404).send({ success: false, error: 'Allocation not found' });
      }
      await query('UPDATE bed SET occupied = FALSE WHERE bed_id = ?', [allocs[0].bed_id]);
    }

    const fields = { ...rest };
    if (status) fields.status = status;
    if (end_date) fields.end_date = end_date;

    const columns = Object.keys(fields);
    if (!columns.length) {
      return reply.status(400).send({ success: false, error: 'No fields to update' });
    }

    const setClause = columns.map((c) => `${c} = ?`).join(', ');
    const values = [...Object.values(fields), request.params.id];
    const [result] = await query(
      `UPDATE allocation SET ${setClause} WHERE allocation_id = ?`, values
    );

    if (result.affectedRows === 0) {
      return reply.status(404).send({ success: false, error: 'Allocation not found' });
    }

    const [rows] = await query(`
      SELECT a.*,
             CONCAT(s.first_name, ' ', s.last_name) AS student_name,
             b.bed_number, r.room_number, h.hostel_name
      FROM allocation a
      JOIN student s ON a.student_id = s.student_id
      JOIN bed b ON a.bed_id = b.bed_id
      JOIN room r ON b.room_id = r.room_id
      JOIN hostel h ON r.hostel_id = h.hostel_id
      WHERE a.allocation_id = ?
    `, [request.params.id]);

    return { success: true, data: rows[0] };
  });

  // ── DELETE ───────────────────────────────────────────────
  fastify.delete('/:id', async (request, reply) => {
    const [allocs] = await query(
      'SELECT bed_id, status FROM allocation WHERE allocation_id = ?', [request.params.id]
    );
    if (!allocs.length) {
      return reply.status(404).send({ success: false, error: 'Allocation not found' });
    }

    if (allocs[0].status === 'Active') {
      await query('UPDATE bed SET occupied = FALSE WHERE bed_id = ?', [allocs[0].bed_id]);
    }

    await query('DELETE FROM allocation WHERE allocation_id = ?', [request.params.id]);
    return { success: true, message: 'Allocation deleted' };
  });
};
