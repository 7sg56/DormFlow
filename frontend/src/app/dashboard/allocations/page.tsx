"use client";
import { useEffect, useState } from "react";
import { fetchApi } from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
/* eslint-disable @typescript-eslint/no-explicit-any */

export default function AllocationsPage() {
    const [allocs, setAllocs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        fetchApi("/allocations").then((d: any) => setAllocs(d)).catch(console.error).finally(() => setLoading(false));
    }, []);
    if (loading) return <div className="text-muted-foreground py-10 text-center">Loading...</div>;
    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold tracking-tight">Allocations</h2>
            <p className="text-muted-foreground">{allocs.length} allocation records</p>
            <Card><CardContent className="p-0"><div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead className="bg-muted/50"><tr>
                        <th className="px-4 py-3 text-left font-medium text-muted-foreground">Student</th>
                        <th className="px-4 py-3 text-left font-medium text-muted-foreground">Hostel</th>
                        <th className="px-4 py-3 text-left font-medium text-muted-foreground">Room</th>
                        <th className="px-4 py-3 text-left font-medium text-muted-foreground">Bed</th>
                        <th className="px-4 py-3 text-left font-medium text-muted-foreground">Start Date</th>
                        <th className="px-4 py-3 text-left font-medium text-muted-foreground">Status</th>
                        <th className="px-4 py-3 text-left font-medium text-muted-foreground">Approved By</th>
                    </tr></thead>
                    <tbody className="divide-y divide-border">
                        {allocs.map((a) => (
                            <tr key={a.allocation_id} className="hover:bg-muted/30">
                                <td className="px-4 py-3 font-medium">{a.student_name || a.student_id}</td>
                                <td className="px-4 py-3">{a.hostel_name || "-"}</td>
                                <td className="px-4 py-3">{a.room_number || "-"}</td>
                                <td className="px-4 py-3">{a.bed_number || "-"}</td>
                                <td className="px-4 py-3 text-muted-foreground">{a.start_date?.split("T")[0]}</td>
                                <td className="px-4 py-3">
                                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${a.status === "Active" ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" : "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400"}`}>
                                        {a.status}
                                    </span>
                                </td>
                                <td className="px-4 py-3 text-muted-foreground">{a.approved_by}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div></CardContent></Card>
        </div>
    );
}
