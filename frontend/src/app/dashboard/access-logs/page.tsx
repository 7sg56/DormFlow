"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { fetchApi } from "@/lib/api";
import { getUserRole } from "@/lib/auth-utils";
import { StatusBadge } from "@/components/ui/status-badge";
import { TableSkeleton } from "@/components/ui/loading-state";
import { NoDataFound } from "@/components/ui/empty-state";

interface AccessLog {
  log_id: string;
  student_id: string;
  entry_time: string;
  exit_time?: string;
  duration_minutes?: number;
  gate_number?: string;
  purpose?: string;
  is_late_entry?: boolean;
  student?: {
    first_name: string;
    last_name: string;
  };
}

export default function AccessLogsPage() {
  const userRole = getUserRole();
  const [logs, setLogs] = useState<AccessLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'today' | 'week' | 'month'>('today');
  const [dateRange, setDateRange] = useState<{ start: string; end: string }>({ start: '', end: '' });

  useEffect(() => {
    async function loadLogs() {
      setLoading(true);
      try {
        const data = await fetchApi<AccessLog[]>('/access-logs');
        setLogs(data || []);
      } catch (err) {
        console.error('Error loading access logs:', err);
      } finally {
        setLoading(false);
      }
    }
    loadLogs();
  }, []);

  useEffect(() => {
    function updateDateRange() {
      const now = new Date();
      let start = '';
      let end = '';

      switch (filter) {
        case 'today':
          start = new Date(now).toISOString().split('T')[0];
          end = new Date(now.setHours(23, 59, 59, 999)).toISOString();
          break;
        case 'week': {
          const weekAgo = new Date(now);
          weekAgo.setDate(weekAgo.getDate() - 7);
          start = weekAgo.toISOString().split('T')[0];
          end = now.toISOString().split('T')[0];
          break;
        }
        case 'month': {
          const monthAgo = new Date(now);
          monthAgo.setDate(monthAgo.getDate() - 30);
          start = monthAgo.toISOString().split('T')[0];
          end = now.toISOString().split('T')[0];
          break;
        }
      }
      setDateRange({ start, end });
    }
    updateDateRange();
  }, [filter]);

  const filteredLogs = logs.filter((log) => {
    if (userRole === 'student') {
      if (log.student_id !== localStorage.getItem('dormflow_user_id')) return false;
    }
    if (filter === 'today') {
      const logDate = new Date(log.entry_time).toISOString().split('T')[0];
      return logDate >= dateRange.start && logDate <= dateRange.end;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Access Logs</h1>
          <p className="text-muted-foreground mt-1">
            Entry and exit logs for security and attendance tracking
          </p>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pb-4">
          <div className="flex flex-wrap gap-2">
            {(['all', 'today', 'week', 'month'] as const).map((f) => (
              <Button
                key={f}
                variant={filter === f ? 'default' : 'outline'}
                onClick={() => setFilter(f)}
                className="capitalize"
              >
                {f === 'all' ? 'All' : f}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Logs Table */}
      {loading ? (
        <TableSkeleton rows={5} cols={6} />
      ) : filteredLogs.length === 0 ? (
        <NoDataFound entity="access logs" />
      ) : (
        <Card>
          <CardContent className="p-0">
            <table className="w-full">
              <thead className="border-b border-border bg-muted/50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-muted-foreground">Student</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-muted-foreground">Entry Time</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-muted-foreground">Exit Time</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-muted-foreground">Duration</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-muted-foreground">Gate</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-muted-foreground">Purpose</th>
                </tr>
              </thead>
              <tbody>
                {filteredLogs.map((log) => (
                  <tr key={log.log_id} className="border-b border-border">
                    <td className="px-4 py-3 text-sm">{log.student?.first_name || '-'} {log.student?.last_name || ''}</td>
                    <td className="px-4 py-3 text-sm">
                      {new Date(log.entry_time).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {log.exit_time ? (
                        <>
                          {new Date(log.exit_time).toLocaleString()}
                        </>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {log.duration_minutes ? `${log.duration_minutes} min` : '-'}
                    </td>
                    <td className="px-4 py-3 text-sm">{log.gate_number || '-'}</td>
                    <td className="px-4 py-3 text-sm line-clamp-1">{log.purpose || '-'}</td>
                    <td className="px-4 py-3 text-sm">
                      <StatusBadge status={log.is_late_entry ? 'warning' : 'success'} />
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
