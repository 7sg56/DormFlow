const { Router } = require('express');
const { createCrudRouter } = require('./crud.factory');
const prisma = require('../lib/prisma');
const { authenticate, authorize } = require('../middleware/auth');

// Import schemas
const { createHostelSchema, updateHostelSchema } = require('../schemas/hostel.schema');
const { createStudentSchema, updateStudentSchema } = require('../schemas/student.schema');
const { createRoomSchema, updateRoomSchema, createBedSchema, updateBedSchema } = require('../schemas/room.schema');
const {
  createFeeSchema, updateFeeSchema,
  createComplaintSchema, updateComplaintSchema,
  createMessSchema, updateMessSchema,
  createMenuSchema, updateMenuSchema,
  createFacilitySchema, updateFacilitySchema,
  createFacilityBookingSchema, updateFacilityBookingSchema,
  createAccessLogSchema, updateAccessLogSchema,
  createVisitorLogSchema, updateVisitorLogSchema,
  createLaundrySchema, updateLaundrySchema,
  createLaundryRequestSchema, updateLaundryRequestSchema,
  createStoreSchema, updateStoreSchema,
  createStorePurchaseSchema, updateStorePurchaseSchema,
  createPharmacySchema, updatePharmacySchema,
  createPharmacyVisitSchema, updatePharmacyVisitSchema,
  createGymSchema, updateGymSchema,
  createGymMembershipSchema, updateGymMembershipSchema,
  createEmergencyRequestSchema, updateEmergencyRequestSchema,
  createAmbulanceSchema, updateAmbulanceSchema,
  createNoticeSchema, updateNoticeSchema,
  createMaintenanceSchema, updateMaintenanceSchema,
  createMessSubscriptionSchema, updateMessSubscriptionSchema,
  createGuardianSchema, updateGuardianSchema,
  createTechnicianSchema, updateTechnicianSchema,
  createRestaurantSchema, updateRestaurantSchema,
} = require('../schemas/entity.schema');

// Import custom routes
const allocationRoutes = require('./allocation.routes');
const authRoutes = require('./auth.routes');
const dashboardRoutes = require('./dashboard.routes');

const router = Router();

// ---- Auth (custom) ----
router.use('/auth', authRoutes);

// ---- Dashboard (custom) ----
router.use('/dashboard', dashboardRoutes);

// ---- Allocation (custom — Redis locking) ----
router.use('/allocations', allocationRoutes);

// ==========================================
// Role Permission Matrix
// ==========================================
// admin: Full access to all operations
// warden: Access to their assigned hostel only
// student: View-only for their own data, create requests
// technician: View all, update their assigned tasks

/**
 * Helper to filter data by user context
 */
