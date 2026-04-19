const { query } = require('../lib/db');
const { authorize } = require('../plugins/auth');

module.exports = async function dashboardRoutes(fastify) {
  /**
   * GET /api/dashboard/stats
   * Aggregate stats for the admin/warden dashboard.
   */
  fastify.get('/stats', {
    preHandler: [authorize('admin', 'warden')],
  }, async () => {
    const [[students]] = await query('SELECT COUNT(*) AS count FROM student WHERE status = ?', ['Active']);
    const [[hostels]] = await query('SELECT COUNT(*) AS count FROM hostel');
    const [[rooms]] = await query('SELECT COUNT(*) AS count FROM room');
    const [[beds]] = await query('SELECT COUNT(*) AS count FROM bed');
    const [[occupiedBeds]] = await query('SELECT COUNT(*) AS count FROM bed WHERE occupied = TRUE');
    const [[openComplaints]] = await query(
      `SELECT COUNT(*) AS count FROM complaint WHERE status NOT IN ('Resolved', 'Closed')`
    );
    const [[pendingFees]] = await query(
      `SELECT COUNT(*) AS count FROM feepayment WHERE status = 'Pending'`
    );
    const [[totalFeeDue]] = await query(
      `SELECT IFNULL(SUM(balance_due), 0) AS total FROM feepayment WHERE status != 'Paid'`
    );

    const totalBeds = beds.count;
    const occupied = occupiedBeds.count;
    const occupancyRate = totalBeds > 0 ? Math.round((occupied / totalBeds) * 100 * 100) / 100 : 0;

    return {
      success: true,
      data: {
        totalStudents: students.count,
        totalHostels: hostels.count,
        totalRooms: rooms.count,
        totalBeds,
        occupiedBeds: occupied,
        availableBeds: totalBeds - occupied,
        occupancyRate,
        openComplaints: openComplaints.count,
        pendingFees: pendingFees.count,
        totalFeeDue: totalFeeDue.total,
      },
    };
  });

  /**
   * GET /api/dashboard/hostel-stats
   * Per-hostel breakdown — warden/admin only.
   */
  fastify.get('/hostel-stats', {
    preHandler: [authorize('admin', 'warden')],
  }, async () => {
    const [rows] = await query('SELECT * FROM v_hostel_stats');
    return { success: true, data: rows };
  });

  /**
   * GET /api/dashboard/fee-summary
   * Per-student fee summary — warden/admin only.
   */
  fastify.get('/fee-summary', {
    preHandler: [authorize('admin', 'warden')],
  }, async () => {
    const [rows] = await query('SELECT * FROM v_fee_summary');
    return { success: true, data: rows };
  });

  /**
   * GET /api/dashboard/complaint-board
   * Complaint dashboard — warden/admin/technician.
   */
  fastify.get('/complaint-board', {
    preHandler: [authorize('admin', 'warden', 'technician')],
  }, async () => {
    const [rows] = await query('SELECT * FROM v_complaint_dashboard ORDER BY created_at DESC');
    return { success: true, data: rows };
  });

  /**
   * GET /api/dashboard/room-occupancy
   * Room occupancy — warden/admin only.
   */
  fastify.get('/room-occupancy', {
    preHandler: [authorize('admin', 'warden')],
  }, async () => {
    const [rows] = await query('SELECT * FROM v_room_occupancy');
    return { success: true, data: rows };
  });
};
