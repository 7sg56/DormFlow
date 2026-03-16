import express from 'express';
import cors from 'cors';
import mysql from 'mysql2/promise';

const app = express();
const port = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());

// MySQL connection pool
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'db',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'hostel',
  database: process.env.DB_NAME || 'hostel_mgmt_3nf',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Retry connection until MySQL is ready (Docker startup delay)
async function waitForDB(retries = 10, delay = 5000): Promise<void> {
  for (let i = 0; i < retries; i++) {
    try {
      const conn = await pool.getConnection();
      console.log('Database connected successfully');
      conn.release();
      return;
    } catch (err) {
      console.log(`DB not ready, retrying in ${delay / 1000}s... (${i + 1}/${retries})`);
      await new Promise((res) => setTimeout(res, delay));
    }
  }
  console.error('Failed to connect to database after all retries');
  process.exit(1);
}

// Health check endpoint
app.get('/', (_req, res) => {
  res.json({ status: 'ok', message: 'Backend initialized' });
});

// DB health check
app.get('/api/health', async (_req, res) => {
  try {
    const [rows] = await pool.query('SELECT 1 AS alive');
    res.json({ status: 'ok', db: 'connected', result: rows });
  } catch (err) {
    res.status(500).json({ status: 'error', db: 'disconnected', error: String(err) });
  }
});

// Start server after DB is ready
waitForDB().then(() => {
  app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
  });
});

export { pool };
