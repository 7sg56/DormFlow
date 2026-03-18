"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { fetchApi } from "@/lib/api";
import { StatusBadge } from "@/components/ui/status-badge";
import { TableSkeleton } from "@/components/ui/loading-state";
import { NoDataFound } from "@/components/ui/empty-state";

interface PharmacyVisit {
  visit_id: string;
  visit_date: string;
  prescription_details?: string;
  medicines_issued?: string;
  total_cost?: number | string;
  payment_status?: string;
  pharmacy?: { pharmacy_name: string };
}

export default function PharmacyVisitsPage() {
  const [visits, setVisits] = useState<PharmacyVisit[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadVisits() {
      setLoading(true);
      try {
        const data = await fetchApi<PharmacyVisit[]>('/pharmacy-visits');
        setVisits(data || []);
      } catch (err) {
        console.error('Error loading pharmacy visits:', err);
      } finally {
        setLoading(false);
      }
    }
    loadVisits();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Pharmacy Visits</h1>
          <p className="text-muted-foreground mt-1">
            View your pharmacy visit history and medications
          </p>
        </div>
      </div>

      {loading ? (
        <TableSkeleton rows={3} cols={4} />
      ) : visits.length === 0 ? (
        <NoDataFound entity="pharmacy visits" />
      ) : (
        <Card>
          <CardContent className="p-0">
            <table className="w-full">
              <thead className="border-b border-border bg-muted/50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-muted-foreground">Date</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-muted-foreground">Pharmacy</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-muted-foreground">Medications</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-muted-foreground">Cost</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-muted-foreground">Status</th>
                </tr>
              </thead>
              <tbody>
                {visits.map((visit) => (
                  <tr key={visit.visit_id} className="border-b border-border">
                    <td className="px-4 py-3 text-sm">{new Date(visit.visit_date).toLocaleDateString()}</td>
                    <td className="px-4 py-3 text-sm">{visit.pharmacy?.pharmacy_name || '-'}</td>
                    <td className="px-4 py-3 text-sm line-clamp-2">{visit.prescription_details || '-'}</td>
                    <td className="px-4 py-3 text-sm text-right">${visit.total_cost || '0'}</td>
                    <td className="px-4 py-3 text-sm">
                      <StatusBadge status={visit.payment_status === 'Paid' ? 'success' : 'pending'} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
