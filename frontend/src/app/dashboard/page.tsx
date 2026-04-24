"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";
import { fetchApi } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import {
  Building2,
  Users,
  Wrench,
  Bed,
  CreditCard,
  Clock,
  CheckCircle2,
  AlertTriangle,
  DoorOpen,
} from "lucide-react";

/* eslint-disable @typescript-eslint/no-explicit-any */

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    fetchApi("/dashboard/stats")
      .then((data) => setStats(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-muted-foreground">Loading dashboard...</div>
      </div>
    );
  }

  const role = user?.role;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">
          {role === "admin"
            ? "System Dashboard"
            : role === "warden"
              ? "Hostel Dashboard"
              : role === "student"
                ? "My Dashboard"
                : "My Tasks"}
        </h2>
        <p className="text-muted-foreground mt-1">
          Welcome back, {user?.name}.
          {role === "warden" && user?.hostel_name && ` Managing ${user.hostel_name}.`}
          {role === "technician" && user?.specializations && ` Specializations: ${user.specializations}.`}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {role === "admin" && stats && (
          <>
            <StatCard title="Total Hostels" value={stats.total_hostels} icon={Building2} href="/dashboard/hostels" />
            <StatCard title="Active Students" value={stats.total_students} icon={Users} href="/dashboard/students" />
            <StatCard title="Rooms / Beds" value={`${stats.total_rooms} / ${stats.total_beds}`} icon={DoorOpen} href="/dashboard/rooms" />
            <StatCard title="Open Complaints" value={stats.open_complaints} icon={Wrench} warning href="/dashboard/complaints" />
            <StatCard title="Occupied Beds" value={`${stats.occupied_beds} / ${stats.total_beds}`} icon={Bed} href="/dashboard/beds" />
            <StatCard title="Pending Fees" value={stats.pending_fees} icon={CreditCard} warning href="/dashboard/fees" />
            <StatCard title="Technicians" value={stats.total_technicians} icon={Users} href="/dashboard/technicians" />
            <StatCard title="Total Outstanding" value={`Rs. ${Number(stats.total_outstanding).toLocaleString()}`} icon={AlertTriangle} warning />
          </>
        )}

        {role === "warden" && stats && (
          <>
            <StatCard title="Rooms" value={stats.total_rooms} icon={DoorOpen} href="/dashboard/rooms" />
            <StatCard title="Beds (Occupied/Total)" value={`${stats.occupied_beds} / ${stats.total_beds}`} icon={Bed} />
            <StatCard title="Students" value={stats.total_students} icon={Users} href="/dashboard/students" />
            <StatCard title="Open Complaints" value={stats.open_complaints} icon={Wrench} warning href="/dashboard/complaints" />
            <StatCard title="Fee Defaulters" value={stats.fee_defaulters} icon={CreditCard} warning href="/dashboard/defaulters" />
          </>
        )}

        {role === "student" && stats && (
          <>
            <StatCard
              title="My Room"
              value={stats.allocation ? `${stats.allocation.hostel_name} - ${stats.allocation.room_number}/${stats.allocation.bed_number}` : "Not Allocated"}
              icon={Bed}
            />
            <StatCard title="Pending Fees" value={stats.fees?.pending_count || 0} icon={CreditCard} warning href="/dashboard/fees" />
            <StatCard title="Open Complaints" value={stats.complaints?.open_count || 0} icon={Wrench} href="/dashboard/complaints" />
            <StatCard
              title="Mess"
              value={stats.mess ? stats.mess.mess_name : "Not Subscribed"}
              icon={Building2}
              href="/dashboard/mess"
            />
            {stats.fees?.overdue_count > 0 && (
              <StatCard title="Overdue Fees" value={stats.fees.overdue_count} icon={AlertTriangle} warning />
            )}
            {stats.fees && (
              <StatCard
                title="Fee Balance"
                value={`Rs. ${Number(stats.fees.total_balance || 0).toLocaleString()}`}
                icon={CreditCard}
                warning={Number(stats.fees.total_balance) > 0}
              />
            )}
          </>
        )}

        {role === "technician" && stats && (
          <>
            <StatCard title="Total Assigned" value={stats.total_assigned} icon={Wrench} href="/dashboard/complaints" />
            <StatCard title="Pending" value={stats.pending} icon={Clock} warning href="/dashboard/complaints" />
            <StatCard title="Resolved" value={stats.resolved} icon={CheckCircle2} success />
            <StatCard title="Avg Resolution (Days)" value={stats.avg_days_to_resolve || "N/A"} icon={Clock} />
          </>
        )}
      </div>

      {/* Quick actions */}
      {role === "student" && (
        <Card>
          <CardHeader><CardTitle>Quick Actions</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <QuickAction href="/dashboard/complaints" icon={Wrench} title="Raise Complaint" />
            <QuickAction href="/dashboard/fees" icon={CreditCard} title="View Fees" />
            <QuickAction href="/dashboard/mess" icon={Building2} title="Mess Info" />
            <QuickAction href="/dashboard/visitors" icon={Users} title="My Visitors" />
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function StatCard({ title, value, icon: Icon, href, warning = false, success = false }: {
  title: string; value: string | number; icon: any; href?: string; warning?: boolean; success?: boolean;
}) {
  const content = (
    <Card className={`transition-all hover:shadow-md ${warning ? "border-orange-200 dark:border-orange-800" : success ? "border-green-200 dark:border-green-800" : ""}`}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <div className={`h-8 w-8 rounded-full flex items-center justify-center ${warning ? "bg-orange-100 dark:bg-orange-900/30 text-orange-600" :
          success ? "bg-green-100 dark:bg-green-900/30 text-green-600" :
            "bg-primary/10 text-primary"
          }`}>
          <Icon className="h-4 w-4" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
      </CardContent>
    </Card>
  );

  return href ? <Link href={href} className="block">{content}</Link> : content;
}

function QuickAction({ href, icon: Icon, title }: { href: string; icon: any; title: string }) {
  return (
    <Link href={href}>
      <div className="flex flex-col items-center justify-center p-4 rounded-xl border border-border hover:bg-muted transition-colors cursor-pointer text-center">
        <Icon className="h-6 w-6 mb-2 text-primary" />
        <span className="text-sm font-medium">{title}</span>
      </div>
    </Link>
  );
}
