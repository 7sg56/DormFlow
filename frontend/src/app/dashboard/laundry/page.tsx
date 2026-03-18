"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { fetchApi } from "@/lib/api";
import { getUserRole } from "@/lib/auth-utils";
import { Phone, Plus } from "lucide-react";
import Link from "next/link";
import { StatusBadge } from "@/components/ui/status-badge";
import { TableSkeleton } from "@/components/ui/loading-state";
import { NoDataFound } from "@/components/ui/empty-state";

interface Laundry {
  laundry_id: string;
  laundry_name: string;
  is_operational: boolean;
  vendor_phone?: string;
  timing_open?: string;
  timing_close?: string;
  operating_days?: string;
  service_types?: string;
  price_per_piece?: number;
  price_per_kg?: number;
}

interface LaundryRequest {
  request_id: string;
  pickup_date: string;
  status: string;
  payment_status?: string;
  total_charge?: number;
  laundry?: { laundry_name: string };
}

export default function LaundryPage() {
  const userRole = getUserRole();
  const [laundries, setLaundries] = useState<Laundry[]>([]);
  const [requests, setRequests] = useState<LaundryRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const [laundriesData, requestsData] = await Promise.all([
          fetchApi<Laundry[]>('/laundries'),
          fetchApi<LaundryRequest[]>('/laundry-requests'),
        ]);
        setLaundries(laundriesData || []);
        setRequests(requestsData || []);
      } catch (err) {
        console.error('Error loading laundry data:', err);
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
          <h1 className="text-3xl font-bold tracking-tight">Laundry Services</h1>
          <p className="text-muted-foreground mt-1">
            Browse available laundry services and manage your requests
          </p>
        </div>
        {userRole === 'student' && (
          <Link href="/dashboard/laundry/request">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Request
            </Button>
          </Link>
        )}
      </div>

      {/* Laundry Services */}
      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-4">Available Services</h2>
        {loading ? (
          <TableSkeleton rows={3} cols={4} />
        ) : laundries.length === 0 ? (
          <NoDataFound entity="laundry services" />
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {laundries.map((laundry) => (
              <Card key={laundry.laundry_id} className="overflow-hidden">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg">{laundry.laundry_name}</CardTitle>
                    <StatusBadge status={laundry.is_operational ? 'active' : 'inactive'} />
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">{laundry.vendor_phone || 'Contact front desk'}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <p className="text-muted-foreground">Open Hours</p>
                      <p className="font-medium">
                        {laundry.timing_open?.split('T')[0] || 'N/A'} - {laundry.timing_close?.split('T')[0] || 'N/A'}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Operating Days</p>
                      <p className="font-medium">{laundry.operating_days || 'All days'}</p>
                    </div>
                  </div>
                  <div className="text-sm">
                    <p className="text-muted-foreground">Services:</p>
                    <p className="line-clamp-2">{laundry.service_types || 'Washing, drying, ironing'}</p>
                  </div>
                  <div className="pt-4 border-t border-border">
                    <div className="flex justify-between items-center mb-2">
                      <div>
                        <p className="text-lg font-bold text-primary">${laundry.price_per_piece || '0'}</p>
                        <span className="text-sm text-muted-foreground">/piece</span>
                      </div>
                      <div>
                        <p className="text-lg font-bold text-primary">${laundry.price_per_kg || '0'}</p>
                        <span className="text-sm text-muted-foreground">/kg</span>
                      </div>
                    </div>
                  </div>
                  <Link href={`/dashboard/laundry/${laundry.laundry_id}`}>
                    <Button variant="outline" className="w-full">View Details</Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* My Laundry Requests */}
      {(userRole === 'student' || userRole === 'admin' || userRole === 'warden') && (
        <div className="mt-8">
          <h2 className="text-2xl font-bold mb-4">My Laundry Requests</h2>
          {loading ? (
            <TableSkeleton rows={3} cols={5} />
          ) : requests.length === 0 ? (
            <NoDataFound entity="laundry requests" />
          ) : (
            <Card>
              <CardContent className="p-0">
                <table className="w-full">
                  <thead className="border-b border-border bg-muted/50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase text-muted-foreground">Service</th>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase text-muted-foreground">Pickup Date</th>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase text-muted-foreground">Status</th>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase text-muted-foreground">Payment</th>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase text-muted-foreground">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {requests.map((req) => (
                      <tr key={req.request_id} className="border-b border-border">
                        <td className="px-4 py-3 text-sm">{req.laundry?.laundry_name || '-'}</td>
                        <td className="px-4 py-3 text-sm">{new Date(req.pickup_date).toLocaleDateString()}</td>
                        <td className="px-4 py-3 text-sm">
                          <StatusBadge status={req.status === 'Pending' ? 'pending' : req.status === 'Completed' ? 'success' : 'info'} />
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <StatusBadge status={req.payment_status === 'Paid' ? 'success' : 'pending'} />
                        </td>
                        <td className="px-4 py-3 text-sm text-right">${req.total_charge || '0'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
