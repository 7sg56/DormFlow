const fp = require('fastify-plugin');

/**
 * Auth plugin — cookie-based sessions (no Clerk).
 * Registers @fastify/cookie + @fastify/session.
 */
module.exports = fp(async function authPlugin(fastify) {
  await fastify.register(require('@fastify/cookie'));
  await fastify.register(require('@fastify/session'), {
    secret: process.env.SESSION_SECRET || 'dormflow-session-secret-viva-2026',
    cookie: {
      secure: false, // HTTP for local dev
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24, // 24 hours
      sameSite: 'lax',
    },
    saveUninitialized: false,
  });
});

/**
 * Pre-handler to require authentication.
 * Checks session for user object.
 */
async function requireAuth(request, reply) {
  if (!request.session || !request.session.user) {
    return reply.status(401).send({ success: false, error: 'Not authenticated' });
  }
}

/**
 * Pre-handler factory for role-based access.
 * Usage: { preHandler: [requireAuth, authorize('admin', 'warden')] }
 */
function authorize(...allowedRoles) {
  return async (request, reply) => {
    if (!request.session || !request.session.user) {
      return reply.status(401).send({ success: false, error: 'Not authenticated' });
    }
    const role = request.session.user.role;
    if (allowedRoles.length && !allowedRoles.includes(role)) {
      return reply.status(403).send({ success: false, error: 'Insufficient permissions' });
    }
  };
}

module.exports.requireAuth = requireAuth;
module.exports.authorize = authorize;
