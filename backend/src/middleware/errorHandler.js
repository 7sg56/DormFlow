const logger = require('../lib/logger');
const { Sentry } = require('../lib/sentry');

class AppError extends Error {
  constructor(statusCode, message, details = null) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
    this.isOperational = true;
  }
}

function errorHandler(err, req, res, _next) {
  // Report to Sentry
  if (Sentry && Sentry.captureException) {
    Sentry.captureException(err);
  }

  if (err instanceof AppError) {
    logger.warn(`AppError: ${err.message}`, {
      statusCode: err.statusCode,
      path: req.path,
      method: req.method,
    });

    return res.status(err.statusCode).json({
      success: false,
      error: err.message,
      details: err.details,
    });
  }

  // Prisma known errors
  if (err.code && err.code.startsWith('P')) {
    const prismaErrors = {
      P2002: { status: 409, message: 'A record with this value already exists' },
      P2025: { status: 404, message: 'Record not found' },
      P2003: { status: 400, message: 'Foreign key constraint failed' },
      P2014: { status: 400, message: 'Relation violation' },
    };

    const mapped = prismaErrors[err.code];
    if (mapped) {
      return res.status(mapped.status).json({
        success: false,
        error: mapped.message,
        code: err.code,
      });
    }
  }

  // Unknown errors
  logger.error('Unhandled error', {
    error: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
  });

  res.status(500).json({
    success: false,
    error: process.env.NODE_ENV === 'production'
      ? 'Internal server error'
      : err.message,
  });
}

module.exports = { errorHandler, AppError };
