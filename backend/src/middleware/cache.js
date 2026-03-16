const { cacheGet, cacheSet, cacheDelete } = require('../lib/redis');
const logger = require('../lib/logger');

/**
 * Redis read-through cache middleware for GET endpoints
 * Usage: cacheMiddleware('hostels', 300)
 */
function cacheMiddleware(prefix, ttl = 300) {
  return async (req, res, next) => {
    if (req.method !== 'GET') {
      return next();
    }

    const key = `cache:${prefix}:${req.originalUrl}`;

    try {
      const cached = await cacheGet(key);
      if (cached) {
        logger.debug(`[CACHE HIT] ${key}`);
        return res.json(cached);
      }
    } catch (err) {
      logger.error('Cache middleware read error', { error: err.message });
    }

    // Intercept res.json to cache the response
    const originalJson = res.json.bind(res);
    res.json = function (body) {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        cacheSet(key, body, ttl).catch((err) => {
          logger.error('Cache middleware write error', { error: err.message });
        });
        logger.debug(`[CACHE SET] ${key}`);
      }
      return originalJson(body);
    };

    next();
  };
}

/**
 * Invalidate cache for a given prefix (tag-based invalidation)
 * Call after mutations (create, update, delete)
 */
async function invalidateCache(prefix) {
  await cacheDelete(`cache:${prefix}:*`);
}

module.exports = { cacheMiddleware, invalidateCache };
