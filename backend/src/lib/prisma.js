const { PrismaClient } = require('@prisma/client');
const logger = require('./logger');

const prisma = new PrismaClient({
  log: [
    { emit: 'event', level: 'query' },
    { emit: 'event', level: 'error' },
    { emit: 'event', level: 'warn' },
  ],
});

prisma.$on('query', (e) => {
  logger.debug(`Prisma Query: ${e.query} — ${e.duration}ms`);
});

prisma.$on('error', (e) => {
  logger.error(`Prisma Error: ${e.message}`);
});

prisma.$on('warn', (e) => {
  logger.warn(`Prisma Warning: ${e.message}`);
});

// ────────────────────────────────────────────────────────────
// OPTIMISTIC CONCURRENCY CONTROL MIDDLEWARE
// ────────────────────────────────────────────────────────────
// Tables with row_version columns (added in 05_concurrency_recovery.sql).
// When these tables are updated, this middleware warns if row_version
// is not included in the WHERE clause — helping developers catch
// potential concurrency issues during development.
//
// For production enforcement, use the withOptimisticLock() helper
// from lib/transaction.js instead of raw prisma.model.update().
// ────────────────────────────────────────────────────────────

const VERSIONED_TABLES = new Set([
  'bed',
  'allocation',
  'feepayment',
  'facility_booking',
  'complaint',
  'laundry_request',
  'mess_subscription',
  'emergency_request',
]);

const extendedPrisma = prisma.$extends({
  query: {
    $allModels: {
      async update({ model, operation, args, query }) {
        if (VERSIONED_TABLES.has(model)) {
          const where = args.where || {};
          if (!('row_version' in where)) {
            logger.debug(
              `[OCC] Update on versioned table "${model}" without row_version in WHERE. ` +
              `Consider using withOptimisticLock() for concurrent-safe updates.`
            );
          }
        }
        return query(args);
      },
      async updateMany({ model, operation, args, query }) {
        if (VERSIONED_TABLES.has(model)) {
          const where = args.where || {};
          if (!('row_version' in where)) {
            logger.debug(
              `[OCC] UpdateMany on versioned table "${model}" without row_version in WHERE. ` +
              `Consider using withOptimisticLock() for concurrent-safe updates.`
            );
          }
        }
        return query(args);
      }
    }
  }
});

module.exports = extendedPrisma;
