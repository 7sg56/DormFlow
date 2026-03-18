"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { fetchApi } from "@/lib/api";
import { PhoneCall, MapPin, Car } from "lucide-react";
import { StatusBadge } from "@/components/ui/status-badge";
import { TableSkeleton } from "@/components/ui/loading-state";
import { NoDataFound } from "@/components/ui/empty-state";

interface Ambulance {
  ambulance_id: string;
  vehicle_number: string;
  is_available: boolean;
  driver_name?: string;
  driver_phone?: string;
  hospital_name?: string;
  hospital_address?: string;
}

interface EmergencyRequest {
  request_id: string;
  request_time: string;
  emergency_type?: string;
  description?: string;
  status: string;
  ambulance?: { vehicle_number: string };
}

export default function AmbulancePage() {
  const [ambulances, setAmbulances] = useState<Ambulance[]>([]);
  const [requests, setRequests] = useState<EmergencyRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const [ambulancesData, requestsData] = await Promise.all([
          fetchApi<Ambulance[]>('/ambulances'),
          fetchApi<EmergencyRequest[]>('/emergency-requests'),
        ]);
        setAmbulances(ambulancesData || []);
        setRequests(requestsData || []);
      } catch (err) {
        console.error('Error loading ambulance data:', err);
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
          <h1 className="text-3xl font-bold tracking-tight">Ambulance Service</h1>
          <p className="text-muted-foreground mt-1">
            Emergency medical transport services for the campus
          </p>
        </div>
        <div>
          <Button className="bg-red-600 hover:bg-red-700 text-white">
            <PhoneCall className="mr-2 h-4 w-4" />
            Emergency: Call 911
          </Button>
        </div>
      </div>

      {/* Available Ambulances */}
      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-4">Available Ambulances</h2>
        {loading ? (
          <TableSkeleton rows={2} cols={4} />
        ) : ambulances.length === 0 ? (
          <NoDataFound entity="ambulances" />
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {ambulances.map((ambulance) => (
              <Card key={ambulance.ambulance_id} className="overflow-hidden">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg">{ambulance.vehicle_number}</CardTitle>
                    <StatusBadge status={ambulance.is_available ? 'active' : 'inactive'} />
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-2 text-sm">
                    <Car className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">{ambulance.driver_name || 'Driver on duty'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <PhoneCall className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">{ambulance.driver_phone || 'Call for service'}</span>
                  </div>
                  <div className="text-sm">
                    <p className="text-muted-foreground">Hospital:</p>
                    <p className="font-medium">{ambulance.hospital_name || 'Nearest Medical Center'}</p>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">{ambulance.hospital_address || 'Address on file'}</span>
                  </div>
                  <div className="pt-4 border-t border-border">
                    <Button variant="outline" className="w-full" disabled={!ambulance.is_available}>
                      Request Ambulance
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* My Emergency Requests */}
      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-4">My Emergency Requests</h2>
        {loading ? (
          <TableSkeleton rows={3} cols={5} />
        ) : requests.length === 0 ? (
          <NoDataFound entity="emergency requests" />
        ) : (
          <Card>
            <CardContent className="p-0">
              <table className="w-full">
                <thead className="border-b border-border bg-muted/50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase text-muted-foreground">Time</th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase text-muted-foreground">Type</th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase text-muted-foreground">Description</th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase text-muted-foreground">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase text-muted-foreground">Ambulance</th>
                  </tr>
                </thead>
                <tbody>
                  {requests.map((req) => (
                    <tr key={req.request_id} className="border-b border-border">
                      <td className="px-4 py-3 text-sm">{new Date(req.request_time).toLocaleString()}</td>
                      <td className="px-4 py-3 text-sm">
                        {req.emergency_type || 'General'}
                      </td>
                      <td className="px-4 py-3 text-sm line-clamp-2">{req.description || '-'}</td>
                      <td className="px-4 py-3 text-sm">
                        <StatusBadge status={
                          req.status === 'Requested' ? 'pending' :
                            req.status === 'Dispatched' ? 'in-progress' :
                              req.status === 'Hospital Reached' ? 'success' :
                                'info'
                        } />
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {req.ambulance?.vehicle_number || 'Not assigned'}
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