const filterByUser = {
  // Warden filter: only their assigned hostel
  hostel: async (req) => {
    if (req.user.role === 'warden') {
      const user = await prisma.auth_user.findUnique({
        where: { user_id: req.user.userId },
        select: { assigned_hostel_id: true },
      });
      if (user?.assigned_hostel_id) {
        return { hostel_id: user.assigned_hostel_id };
      }
    }
    return {};
  },

  // Student filter: only their own data
  student: async (req) => {
    if (req.user.role === 'student') {
      const user = await prisma.auth_user.findUnique({
        where: { user_id: req.user.userId },
        select: { student_id: true },
      });
      if (user?.student_id) {
        return { student_id: user.student_id };
      }
    }
    return {};
  },

  // Warden filter for rooms: only their hostel's rooms
  room: async (req) => {
    if (req.user.role === 'warden') {
      const user = await prisma.auth_user.findUnique({
        where: { user_id: req.user.userId },
        select: { assigned_hostel_id: true },
      });
      if (user?.assigned_hostel_id) {
        return { hostel_id: user.assigned_hostel_id };
      }
    }
    return {};
  },

  // Warden filter for beds: only their hostel's beds
  bed: async (req) => {
    if (req.user.role === 'warden') {
      const user = await prisma.auth_user.findUnique({
        where: { user_id: req.user.userId },
        select: { assigned_hostel_id: true },
      });
      if (user?.assigned_hostel_id) {
        return { room: { hostel_id: user.assigned_hostel_id } };
      }
    }
    return {};
  },

  // Warden filter for students: only their hostel's students
  students: async (req) => {
    if (req.user.role === 'warden') {
      const user = await prisma.auth_user.findUnique({
        where: { user_id: req.user.userId },
        select: { assigned_hostel_id: true },
      });
      if (user?.assigned_hostel_id) {
        return { allocations: { some: { bed: { room: { hostel_id: user.assigned_hostel_id } } } } };
      }
    }
    return {};
  },

  // Warden filter for complaints: only their hostel's complaints
  complaint: async (req) => {
    if (req.user.role === 'warden') {
      const user = await prisma.auth_user.findUnique({
        where: { user_id: req.user.userId },
        select: { assigned_hostel_id: true },
      });
      if (user?.assigned_hostel_id) {
        return { room: { hostel_id: user.assigned_hostel_id } };
      }
    }
    if (req.user.role === 'student') {
      const user = await prisma.auth_user.findUnique({
        where: { user_id: req.user.userId },
        select: { student_id: true },
      });
      if (user?.student_id) {
        return { student_id: user.student_id };
      }
    }
    return {};
  },

  // Warden filter for maintenance: only their hostel's maintenance
  maintenance: async (req) => {
    if (req.user.role === 'warden') {
      const user = await prisma.auth_user.findUnique({
        where: { user_id: req.user.userId },
        select: { assigned_hostel_id: true },
      });
      if (user?.assigned_hostel_id) {
        return { hostel_id: user.assigned_hostel_id };
      }
    }
    return {};
  },

  // Technician filter: assigned tasks
  technician: async (req) => {
    if (req.user.role === 'technician') {
      const user = await prisma.auth_user.findUnique({
        where: { user_id: req.user.userId },
        select: { technician_id: true },
      });
      if (user?.technician_id) {
        return { technician_id: user.technician_id };
      }
    }
    return {};
  },
};

// ---- Standard CRUD entities (factory-generated with RBAC) ----

// Hostels: Admin full, Warden read-only their hostel, Student read-only, Technician read-only
router.use('/hostels', createCrudRouter({
  model: 'hostel',
  idField: 'hostel_id',
  cachePrefix: 'hostels',
  createSchema: createHostelSchema,
  updateSchema: updateHostelSchema,
  includes: { rooms: { select: { room_id: true, room_number: true, floor: true } } },
  allowedRoles: {
    get: ['admin', 'warden', 'student', 'technician'],
    post: ['admin'],
    put: ['admin', 'warden'],
    delete: ['admin'],
  },
  filterByUser: filterByUser.hostel,
}));

// Students: Admin full, Warden read their hostel's, Student own data, Technician read-all
router.use('/students', createCrudRouter({
  model: 'student',
  idField: 'student_id',
  cachePrefix: 'students',
  createSchema: createStudentSchema,
  updateSchema: updateStudentSchema,
  includes: {
    guardians: true,
    allocations: {
      where: { status: 'Active' },
      include: { bed: { include: { room: { include: { hostel: { select: { hostel_name: true } } } } } } },
    },
  },
  allowedRoles: {
    get: ['admin', 'warden', 'student', 'technician'],
    post: ['admin', 'warden'],
    put: ['admin', 'warden', 'student'],
    delete: ['admin'],
  },
  filterByUser: filterByUser.student,
}));

// Rooms: Admin full, Warden their hostel only, Student read-only, Technician read-all
router.use('/rooms', createCrudRouter({
  model: 'room',
  idField: 'room_id',
  cachePrefix: 'rooms',
  createSchema: createRoomSchema,
  updateSchema: updateRoomSchema,
  includes: {
    hostel: { select: { hostel_id: true, hostel_name: true } },
    beds: true,
  },
  allowedRoles: {
    get: ['admin', 'warden', 'student', 'technician'],
    post: ['admin', 'warden'],
    put: ['admin', 'warden'],
    delete: ['admin'],
  },
  filterByUser: filterByUser.room,
}));

