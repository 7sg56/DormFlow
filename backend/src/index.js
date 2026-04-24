const path = require('path');
const fs = require('fs');

// Load .env from project root
const envPath = path.resolve(__dirname, '../../.env');
if (fs.existsSync(envPath)) {
  require('dotenv').config({ path: envPath });
}

const fastify = require('fastify');
const logger = require('./lib/logger');
const { testConnection } = require('./lib/db');

const app = fastify({
  logger: false, // We use our own logger
});

// ---- Register plugins ----
async function registerPlugins() {
  // Helmet (security headers)
  await app.register(require('@fastify/helmet'));

  // CORS
  await app.register(require('@fastify/cors'), {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  });

  // Global rate limit
  await app.register(require('@fastify/rate-limit'), {
    max: 200,
    timeWindow: '1 minute',
    errorResponseBuilder: () => ({
      success: false,
      error: 'Too many requests, please try again later',
    }),
  });

  // Auth plugin (cookie-session)
  await app.register(require('./plugins/auth'));

  // Routes
  await app.register(require('./routes'), { prefix: '/api' });
}

// ---- Health checks ----
app.get('/', async () => {
  return { status: 'ok', service: 'dormflow-api', version: '3.0.0' };
});

app.get('/api/health', async (_request, reply) => {
  const health = { status: 'ok', timestamp: new Date().toISOString() };

  try {
    await testConnection();
    health.db = 'connected';
  } catch (_err) {
    health.db = 'disconnected';
    health.status = 'degraded';
  }

  const statusCode = health.status === 'ok' ? 200 : 503;
  return reply.status(statusCode).send(health);
});

// ---- Global error handler ----
app.setErrorHandler((error, _request, reply) => {
  logger.error('Unhandled error', {
    error: error.message,
    stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
  });

  // MySQL duplicate entry
  if (error.code === 'ER_DUP_ENTRY') {
    return reply.status(409).send({ success: false, error: 'Duplicate record' });
  }
  // MySQL FK not found
  if (error.code === 'ER_NO_REFERENCED_ROW_2') {
    return reply.status(400).send({ success: false, error: 'Referenced record not found' });
  }
  // MySQL cannot delete parent
  if (error.code === 'ER_ROW_IS_REFERENCED_2') {
    return reply.status(409).send({
      success: false,
      error: 'Cannot delete — record is referenced by other records',
    });
  }

  const statusCode = error.statusCode || 500;
  return reply.status(statusCode).send({
    success: false,
    error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
  });
});

// ---- Startup ----
async function start() {
  const port = parseInt(process.env.PORT || '5001', 10);

  // Wait for DB
  let dbReady = false;
  for (let i = 0; i < 10; i++) {
    try {
      await testConnection();
      logger.info('Database connected');
      dbReady = true;
      break;
    } catch (_err) {
      logger.warn(`DB not ready, retrying in 5s... (${i + 1}/10)`);
      await new Promise((r) => setTimeout(r, 5000));
    }
  }

  if (!dbReady) {
    logger.error('Failed to connect to database after 10 retries');
    process.exit(1);
  }

  await registerPlugins();

  try {
    await app.listen({ port, host: '0.0.0.0' });
    logger.info(`DormFlow API listening on port ${port}`);
    logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
  } catch (err) {
    logger.error('Failed to start server', { error: err.message });
    process.exit(1);
  }
}

// ---- Graceful shutdown ----
function shutdown(signal) {
  logger.info(`${signal} received — shutting down`);
  app.close().then(() => process.exit(0));
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
process.on('unhandledRejection', (reason) => {
  logger.error('Unhandled Rejection', { reason: String(reason) });
});

start();

module.exports = app;
