const Redis = require('ioredis');
const logger = require('./logger');

const REDIS_HOST = process.env.REDIS_HOST || 'localhost';
const REDIS_PORT = parseInt(process.env.REDIS_PORT || '6379', 10);

// Shared client options
const clientOptions = {
  host: REDIS_HOST,
  port: REDIS_PORT,
  // Keep idle connections alive
  keepAlive: 10000,
  // Don't block app startup if Redis is down
  lazyConnect: false,
  // Pipelining: automatically batch commands sent in the same event loop tick
  enableAutoPipelining: true,
  // Offline buffer: queue commands if disconnected, flush when reconnected
  enableOfflineQueue: true,
  maxRetriesPerRequest: 3,
  connectTimeout: 5000,
  commandTimeout: 3000,
  retryStrategy(times) {
    const delay = Math.min(times * 200, 3000);
    logger.warn(`Redis retry attempt ${times}, next in ${delay}ms`);
    return delay;
  },
  reconnectOnError(err) {
    const targetErrors = ['READONLY', 'ECONNRESET', 'ETIMEDOUT'];
    return targetErrors.some((e) => err.message.includes(e));
  },
};

// Primary client (reads + writes)
const redis = new Redis(clientOptions);

// Dedicated subscriber client for pub/sub (separate TCP connection required)
// Kept here for future use; do NOT use this for regular commands
const redisSubscriber = new Redis({ ...clientOptions, enableAutoPipelining: false });

redis.on('connect', () => logger.info('Redis connected'));
redis.on('ready', () => logger.info('Redis ready'));
redis.on('error', (err) => logger.error('Redis error', { error: err.message }));
redis.on('close', () => logger.warn('Redis connection closed'));
redis.on('reconnecting', () => logger.warn('Redis reconnecting'));

const CACHE_TTL = 300; // 5 minutes default

/**
 * Get a value from cache
 */
async function cacheGet(key) {
  try {
    const cached = await redis.get(key);
    if (cached) return JSON.parse(cached);
    return null;
  } catch (err) {
    logger.error('Cache get error', { key, error: err.message });
    return null;
  }
}

/**
 * Set a value in cache with TTL
 */
async function cacheSet(key, value, ttl = CACHE_TTL) {
  try {
    // Use SET with EX flag (single round-trip, faster than SETEX)
    await redis.set(key, JSON.stringify(value), 'EX', ttl);
  } catch (err) {
    logger.error('Cache set error', { key, error: err.message });
  }
}

/**
 * Delete all keys matching a glob pattern
 * Uses SCAN instead of KEYS to avoid blocking the server under load
 */
async function cacheDelete(pattern) {
  try {
    let cursor = '0';
    let deleted = 0;
    do {
      const [nextCursor, keys] = await redis.scan(cursor, 'MATCH', pattern, 'COUNT', 100);
      cursor = nextCursor;
      if (keys.length > 0) {
        // Pipeline the DEL calls
        const pipeline = redis.pipeline();
        keys.forEach((k) => pipeline.del(k));
        await pipeline.exec();
        deleted += keys.length;
      }
    } while (cursor !== '0');

    if (deleted > 0) {
      logger.debug(`Cache invalidated: ${deleted} keys matching ${pattern}`);
    }
  } catch (err) {
    logger.error('Cache delete error', { pattern, error: err.message });
  }
}

/**
 * Batch get multiple keys in a single round-trip (MGET)
 */
async function cacheGetMany(keys) {
  if (!keys.length) return {};
  try {
    const values = await redis.mget(...keys);
    return keys.reduce((acc, key, i) => {
      acc[key] = values[i] ? JSON.parse(values[i]) : null;
      return acc;
    }, {});
  } catch (err) {
    logger.error('Cache getMany error', { error: err.message });
    return {};
  }
}

/**
 * Batch set multiple keys in a single pipeline
 */
async function cacheSetMany(entries, ttl = CACHE_TTL) {
  if (!entries.length) return;
  try {
    const pipeline = redis.pipeline();
    entries.forEach(({ key, value }) => {
      pipeline.set(key, JSON.stringify(value), 'EX', ttl);
    });
    await pipeline.exec();
  } catch (err) {
    logger.error('Cache setMany error', { error: err.message });
  }
}

/**
 * Acquire a distributed lock using SET NX PX (single atomic command)
 * Returns unlock function, or null if lock not acquired
 */
async function acquireLock(resource, ttlMs = 10000) {
  const lockKey = `lock:${resource}`;
  // Random value to ensure only the owner can unlock
  const lockValue = `${Date.now()}:${Math.random().toString(36).slice(2)}`;
  try {
    // Atomic: only sets if key doesn't exist
    const result = await redis.set(lockKey, lockValue, 'PX', ttlMs, 'NX');
    if (result !== 'OK') return null;

    logger.debug(`Lock acquired: ${resource}`);

    return async () => {
      // Lua script for atomic check-and-delete (prevents releasing another owner's lock)
      const luaScript = `
        if redis.call("get", KEYS[1]) == ARGV[1] then
          return redis.call("del", KEYS[1])
        else
          return 0
        end
      `;
      await redis.eval(luaScript, 1, lockKey, lockValue);
      logger.debug(`Lock released: ${resource}`);
    };
  } catch (err) {
    logger.error('Lock acquire error', { resource, error: err.message });
    return null;
  }
}

/**
 * Increment a counter with optional expiry (for custom rate limiting or analytics)
 */
async function increment(key, ttlSeconds) {
  try {
    const pipeline = redis.pipeline();
    pipeline.incr(key);
    if (ttlSeconds) pipeline.expire(key, ttlSeconds);
    const results = await pipeline.exec();
    return results[0][1]; // Return new count
  } catch (err) {
    logger.error('Increment error', { key, error: err.message });
    return null;
  }
}

module.exports = {
  redis,
  redisSubscriber,
  cacheGet,
  cacheSet,
  cacheDelete,
  cacheGetMany,
  cacheSetMany,
  acquireLock,
  increment,
  CACHE_TTL,
};
