const { Router } = require('express');
const prisma = require('../lib/prisma');
const { authenticate } = require('../middleware/auth');

const router = Router();

// GET /dashboard/stats - Role-based statistics
router.get('/stats', authenticate, async (req, res, next) => {
  try {
    const { role, userId } = req.user;
    let stats = {};

    switch (role) {
      case 'admin':
        // Admin gets full statistics
        stats = await getAdminStats();
        break;

      case 'warden':
        // Warden gets their hostel's statistics
        stats = await getWardenStats(userId);
        break;

      case 'student':
        // Student gets their personal statistics
        stats = await getStudentStats(userId);
        break;

      case 'technician':
        // Technician gets their task statistics
        stats = await getTechnicianStats(userId);
        break;

      default:
        throw new Error('Invalid role');
    }

    res.json({ success: true, data: stats });
  } catch (err) {
    next(err);
  }
});

// GET /dashboard/activity - Recent activities from audit_log
router.get('/activity', authenticate, async (req, res, next) => {
  try {
    const { role, userId } = req.user;
    const limit = parseInt(req.query.limit) || 10;

    let activities = [];

    if (role === 'admin') {
      // Admin sees all activities
      activities = await prisma.audit_log.findMany({
        take: limit,
        orderBy: { created_at: 'desc' },
        include: {
          user: {
            select: {
              user_id: true,
              email: true,
              role: true,
            },
          },
        },
      });
    } else {
      // Other roles see their own activities
      activities = await prisma.audit_log.findMany({
        where: { user_id: userId },
        take: limit,
        orderBy: { created_at: 'desc' },
        select: {
          log_id: true,
          table_name: true,
          action: true,
          created_at: true,
        },
      });
    }

    res.json({ success: true, data: activities });
  } catch (err) {
    next(err);
  }
});

// GET /dashboard/my-info - Current user info with role context
router.get('/my-info', authenticate, async (req, res, next) => {
  try {
    const { role, userId } = req.user;

    let userInfo = {};

    if (role === 'admin') {
      userInfo = await getAdminInfo(userId);
    } else if (role === 'warden') {
      userInfo = await getWardenInfo(userId);
    } else if (role === 'student') {
      userInfo = await getStudentInfo(userId);
    } else if (role === 'technician') {
      userInfo = await getTechnicianInfo(userId);
    }

    res.json({ success: true, data: userInfo });
  } catch (err) {
    next(err);
  }
});

// ==========================================
// Helper Functions
// ==========================================

async function getAdminStats() {
  const [
    totalHostels,
    totalStudents,
    totalRooms,
    totalComplaints,
    openComplaints,
    pendingFees,
  ] = await Promise.all([
    prisma.hostel.count(),
    prisma.student.count({ where: { status: 'Active' } }),
    prisma.room.count(),
    prisma.complaint.count(),
    prisma.complaint.count({ where: { status: { in: ['Open', 'In Progress'] } } }),
    prisma.feepayment.count({ where: { status: 'Pending' } }),
  ]);

  return {
    overview: {
      totalHostels,
      totalStudents,
      totalRooms,
      totalComplaints,
      openComplaints,
      pendingFees,
    },
    hostelOccupancy: await getHostelOccupancyStats(),
    recentActivities: await getRecentActivities(5),
  };
}

async function getWardenStats(userId) {
  const user = await prisma.auth_user.findUnique({
    where: { user_id: userId },
    select: { assigned_hostel_id: true },
  });

  if (!user?.assigned_hostel_id) {
    return {
      overview: {
        message: 'No hostel assigned',
      },
    };
  }

  const hostelId = user.assigned_hostel_id;

  const [
    hostelRooms,
    hostelBeds,
    hostelStudents,
    hostelComplaints,
    openComplaints,
    pendingMaintenance,
  ] = await Promise.all([
    prisma.room.count({ where: { hostel_id: hostelId } }),
    prisma.bed.count({ where: { room: { hostel_id: hostelId } } }),
    prisma.student.count({
      where: {
        status: 'Active',
        allocations: {
          some: {
            bed: { room: { hostel_id: hostelId } },
          },
        },
      },
    }),
    prisma.complaint.count(),
    prisma.complaint.count({
      where: {
        room: { hostel_id: hostelId },
        status: { in: ['Open', 'In Progress'] },
      },
    }),
    prisma.maintenance_schedule.count({
      where: {
        hostel_id: hostelId,
        status: { in: ['Scheduled', 'In Progress'] },
      },
    }),
  ]);

  return {
    overview: {
      hostelRooms,
      hostelBeds,
      hostelStudents,
      hostelComplaints,
      openComplaints,
      pendingMaintenance,
    },
    hostelInfo: await prisma.hostel.findUnique({
      where: { hostel_id: hostelId },
    }),
  };
}

