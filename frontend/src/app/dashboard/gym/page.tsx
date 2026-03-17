"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { fetchApi, getUserRole } from "@/lib/auth-utils";
import { MapPin, User, Plus } from "lucide-react";
import Link from "next/link";
import { StatusBadge } from "@/components/ui/status-badge";
import { TableSkeleton } from "@/components/ui/loading-state";
import { NoDataFound } from "@/components/ui/empty-state";

interface Gym {
  gym_id: string;
  gym_name: string;
  is_operational: boolean;
  location?: string;
  trainer_name?: string;
  timing_open?: string;
  timing_close?: string;
  capacity?: number;
  equipment_summary?: string;
  monthly_fee?: number | string;
}

interface Membership {
  membership_id: string;
  start_date: string;
  end_date?: string;
  status?: string;
  fee_paid?: number | string;
  gym?: { gym_name: string };
}

export default function GymPage() {
  const userRole = getUserRole();
  const [gyms, setGyms] = useState<Gym[]>([]);
  const [memberships, setMemberships] = useState<Membership[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const [gymsData, membershipsData] = await Promise.all([
          fetchApi<Gym[]>('/gyms'),
          fetchApi<Membership[]>('/gym-memberships'),
        ]);
        setGyms(gymsData || []);
        setMemberships(membershipsData || []);
      } catch (err) {
        console.error('Error loading gym data:', err);
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
          <h1 className="text-3xl font-bold tracking-tight">Gym & Fitness Centers</h1>
          <p className="text-muted-foreground mt-1">
            Browse available gyms and manage your memberships
          </p>
        </div>
        {userRole === 'student' && (
          <Link href="/dashboard/gym/membership">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Membership
            </Button>
          </Link>
        )}
      </div>

      {loading ? (
        <TableSkeleton rows={5} cols={4} />
      ) : gyms.length === 0 ? (
        <NoDataFound entity="gyms" />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {gyms.map((gym) => (
            <Card key={gym.gym_id} className="overflow-hidden">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg">{gym.gym_name}</CardTitle>
                  <StatusBadge status={gym.is_operational ? 'active' : 'inactive'} />
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">{gym.location || 'Location not specified'}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">{gym.trainer_name || 'Staff not assigned'}</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <p className="text-muted-foreground">Opens</p>
                    <p className="font-medium">{gym.timing_open || 'N/A'} - {gym.timing_close || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Capacity</p>
                    <p className="font-medium">{gym.capacity || 'N/A'} people</p>
                  </div>
                </div>
                <div className="text-sm">
                  <p className="text-muted-foreground">Equipment:</p>
                  <p className="line-clamp-2">{gym.equipment_summary || 'Contact for details'}</p>
                </div>
                <div className="pt-4 border-t border-border">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-lg font-bold text-primary">${gym.monthly_fee || '0'}</span>
                    <span className="text-sm text-muted-foreground">/month</span>
                  </div>
                  <Link href={`/dashboard/gym/${gym.gym_id}`}>
                    <Button variant="outline" className="w-full">View Details</Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* My Memberships Section */}
      {(userRole === 'student' || userRole === 'admin' || userRole === 'warden') && (
        <div className="mt-8">
          <h2 className="text-2xl font-bold mb-4">My Memberships</h2>
          {loading ? (
            <TableSkeleton rows={3} cols={4} />
          ) : memberships.length === 0 ? (
            <NoDataFound entity="gym memberships" />
          ) : (
            <Card>
              <CardContent className="p-0">
                <table className="w-full">
                  <thead className="border-b border-border bg-muted/50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase text-muted-foreground">Gym</th>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase text-muted-foreground">Start Date</th>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase text-muted-foreground">End Date</th>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase text-muted-foreground">Status</th>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase text-muted-foreground">Fee Paid</th>
                    </tr>
                  </thead>
                  <tbody>
                    {memberships.map((membership) => (
                      <tr key={membership.membership_id} className="border-b border-border">
                        <td className="px-4 py-3 text-sm">{membership.gym?.gym_name || '-'}</td>
                        <td className="px-4 py-3 text-sm">{new Date(membership.start_date).toLocaleDateString()}</td>
                        <td className="px-4 py-3 text-sm">{membership.end_date ? new Date(membership.end_date).toLocaleDateString() : 'Active'}</td>
                        <td className="px-4 py-3 text-sm">
                          <StatusBadge status={membership.status === 'Active' ? 'active' : 'inactive'} />
                        </td>
                        <td className="px-4 py-3 text-sm">${membership.fee_paid || '0'}</td>
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
