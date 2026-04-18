const { query } = require('../lib/db');

/**
 * Generic CRUD route factory using raw MySQL queries.
 * Returns a Fastify plugin function.
 *
 * @param {object} opts
 * @param {string} opts.table        — MySQL table name
 * @param {string} opts.idColumn     — Primary key column name
 * @param {string} [opts.label]      — Human label for responses
 * @param {string} [opts.listQuery]  — Custom SELECT for list
 * @param {string} [opts.getQuery]   — Custom SELECT for get-by-id
 */
function createCrudRoutes(opts) {
  const {
    table,
    idColumn,
    label = table,
    listQuery,
    getQuery,
  } = opts;

  return async function (fastify) {
    // ── LIST (paginated) ───────────────────────────────────
    fastify.get('/', async (request) => {
      const page = Math.max(1, parseInt(request.query.page) || 1);
      const limit = Math.min(100, Math.max(1, parseInt(request.query.limit) || 20));
      const offset = (page - 1) * limit;
      const sort = (request.query.sort || 'created_at').replace(/[^a-zA-Z0-9_]/g, '');
      const order = request.query.order === 'asc' ? 'ASC' : 'DESC';

      const baseQuery = listQuery || `SELECT * FROM ${table}`;
      const sql = `${baseQuery} ORDER BY ${sort} ${order} LIMIT ? OFFSET ?`;
      const [rows] = await query(sql, [limit, offset]);
      const [[{ total }]] = await query(`SELECT COUNT(*) AS total FROM ${table}`);

      return {
        success: true,
        data: rows,
        pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
      };
    });

    // ── GET BY ID ──────────────────────────────────────────
    fastify.get('/:id', async (request, reply) => {
      const sql = getQuery
        ? `${getQuery} WHERE t.${idColumn} = ?`
        : `SELECT * FROM ${table} WHERE ${idColumn} = ?`;
      const [rows] = await query(sql, [request.params.id]);
      if (!rows.length) {
        return reply.status(404).send({ success: false, error: `${label} not found` });
      }
      return { success: true, data: rows[0] };
    });

    // ── CREATE ─────────────────────────────────────────────
    fastify.post('/', async (request, reply) => {
      const body = request.body;
      const columns = Object.keys(body);
      const values = Object.values(body);
      const placeholders = columns.map(() => '?').join(', ');
      const sql = `INSERT INTO ${table} (${columns.join(', ')}) VALUES (${placeholders})`;

      try {
        await query(sql, values);
      } catch (err) {
        if (err.code === 'ER_DUP_ENTRY') {
          return reply.status(409).send({ success: false, error: 'Duplicate record' });
        }
        throw err;
      }

      const id = body[idColumn];
      if (id) {
        const [rows] = await query(`SELECT * FROM ${table} WHERE ${idColumn} = ?`, [id]);
        return reply.status(201).send({ success: true, data: rows[0] });
      }
      return reply.status(201).send({ success: true, data: body });
    });

    // ── UPDATE ─────────────────────────────────────────────
    fastify.put('/:id', async (request, reply) => {
      const body = request.body;
      const columns = Object.keys(body);
      if (!columns.length) {
        return reply.status(400).send({ success: false, error: 'No fields to update' });
      }

      const setClause = columns.map((col) => `${col} = ?`).join(', ');
      const values = [...Object.values(body), request.params.id];
      const [result] = await query(
        `UPDATE ${table} SET ${setClause} WHERE ${idColumn} = ?`, values
      );

      if (result.affectedRows === 0) {
        return reply.status(404).send({ success: false, error: `${label} not found` });
      }

      const [rows] = await query(`SELECT * FROM ${table} WHERE ${idColumn} = ?`, [request.params.id]);
      return { success: true, data: rows[0] };
    });

    // ── DELETE ─────────────────────────────────────────────
    fastify.delete('/:id', async (request, reply) => {
      const [result] = await query(`DELETE FROM ${table} WHERE ${idColumn} = ?`, [request.params.id]);
      if (result.affectedRows === 0) {
        return reply.status(404).send({ success: false, error: `${label} not found` });
      }
      return { success: true, message: `${label} deleted` };
    });
  };
}

module.exports = { createCrudRoutes };
