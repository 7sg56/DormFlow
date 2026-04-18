const { getAuth } = require('@clerk/fastify');

module.exports = async function authRoutes(fastify) {
  /**
   * GET /api/auth/me
   * Returns current user info from Clerk session.
   */
  fastify.get('/me', async (request, reply) => {
    const auth = getAuth(request);

    if (!auth || !auth.userId) {
      return reply.status(401).send({ success: false, error: 'Not authenticated' });
    }

    return {
      success: true,
      data: {
        userId: auth.userId,
        sessionId: auth.sessionId,
        role: auth.sessionClaims?.metadata?.role || 'student',
      },
    };
  });
};
