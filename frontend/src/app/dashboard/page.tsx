import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getServerUserRole, fetchServerApi } from "@/lib/server-api";
import { getQuickActionsForRole } from "@/lib/rbac-config";
import type { UserRole } from "@/lib/rbac-config";
import {
  Building2,
  Users,
  Wrench,
  Bed,
  CreditCard,
  FileText,
  Activity,
  Dumbbell,
  Clock,
  CheckCircle2,
  Utensils,
  X,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import Link from "next/link";

interface DashboardStats {
  overview?: {
    totalHostels?: number;
    totalStudents?: number;
    totalRooms?: number;
    totalComplaints?: number;
    openComplaints?: number;
    pendingFees?: number;
    hostelRooms?: number;
    hostelBeds?: number;
    hostelStudents?: number;
    pendingMaintenance?: number;
    allocatedBed?: string | null;
    pendingFeesForStudent?: number;
    openComplaintsForStudent?: number;
    messSubscription?: string | null;
    assignedComplaints?: number;
    completedToday?: number;
  };
  hostelInfo?: Record<string, unknown>;
  studentInfo?: { allocations?: unknown[] };
  messSubscription?: { mess?: { mess_name?: string } };
  gymMembership?: Record<string, unknown>;
}

interface ActivityItem {
  log_id: string;
  table_name: string;
  action: string;
  created_at: string;
  user?: {
    email: string;
    role: string;
  };
}

export default async function DashboardPage() {
  const userRole = await getServerUserRole() as UserRole | null;

  // Fetch dashboard stats based on role
  let stats: DashboardStats = {};
  try {
    stats = (await fetchServerApi<DashboardStats>('/dashboard/stats')) || {};
  } catch (err) {
    console.error("Dashboard stats fetch error:", err);
    stats = { overview: {} };
  }

  // Fetch activity logs
  let activities: ActivityItem[] = [];
  try {
    activities = (await fetchServerApi<ActivityItem[]>('/dashboard/activity?limit=5')) || [];
  } catch (err) {
    console.error("Dashboard activity fetch error:", err);
    activities = [];
  }

  // Get quick actions based on role
  const quickActions = userRole ? getQuickActionsForRole(userRole as 'admin' | 'warden' | 'student' | 'technician') : [];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">
          {userRole === 'admin' ? 'System Dashboard' :
            userRole === 'warden' ? 'My Hostel Dashboard' :
              userRole === 'student' ? 'My Dashboard' :
                userRole === 'technician' ? 'My Tasks Dashboard' :
                  'Dashboard'}
        </h2>
        <p className="text-muted-foreground mt-1">
          {userRole === 'admin' ? 'Welcome! Here\'s an overview of your entire dormitory management system.' :
            userRole === 'warden' ? 'Welcome! Here\'s what\'s happening in your hostel today.' :
              userRole === 'student' ? 'Welcome back! Here\'s your personal overview.' :
                userRole === 'technician' ? 'Welcome! Here are your assigned tasks.' :
                  'Welcome back!'}
        </p>
      </div>

      {/* Stats Grid - Role-based */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {userRole === 'admin' ? (
          // Admin Stats
          <>
            <StatCard
              title="Total Hostels"
              value={stats.overview?.totalHostels ?? 0}
              icon={Building2}
              href="/dashboard/hostels"
            />
            <StatCard
              title="Total Students"
              value={stats.overview?.totalStudents ?? 0}
              icon={Users}
              href="/dashboard/students"
            />
            <StatCard
              title="Total Rooms"
              value={stats.overview?.totalRooms ?? 0}
              icon={Bed}
              href="/dashboard/rooms"
            />
            <StatCard
              title="Active Complaints"
              value={stats.overview?.openComplaints ?? 0}
              icon={Wrench}
              warning
              href="/dashboard/complaints"
            />
          </>
        ) : userRole === 'warden' ? (
          // Warden Stats
          <>
            <StatCard
              title="My Rooms"
              value={stats.overview?.hostelRooms ?? 0}
              icon={Bed}
              href="/dashboard/rooms"
            />
            <StatCard
              title="My Beds"
              value={stats.overview?.hostelBeds ?? 0}
              icon={Bed}
              href="/dashboard/beds"
            />
            <StatCard
              title="My Students"
              value={stats.overview?.hostelStudents ?? 0}
              icon={Users}
              href="/dashboard/students"
            />
            <StatCard
              title="Pending Maintenance"
              value={stats.overview?.pendingMaintenance ?? 0}
              icon={Wrench}
              warning
              href="/dashboard/maintenance"
            />
          </>
        ) : userRole === 'student' ? (
          // Student Stats
          <>
            <StatCard
              title="My Room"
              value={stats.studentInfo?.allocations?.length ? 'Allocated' : 'Not Allocated'}
              icon={Bed}
              href="/dashboard/rooms"
              isText
            />
            <StatCard
              title="Pending Fees"
              value={stats.overview?.pendingFeesForStudent ?? 0}
              icon={CreditCard}
              warning
              href="/dashboard/fees"
            />
            <StatCard
              title="My Complaints"
              value={stats.overview?.openComplaintsForStudent ?? 0}
              icon={Wrench}
              warning
              href="/dashboard/complaints"
            />
            <StatCard
              title="Mess Subscription"
              value={stats.messSubscription?.mess?.mess_name || 'Not Subscribed'}
              icon={Utensils}
              isText
              href="/dashboard/messes"
            />
          </>
        ) : userRole === 'technician' ? (
          // Technician Stats
          <>
            <StatCard
              title="Assigned Tasks"
              value={stats.overview?.assignedComplaints ?? 0}
              icon={Wrench}
              warning
              href="/dashboard/complaints"
            />
            <StatCard
              title="Completed Today"
              value={stats.overview?.completedToday ?? 0}
              icon={CheckCircle2}
              success
              href="/dashboard/complaints"
            />
            <StatCard
              title="Maintenance Tasks"
              value={activities.filter((a) => a.table_name === 'maintenance_schedule').length}
              icon={Activity}
              href="/dashboard/maintenance"
            />
            <StatCard
              title="Weekly Progress"
              value={stats.overview?.completedToday ?? 0}
              icon={Clock}
              isText
              href="/dashboard/maintenance"
            />
          </>
        ) : (
          // Default stats for logged out users
          <>
            <StatCard
              title="Total Hostels"
              value={stats.overview?.totalHostels ?? 0}
              icon={Building2}
              href="/dashboard/hostels"
            />
            <StatCard
              title="Total Students"
              value={stats.overview?.totalStudents ?? 0}
              icon={Users}
              href="/dashboard/students"
            />
            <StatCard
              title="Total Rooms"
              value={stats.overview?.totalRooms ?? 0}
              icon={Bed}
              href="/dashboard/rooms"
            />
            <StatCard
              title="Total Complaints"
              value={stats.overview?.totalComplaints ?? 0}
              icon={Wrench}
              href="/dashboard/complaints"
            />
          </>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-8">
              {activities.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                  <Activity className="h-12 w-12 mb-4 opacity-50" />
                  <p>No recent activity</p>
                </div>
              ) : (
                activities.map((activity) => {
                  const icon = getActionIcon(activity.action, activity.table_name);
                  const time = formatTimeAgo(activity.created_at);
                  const description = getActivityDescription(activity);
                  return (
                    <div key={activity.log_id} className="flex items-center">
                      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-muted">
                        {icon}
                      </span>
                      <div className="ml-4 space-y-1">
                        <p className="text-sm font-medium leading-none">{description}</p>
                        <p className="text-sm text-muted-foreground">{time}</p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4">
            {quickActions.map((action, index) => (
              <Link key={index} href={action.href}>
                <div className="flex flex-col items-center justify-center p-4 rounded-xl border border-border hover:bg-muted transition-colors cursor-pointer text-center">
                  <action.icon className="h-6 w-6 mb-2 text-primary" />
                  <span className="text-sm font-medium">{action.title}</span>
                </div>
              </Link>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
  icon: Icon,
  href,
  warning = false,
  success = false,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  isText = false,
}: {
  title: string;
  value: number | string;
  icon: LucideIcon;
  href?: string;
  warning?: boolean;
  success?: boolean;
  isText?: boolean;
}) {
  const content = (
    <>
      <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
      </CardContent>
    </>
  );

  if (href) {
    return (
      <Link href={href} className="block">
        <Card className={`transition-all hover:shadow-md ${warning ? 'border-orange-200 dark:border-orange-800' : success ? 'border-green-200 dark:border-green-800' : ''}`}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            {content}
            <div className={`h-8 w-8 ${warning ? 'bg-orange-100 dark:bg-orange-900/30' : success ? 'bg-green-100 dark:bg-green-900/30' : 'bg-primary/10'} text-${warning ? 'orange' : success ? 'green' : 'primary'} rounded-full flex items-center justify-center`}>
              <Icon className="h-4 w-4" />
            </div>
          </CardHeader>
        </Card>
      </Link>
    );
  }

  return (
    <Card className={warning ? 'border-orange-200 dark:border-orange-800' : success ? 'border-green-200 dark:border-green-800' : ''}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        {content}
        <div className={`h-8 w-8 ${warning ? 'bg-orange-100 dark:bg-orange-900/30' : success ? 'bg-green-100 dark:bg-green-900/30' : 'bg-primary/10'} text-${warning ? 'orange' : success ? 'green' : 'primary'} rounded-full flex items-center justify-center`}>
          <Icon className="h-4 w-4" />
        </div>
      </CardHeader>
    </Card>
  );
}

function getActionIcon(action: string, table: string) {
  const iconMap: Record<string, React.ReactNode> = {
    'INSERT': <CheckCircle2 className="h-4 w-4 text-green-600" />,
    'UPDATE': <Clock className="h-4 w-4 text-blue-600" />,
    'DELETE': <X className="h-4 w-4 text-red-600" />,
  };

  const tableIcons: Record<string, React.ReactNode> = {
    'student': <Users className="h-4 w-4" />,
    'room': <Bed className="h-4 w-4" />,
    'bed': <Bed className="h-4 w-4" />,
    'complaint': <Wrench className="h-4 w-4" />,
    'hostel': <Building2 className="h-4 w-4" />,
    'feepayment': <CreditCard className="h-4 w-4" />,
    'mess_subscription': <Utensils className="h-4 w-4" />,
    'facility_booking': <Dumbbell className="h-4 w-4" />,
    'maintenance_schedule': <Activity className="h-4 w-4" />,
  };

  return tableIcons[table] || iconMap[action] || <FileText className="h-4 w-4" />;
}

function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  return `${days} day${days > 1 ? 's' : ''} ago`;
}

function getActivityDescription(activity: ActivityItem): string {
  const actionLabels: Record<string, string> = {
    'INSERT': 'Created',
    'UPDATE': 'Updated',
    'DELETE': 'Deleted',
  };

  const tableLabels: Record<string, string> = {
    'student': 'Student',
    'room': 'Room',
    'bed': 'Bed',
    'complaint': 'Complaint',
    'hostel': 'Hostel',
    'feepayment': 'Fee Payment',
    'mess_subscription': 'Mess Subscription',
    'facility_booking': 'Facility Booking',
    'maintenance_schedule': 'Maintenance Schedule',
  };

  const action = actionLabels[activity.action] || activity.action;
  const table = tableLabels[activity.table_name] || activity.table_name;

  return `${action} ${table}`;
}
