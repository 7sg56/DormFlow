/**
 * Transaction Utilities — Concurrency Control & Recovery
 *
 * Provides application-level wrappers for:
 *   1. withRetry()       — Automatic deadlock retry with exponential backoff
 *   2. withSavepoint()   — Named savepoints within interactive transactions
 *   3. logTransaction()  — Write-ahead log entries in transaction_log table
 *   4. withOptimisticLock() — Row version checking for conflict detection
 *
 * These complement the SQL-level stored procedures in 05_concurrency_recovery.sql
 * for cases where the application (not a stored procedure) manages the transaction.
 */

const prisma = require('./prisma');
const logger = require('./logger');

/**
 * Tables that have row_version columns (from 05_concurrency_recovery.sql)
 */
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

/**
 * Custom error for concurrency conflicts (optimistic locking failure)
 */
class ConcurrencyConflictError extends Error {
  constructor(model, id) {
    super(`Concurrency conflict on ${model} (id: ${id}). The record was modified by another transaction. Please retry with the latest version.`);
    this.name = 'ConcurrencyConflictError';
    this.statusCode = 409;
    this.model = model;
    this.recordId = id;
  }
}

/**
 * Custom error for deadlock exhaustion (all retries failed)
 */
class DeadlockExhaustedError extends Error {
  constructor(attempts) {
    super(`Transaction failed after ${attempts} deadlock retries.`);
    this.name = 'DeadlockExhaustedError';
    this.statusCode = 503;
    this.attempts = attempts;
  }
}

// ────────────────────────────────────────────────────────────
// 1. DEADLOCK RETRY
// ────────────────────────────────────────────────────────────

/**
 * Wraps a Prisma interactive transaction with automatic deadlock retry.
 *
 * MySQL raises error code P2034 (via Prisma) when a deadlock is detected.
 * This wrapper catches it and retries with exponential backoff.
 *
 * @param {Function} fn - Async function receiving (tx) parameter — the Prisma transaction client
 * @param {object} [options]
 * @param {number} [options.maxRetries=3] - Maximum retry attempts
 * @param {number} [options.baseDelayMs=100] - Base delay for exponential backoff
 * @param {number} [options.maxWaitMs=30000] - Maximum total transaction duration
 * @param {number} [options.timeoutMs=10000] - Individual transaction timeout
 * @returns {Promise<*>} Result of the transaction function
 */
async function withRetry(fn, options = {}) {
  const {
    maxRetries = 3,
    baseDelayMs = 100,
    maxWaitMs = 30000,
    timeoutMs = 10000,
  } = options;

  let lastError;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const result = await prisma.$transaction(fn, {
        maxWait: maxWaitMs,
        timeout: timeoutMs,
        isolationLevel: options.isolationLevel, // Optional override
      });

      if (attempt > 1) {
        logger.info(`Transaction succeeded on attempt ${attempt}/${maxRetries}`);
      }

      return result;
    } catch (error) {
      lastError = error;

      // Check if it's a deadlock or lock-timeout error
      const isDeadlock =
        error.code === 'P2034' ||                  // Prisma deadlock code
        error.message?.includes('Deadlock') ||
        error.message?.includes('deadlock') ||
        error.message?.includes('Lock wait timeout');

      if (!isDeadlock || attempt === maxRetries) {
        // Not a deadlock, or we've exhausted retries — rethrow
        break;
      }

      // Exponential backoff: 100ms, 200ms, 400ms, …
      const delay = baseDelayMs * Math.pow(2, attempt - 1);
      logger.warn(`Deadlock detected (attempt ${attempt}/${maxRetries}), retrying in ${delay}ms`, {
        error: error.message,
      });

      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  // If all retries exhausted due to deadlocks
  if (
    lastError?.code === 'P2034' ||
    lastError?.message?.includes('Deadlock') ||
    lastError?.message?.includes('deadlock')
  ) {
    throw new DeadlockExhaustedError(maxRetries);
  }

  throw lastError;
}

// ────────────────────────────────────────────────────────────
// 2. SAVEPOINTS
// ────────────────────────────────────────────────────────────

/**
 * Creates a named savepoint within an interactive Prisma transaction.
 *
 * Usage:
 *   await prisma.$transaction(async (tx) => {
 *     await doStepOne(tx);
 *     const result = await withSavepoint(tx, 'step_two', async () => {
 *       return await doStepTwo(tx);
 *     });
 *     // If step_two failed, we're rolled back to the savepoint
 *     // but step_one is still committed
 *   });
 *
 * @param {object} tx - Prisma transaction client
 * @param {string} name - Savepoint name (alphanumeric + underscores)
 * @param {Function} fn - Async function to execute within the savepoint
 * @returns {Promise<{success: boolean, result?: *, error?: Error}>}
 */
