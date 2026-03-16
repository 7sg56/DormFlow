const crypto = require('crypto');
const prisma = require('../lib/prisma');
const { cacheGet, cacheSet, redis } = require('../lib/redis');
const logger = require('../lib/logger');

const IDEMPOTENCY_TTL = 24 * 60 * 60; // 24 hours

/**
 * Idempotency middleware for POST endpoints
 * Reads `Idempotency-Key` header, returns cached response for duplicates
 */
function idempotency(req, res, next) {
  const key = req.headers['idempotency-key'];

  if (!key) {
    return next(); // No key = no idempotency check
  }

  const requestHash = crypto
    .createHash('sha256')
    .update(JSON.stringify(req.body || {}))
    .digest('hex');

  // Check Redis first (fast path)
  const cacheKey = `idem:${key}`;

  redis
    .get(cacheKey)
    .then(async (cached) => {
      if (cached) {
        const data = JSON.parse(cached);
        // Verify same request body
        if (data.request_hash === requestHash) {
          logger.info('Idempotent request replayed from cache', { key });
          return res.status(data.response_code).json(data.response_body);
        }
        // Different body with same key = conflict
        return res.status(409).json({
          success: false,
          error: 'Idempotency key already used with different request body',
        });
      }

      // Check DB (slow path, for keys that outlived Redis TTL)
      const existing = await prisma.idempotency_key.findUnique({
        where: { idempotency_key: key },
      });

      if (existing) {
        if (existing.request_hash === requestHash && existing.response_body) {
          // Re-cache in Redis
          await cacheSet(cacheKey, {
            request_hash: existing.request_hash,
            response_code: existing.response_code,
            response_body: existing.response_body,
          }, IDEMPOTENCY_TTL);

          logger.info('Idempotent request replayed from DB', { key });
          return res.status(existing.response_code).json(existing.response_body);
        }
        if (existing.request_hash !== requestHash) {
          return res.status(409).json({
            success: false,
            error: 'Idempotency key already used with different request body',
          });
        }
      }

      // First time — intercept the response to capture it
      const originalJson = res.json.bind(res);
      res.json = async function (body) {
        try {
          const expiresAt = new Date(Date.now() + IDEMPOTENCY_TTL * 1000);
          // Store in DB
          await prisma.idempotency_key.create({
            data: {
              idempotency_key: key,
              request_path: req.originalUrl,
              request_hash: requestHash,
              response_code: res.statusCode,
              response_body: body,
              expires_at: expiresAt,
            },
          });
          // Store in Redis
          await cacheSet(cacheKey, {
            request_hash: requestHash,
            response_code: res.statusCode,
            response_body: body,
          }, IDEMPOTENCY_TTL);
        } catch (err) {
          logger.error('Idempotency store error', { key, error: err.message });
        }
        return originalJson(body);
      };

      next();
    })
    .catch((err) => {
      logger.error('Idempotency check error', { key, error: err.message });
      next(); // Fail open
    });
}

module.exports = { idempotency };
