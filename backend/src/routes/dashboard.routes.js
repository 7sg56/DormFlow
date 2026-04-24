const { query } = require('../lib/db');
const { authorize } = require('../plugins/auth');

module.exports = async function dashboardRoutes(fastify) {

  // ================================================================
  // STATS — role-aware, single endpoint
  // ================================================================
  fastify.get('/stats', async (request) => {
    const { role, id, hostel_id } = request.session.user;

    if (role === 'admin') {
      const [[s]] = await query('SELECT COUNT(*) AS c FROM student WHERE status="Active"');
      const [[h]] = await query('SELECT COUNT(*) AS c FROM hostel');
      const [[r]] = await query('SELECT COUNT(*) AS c FROM room');
      const [[b]] = await query('SELECT COUNT(*) AS c FROM bed');
      const [[ob]] = await query('SELECT COUNT(*) AS c FROM bed WHERE occupied=TRUE');
      const [[oc]] = await query("SELECT COUNT(*) AS c FROM complaint WHERE status NOT IN ('Resolved','Closed')");
      const [[pf]] = await query("SELECT COUNT(*) AS c FROM feepayment WHERE status='Pending'");
      const [[td]] = await query("SELECT IFNULL(SUM(balance_due),0) AS t FROM feepayment WHERE status!='Paid'");
      const [[tc]] = await query('SELECT COUNT(*) AS c FROM technician');
      return { success: true, data: {
        total_hostels: h.c, total_students: s.c, total_rooms: r.c,
        total_beds: b.c, occupied_beds: ob.c, open_complaints: oc.c,
        pending_fees: pf.c, total_outstanding: td.t, total_technicians: tc.c,
      }};
    }

    if (role === 'warden') {
      const [[r]] = await query('SELECT COUNT(*) AS c FROM room WHERE hostel_id=?', [hostel_id]);
      const [[b]] = await query('SELECT COUNT(*) AS c FROM bed b JOIN room r ON b.room_id=r.room_id WHERE r.hostel_id=?', [hostel_id]);
      const [[ob]] = await query('SELECT COUNT(*) AS c FROM bed b JOIN room r ON b.room_id=r.room_id WHERE r.hostel_id=? AND b.occupied=TRUE', [hostel_id]);
      const [[s]] = await query(`SELECT COUNT(*) AS c FROM allocation a
        JOIN bed bd ON a.bed_id=bd.bed_id JOIN room rm ON bd.room_id=rm.room_id
        WHERE rm.hostel_id=? AND a.status='Active'`, [hostel_id]);
      const [[oc]] = await query(`SELECT COUNT(*) AS c FROM complaint c
        JOIN room rm ON c.room_id=rm.room_id
        WHERE rm.hostel_id=? AND c.status NOT IN ('Resolved','Closed')`, [hostel_id]);
      const [[fd]] = await query(`SELECT COUNT(DISTINCT f.student_id) AS c FROM feepayment f
        JOIN allocation a ON f.student_id=a.student_id AND a.status='Active'
        JOIN bed bd ON a.bed_id=bd.bed_id JOIN room rm ON bd.room_id=rm.room_id
        WHERE rm.hostel_id=? AND f.status IN ('Pending','Overdue')`, [hostel_id]);
      return { success: true, data: {
        total_rooms: r.c, total_beds: b.c, occupied_beds: ob.c,
        total_students: s.c, open_complaints: oc.c, fee_defaulters: fd.c,
      }};
    }

    if (role === 'student') {
      // Allocation
      const [alloc] = await query(`SELECT h.hostel_name, r.room_number, r.floor, b.bed_number
        FROM allocation a JOIN bed b ON a.bed_id=b.bed_id JOIN room r ON b.room_id=r.room_id
        JOIN hostel h ON r.hostel_id=h.hostel_id
        WHERE a.student_id=? AND a.status='Active'`, [id]);
      // Fees
      const [[fc]] = await query(`SELECT
        COUNT(CASE WHEN status='Pending' THEN 1 END) AS pending_count,
        COUNT(CASE WHEN status='Overdue' THEN 1 END) AS overdue_count,
        IFNULL(SUM(balance_due),0) AS total_balance
        FROM feepayment WHERE student_id=?`, [id]);
      // Complaints
      const [[cc]] = await query(`SELECT COUNT(*) AS open_count FROM complaint
        WHERE student_id=? AND status NOT IN ('Resolved','Closed')`, [id]);
      // Mess
      const [mess] = await query(`SELECT m.mess_name FROM student s
        JOIN mess m ON s.mess_id=m.mess_id WHERE s.student_id=?`, [id]);
      return { success: true, data: {
        allocation: alloc[0] || null,
        fees: { pending_count: fc.pending_count, overdue_count: fc.overdue_count, total_balance: fc.total_balance },
        complaints: { open_count: cc.open_count },
        mess: mess[0] || null,
      }};
    }

    if (role === 'technician') {
      const [[ta]] = await query('SELECT COUNT(*) AS c FROM complaint WHERE technician_id=?', [id]);
      const [[p]] = await query("SELECT COUNT(*) AS c FROM complaint WHERE technician_id=? AND status NOT IN ('Resolved','Closed')", [id]);
      const [[rv]] = await query("SELECT COUNT(*) AS c FROM complaint WHERE technician_id=? AND status='Resolved'", [id]);
      const [[avg]] = await query("SELECT ROUND(AVG(DATEDIFF(COALESCE(resolved_date,CURDATE()),created_at)),1) AS d FROM complaint WHERE technician_id=?", [id]);
      return { success: true, data: {
        total_assigned: ta.c, pending: p.c, resolved: rv.c, avg_days_to_resolve: avg.d,
      }};
    }

    return { success: true, data: {} };
  });

  // ================================================================
  // STUDENT endpoints
  // ================================================================
  fastify.get('/student-complaints', {
    preHandler: [authorize('student')],
  }, async (request) => {
    const [rows] = await query(`SELECT c.complaint_id, c.complaint_type, c.description,
      c.priority, c.status, r.room_number, DATEDIFF(CURDATE(), c.created_at) AS days_open
      FROM complaint c LEFT JOIN room r ON c.room_id=r.room_id
      WHERE c.student_id=? ORDER BY c.created_at DESC`, [request.session.user.id]);
    return { success: true, data: rows };
  });

  fastify.post('/raise-complaint', {
    preHandler: [authorize('student')],
  }, async (request) => {
    const { description, complaint_type, priority } = request.body;
    const sid = request.session.user.id;
    // Auto-derive room_id from active allocation
    const [alloc] = await query(`SELECT r.room_id FROM allocation a
      JOIN bed b ON a.bed_id=b.bed_id JOIN room r ON b.room_id=r.room_id
      WHERE a.student_id=? AND a.status='Active'`, [sid]);
    const roomId = alloc.length ? alloc[0].room_id : null;
    await query(`INSERT INTO complaint (student_id, room_id, complaint_type, description, priority, status, created_at)
      VALUES (?,?,?,?,?,'Open',NOW())`, [sid, roomId, complaint_type, description, priority || 'Medium']);
    return { success: true, data: { message: 'Complaint raised' } };
  });

  fastify.get('/student-fees', {
    preHandler: [authorize('student')],
  }, async (request) => {
    const [rows] = await query(`SELECT payment_id, fee_month, semester, amount_due, paid_amount,
      balance_due, payment_mode, due_date, payment_date,
      CASE WHEN status='Paid' THEN 'Paid'
           WHEN due_date < CURDATE() AND status!='Paid' THEN 'Overdue'
           WHEN paid_amount > 0 AND paid_amount < amount_due THEN 'Partial'
           ELSE 'Pending' END AS display_status
      FROM feepayment WHERE student_id=? ORDER BY due_date DESC`, [request.session.user.id]);
    return { success: true, data: rows };
  });

  // ================================================================
  // WARDEN / ADMIN endpoints
  // ================================================================
  fastify.get('/hostel-complaints', {
    preHandler: [authorize('admin', 'warden')],
  }, async (request) => {
    const { role, hostel_id } = request.session.user;
    let sql = `SELECT c.complaint_id, c.complaint_type, c.description, c.priority, c.status,
      CONCAT(s.first_name,' ',s.last_name) AS student_name, s.reg_no,
      r.room_number, DATEDIFF(CURDATE(), c.created_at) AS days_open
      FROM complaint c JOIN student s ON c.student_id=s.student_id
      LEFT JOIN room r ON c.room_id=r.room_id`;
    const params = [];
    if (role === 'warden') {
      sql += ' WHERE r.hostel_id=?';
      params.push(hostel_id);
    }
    sql += ' ORDER BY c.created_at DESC';
    const [rows] = await query(sql, params);
    return { success: true, data: rows };
  });

  fastify.put('/update-complaint/:id', {
    preHandler: [authorize('admin', 'warden', 'technician')],
  }, async (request) => {
    const { status } = request.body;
    const resolvedCol = status === 'Resolved' ? ', resolved_date=CURDATE()' : '';
    await query(`UPDATE complaint SET status=?${resolvedCol} WHERE complaint_id=?`, [status, request.params.id]);
    return { success: true, data: { message: 'Updated' } };
  });

  fastify.get('/hostel-fees', {
    preHandler: [authorize('admin', 'warden')],
  }, async (request) => {
    const { role, hostel_id } = request.session.user;
    let sql = `SELECT f.payment_id, f.fee_month, f.semester, f.amount_due, f.paid_amount,
      f.balance_due, f.payment_mode, f.due_date,
      CONCAT(s.first_name,' ',s.last_name) AS student_name, r.room_number,
      CASE WHEN f.status='Paid' THEN 'Paid'
           WHEN f.due_date < CURDATE() AND f.status!='Paid' THEN 'Overdue'
           WHEN f.paid_amount > 0 AND f.paid_amount < f.amount_due THEN 'Partial'
           ELSE 'Pending' END AS display_status
      FROM feepayment f JOIN student s ON f.student_id=s.student_id
      LEFT JOIN allocation a ON s.student_id=a.student_id AND a.status='Active'
      LEFT JOIN bed b ON a.bed_id=b.bed_id LEFT JOIN room r ON b.room_id=r.room_id`;
    const params = [];
    if (role === 'warden') {
      sql += ' WHERE r.hostel_id=?';
      params.push(hostel_id);
    }
    sql += ' ORDER BY f.due_date DESC';
    const [rows] = await query(sql, params);
    return { success: true, data: rows };
  });

  fastify.get('/fee-defaulters', {
    preHandler: [authorize('admin', 'warden')],
  }, async (request) => {
    const { role, hostel_id } = request.session.user;
    let sql = `SELECT s.reg_no, CONCAT(s.first_name,' ',s.last_name) AS name,
      s.phone_primary, r.room_number, b.bed_number,
      SUM(f.balance_due) AS total_outstanding,
      COUNT(*) AS overdue_count, MAX(f.due_date) AS latest_due_date
      FROM feepayment f JOIN student s ON f.student_id=s.student_id
      LEFT JOIN allocation a ON s.student_id=a.student_id AND a.status='Active'
      LEFT JOIN bed b ON a.bed_id=b.bed_id LEFT JOIN room r ON b.room_id=r.room_id
      WHERE f.status IN ('Pending','Overdue') AND f.balance_due > 0`;
    const params = [];
    if (role === 'warden') {
      sql += ' AND r.hostel_id=?';
      params.push(hostel_id);
    }
    sql += ' GROUP BY s.student_id HAVING total_outstanding > 0 ORDER BY total_outstanding DESC';
    const [rows] = await query(sql, params);
    return { success: true, data: rows };
  });

  fastify.get('/students', {
    preHandler: [authorize('admin', 'warden')],
  }, async (request) => {
    const { role, hostel_id } = request.session.user;
    let sql = `SELECT s.student_id, s.reg_no, CONCAT(s.first_name,' ',s.last_name) AS name,
      s.department, s.academic_year, s.phone_primary,
      h.hostel_name, r.room_number, r.floor, b.bed_number, m.mess_name AS mess,
      (SELECT IFNULL(SUM(fp.balance_due),0) FROM feepayment fp WHERE fp.student_id=s.student_id AND fp.status!='Paid') AS pending_fees,
      (SELECT COUNT(*) FROM complaint c WHERE c.student_id=s.student_id AND c.status NOT IN ('Resolved','Closed')) AS open_complaints
      FROM student s
      JOIN allocation a ON s.student_id=a.student_id AND a.status='Active'
      JOIN bed b ON a.bed_id=b.bed_id JOIN room r ON b.room_id=r.room_id
      JOIN hostel h ON r.hostel_id=h.hostel_id LEFT JOIN mess m ON s.mess_id=m.mess_id`;
    const params = [];
    if (role === 'warden') {
      sql += ' WHERE r.hostel_id=?';
      params.push(hostel_id);
    }
    sql += ' ORDER BY s.reg_no';
    const [rows] = await query(sql, params);
    return { success: true, data: rows };
  });

  // ================================================================
  // TECHNICIAN endpoints
  // ================================================================
  fastify.get('/my-complaints', {
    preHandler: [authorize('technician')],
  }, async (request) => {
    const [rows] = await query(`SELECT c.complaint_id, c.complaint_type, c.description,
      c.priority, c.status, CONCAT(s.first_name,' ',s.last_name) AS student_name,
      s.reg_no, r.room_number, DATEDIFF(CURDATE(), c.created_at) AS days_open
      FROM complaint c JOIN student s ON c.student_id=s.student_id
      LEFT JOIN room r ON c.room_id=r.room_id
      WHERE c.technician_id=? ORDER BY c.created_at DESC`, [request.session.user.id]);
    return { success: true, data: rows };
  });

  // ================================================================
  // SHARED endpoints (all roles)
  // ================================================================
  fastify.get('/room-occupancy', {
    preHandler: [authorize('admin', 'warden')],
  }, async (request) => {
    const { role, hostel_id } = request.session.user;
    let sql = `SELECT r.room_id, r.room_number, r.floor, r.room_type, r.capacity,
      h.hostel_name, r.hostel_id,
      COUNT(b.bed_id) AS total_beds,
      SUM(CASE WHEN b.occupied=TRUE THEN 1 ELSE 0 END) AS occupied_beds,
      SUM(CASE WHEN b.occupied=FALSE THEN 1 ELSE 0 END) AS vacant_beds
      FROM room r JOIN hostel h ON r.hostel_id=h.hostel_id
      LEFT JOIN bed b ON r.room_id=b.room_id`;
    const params = [];
    if (role === 'warden') {
      sql += ' WHERE r.hostel_id=?';
      params.push(hostel_id);
    }
    sql += ' GROUP BY r.room_id ORDER BY h.hostel_name, r.room_number';
    const [rows] = await query(sql, params);
    return { success: true, data: rows };
  });

  fastify.get('/mess-info', async () => {
    const [rows] = await query('SELECT * FROM v_mess_full');
    return { success: true, data: rows };
  });

  fastify.get('/laundry-info', async () => {
    const [rows] = await query('SELECT * FROM v_laundry_full');
    return { success: true, data: rows };
  });

  fastify.get('/visitor-logs', async (request) => {
    const { role, id, hostel_id } = request.session.user;
    let sql = 'SELECT * FROM v_visitor_log';
    const params = [];
    if (role === 'student') {
      sql += ' WHERE student_id=?';
      params.push(id);
    } else if (role === 'warden') {
      sql += ' WHERE hostel_id=?';
      params.push(hostel_id);
    }
    sql += ' ORDER BY entry_time DESC';
    const [rows] = await query(sql, params);
    return { success: true, data: rows };
  });
};