// Beds: Admin full, Warden their hostel only, Student read-only, Technician read-all
router.use('/beds', createCrudRouter({
  model: 'bed',
  idField: 'bed_id',
  cachePrefix: 'beds',
  createSchema: createBedSchema,
  updateSchema: updateBedSchema,
  includes: {
    room: { include: { hostel: { select: { hostel_id: true, hostel_name: true } } } },
  },
  allowedRoles: {
    get: ['admin', 'warden', 'student', 'technician'],
    post: ['admin', 'warden'],
    put: ['admin', 'warden'],
    delete: ['admin'],
  },
  filterByUser: filterByUser.bed,
}));

// Fees: Admin full, Warden read their hostel's, Student own, Technician read-only
router.use('/fees', createCrudRouter({
  model: 'feepayment',
  idField: 'payment_id',
  cachePrefix: 'fees',
  createSchema: createFeeSchema,
  updateSchema: updateFeeSchema,
  includes: {
    student: { select: { student_id: true, reg_no: true, first_name: true, last_name: true } },
  },
  allowedRoles: {
    get: ['admin', 'warden', 'student'],
    post: ['admin'],
    put: ['admin'],
    delete: ['admin'],
  },
  filterByUser: filterByUser.student,
}));

// Complaints: Admin full, Warden their hostel, Student own, Technician all (can assign)
router.use('/complaints', createCrudRouter({
  model: 'complaint',
  idField: 'complaint_id',
  cachePrefix: 'complaints',
  createSchema: createComplaintSchema,
  updateSchema: updateComplaintSchema,
  includes: {
    student: { select: { student_id: true, reg_no: true, first_name: true, last_name: true } },
    room: { select: { room_id: true, room_number: true } },
    technician: { select: { technician_id: true, name: true, specialization: true } },
  },
  allowedRoles: {
    get: ['admin', 'warden', 'student', 'technician'],
    post: ['admin', 'warden', 'student'],
    put: ['admin', 'warden', 'technician'],
    delete: ['admin'],
  },
  filterByUser: filterByUser.complaint,
}));

// Mess: Admin full, Warden their hostel only, Student read-only, Technician read-only
router.use('/messes', createCrudRouter({
  model: 'mess',
  idField: 'mess_id',
  cachePrefix: 'messes',
  createSchema: createMessSchema,
  updateSchema: updateMessSchema,
  includes: { hostel: { select: { hostel_id: true, hostel_name: true } } },
  allowedRoles: {
    get: ['admin', 'warden', 'student', 'technician'],
    post: ['admin', 'warden'],
    put: ['admin', 'warden'],
    delete: ['admin'],
  },
  filterByUser: filterByUser.hostel,
}));

// Menu: Admin full, Warden their hostel's, Student read-only, Technician read-only
router.use('/menus', createCrudRouter({
  model: 'menu',
  idField: 'menu_id',
  cachePrefix: 'menus',
  createSchema: createMenuSchema,
  updateSchema: updateMenuSchema,
  includes: { mess: { select: { mess_id: true, mess_name: true } } },
  allowedRoles: {
    get: ['admin', 'warden', 'student', 'technician'],
    post: ['admin', 'warden'],
    put: ['admin', 'warden'],
    delete: ['admin', 'warden'],
  },
}));

// Mess Subscriptions: Admin full, Warden their hostel's, Student own, Technician read-only
router.use('/mess-subscriptions', createCrudRouter({
  model: 'mess_subscription',
  idField: 'subscription_id',
  cachePrefix: 'mess_subs',
  createSchema: createMessSubscriptionSchema,
  updateSchema: updateMessSubscriptionSchema,
  includes: {
    student: { select: { student_id: true, reg_no: true, first_name: true, last_name: true } },
    mess: { select: { mess_id: true, mess_name: true } },
  },
  allowedRoles: {
    get: ['admin', 'warden', 'student'],
    post: ['admin', 'warden', 'student'],
    put: ['admin', 'warden', 'student'],
    delete: ['admin', 'warden', 'student'],
  },
  filterByUser: filterByUser.student,
}));

