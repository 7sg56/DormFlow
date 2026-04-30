"use client";
import { useEffect, useState } from "react";
import { fetchApi } from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
/* eslint-disable @typescript-eslint/no-explicit-any */

export default function AllocationsPage() {
    const [allocs, setAllocs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        fetchApi("/allocations").then((d: any) => setAllocs(d)).catch(console.error).finally(() => setLoading(false));
    }, []);

    if (loading) return (
        <div className="flex items-center justify-center py-16">
            <div className="flex flex-col items-center gap-3">
                <div className="h-6 w-6 animate-spin rounded-full border-[3px] border-primary border-t-transparent" />
                <span className="text-sm font-ui text-on-surface-variant">Loading allocations...</span>
            </div>
        </div>
    );

    return (
        <div className="space-y-5 animate-fade-in">
            <div>
                <h1 className="font-headline text-2xl font-bold tracking-tight text-on-surface">Allocations</h1>
                <p className="text-sm text-on-surface-variant mt-0.5">{allocs.length} allocation records</p>
            </div>
            <Card className="overflow-hidden">
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-surface-container border-b border-outline-variant sticky top-0 z-10">
                                <tr>
                                    <th className="px-4 py-2.5 text-left label-md text-on-surface-variant">Student</th>
                                    <th className="px-4 py-2.5 text-left label-md text-on-surface-variant">Hostel</th>
                                    <th className="px-4 py-2.5 text-left label-md text-on-surface-variant">Room</th>
                                    <th className="px-4 py-2.5 text-left label-md text-on-surface-variant">Bed</th>
                                    <th className="px-4 py-2.5 text-left label-md text-on-surface-variant">Start Date</th>
                                    <th className="px-4 py-2.5 text-left label-md text-on-surface-variant">Status</th>
                                    <th className="px-4 py-2.5 text-left label-md text-on-surface-variant">Approved By</th>
                                </tr>
                            </thead>
                            <tbody>
                                {allocs.map((a, i) => (
                                    <tr key={a.allocation_id} className={`border-b border-outline-variant/50 hover:bg-surface-container-high/40 transition-colors ${i % 2 === 1 ? 'bg-surface-container-lowest' : 'bg-background'}`}>
                                        <td className="px-4 py-2 data-tabular font-semibold text-on-surface">{a.student_name || a.student_id}</td>
                                        <td className="px-4 py-2 data-tabular text-on-surface">{a.hostel_name || "-"}</td>
                                        <td className="px-4 py-2 data-tabular text-on-surface">{a.room_number || "-"}</td>
                                        <td className="px-4 py-2 data-tabular text-on-surface">{a.bed_number || "-"}</td>
                                        <td className="px-4 py-2 data-tabular text-on-surface-variant">{a.start_date?.split("T")[0]}</td>
                                        <td className="px-4 py-2">
                                            <StatusBadge
                                                status={a.status === "Active" ? "active" : "inactive"}
                                                text={a.status}
                                            />
                                        </td>
                                        <td className="px-4 py-2 data-tabular text-on-surface-variant">{a.approved_by}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
