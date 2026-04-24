"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/lib/auth";
import {
  Building2,
  LogOut,
  Menu,
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
      <div className="md:hidden p-4 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2 font-semibold">
          <Building2 className="h-5 w-5 text-primary" />
          <span>DormFlow</span>
        </div>
        <button onClick={() => setIsOpen(!isOpen)} className="p-2 rounded-md hover:bg-muted">
          <Menu className="h-5 w-5" />
        </button>
      </div>

      <div className={`fixed inset-y-0 left-0 z-50 w-64 transform flex-col bg-card border-r border-border transition-transform md:relative md:flex md:translate-x-0 ${isOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="flex h-16 items-center border-b border-border px-6 mt-16 md:mt-0 font-bold tracking-tight text-xl text-primary">
          <Building2 className="mr-2 h-6 w-6" />
          DormFlow
        </div>

        <div className="flex-1 overflow-y-auto py-4">
          {/* User Info */}
          <div className="px-4 mb-4 space-y-1">
            <p className="text-sm font-medium text-foreground truncate">{user?.name || "User"}</p>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary capitalize">
              {user?.role}
            </span>
            {user?.hostel_name && (
              <p className="text-xs text-muted-foreground">{user.hostel_name}</p>
            )}
          </div>

          {/* Navigation */}
          <nav className="space-y-6 px-4">
            {navItems.map((group) => (
              <div key={group.group}>
                <h4 className="mb-2 px-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {group.group}
                </h4>
                <ul className="space-y-1">
                  {group.items.map((item) => {
                    const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(`${item.href}/`));
                    return (
                      <li key={item.href}>
                        <Link
                          href={item.href}
                          onClick={() => setIsOpen(false)}
                          className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors ${isActive
                              ? "bg-primary/10 text-primary"
                              : "text-muted-foreground hover:bg-muted"
                            }`}
                        >
                          <item.icon className="h-4 w-4" />
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

        <div className="p-4 border-t border-border mt-auto">
          <button
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:text-foreground rounded-md hover:bg-muted transition-colors"
            onClick={() => { logout(); router.push("/login"); }}
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </button>
        </div>
      </div>

      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}
