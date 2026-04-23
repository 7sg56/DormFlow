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
  ShoppingBag,
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

export const roleNavItems: Record<UserRole, NavGroup[]> = {
  admin: [
    {
      group: 'Core',
      items: [
        { title: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
        { title: 'Hostels', href: '/dashboard/hostels', icon: Building2 },
        { title: 'Rooms', href: '/dashboard/rooms', icon: Bed },
        { title: 'Beds', href: '/dashboard/beds', icon: Bed },
      ],
    },
    {
      group: 'People',
      items: [
        { title: 'Students', href: '/dashboard/students', icon: Users },
        { title: 'Wardens', href: '/dashboard/wardens', icon: UserSquare2 },
        { title: 'Technicians', href: '/dashboard/technicians', icon: UserSquare2 },
      ],
    },
    {
      group: 'Operations',
      items: [
        { title: 'Allocations', href: '/dashboard/allocations', icon: Bed },
        { title: 'Fee Payments', href: '/dashboard/fees', icon: CreditCard },
        { title: 'Complaints', href: '/dashboard/complaints', icon: Wrench },
      ],
    },
    {
      group: 'Services',
      items: [
        { title: 'Mess', href: '/dashboard/messes', icon: Utensils },
        { title: 'Laundry', href: '/dashboard/laundry', icon: ShoppingBag },
        { title: 'Visitor Logs', href: '/dashboard/visitor-logs', icon: FileText },
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
        { title: 'Allocations', href: '/dashboard/allocations', icon: Bed },
        { title: 'Complaints', href: '/dashboard/complaints', icon: Wrench },
        { title: 'Mess', href: '/dashboard/messes', icon: Utensils },
        { title: 'Laundry', href: '/dashboard/laundry', icon: ShoppingBag },
        { title: 'Visitor Logs', href: '/dashboard/visitor-logs', icon: FileText },
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
        { title: 'Mess', href: '/dashboard/messes', icon: Utensils },
        { title: 'Laundry', href: '/dashboard/laundry', icon: ShoppingBag },
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
      ],
    },
  ],
};

export const rolePermissions: Record<UserRole, string[]> = {
  admin: ['*'],
  warden: [
    '/dashboard',
    '/dashboard/hostels',
    '/dashboard/rooms',
    '/dashboard/beds',
    '/dashboard/students',
    '/dashboard/allocations',
    '/dashboard/complaints',
    '/dashboard/messes',
    '/dashboard/laundry',
    '/dashboard/visitor-logs',
  ],
  student: [
    '/dashboard',
    '/dashboard/rooms',
    '/dashboard/fees',
    '/dashboard/complaints',
    '/dashboard/messes',
    '/dashboard/laundry',
    '/dashboard/visitor-logs',
  ],
  technician: [
    '/dashboard',
    '/dashboard/complaints',
  ],
};

export const roleQuickActions: Record<UserRole, Array<{ title: string; href: string; icon: LucideIcon }>> = {
  admin: [
    { title: 'Add Student', href: '/dashboard/students', icon: Users },
    { title: 'Allocate Bed', href: '/dashboard/allocations', icon: Bed },
    { title: 'Record Fee', href: '/dashboard/fees', icon: CreditCard },
    { title: 'View Complaints', href: '/dashboard/complaints', icon: Wrench },
  ],
  warden: [
    { title: 'View Students', href: '/dashboard/students', icon: Users },
    { title: 'View Rooms', href: '/dashboard/rooms', icon: Bed },
    { title: 'Create Complaint', href: '/dashboard/complaints', icon: Wrench },
  ],
  student: [
    { title: 'View Room', href: '/dashboard/rooms', icon: Bed },
    { title: 'Submit Complaint', href: '/dashboard/complaints', icon: Wrench },
    { title: 'View Fees', href: '/dashboard/fees', icon: CreditCard },
  ],
  technician: [
    { title: 'My Tasks', href: '/dashboard/complaints', icon: Wrench },
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
