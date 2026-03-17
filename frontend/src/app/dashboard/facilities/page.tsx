"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { fetchApi, getUserRole } from "@/lib/auth-utils";
import { Activity, MapPin, Plus } from "lucide-react";
import Link from "next/link";
import { StatusBadge } from "@/components/ui/status-badge";
import { TableSkeleton } from "@/components/ui/loading-state";
import { NoDataFound } from "@/components/ui/empty-state";

interface Facility {
  facility_id: string;
  facility_name: string;
  facility_type?: string;
  is_operational: boolean;
  capacity?: number;
  timing_open?: string;
  timing_close?: string;
  in_charge_name?: string;
  hostel?: { hostel_name: string };
}

interface Booking {
  booking_id: string;
  booking_date: string;
  slot_start?: string;
  slot_end?: string;
  purpose?: string;
  status: string;
  facility?: { facility_name: string };
}

export default function FacilitiesPage() {
  const userRole = getUserRole();
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const [facilitiesData, bookingsData] = await Promise.all([
          fetchApi<Facility[]>('/facilities'),
          fetchApi<Booking[]>('/facility-bookings'),
        ]);
        setFacilities(facilitiesData || []);
        setBookings(bookingsData || []);
      } catch (err) {
        console.error('Error loading facilities data:', err);
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
          <h1 className="text-3xl font-bold tracking-tight">Facilities</h1>
          <p className="text-muted-foreground mt-1">
            Browse and book available campus facilities
          </p>
        </div>
        {userRole === 'student' && (
          <Link href="/dashboard/facilities/book">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Book a Facility
            </Button>
          </Link>
        )}
      </div>

      {/* Available Facilities */}
      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-4">Available Facilities</h2>
        {loading ? (
          <TableSkeleton rows={3} cols={4} />
        ) : facilities.length === 0 ? (
          <NoDataFound entity="facilities" />
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {facilities.map((facility) => (
              <Card key={facility.facility_id} className="overflow-hidden">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg">{facility.facility_name}</CardTitle>
                    <StatusBadge status={facility.is_operational ? 'active' : 'inactive'} />
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-2 text-sm">
                    <Activity className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">{facility.facility_type || 'General'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">{facility.hostel?.hostel_name || 'Campus'}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <p className="text-muted-foreground">Capacity</p>
                      <p className="font-medium">{facility.capacity || 'N/A'} people</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Hours</p>
                      <p className="font-medium">
                        {facility.timing_open?.split('T')[0] || 'N/A'} - {facility.timing_close?.split('T')[0] || 'N/A'}
                      </p>
                    </div>
                  </div>
                  <div className="text-sm">
                    <p className="text-muted-foreground">In Charge:</p>
                    <p className="font-medium">{facility.in_charge_name || '-'}</p>
                  </div>
                  <div className="pt-4 border-t border-border">
                    <Button variant="outline" className="w-full" disabled={!facility.is_operational}>
                      View Schedule
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* My Bookings */}
      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-4">My Bookings</h2>
        {loading ? (
          <TableSkeleton rows={3} cols={4} />
        ) : bookings.length === 0 ? (
          <NoDataFound entity="bookings" />
        ) : (
          <Card>
            <CardContent className="p-0">
              <table className="w-full">
                <thead className="border-b border-border bg-muted/50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase text-muted-foreground">Facility</th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase text-muted-foreground">Date</th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase text-muted-foreground">Time</th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase text-muted-foreground">Purpose</th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase text-muted-foreground">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase text-muted-foreground">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map((booking) => (
                    <tr key={booking.booking_id} className="border-b border-border">
                      <td className="px-4 py-3 text-sm">{booking.facility?.facility_name || '-'}</td>
                      <td className="px-4 py-3 text-sm">{new Date(booking.booking_date).toLocaleDateString()}</td>
                      <td className="px-4 py-3 text-sm">
                        {booking.slot_start?.split('T')[0] || ''} - {booking.slot_end?.split('T')[0] || ''}
                      </td>
                      <td className="px-4 py-3 text-sm line-clamp-1">{booking.purpose || '-'}</td>
                      <td className="px-4 py-3 text-sm">
                        <StatusBadge status={
                          booking.status === 'Confirmed' ? 'active' :
                            booking.status === 'Cancelled' ? 'cancelled' :
                              booking.status === 'Completed' ? 'success' :
                                'info'
                        } />
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <Button variant="ghost" size="sm">
                          Cancel
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
