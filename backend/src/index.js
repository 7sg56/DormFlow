const path = require('path');
const fs = require('fs');

// Load .env from project root for local dev; Docker injects env vars directly
const envPath = path.resolve(__dirname, '../../.env');
if (fs.existsSync(envPath)) {
  require('dotenv').config({ path: envPath });
}

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const logger = require('./lib/logger');
const { initSentry, Sentry } = require('./lib/sentry');
const prisma = require('./lib/prisma');
const { redis } = require('./lib/redis');
const { errorHandler } = require('./middleware/errorHandler');
const { globalLimiter } = require('./middleware/rateLimiter');
const routes = require('./routes');

const app = express();
const port = process.env.PORT || 5001;

// ---- Sentry (must be first) ----
initSentry(app);

// ---- Global middleware ----
app.use(helmet());

// CORS configuration - allow credentials for httpOnly cookies
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ---- Rate limiter ----
app.use('/api', globalLimiter);

// ---- Health checks ----
app.get('/', (_req, res) => {
  res.json({ status: 'ok', service: 'dormflow-api', version: '1.0.0' });
});

app.get('/api/health', async (_req, res) => {
  const health = { status: 'ok', timestamp: new Date().toISOString() };

  // Check DB
  try {
    await prisma.$queryRaw`SELECT 1`;
    health.db = 'connected';
  } catch (err) {
    health.db = 'disconnected';
    health.status = 'degraded';
  }

  // Check Redis
  try {
    await redis.ping();
    health.redis = 'connected';
  } catch (err) {
    health.redis = 'disconnected';
    health.status = 'degraded';
  }

  const statusCode = health.status === 'ok' ? 200 : 503;
  res.status(statusCode).json(health);
});

// ---- API routes ----
app.use('/api', routes);

// ---- Error handler (must be last) ----
if (Sentry && process.env.SENTRY_DSN) {
  app.use(Sentry.expressErrorHandler());
}
app.use(errorHandler);

// ---- Startup ----
async function start() {
  // Wait for DB
  let dbReady = false;
  for (let i = 0; i < 10; i++) {
    try {
      await prisma.$connect();
      logger.info('Database connected');
      dbReady = true;
      break;
    } catch (err) {
      logger.warn(`DB not ready, retrying in 5s... (${i + 1}/10)`);
      await new Promise((r) => setTimeout(r, 5000));
    }
  }

  if (!dbReady) {
    logger.error('Failed to connect to database after 10 retries');
    process.exit(1);
  }

  // Wait for Redis
  try {
    await redis.ping();
    logger.info('Redis connected');
  } catch (err) {
    logger.warn('Redis not available — running without cache', { error: err.message });
  }

  app.listen(port, () => {
    logger.info(`DormFlow API listening on port ${port}`);
    logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
  });
}

// ---- Graceful shutdown ----
async function shutdown(signal) {
  logger.info(`${signal} received — shutting down gracefully`);

  try {
    await prisma.$disconnect();
    logger.info('Prisma disconnected');
  } catch (err) {
    logger.error('Prisma disconnect error', { error: err.message });
  }

  try {
    redis.disconnect();
    logger.info('Redis disconnected');
  } catch (err) {
    logger.error('Redis disconnect error', { error: err.message });
  }

  if (Sentry && Sentry.close) {
    await Sentry.close(2000);
  }

  process.exit(0);
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
process.on('unhandledRejection', (reason) => {
  logger.error('Unhandled Rejection', { reason: String(reason) });
});
process.on('uncaughtException', (err) => {
  logger.error('Uncaught Exception', { error: err.message, stack: err.stack });
  process.exit(1);
});

start();

module.exports = app;
