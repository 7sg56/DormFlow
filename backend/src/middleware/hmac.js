const crypto = require('crypto');
const logger = require('../lib/logger');

if (!process.env.HMAC_SECRET) {
  logger.error('FATAL ERROR: HMAC_SECRET environment variable is not set.');
  process.exit(1);
}

const HMAC_SECRET = process.env.HMAC_SECRET;
const MAX_TIMESTAMP_DRIFT_MS = 5 * 60 * 1000; // 5 minutes

/**
 * HMAC-SHA256 signature verification middleware
 * Protects mutation endpoints (POST/PUT/DELETE) from tampering
 *
 * Client must send:
 *   X-HMAC-Signature: HMAC-SHA256 of (timestamp + method + path + body)
 *   X-HMAC-Timestamp: Unix timestamp in ms
 */
function hmacVerify(req, res, next) {
  const signature = req.headers['x-hmac-signature'];
  const timestamp = req.headers['x-hmac-timestamp'];

  if (!signature || !timestamp) {
    return res.status(401).json({
      success: false,
      error: 'Missing HMAC signature or timestamp',
    });
  }

  // Reject stale requests
  const tsNum = parseInt(timestamp, 10);
  const now = Date.now();
  if (isNaN(tsNum) || Math.abs(now - tsNum) > MAX_TIMESTAMP_DRIFT_MS) {
    logger.warn('HMAC timestamp drift exceeded', {
      timestamp: tsNum,
      now,
      drift: Math.abs(now - tsNum),
      path: req.path,
    });
    return res.status(401).json({
      success: false,
      error: 'Request timestamp expired or invalid',
    });
  }

  // Compute expected signature
  const body = JSON.stringify(req.body || {});
  const payload = `${timestamp}${req.method}${req.originalUrl}${body}`;
  const expected = crypto
    .createHmac('sha256', HMAC_SECRET)
    .update(payload)
    .digest('hex');

  // Constant-time comparison
  if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) {
    logger.warn('HMAC signature mismatch', { path: req.path, method: req.method });
    return res.status(401).json({
      success: false,
      error: 'Invalid HMAC signature',
    });
  }

  next();
}

module.exports = { hmacVerify };