// Facilities: Admin full, Warden their hostel's, Student read-only, Technician read-only
router.use('/facilities', createCrudRouter({
  model: 'facility',
  idField: 'facility_id',
  cachePrefix: 'facilities',
  createSchema: createFacilitySchema,
  updateSchema: updateFacilitySchema,
  includes: { hostel: { select: { hostel_id: true, hostel_name: true } } },
  allowedRoles: {
    get: ['admin', 'warden', 'student', 'technician'],
    post: ['admin', 'warden'],
    put: ['admin', 'warden'],
    delete: ['admin'],
  },
  filterByUser: filterByUser.hostel,
}));

// Facility Bookings: Admin full, Warden their hostel's, Student own, Technician read-only
router.use('/facility-bookings', createCrudRouter({
  model: 'facility_booking',
  idField: 'booking_id',
  cachePrefix: 'facility_bookings',
  createSchema: createFacilityBookingSchema,
  updateSchema: updateFacilityBookingSchema,
  includes: {
    facility: { select: { facility_id: true, facility_name: true } },
    student: { select: { student_id: true, reg_no: true, first_name: true, last_name: true } },
  },
  allowedRoles: {
    get: ['admin', 'warden', 'student'],
    post: ['admin', 'warden', 'student'],
    put: ['admin', 'warden', 'student'],
    delete: ['admin', 'warden', 'student'],
  },
  filterByUser: filterByUser.student,
}));

// Access Logs: Admin all, Warden their hostel's, Student own, Technician read-only
router.use('/access-logs', createCrudRouter({
  model: 'accesslog',
  idField: 'log_id',
  cachePrefix: 'access_logs',
  createSchema: createAccessLogSchema,
  updateSchema: createAccessLogSchema.partial(),
  includes: {
    student: { select: { student_id: true, reg_no: true, first_name: true, last_name: true } },
  },
  allowedRoles: {
    get: ['admin', 'warden', 'student'],
    post: ['admin'],
    put: ['admin'],
    delete: ['admin'],
  },
  filterByUser: filterByUser.student,
}));

// Visitor Logs: Admin all, Warden their hostel's, Student own, Technician read-only
router.use('/visitor-logs', createCrudRouter({
  model: 'visitor_log',
  idField: 'visitor_id',
  cachePrefix: 'visitor_logs',
  createSchema: createVisitorLogSchema,
  updateSchema: updateVisitorLogSchema,
  includes: {
    student: { select: { student_id: true, reg_no: true, first_name: true, last_name: true } },
    room: { select: { room_id: true, room_number: true } },
  },
  allowedRoles: {
    get: ['admin', 'warden', 'student'],
    post: ['admin', 'warden'],
    put: ['admin', 'warden'],
    delete: ['admin'],
  },
  filterByUser: filterByUser.student,
}));

// Laundry: Admin full, Warden their hostel's, Student read-only, Technician read-only
router.use('/laundries', createCrudRouter({
  model: 'laundry',
  idField: 'laundry_id',
  cachePrefix: 'laundries',
  createSchema: createLaundrySchema,
  updateSchema: updateLaundrySchema,
  includes: { hostel: { select: { hostel_id: true, hostel_name: true } } },
  allowedRoles: {
    get: ['admin', 'warden', 'student', 'technician'],
    post: ['admin', 'warden'],
    put: ['admin', 'warden'],
    delete: ['admin'],
  },
  filterByUser: filterByUser.hostel,
}));

// Laundry Requests: Admin full, Warden their hostel's, Student own, Technician read-only
router.use('/laundry-requests', createCrudRouter({
  model: 'laundry_request',
  idField: 'request_id',
  cachePrefix: 'laundry_requests',
  createSchema: createLaundryRequestSchema,
  updateSchema: updateLaundryRequestSchema,
  includes: {
    student: { select: { student_id: true, reg_no: true, first_name: true, last_name: true } },
    laundry: { select: { laundry_id: true, laundry_name: true } },
  },
  allowedRoles: {
    get: ['admin', 'warden', 'student'],
    post: ['admin', 'warden', 'student'],
    put: ['admin', 'warden'],
    delete: ['admin', 'warden', 'student'],
  },
  filterByUser: filterByUser.student,
}));

