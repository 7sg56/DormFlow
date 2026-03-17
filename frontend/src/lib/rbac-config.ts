import {
  LayoutDashboard,
  Building2,
  Bed,
  Users,
  UserSquare2,
  CreditCard,
  Wrench,
  FileText,
  Utensils,
  Dumbbell,
  ShoppingBag,
  Pill,
  UtensilsCrossed,
  Activity,
  PhoneCall,
  Calendar,
  Shield,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export type UserRole = 'admin' | 'warden' | 'student' | 'technician';

export interface NavItem {
  title: string;
  href: string;
  icon: LucideIcon;
  roles?: UserRole[];
  badge?: string | number;
}

export interface NavGroup {
  group: string;
  items: NavItem[];
}

// Role-based navigation configuration
export const roleNavItems: Record<UserRole, NavGroup[]> = {
  admin: [
    {
      group: 'Core',
      items: [
        { title: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
        { title: 'Hostels & Rooms', href: '/dashboard/hostels', icon: Building2 },
        { title: 'Beds', href: '/dashboard/beds', icon: Bed },
      ],
    },
    {
      group: 'People',
      items: [
        { title: 'Students', href: '/dashboard/students', icon: Users },
        { title: 'Technicians', href: '/dashboard/technicians', icon: UserSquare2 },
      ],
    },
    {
      group: 'Operations',
      items: [
        { title: 'Fee Payments', href: '/dashboard/fees', icon: CreditCard },
        { title: 'Complaints', href: '/dashboard/complaints', icon: Wrench },
        { title: 'Mess & Menu', href: '/dashboard/messes', icon: Utensils },
        { title: 'Maintenance', href: '/dashboard/maintenance', icon: Calendar },
      ],
    },
    {
      group: 'Services',
      items: [
        { title: 'Gym & Fitness', href: '/dashboard/gym', icon: Dumbbell },
        { title: 'Laundry', href: '/dashboard/laundry', icon: ShoppingBag },
        { title: 'Pharmacy', href: '/dashboard/pharmacy', icon: Pill },
        { title: 'Campus Store', href: '/dashboard/store', icon: ShoppingBag },
        { title: 'Restaurant', href: '/dashboard/restaurant', icon: UtensilsCrossed },
        { title: 'Facilities', href: '/dashboard/facilities', icon: Activity },
      ],
    },
    {
      group: 'Emergency & Logs',
      items: [
        { title: 'Ambulance', href: '/dashboard/ambulance', icon: PhoneCall },
        { title: 'Emergency Requests', href: '/dashboard/emergency', icon: Shield },
        { title: 'Access Logs', href: '/dashboard/access-logs', icon: Activity },
        { title: 'Visitor Logs', href: '/dashboard/visitor-logs', icon: FileText },
      ],
    },
    {
      group: 'Information',
      items: [
        { title: 'Notice Board', href: '/dashboard/notices', icon: FileText },
      ],
    },
  ],
  warden: [
    {
      group: 'Core',
      items: [
        { title: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
        { title: 'My Hostel', href: '/dashboard/hostels', icon: Building2 },
        { title: 'Rooms & Beds', href: '/dashboard/rooms', icon: Bed },
      ],
    },
    {
      group: 'People',
      items: [
        { title: 'Students', href: '/dashboard/students', icon: Users },
      ],
    },
    {
      group: 'Operations',
      items: [
        { title: 'Complaints', href: '/dashboard/complaints', icon: Wrench },
        { title: 'Mess & Menu', href: '/dashboard/messes', icon: Utensils },
        { title: 'Maintenance', href: '/dashboard/maintenance', icon: Calendar },
      ],
    },
    {
      group: 'Services',
      items: [
        { title: 'Laundry', href: '/dashboard/laundry', icon: ShoppingBag },
        { title: 'Pharmacy', href: '/dashboard/pharmacy', icon: Pill },
        { title: 'Campus Store', href: '/dashboard/store', icon: ShoppingBag },
        { title: 'Facilities', href: '/dashboard/facilities', icon: Activity },
      ],
    },
    {
      group: 'Logs',
      items: [
        { title: 'Access Logs', href: '/dashboard/access-logs', icon: Activity },
        { title: 'Visitor Logs', href: '/dashboard/visitor-logs', icon: FileText },
      ],
    },
    {
      group: 'Information',
      items: [
        { title: 'Notice Board', href: '/dashboard/notices', icon: FileText },
      ],
    },
  ],
  student: [
    {
      group: 'Overview',
      items: [
        { title: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
      ],
    },
    {
      group: 'My Profile',
      items: [
        { title: 'My Room', href: '/dashboard/rooms', icon: Bed },
        { title: 'My Fees', href: '/dashboard/fees', icon: CreditCard },
        { title: 'My Complaints', href: '/dashboard/complaints', icon: Wrench },
      ],
    },
    {
      group: 'Services',
      items: [
        { title: 'Gym & Fitness', href: '/dashboard/gym', icon: Dumbbell },
        { title: 'Laundry', href: '/dashboard/laundry', icon: ShoppingBag },
        { title: 'Pharmacy', href: '/dashboard/pharmacy', icon: Pill },
        { title: 'Campus Store', href: '/dashboard/store', icon: ShoppingBag },
        { title: 'Restaurant', href: '/dashboard/restaurant', icon: UtensilsCrossed },
        { title: 'Facilities', href: '/dashboard/facilities', icon: Activity },
      ],
    },
    {
      group: 'Dining',
      items: [
        { title: 'Mess & Menu', href: '/dashboard/messes', icon: Utensils },
      ],
    },
    {
      group: 'Information',
      items: [
        { title: 'Notice Board', href: '/dashboard/notices', icon: FileText },
        { title: 'My Access Logs', href: '/dashboard/access-logs', icon: Activity },
        { title: 'My Visitors', href: '/dashboard/visitor-logs', icon: FileText },
      ],
    },
  ],
  technician: [
    {
      group: 'Overview',
      items: [
        { title: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
      ],
    },
    {
      group: 'My Tasks',
      items: [
        { title: 'Complaints', href: '/dashboard/complaints', icon: Wrench },
        { title: 'Maintenance', href: '/dashboard/maintenance', icon: Calendar },
        { title: 'Emergency Requests', href: '/dashboard/emergency', icon: Shield },
      ],
    },
    {
      group: 'Services',
      items: [
        { title: 'Gym', href: '/dashboard/gym', icon: Dumbbell },
        { title: 'Laundry', href: '/dashboard/laundry', icon: ShoppingBag },
        { title: 'Pharmacy', href: '/dashboard/pharmacy', icon: Pill },
        { title: 'Campus Store', href: '/dashboard/store', icon: ShoppingBag },
        { title: 'Restaurant', href: '/dashboard/restaurant', icon: UtensilsCrossed },
      ],
    },
    {
      group: 'Information',
      items: [
        { title: 'Notice Board', href: '/dashboard/notices', icon: FileText },
      ],
    },
  ],
};

// Role permissions for routes
export const rolePermissions: Record<UserRole, string[]> = {
  admin: ['*'], // Admin has access to all routes
  warden: [
    '/dashboard',
    '/dashboard/hostels',
    '/dashboard/rooms',
    '/dashboard/beds',
    '/dashboard/students',
    '/dashboard/complaints',
    '/dashboard/messes',
    '/dashboard/maintenance',
    '/dashboard/laundry',
    '/dashboard/pharmacy',
    '/dashboard/store',
    '/dashboard/facilities',
    '/dashboard/access-logs',
    '/dashboard/visitor-logs',
    '/dashboard/notices',
  ],
  student: [
    '/dashboard',
    '/dashboard/rooms',
    '/dashboard/beds',
    '/dashboard/fees',
    '/dashboard/complaints',
    '/dashboard/gym',
    '/dashboard/laundry',
    '/dashboard/pharmacy',
    '/dashboard/store',
    '/dashboard/restaurant',
    '/dashboard/facilities',
    '/dashboard/messes',
    '/dashboard/notices',
    '/dashboard/access-logs',
    '/dashboard/visitor-logs',
  ],
  technician: [
    '/dashboard',
    '/dashboard/complaints',
    '/dashboard/maintenance',
    '/dashboard/emergency',
    '/dashboard/gym',
    '/dashboard/laundry',
    '/dashboard/pharmacy',
    '/dashboard/store',
    '/dashboard/restaurant',
    '/dashboard/notices',
  ],
};

// Role-specific quick actions
export const roleQuickActions: Record<UserRole, Array<{ title: string; href: string; icon: LucideIcon }>> = {
  admin: [
    { title: 'Add Student', href: '/dashboard/students', icon: Users },
    { title: 'Allocate Bed', href: '/dashboard/beds', icon: Bed },
    { title: 'Record Fee', href: '/dashboard/fees', icon: CreditCard },
    { title: 'Create Notice', href: '/dashboard/notices', icon: FileText },
  ],
  warden: [
    { title: 'View Students', href: '/dashboard/students', icon: Users },
    { title: 'View Rooms', href: '/dashboard/rooms', icon: Bed },
    { title: 'Create Complaint', href: '/dashboard/complaints', icon: Wrench },
    { title: 'Create Notice', href: '/dashboard/notices', icon: FileText },
  ],
  student: [
    { title: 'View Room', href: '/dashboard/rooms', icon: Bed },
    { title: 'Submit Complaint', href: '/dashboard/complaints', icon: Wrench },
    { title: 'View Fees', href: '/dashboard/fees', icon: CreditCard },
    { title: 'Book Facility', href: '/dashboard/facilities', icon: Activity },
  ],
  technician: [
    { title: 'My Tasks', href: '/dashboard/complaints', icon: Wrench },
    { title: 'Maintenance', href: '/dashboard/maintenance', icon: Calendar },
    { title: 'Emergency', href: '/dashboard/emergency', icon: Shield },
    { title: 'My Profile', href: '/dashboard/technicians', icon: UserSquare2 },
  ],
};

export function getNavItemsForRole(role: UserRole): NavGroup[] {
  return roleNavItems[role] || [];
}

export function canAccessRoute(role: UserRole, route: string): boolean {
  if (role === 'admin') return true;
  return rolePermissions[role]?.includes(route) || false;
}

export function getQuickActionsForRole(role: UserRole): Array<{ title: string; href: string; icon: LucideIcon }> {
  return roleQuickActions[role] || [];
}
