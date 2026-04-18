const fp = require('fastify-plugin');
const { clerkPlugin, getAuth } = require('@clerk/fastify');

/**
 * Auth plugin — registers Clerk and provides decorators.
 */
module.exports = fp(async function authPlugin(fastify) {
  // Register Clerk plugin
  await fastify.register(clerkPlugin, {
    publishableKey: process.env.CLERK_PUBLISHABLE_KEY,
    secretKey: process.env.CLERK_SECRET_KEY,
  });

  // Decorate request with auth helpers
  fastify.decorateRequest('clerkAuth', null);

  // Pre-handler hook to attach auth state
  fastify.addHook('preHandler', async (request) => {
    try {
      request.clerkAuth = getAuth(request);
    } catch (_) {
      request.clerkAuth = null;
    }
  });
});

/**
 * Pre-handler to require authentication.
 * Use as: { preHandler: [requireAuth] }
 */
async function requireAuth(request, reply) {
  const auth = request.clerkAuth;
  if (!auth || !auth.userId) {
    return reply.status(401).send({ success: false, error: 'Not authenticated' });
  }
}

/**
 * Pre-handler factory for role-based access.
 * Use as: { preHandler: [requireAuth, authorize('admin', 'warden')] }
 */
function authorize(...allowedRoles) {
  return async (request, reply) => {
    const auth = request.clerkAuth;
    if (!auth || !auth.userId) {
      return reply.status(401).send({ success: false, error: 'Not authenticated' });
    }
    const role = auth.sessionClaims?.metadata?.role || 'student';
    if (allowedRoles.length && !allowedRoles.includes(role)) {
      return reply.status(403).send({ success: false, error: 'Insufficient permissions' });
    }
  };
}

module.exports.requireAuth = requireAuth;
module.exports.authorize = authorize;