async function getStudentStats(userId) {
  const user = await prisma.auth_user.findUnique({
    where: { user_id: userId },
    select: { student_id: true },
  });

  if (!user?.student_id) {
    return {
      overview: {
        message: 'No student account linked',
      },
    };
  }

  const studentId = user.student_id;

  const [
    studentInfo,
    allocation,
    fees,
    complaints,
    messSubscription,
    gymMembership,
  ] = await Promise.all([
    prisma.student.findUnique({
      where: { student_id: studentId },
      include: {
        allocations: {
          where: { status: 'Active' },
          include: {
            bed: {
              include: {
                room: {
                  include: {
                    hostel: {
                      select: {
                        hostel_id: true,
                        hostel_name: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    }),
    prisma.feepayment.findMany({
      where: { student_id: studentId },
      orderBy: { due_date: 'desc' },
      take: 5,
    }),
    prisma.complaint.count({
      where: {
        student_id: studentId,
        status: { in: ['Open', 'In Progress'] },
      },
    }),
    prisma.mess_subscription.findFirst({
      where: {
        student_id: studentId,
        status: 'Active',
      },
      include: {
        mess: true,
      },
    }),
    prisma.gym_membership.findFirst({
      where: {
        student_id: studentId,
        status: 'Active',
      },
      include: {
        gym: true,
      },
    }),
  ]);

  return {
    overview: {
      allocation: allocation?.allocations?.[0] || null,
      pendingFees: fees.filter((f) => f.status === 'Pending').length,
      openComplaints: complaints,
    },
    studentInfo: studentInfo,
    messSubscription,
    gymMembership,
  };
}

async function getTechnicianStats(userId) {
  const user = await prisma.auth_user.findUnique({
    where: { user_id: userId },
    select: { technician_id: true },
  });

  if (!user?.technician_id) {
    return {
      overview: {
        message: 'No technician account linked',
      },
    };
  }

  const technicianId = user.technician_id;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [assignedComplaints, completedToday, technicianInfo] = await Promise.all([
    prisma.complaint.findMany({
      where: {
        technician_id: technicianId,
        status: { in: ['Open', 'In Progress'] },
      },
      take: 10,
      orderBy: { created_at: 'desc' },
      include: {
        student: { select: { student_id: true, first_name: true, last_name: true } },
        room: { select: { room_number: true } },
      },
    }),
    prisma.complaint.count({
      where: {
        technician_id: technicianId,
        status: 'Resolved',
        resolved_at: { gte: today },
      },
    }),
    prisma.technician.findUnique({
      where: { technician_id: technicianId },
      include: { hostel: true },
    }),
  ]);

  return {
    overview: {
      assignedComplaints: assignedComplaints.length,
      completedToday,
    },
    tasks: assignedComplaints,
    technicianInfo,
  };
}

async function getHostelOccupancyStats() {
  const hostels = await prisma.hostel.findMany({
    include: {
      rooms: {
        include: {
          beds: {
            where: { occupied: true },
          },
        },
      },
    },
  });

  return hostels.map((hostel) => {
    const totalBeds = hostel.rooms.reduce((sum, room) => sum + room.beds.length, 0);
    const occupiedBeds = hostel.rooms.reduce((sum, room) => sum + room.beds.filter((b) => b.occupied).length, 0);
    return {
      hostel_id: hostel.hostel_id,
      hostel_name: hostel.hostel_name,
      totalRooms: hostel.rooms.length,
      totalBeds,
      occupiedBeds,
      occupancyRate: totalBeds > 0 ? Math.round((occupiedBeds / totalBeds) * 100) : 0,
    };
  });
}

async function getRecentActivities(limit = 5) {
  return await prisma.audit_log.findMany({
    take: limit,
    orderBy: { created_at: 'desc' },
    select: {
      log_id: true,
      table_name: true,
      action: true,
      created_at: true,
      user: {
        select: {
          email: true,
          role: true,
        },
      },
    },
  });
}

async function getAdminInfo(userId) {
  return await prisma.auth_user.findUnique({
    where: { user_id: userId },
    select: {
      user_id: true,
      email: true,
      role: true,
      last_login: true,
      created_at: true,
    },
  });
}

async function getWardenInfo(userId) {
  return await prisma.auth_user.findUnique({
    where: { user_id: userId },
    select: {
      user_id: true,
      email: true,
      role: true,
      assigned_hostel_id: true,
      last_login: true,
      hostel: {
        select: {
          hostel_id: true,
          hostel_name: true,
          total_floors: true,
        },
      },
    },
  });
}

async function getStudentInfo(userId) {
  return await prisma.auth_user.findUnique({
    where: { user_id: userId },
    select: {
      user_id: true,
      email: true,
      role: true,
      last_login: true,
      student: {
        select: {
          student_id: true,
          reg_no: true,
          first_name: true,
          last_name: true,
          phone_primary: true,
          email_institutional: true,
          status: true,
        },
      },
    },
  });
}

async function getTechnicianInfo(userId) {
  return await prisma.auth_user.findUnique({
    where: { user_id: userId },
    select: {
      user_id: true,
      email: true,
      role: true,
      last_login: true,
      technician: {
        select: {
          technician_id: true,
          name: true,
          specialization: true,
          hostel_id: true,
        },
      },
    },
  });
}

module.exports = router;
