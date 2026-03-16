const { Router } = require('express');
const { createCrudRouter } = require('./crud.factory');

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
  createAccessLogSchema,
  createVisitorLogSchema, updateVisitorLogSchema,
  createLaundrySchema, updateLaundrySchema,
  createLaundryRequestSchema, updateLaundryRequestSchema,
  createStoreSchema, updateStoreSchema,
  createStorePurchaseSchema,
  createPharmacySchema, updatePharmacySchema,
  createPharmacyVisitSchema,
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

const router = Router();

// ---- Auth (custom) ----
router.use('/auth', authRoutes);

// ---- Allocation (custom — Redis locking) ----
router.use('/allocations', allocationRoutes);

// ---- Standard CRUD entities (factory-generated) ----
router.use('/hostels', createCrudRouter({
  model: 'hostel',
  idField: 'hostel_id',
  cachePrefix: 'hostels',
  createSchema: createHostelSchema,
  updateSchema: updateHostelSchema,
  includes: { rooms: { select: { room_id: true, room_number: true, floor: true } } },
}));

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
}));

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
}));

router.use('/beds', createCrudRouter({
  model: 'bed',
  idField: 'bed_id',
  cachePrefix: 'beds',
  createSchema: createBedSchema,
  updateSchema: updateBedSchema,
  includes: {
    room: { include: { hostel: { select: { hostel_id: true, hostel_name: true } } } },
  },
}));

router.use('/fees', createCrudRouter({
  model: 'feepayment',
  idField: 'payment_id',
  cachePrefix: 'fees',
  createSchema: createFeeSchema,
  updateSchema: updateFeeSchema,
  includes: {
    student: { select: { student_id: true, reg_no: true, first_name: true, last_name: true } },
  },
}));

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
}));

router.use('/messes', createCrudRouter({
  model: 'mess',
  idField: 'mess_id',
  cachePrefix: 'messes',
  createSchema: createMessSchema,
  updateSchema: updateMessSchema,
  includes: { hostel: { select: { hostel_id: true, hostel_name: true } } },
}));

router.use('/menus', createCrudRouter({
  model: 'menu',
  idField: 'menu_id',
  cachePrefix: 'menus',
  createSchema: createMenuSchema,
  updateSchema: updateMenuSchema,
  includes: { mess: { select: { mess_id: true, mess_name: true } } },
}));

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
}));

router.use('/facilities', createCrudRouter({
  model: 'facility',
  idField: 'facility_id',
  cachePrefix: 'facilities',
  createSchema: createFacilitySchema,
  updateSchema: updateFacilitySchema,
  includes: { hostel: { select: { hostel_id: true, hostel_name: true } } },
}));

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
}));

router.use('/access-logs', createCrudRouter({
  model: 'accesslog',
  idField: 'log_id',
  cachePrefix: 'access_logs',
  createSchema: createAccessLogSchema,
  updateSchema: createAccessLogSchema.partial(),
  includes: {
    student: { select: { student_id: true, reg_no: true, first_name: true, last_name: true } },
  },
}));

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
}));

router.use('/laundries', createCrudRouter({
  model: 'laundry',
  idField: 'laundry_id',
  cachePrefix: 'laundries',
  createSchema: createLaundrySchema,
  updateSchema: updateLaundrySchema,
  includes: { hostel: { select: { hostel_id: true, hostel_name: true } } },
}));

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
}));

router.use('/stores', createCrudRouter({
  model: 'store',
  idField: 'store_id',
  cachePrefix: 'stores',
  createSchema: createStoreSchema,
  updateSchema: updateStoreSchema,
  includes: { hostel: { select: { hostel_id: true, hostel_name: true } } },
}));

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
}));

router.use('/pharmacies', createCrudRouter({
  model: 'pharmacy',
  idField: 'pharmacy_id',
  cachePrefix: 'pharmacies',
  createSchema: createPharmacySchema,
  updateSchema: updatePharmacySchema,
}));

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
}));

router.use('/restaurants', createCrudRouter({
  model: 'restaurant',
  idField: 'restaurant_id',
  cachePrefix: 'restaurants',
  createSchema: createRestaurantSchema,
  updateSchema: updateRestaurantSchema,
}));

router.use('/gyms', createCrudRouter({
  model: 'gym',
  idField: 'gym_id',
  cachePrefix: 'gyms',
  createSchema: createGymSchema,
  updateSchema: updateGymSchema,
}));

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
}));

router.use('/ambulances', createCrudRouter({
  model: 'ambulance_service',
  idField: 'ambulance_id',
  cachePrefix: 'ambulances',
  createSchema: createAmbulanceSchema,
  updateSchema: updateAmbulanceSchema,
}));

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
}));

router.use('/notices', createCrudRouter({
  model: 'notice_board',
  idField: 'notice_id',
  cachePrefix: 'notices',
  createSchema: createNoticeSchema,
  updateSchema: updateNoticeSchema,
  includes: { hostel: { select: { hostel_id: true, hostel_name: true } } },
}));

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
}));

router.use('/guardians', createCrudRouter({
  model: 'student_guardian',
  idField: 'guardian_id',
  cachePrefix: 'guardians',
  createSchema: createGuardianSchema,
  updateSchema: updateGuardianSchema,
  includes: {
    student: { select: { student_id: true, reg_no: true, first_name: true, last_name: true } },
  },
}));

router.use('/technicians', createCrudRouter({
  model: 'technician',
  idField: 'technician_id',
  cachePrefix: 'technicians',
  createSchema: createTechnicianSchema,
  updateSchema: updateTechnicianSchema,
  includes: {
    hostel: { select: { hostel_id: true, hostel_name: true } },
  },
}));

module.exports = router;
