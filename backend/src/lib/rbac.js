/**
 * Centralized RBAC Policy Matrix
 *
 * Defines which roles can perform which operations on each entity.
 * Roles: 'admin' (superuser), 'warden' (hostel admin), 'technician', 'student'
 *
 * Each entity maps to { list, get, create, update, delete }.
 * Value is an array of allowed roles, or null (operation disabled for everyone).
 */

const ADMIN = ['admin', 'warden'];
const ALL_ROLES = ['admin', 'warden', 'technician', 'student'];

const POLICY = {
  // ── Identity & Admin ──────────────────────────────────────
  hostel: {
    list: ALL_ROLES,
    get: ALL_ROLES,
    create: null,         // hostels are seeded, not created via API
    update: ADMIN,
    delete: null,
  },
  hostel_warden: {
    list: ALL_ROLES,
    get: ALL_ROLES,
    create: null,
    update: ADMIN,
    delete: null,
  },

  // ── Resident Profiles ─────────────────────────────────────
  student: {
    list: ADMIN,
    get: [...ADMIN, 'student'],   // students can GET (self, enforced at row level later)
    create: ADMIN,
    update: [...ADMIN, 'student'], // students can UPDATE (self)
    delete: ADMIN,
  },

  // ── Physical Assets ───────────────────────────────────────
  room: {
    list: [...ADMIN, 'student'],
    get: ALL_ROLES,
    create: ADMIN,
    update: ADMIN,
    delete: ADMIN,
  },
  bed: {
    list: ADMIN,
    get: [...ADMIN, 'student'],
    create: ADMIN,
    update: ADMIN,
    delete: ADMIN,
  },
  allocation: {
    list: ADMIN,
    get: [...ADMIN, 'student'],
    create: ADMIN,
    update: ADMIN,
    delete: ADMIN,
  },

  // ── Financials ────────────────────────────────────────────
  feepayment: {
    list: [...ADMIN, 'student'],  // students see own fees (row-level later)
    get: [...ADMIN, 'student'],
    create: ADMIN,
    update: ADMIN,
    delete: null,
  },

  // ── Ticketing ─────────────────────────────────────────────
  complaint: {
    list: ALL_ROLES,
    get: ALL_ROLES,
    create: [...ADMIN, 'student'],
    update: [...ADMIN, 'technician'],  // technicians can resolve assigned tickets
    delete: null,
  },

  // ── Security ──────────────────────────────────────────────
  visitor_log: {
    list: [...ADMIN, 'student'],
    get: [...ADMIN, 'student'],
    create: [...ADMIN, 'student'],
    update: ADMIN,
    delete: null,
  },

  // ── Staffing ──────────────────────────────────────────────
  technician: {
    list: [...ADMIN, 'technician'],
    get: [...ADMIN, 'technician'],
    create: ADMIN,
    update: [...ADMIN, 'technician'],  // technicians can update own profile
    delete: ADMIN,
  },

  // ── Amenities ─────────────────────────────────────────────
  mess: {
    list: ALL_ROLES,
    get: ALL_ROLES,
    create: ADMIN,
    update: ADMIN,
    delete: ADMIN,
  },
  laundry: {
    list: ALL_ROLES,
    get: ALL_ROLES,
    create: ADMIN,
    update: ADMIN,
    delete: ADMIN,
  },
};

/**
 * Get allowed roles for a specific entity + operation.
 * @param {string} entity - table/entity name
 * @param {'list'|'get'|'create'|'update'|'delete'} operation
 * @returns {string[]|null} allowed roles, or null if operation is disabled
 */
function getAllowedRoles(entity, operation) {
  const entityPolicy = POLICY[entity];
  if (!entityPolicy) return null;
  return entityPolicy[operation] ?? null;
}

module.exports = { POLICY, ADMIN, ALL_ROLES, getAllowedRoles };
