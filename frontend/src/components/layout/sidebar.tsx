"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/lib/auth";
import {
  Building2,
  LogOut,
  Menu,
  X,
  LayoutDashboard,
  Users,
  Bed,
  DoorOpen,
  CreditCard,
  Wrench,
  Utensils,
  ShirtIcon,
  UserCheck,
  Eye,
  type LucideIcon,
} from "lucide-react";

interface NavItem {
  title: string;
  href: string;
  icon: LucideIcon;
}

interface NavGroup {
  group: string;
  items: NavItem[];
}

function getNavForRole(role: string): NavGroup[] {
  const common: NavGroup = {
    group: "Information",
    items: [
      { title: "Mess Info", href: "/dashboard/mess", icon: Utensils },
      { title: "Laundry Info", href: "/dashboard/laundry", icon: ShirtIcon },
    ],
  };

  if (role === "admin") {
    return [
      { group: "Overview", items: [{ title: "Dashboard", href: "/dashboard", icon: LayoutDashboard }] },
      {
        group: "Management",
        items: [
          { title: "Hostels", href: "/dashboard/hostels", icon: Building2 },
          { title: "Students", href: "/dashboard/students", icon: Users },
          { title: "Rooms", href: "/dashboard/rooms", icon: DoorOpen },
          { title: "Beds", href: "/dashboard/beds", icon: Bed },
          { title: "Allocations", href: "/dashboard/allocations", icon: UserCheck },
          { title: "Fees", href: "/dashboard/fees", icon: CreditCard },
          { title: "Complaints", href: "/dashboard/complaints", icon: Wrench },
          { title: "Technicians", href: "/dashboard/technicians", icon: Users },
          { title: "Visitors", href: "/dashboard/visitors", icon: Eye },
        ],
      },
      common,
    ];
  }

  if (role === "warden") {
    return [
      { group: "Overview", items: [{ title: "Dashboard", href: "/dashboard", icon: LayoutDashboard }] },
      {
        group: "My Hostel",
        items: [
          { title: "Students", href: "/dashboard/students", icon: Users },
          { title: "Room Occupancy", href: "/dashboard/rooms", icon: DoorOpen },
          { title: "Fee Tracker", href: "/dashboard/fees", icon: CreditCard },
          { title: "Fee Defaulters", href: "/dashboard/defaulters", icon: CreditCard },
          { title: "Complaints", href: "/dashboard/complaints", icon: Wrench },
          { title: "Visitors", href: "/dashboard/visitors", icon: Eye },
        ],
      },
      common,
    ];
  }

  if (role === "student") {
    return [
      { group: "Overview", items: [{ title: "Dashboard", href: "/dashboard", icon: LayoutDashboard }] },
      {
        group: "My Info",
        items: [
          { title: "My Complaints", href: "/dashboard/complaints", icon: Wrench },
          { title: "My Fees", href: "/dashboard/fees", icon: CreditCard },
          { title: "My Visitors", href: "/dashboard/visitors", icon: Eye },
        ],
      },
      common,
    ];
  }

  if (role === "technician") {
    return [
      { group: "Overview", items: [{ title: "Dashboard", href: "/dashboard", icon: LayoutDashboard }] },
      {
        group: "My Tasks",
        items: [
          { title: "Assigned Complaints", href: "/dashboard/complaints", icon: Wrench },
        ],
      },
      common,
    ];
  }

  return [];
}

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const { user, logout } = useAuth();

  const navItems = getNavForRole(user?.role || "student");

  return (
    <>
      {/* Mobile Nav Toggle */}
      <div className="md:hidden px-4 py-3 border-b border-outline-variant bg-card flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-[var(--radius)] bg-primary-container flex items-center justify-center">
            <Building2 className="h-4 w-4 text-on-primary-container" />
          </div>
          <span className="font-headline font-bold text-on-surface">DormFlow</span>
        </div>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 rounded-[var(--radius)] hover:bg-surface-container-high text-on-surface-variant transition-colors"
        >
          {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Sidebar Panel */}
      <div className={`fixed inset-y-0 left-0 z-50 w-60 transform flex-col bg-card border-r border-outline-variant transition-transform duration-200 ease-out md:relative md:flex md:translate-x-0 ${isOpen ? "translate-x-0" : "-translate-x-full"}`}>
        {/* Brand Header */}
        <div className="flex h-14 items-center border-b border-outline-variant px-5 mt-[52px] md:mt-0">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-[var(--radius-md)] bg-primary-container flex items-center justify-center">
              <Building2 className="h-[18px] w-[18px] text-on-primary-container" />
            </div>
            <span className="font-headline font-bold text-lg tracking-tight text-on-surface">DormFlow</span>
          </div>
        </div>

        {/* User Profile Section */}
        <div className="px-4 py-4 border-b border-outline-variant/60">
          <p className="text-sm font-medium text-on-surface truncate">{user?.name || "User"}</p>
          <div className="flex items-center gap-2 mt-1.5">
            <span className="inline-flex items-center px-2 py-0.5 rounded-[var(--radius-xl)] text-[11px] font-ui font-semibold bg-primary-container/15 text-primary-container capitalize">
              {user?.role}
            </span>
            {user?.hostel_name && (
              <span className="text-xs text-on-surface-variant truncate">{user.hostel_name}</span>
            )}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto py-3">
          <nav className="space-y-5 px-3">
            {navItems.map((group) => (
              <div key={group.group}>
                <h4 className="mb-1.5 px-2 label-md text-outline">
                  {group.group}
                </h4>
                <ul className="space-y-0.5">
                  {group.items.map((item) => {
                    const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(`${item.href}/`));
                    return (
                      <li key={item.href}>
                        <Link
                          href={item.href}
                          onClick={() => setIsOpen(false)}
                          className={`flex items-center gap-2.5 rounded-[var(--radius)] px-2.5 py-[7px] text-sm font-medium transition-all duration-150 ${isActive
                              ? "bg-primary-container/12 text-primary-container border-l-[3px] border-primary-container -ml-px"
                              : "text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface"
                            }`}
                        >
                          <item.icon className={`h-4 w-4 shrink-0 ${isActive ? 'text-primary-container' : ''}`} />
                          {item.title}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </nav>
        </div>

        {/* Sign Out */}
        <div className="p-3 border-t border-outline-variant">
          <button
            className="w-full flex items-center gap-2 px-2.5 py-2 text-sm font-ui text-on-surface-variant hover:text-on-surface rounded-[var(--radius)] hover:bg-surface-container-high transition-colors"
            onClick={() => { logout(); router.push("/login"); }}
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </button>
        </div>
      </div>

      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-inverse-surface/40 backdrop-blur-sm md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}
