"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { fetchApi, getUserRole } from "@/lib/auth-utils";
import Link from "next/link";
import { StatusBadge, MaintenanceStatusBadge } from "@/components/ui/status-badge";
import { TableSkeleton } from "@/components/ui/loading-state";
import { NoDataFound } from "@/components/ui/empty-state";

interface Schedule {
  schedule_id: string;
  scheduled_date: string;
  area_type?: string;
  status: "Scheduled" | "In Progress" | "Completed" | "Cancelled";
  notes?: string;
  hostel_id?: string;
  technician?: { name: string };
  hostel?: { hostel_name: string };
}

interface Complaint {
  complaint_id: string;
  student_id?: string;
  complaint_type?: string;
  priority?: string;
  status: string;
  student?: { first_name: string; last_name: string };
  room?: { room_number: string };
}

export default function MaintenancePage() {
  const userRole = getUserRole();
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const [schedulesData, complaintsData] = await Promise.all([
          fetchApi<Schedule[]>('/maintenance'),
          fetchApi<Complaint[]>('/complaints'),
        ]);
        setSchedules(schedulesData || []);
        setComplaints(complaintsData || []);
      } catch (err) {
        console.error('Error loading maintenance data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Maintenance Schedule</h1>
          <p className="text-muted-foreground mt-1">
            Track scheduled maintenance and complaints across hostels
          </p>
        </div>
        {userRole === 'technician' && (
          <Button onClick={() => alert('Technician task claiming will be implemented in next iteration')}>
            Claim Next Task
          </Button>
        )}
      </div>

      {/* Maintenance Schedules */}
      <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Maintenance Schedules</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <TableSkeleton rows={4} cols={6} />
            ) : schedules.length === 0 ? (
              <NoDataFound entity="maintenance schedules" />
            ) : (
              <table className="w-full">
                <thead className="border-b border-border bg-muted/50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase text-muted-foreground">Date</th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase text-muted-foreground">Area Type</th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase text-muted-foreground">Technician</th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase text-muted-foreground">Hostel</th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase text-muted-foreground">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase text-muted-foreground">Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {schedules.map((schedule) => (
                    <tr key={schedule.schedule_id} className="border-b border-border">
                      <td className="px-4 py-3 text-sm">{new Date(schedule.scheduled_date).toLocaleDateString()}</td>
                      <td className="px-4 py-3 text-sm capitalize">{schedule.area_type || '-'}</td>
                      <td className="px-4 py-3 text-sm">{schedule.technician?.name || 'Unassigned'}</td>
                      <td className="px-4 py-3 text-sm">
                        <Link href={`/dashboard/students/${schedule.hostel_id}`}>
                          {schedule.hostel?.hostel_name || '-'}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <MaintenanceStatusBadge status={schedule.status} />
                      </td>
                      <td className="px-4 py-3 text-sm line-clamp-2">{schedule.notes || '-'}</td>
                      <td className="px-4 py-3 text-sm">
                        <Button variant="ghost" size="sm">
                          Edit
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </CardContent>
        </Card>

        {/* Complaints for Technicians */}
        {userRole === 'technician' && (
          <Card>
            <CardHeader>
              <CardTitle>Assigned Complaints</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <TableSkeleton rows={4} cols={5} />
              ) : complaints.length === 0 ? (
                <NoDataFound entity="complaints" />
              ) : (
                <table className="w-full">
                  <thead className="border-b border-border bg-muted/50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase text-muted-foreground">ID</th>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase text-muted-foreground">Student</th>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase text-muted-foreground">Room</th>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase text-muted-foreground">Type</th>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase text-muted-foreground">Priority</th>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase text-muted-foreground">Status</th>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase text-muted-foreground">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {complaints.filter((c) => c.status !== 'Resolved').map((complaint) => (
                      <tr key={complaint.complaint_id} className="border-b border-border">
                        <td className="px-4 py-3 text-sm text-xs">{complaint.complaint_id.substring(0, 8)}...</td>
                        <td className="px-4 py-3 text-sm">{complaint.student?.first_name || ''} {complaint.student?.last_name || ''}</td>
                        <td className="px-4 py-3 text-sm">
                          <Link href={`/dashboard/students/${complaint.student_id}`}>
                            {complaint.room?.room_number || '-'}
                          </Link>
                        </td>
                        <td className="px-4 py-3 text-sm capitalize">{complaint.complaint_type || 'General'}</td>
                        <td className="px-4 py-3 text-sm">
                          <StatusBadge status={complaint.priority === 'High' ? 'error' : complaint.priority === 'Medium' ? 'warning' : 'success'} />
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <StatusBadge status={complaint.status === 'Open' ? 'open' : complaint.status === 'In Progress' ? 'in-progress' : 'info'} />
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <Button
                            variant="outline"
                            size="sm"
                          >
                            Claim
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
