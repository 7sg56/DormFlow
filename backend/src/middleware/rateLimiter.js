const rateLimit = require('express-rate-limit');
const RedisStore = require('rate-limit-redis').default;
const { redis } = require('../lib/redis');

/**
 * Create a Redis-backed rate limiter
 */
function createRateLimiter(options = {}) {
  const {
    windowMs = 60 * 1000,     // 1 minute default
    max = 200,                 // 200 requests per window
    prefix = 'rl:',
    message = 'Too many requests, please try again later',
  } = options;

  return rateLimit({
    windowMs,
    max,
    standardHeaders: true,
    legacyHeaders: false,
    store: new RedisStore({
      sendCommand: (...args) => redis.call(...args),
      prefix,
    }),
    message: {
      success: false,
      error: message,
    },
  });
}

// Pre-configured limiters
const globalLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  max: 400,
  prefix: 'rl:global:',
});

// Strict limiter for booking/allocation endpoints (mass request protection)
const bookingLimiter = createRateLimiter({
  windowMs: 10 * 1000,        // 10 second window
  max: 10,                     // max 10 requests per 10 sec
  prefix: 'rl:booking:',
  message: 'Booking rate limit exceeded. Please wait before trying again.',
});

// Auth limiter (login bruteforce protection)
const authLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,   // 15 minutes
  max: 20,                     // 20 attempts
  prefix: 'rl:auth:',
  message: 'Too many login attempts. Please try again later.',
});

// DDoS-level protection for write endpoints
const writeLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  max: 60,
  prefix: 'rl:write:',
  message: 'Write rate limit exceeded.',
});

module.exports = {
  createRateLimiter,
  globalLimiter,
  bookingLimiter,
  authLimiter,
  writeLimiter,
};