async function withSavepoint(tx, name, fn) {
  const safeName = name.replace(/[^a-zA-Z0-9_]/g, '_');

  try {
    await tx.$executeRawUnsafe(`SAVEPOINT ${safeName}`);

    const result = await fn();

    // Release the savepoint (frees resources, keeps changes)
    await tx.$executeRawUnsafe(`RELEASE SAVEPOINT ${safeName}`);

    return { success: true, result };
  } catch (error) {
    // Roll back to the savepoint — undo only this step
    try {
      await tx.$executeRawUnsafe(`ROLLBACK TO SAVEPOINT ${safeName}`);
    } catch (rollbackError) {
      logger.error(`Failed to rollback to savepoint ${safeName}`, {
        error: rollbackError.message,
      });
    }

    logger.warn(`Savepoint ${safeName} rolled back`, { error: error.message });

    return { success: false, error };
  }
}

// ────────────────────────────────────────────────────────────
// 3. TRANSACTION LOGGING
// ────────────────────────────────────────────────────────────

/**
 * Wraps a transaction with write-ahead logging to the transaction_log table.
 *
 * Logs STARTED before the work begins, COMMITTED on success,
 * and FAILED/ROLLED_BACK on error — providing a full audit trail
 * for recovery purposes.
 *
 * @param {object} params
 * @param {string} params.txnType - e.g. 'ALLOCATION', 'PAYMENT', 'BOOKING'
 * @param {string[]} params.affectedTables - e.g. ['bed', 'allocation']
 * @param {string} [params.userId] - auth_user.user_id of the initiator
 * @param {string} [params.sessionId] - Request/session ID for correlation
 * @param {Function} fn - Async function that performs the actual work
 * @returns {Promise<*>} Result of fn
 */
async function logTransaction({ txnType, affectedTables, userId, sessionId }, fn) {
  // Step 1: Log STARTED (outside the business transaction)
  const txnLog = await prisma.transaction_log.create({
    data: {
      txn_type: txnType,
      status: 'STARTED',
      affected_tables: affectedTables,
      user_id: userId || null,
      session_id: sessionId || null,
    },
  });

  try {
    // Step 2: Execute the business logic
    const result = await fn(txnLog.txn_id);

    // Step 3: Log COMMITTED
    await prisma.transaction_log.update({
      where: { txn_id: txnLog.txn_id },
      data: {
        status: 'COMMITTED',
        completed_at: new Date(),
        affected_ids: result?.affectedIds || null,
        rollback_sql: result?.rollbackSql || null,
      },
    });

    return result;
  } catch (error) {
    // Step 4: Log FAILED
    await prisma.transaction_log.update({
      where: { txn_id: txnLog.txn_id },
      data: {
        status: 'FAILED',
        completed_at: new Date(),
        error_message: error.message,
      },
    }).catch((logErr) => {
      logger.error('Failed to log transaction failure', { error: logErr.message });
    });

    throw error;
  }
}

// ────────────────────────────────────────────────────────────
// 4. OPTIMISTIC LOCKING HELPER
// ────────────────────────────────────────────────────────────

/**
 * Performs an update with optimistic locking (row_version check).
 *
 * Reads the current row_version, then updates only if the version
 * still matches. If another transaction modified the row in between,
 * throws ConcurrencyConflictError.
 *
 * @param {object} params
 * @param {string} params.model - Prisma model name (must be a versioned table)
 * @param {string} params.idField - Primary key field name
 * @param {string} params.id - Record ID to update
 * @param {number} params.expectedVersion - The row_version the client read
 * @param {object} params.data - Update data
 * @param {object} [params.include] - Prisma include clause
 * @returns {Promise<object>} Updated record
 */
async function withOptimisticLock({ model, idField, id, expectedVersion, data, include }) {
  if (!VERSIONED_TABLES.has(model)) {
    // Not a versioned table — fall back to normal update
    return prisma[model].update({
      where: { [idField]: id },
      data,
      include,
    });
  }

  // Use updateMany with version check (returns count, not record)
  const result = await prisma[model].updateMany({
    where: {
      [idField]: id,
      row_version: expectedVersion,
    },
    data,
  });

  if (result.count === 0) {
    // Either record doesn't exist, or version mismatch
    const exists = await prisma[model].findUnique({
      where: { [idField]: id },
    });

    if (!exists) {
      const { AppError } = require('../middleware/errorHandler');
      throw new AppError(404, `${model} not found`);
    }

    // Version mismatch — someone else modified it
    throw new ConcurrencyConflictError(model, id);
  }

  // Fetch and return the updated record
  return prisma[model].findUnique({
    where: { [idField]: id },
    include,
  });
}

module.exports = {
  VERSIONED_TABLES,
  ConcurrencyConflictError,
  DeadlockExhaustedError,
  withRetry,
  withSavepoint,
  logTransaction,
  withOptimisticLock,
};
