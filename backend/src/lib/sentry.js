const Sentry = require('@sentry/node');
const logger = require('./logger');

function initSentry(app) {
  const dsn = process.env.SENTRY_DSN;

  if (!dsn) {
    logger.warn('SENTRY_DSN not set — Sentry disabled');
    return;
  }

  Sentry.init({
    dsn,
    environment: process.env.NODE_ENV || 'development',
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.2 : 1.0,
    integrations: [
      Sentry.httpIntegration(),
      Sentry.expressIntegration({ app }),
    ],
  });

  logger.info('Sentry initialized');
}

module.exports = { initSentry, Sentry };
