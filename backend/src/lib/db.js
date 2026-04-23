const mysql = require('mysql2/promise');
const logger = require('./logger');

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306', 10),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'hostel',
  database: process.env.DB_NAME || 'hostel_mgmt',
  waitForConnections: true,
  connectionLimit: 20,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 10000,
});

/**
 * Execute a parameterized query.
 * @param {string} sql
 * @param {any[]}  params
 * @returns {Promise<[any[], any]>}
 */
async function query(sql, params = []) {
  const [rows, fields] = await pool.execute(sql, params);
  return [rows, fields];
}

/**
 * Get a dedicated connection for transactions.
 * Caller MUST call conn.release() when done.
 */
async function getConnection() {
  return pool.getConnection();
}

/**
 * Test connectivity — used during startup.
 */
async function testConnection() {
  const conn = await pool.getConnection();
  await conn.ping();
  conn.release();
}

module.exports = { pool, query, getConnection, testConnection };
