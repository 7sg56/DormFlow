const { getConnection } = require('./db');
const logger = require('./logger');

/**
 * Run a callback inside a MySQL transaction.
 * Automatically commits on success, rolls back on error.
 *
 * @param {(conn: import('mysql2/promise').PoolConnection) => Promise<any>} fn
 * @returns {Promise<any>}
 */
async function withTransaction(fn) {
  const conn = await getConnection();
  try {
    await conn.beginTransaction();
    const result = await fn(conn);
    await conn.commit();
    return result;
  } catch (err) {
    await conn.rollback();
    logger.error('Transaction rolled back', { error: err.message });
    throw err;
  } finally {
    conn.release();
  }
}

module.exports = { withTransaction };
