const { query } = require('../lib/db');
const { requireAuth } = require('../plugins/auth');

/**
 * Onboarding routes — link a Clerk user to a DB record.
 *
 * POST /api/onboarding/link
 * Body: { role: 'student'|'warden'|'technician', identifier: string }
 *
 * The identifier is:
 *   - student:    reg_no (e.g., "REG2024001")
 *   - warden:     warden_email (e.g., "warden@hostel.edu")
 *   - technician: phone (e.g., "9790100001")
 *
 * On success, sets the clerk_user_id on the matched record and
 * updates the Clerk user's publicMetadata with { role }.
 */
module.exports = async function onboardingRoutes(fastify) {
  fastify.post('/link', {
    preHandler: [requireAuth],
  }, async (request, reply) => {
    const auth = request.clerkAuth;
    const clerkUserId = auth?.userId;

    if (!clerkUserId) {
      return reply.status(401).send({ success: false, error: 'Not authenticated' });
    }

    const { role, identifier } = request.body || {};

    if (!role || !identifier) {
      return reply.status(400).send({
        success: false,
        error: 'role and identifier are required',
      });
    }

    const validRoles = ['student', 'warden', 'technician'];
    if (!validRoles.includes(role)) {
      return reply.status(400).send({
        success: false,
        error: `Invalid role. Must be one of: ${validRoles.join(', ')}`,
      });
    }

    let matchQuery, matchParams, updateQuery, updateParams, idColumn;

    switch (role) {
      case 'student':
        // Match by registration number
        matchQuery = 'SELECT student_id, clerk_user_id FROM student WHERE reg_no = ?';
        matchParams = [identifier.trim()];
        updateQuery = 'UPDATE student SET clerk_user_id = ? WHERE student_id = ?';
        idColumn = 'student_id';
        break;

      case 'warden':
        // Match by warden email
        matchQuery = 'SELECT warden_id, clerk_user_id FROM hostel_warden WHERE warden_email = ?';
        matchParams = [identifier.trim().toLowerCase()];
        updateQuery = 'UPDATE hostel_warden SET clerk_user_id = ? WHERE warden_id = ?';
        idColumn = 'warden_id';
        break;

      case 'technician':
        // Match by phone number
        matchQuery = 'SELECT technician_id, clerk_user_id FROM technician WHERE phone = ?';
        matchParams = [identifier.trim()];
        updateQuery = 'UPDATE technician SET clerk_user_id = ? WHERE technician_id = ?';
        idColumn = 'technician_id';
        break;
    }

    // Find the matching DB record
    const [rows] = await query(matchQuery, matchParams);

    if (!rows.length) {
      return reply.status(404).send({
        success: false,
        error: `No ${role} record found with the provided identifier. Contact your administrator.`,
      });
    }

    const record = rows[0];

    // Check if already linked to another Clerk user
    if (record.clerk_user_id && record.clerk_user_id !== clerkUserId) {
      return reply.status(409).send({
        success: false,
        error: 'This record is already linked to another account.',
      });
    }

    // Check if this Clerk user is already linked elsewhere
    for (const [tbl, col] of [['student', 'student_id'], ['hostel_warden', 'warden_id'], ['technician', 'technician_id']]) {
      const [existing] = await query(
        `SELECT ${col} FROM ${tbl} WHERE clerk_user_id = ?`,
        [clerkUserId]
      );
      if (existing.length > 0) {
        return reply.status(409).send({
          success: false,
          error: 'Your account is already linked to a record. Contact your administrator to change roles.',
        });
      }
    }

    // Link the Clerk user to the DB record
    const recordId = record[idColumn];
    await query(updateQuery, [clerkUserId, recordId]);

    // Update Clerk user publicMetadata with the role
    const clerkSecretKey = process.env.CLERK_SECRET_KEY;
    if (clerkSecretKey) {
      try {
        const clerkRes = await fetch(
          `https://api.clerk.com/v1/users/${clerkUserId}/metadata`,
          {
            method: 'PATCH',
            headers: {
              'Authorization': `Bearer ${clerkSecretKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              public_metadata: {
                role,
                onboardingComplete: true,
              },
            }),
          }
        );

        if (!clerkRes.ok) {
          const errBody = await clerkRes.text();
          fastify.log.error(`Clerk metadata update failed: ${errBody}`);
          // Don't fail the request — the DB link is saved, role can be fixed later
        }
      } catch (err) {
        fastify.log.error(`Clerk API call failed: ${err.message}`);
      }
    }

    return reply.status(200).send({
      success: true,
      data: { role, linked: true },
      message: `Successfully linked as ${role}. Redirecting to dashboard...`,
    });
  });

  /**
   * GET /api/onboarding/status
   * Check if the current Clerk user has completed onboarding.
   */
  fastify.get('/status', {
    preHandler: [requireAuth],
  }, async (request, reply) => {
    const auth = request.clerkAuth;
    const clerkUserId = auth?.userId;

    if (!clerkUserId) {
      return reply.status(401).send({ success: false, error: 'Not authenticated' });
    }

    // Check if linked to any record
    for (const [tbl, role] of [['student', 'student'], ['hostel_warden', 'warden'], ['technician', 'technician']]) {
      const [rows] = await query(
        `SELECT 1 FROM ${tbl} WHERE clerk_user_id = ?`,
        [clerkUserId]
      );
      if (rows.length > 0) {
        return { success: true, data: { onboarded: true, role } };
      }
    }

    return { success: true, data: { onboarded: false, role: null } };
  });
};