// Stores: Admin full, Warden their hostel's, Student read-only, Technician read-only
router.use('/stores', createCrudRouter({
  model: 'store',
  idField: 'store_id',
  cachePrefix: 'stores',
  createSchema: createStoreSchema,
  updateSchema: updateStoreSchema,
  includes: { hostel: { select: { hostel_id: true, hostel_name: true } } },
  allowedRoles: {
    get: ['admin', 'warden', 'student', 'technician'],
    post: ['admin', 'warden'],
    put: ['admin', 'warden'],
    delete: ['admin'],
  },
  filterByUser: filterByUser.hostel,
}));

// Store Purchases: Admin full, Warden their hostel's, Student own, Technician read-only
router.use('/store-purchases', createCrudRouter({
  model: 'store_purchase',
  idField: 'purchase_id',
  cachePrefix: 'store_purchases',
  createSchema: createStorePurchaseSchema,
  updateSchema: createStorePurchaseSchema.partial(),
  includes: {
    student: { select: { student_id: true, reg_no: true, first_name: true, last_name: true } },
    store: { select: { store_id: true, store_name: true } },
  },
  allowedRoles: {
    get: ['admin', 'warden', 'student'],
    post: ['admin', 'warden', 'student'],
    put: ['admin', 'warden'],
    delete: ['admin', 'warden'],
  },
  filterByUser: filterByUser.student,
}));

// Pharmacies: Admin full, Warden read-only, Student read-only, Technician read-only
router.use('/pharmacies', createCrudRouter({
  model: 'pharmacy',
  idField: 'pharmacy_id',
  cachePrefix: 'pharmacies',
  createSchema: createPharmacySchema,
  updateSchema: updatePharmacySchema,
  allowedRoles: {
    get: ['admin', 'warden', 'student', 'technician'],
    post: ['admin'],
    put: ['admin'],
    delete: ['admin'],
  },
}));

// Pharmacy Visits: Admin full, Warden their hostel's, Student own, Technician read-only
router.use('/pharmacy-visits', createCrudRouter({
  model: 'pharmacy_visit',
  idField: 'visit_id',
  cachePrefix: 'pharmacy_visits',
  createSchema: createPharmacyVisitSchema,
  updateSchema: createPharmacyVisitSchema.partial(),
  includes: {
    student: { select: { student_id: true, reg_no: true, first_name: true, last_name: true } },
    pharmacy: { select: { pharmacy_id: true, pharmacy_name: true } },
  },
  allowedRoles: {
    get: ['admin', 'warden', 'student'],
    post: ['admin', 'warden', 'student'],
    put: ['admin', 'warden'],
    delete: ['admin', 'warden', 'student'],
  },
  filterByUser: filterByUser.student,
}));

// Restaurants: Admin full, Warden read-only, Student read-only, Technician read-only
router.use('/restaurants', createCrudRouter({
  model: 'restaurant',
  idField: 'restaurant_id',
  cachePrefix: 'restaurants',
  createSchema: createRestaurantSchema,
  updateSchema: updateRestaurantSchema,
  allowedRoles: {
    get: ['admin', 'warden', 'student', 'technician'],
    post: ['admin'],
    put: ['admin'],
    delete: ['admin'],
  },
}));

// Gyms: Admin full, Warden read-only, Student read-only, Technician read-only
router.use('/gyms', createCrudRouter({
  model: 'gym',
  idField: 'gym_id',
  cachePrefix: 'gyms',
  createSchema: createGymSchema,
  updateSchema: updateGymSchema,
  allowedRoles: {
    get: ['admin', 'warden', 'student', 'technician'],
    post: ['admin'],
    put: ['admin'],
    delete: ['admin'],
  },
}));

// Gym Memberships: Admin full, Warden their hostel's, Student own, Technician read-only
router.use('/gym-memberships', createCrudRouter({
  model: 'gym_membership',
  idField: 'membership_id',
  cachePrefix: 'gym_memberships',
  createSchema: createGymMembershipSchema,
  updateSchema: updateGymMembershipSchema,
  includes: {
    student: { select: { student_id: true, reg_no: true, first_name: true, last_name: true } },
    gym: { select: { gym_id: true, gym_name: true } },
  },
  allowedRoles: {
    get: ['admin', 'warden', 'student'],
    post: ['admin', 'warden', 'student'],
    put: ['admin', 'warden', 'student'],
    delete: ['admin', 'warden', 'student'],
  },
  filterByUser: filterByUser.student,
}));

