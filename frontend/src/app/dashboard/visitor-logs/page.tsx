"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { fetchApi } from "@/lib/api";
import { Users } from "lucide-react";
import { TableSkeleton } from "@/components/ui/loading-state";
import { NoDataFound } from "@/components/ui/empty-state";

interface VisitorLog {
  visitor_id: string;
  visitor_name?: string;
  relation_to_student?: string;
  entry_time: string;
  exit_time?: string;
  visit_duration_minutes?: number;
  purpose?: string;
  gate_number?: string;
  approved_by?: string;
  student?: {
    first_name: string;
    last_name: string;
  };
}

export default function VisitorLogsPage() {
  const [visitors, setVisitors] = useState<VisitorLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadVisitors() {
      setLoading(true);
      try {
        const data = await fetchApi<VisitorLog[]>('/visitor-logs');
        setVisitors(data || []);
      } catch (err) {
        console.error('Error loading visitor logs:', err);
      } finally {
        setLoading(false);
      }
    }
    loadVisitors();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Visitor Logs</h1>
          <p className="text-muted-foreground mt-1">
            Track visitor entries and exits across all hostels
          </p>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <TableSkeleton rows={3} cols={4} />
          ) : visitors.length === 0 ? (
            <NoDataFound entity="visitor logs" />
          ) : (
            <table className="w-full">
              <thead className="border-b border-border bg-muted/50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-muted-foreground">Visitor</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-muted-foreground">Student</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-muted-foreground">Relation</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-muted-foreground">Visit Date</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-muted-foreground">Entry Time</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-muted-foreground">Exit Time</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-muted-foreground">Duration</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-muted-foreground">Purpose</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-muted-foreground">Gate</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-muted-foreground">Approved By</th>
                </tr>
              </thead>
              <tbody>
                {visitors.map((visitor) => (
                  <tr key={visitor.visitor_id} className="border-b border-border">
                    <td className="px-4 py-3 text-sm">{visitor.visitor_name || '-'}</td>
                    <td className="px-4 py-3 text-sm">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">{visitor.student?.first_name || ''} {visitor.student?.last_name || '-'}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm">{visitor.relation_to_student || '-'}</td>
                    <td className="px-4 py-3 text-sm">{new Date(visitor.entry_time).toLocaleDateString()}</td>
                    <td className="px-4 py-3 text-sm">
                      {visitor.entry_time ? formatTime(visitor.entry_time) : '-'}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {visitor.exit_time ? formatTime(visitor.exit_time) : (
                        <span className="text-muted-foreground">Still visiting</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {visitor.visit_duration_minutes ? `${visitor.visit_duration_minutes} min` : '-'}
                    </td>
                    <td className="px-4 py-3 text-sm">{visitor.purpose || '-'}</td>
                    <td className="px-4 py-3 text-sm">{visitor.gate_number || '-'}</td>
                    <td className="px-4 py-3 text-sm">{visitor.approved_by || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function formatTime(timeStr: string): string {
  if (!timeStr) return '-';
  const time = new Date(timeStr);
  return time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}