// Ambulances: Admin full, Warden read-only, Student read-only, Technician read-only
router.use('/ambulances', createCrudRouter({
  model: 'ambulance_service',
  idField: 'ambulance_id',
  cachePrefix: 'ambulances',
  createSchema: createAmbulanceSchema,
  updateSchema: updateAmbulanceSchema,
  allowedRoles: {
    get: ['admin', 'warden', 'student', 'technician'],
    post: ['admin'],
    put: ['admin'],
    delete: ['admin'],
  },
}));

// Emergency Requests: Admin full, Warden their hostel's, Student own, Technician read-all
router.use('/emergency-requests', createCrudRouter({
  model: 'emergency_request',
  idField: 'request_id',
  cachePrefix: 'emergency_requests',
  createSchema: createEmergencyRequestSchema,
  updateSchema: updateEmergencyRequestSchema,
  includes: {
    student: { select: { student_id: true, reg_no: true, first_name: true, last_name: true } },
    ambulance: true,
  },
  allowedRoles: {
    get: ['admin', 'warden', 'student', 'technician'],
    post: ['admin', 'warden', 'student'],
    put: ['admin', 'warden', 'technician'],
    delete: ['admin'],
  },
  filterByUser: filterByUser.student,
}));

// Notices: Admin full, Warden their hostel's, Student read-only, Technician read-only
router.use('/notices', createCrudRouter({
  model: 'notice_board',
  idField: 'notice_id',
  cachePrefix: 'notices',
  createSchema: createNoticeSchema,
  updateSchema: updateNoticeSchema,
  includes: { hostel: { select: { hostel_id: true, hostel_name: true } } },
  allowedRoles: {
    get: ['admin', 'warden', 'student', 'technician'],
    post: ['admin', 'warden'],
    put: ['admin', 'warden'],
    delete: ['admin', 'warden'],
  },
  filterByUser: filterByUser.hostel,
}));

// Maintenance Schedules: Admin full, Warden their hostel's, Student read-only, Technician their assigned
router.use('/maintenance', createCrudRouter({
  model: 'maintenance_schedule',
  idField: 'schedule_id',
  cachePrefix: 'maintenance',
  createSchema: createMaintenanceSchema,
  updateSchema: updateMaintenanceSchema,
  includes: {
    hostel: { select: { hostel_id: true, hostel_name: true } },
    technician: { select: { technician_id: true, name: true, specialization: true } },
  },
  allowedRoles: {
    get: ['admin', 'warden', 'student', 'technician'],
    post: ['admin', 'warden'],
    put: ['admin', 'warden', 'technician'],
    delete: ['admin', 'warden'],
  },
  filterByUser: filterByUser.maintenance,
}));

// Guardians: Admin full, Warden their hostel's students' guardians, Student own, Technician read-only
router.use('/guardians', createCrudRouter({
  model: 'student_guardian',
  idField: 'guardian_id',
  cachePrefix: 'guardians',
  createSchema: createGuardianSchema,
  updateSchema: updateGuardianSchema,
  includes: {
    student: { select: { student_id: true, reg_no: true, first_name: true, last_name: true } },
  },
  allowedRoles: {
    get: ['admin', 'warden', 'student'],
    post: ['admin', 'warden', 'student'],
    put: ['admin', 'warden', 'student'],
    delete: ['admin', 'warden', 'student'],
  },
  filterByUser: filterByUser.student,
}));

// Technicians: Admin full, Warden read their hostel's, Student read-only, Technician their own data
router.use('/technicians', createCrudRouter({
  model: 'technician',
  idField: 'technician_id',
  cachePrefix: 'technicians',
  createSchema: createTechnicianSchema,
  updateSchema: updateTechnicianSchema,
  includes: {
    hostel: { select: { hostel_id: true, hostel_name: true } },
  },
  allowedRoles: {
    get: ['admin', 'warden', 'student', 'technician'],
    post: ['admin'],
    put: ['admin', 'technician'],
    delete: ['admin'],
  },
  filterByUser: filterByUser.technician,
}));

module.exports = router;
