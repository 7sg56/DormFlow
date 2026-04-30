"use client";

import { useEffect, useState } from "react";
import { fetchApi } from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";

/* eslint-disable @typescript-eslint/no-explicit-any */

export default function VisitorsPage() {
    const [visitors, setVisitors] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchApi("/dashboard/visitor-logs")
            .then((data: any) => setVisitors(data))
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    if (loading) return (
        <div className="flex items-center justify-center py-16">
            <div className="flex flex-col items-center gap-3">
                <div className="h-6 w-6 animate-spin rounded-full border-[3px] border-primary border-t-transparent" />
                <span className="text-sm font-ui text-on-surface-variant">Loading visitors...</span>
            </div>
        </div>
    );

    return (
        <div className="space-y-5 animate-fade-in">
            <div>
                <h1 className="font-headline text-2xl font-bold tracking-tight text-on-surface">Visitor Logs</h1>
                <p className="text-sm text-on-surface-variant mt-0.5">{visitors.length} visitor records</p>
            </div>
            <Card className="overflow-hidden">
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-surface-container border-b border-outline-variant sticky top-0 z-10">
                                <tr>
                                    <th className="px-4 py-2.5 text-left label-md text-on-surface-variant">Visitor</th>
                                    <th className="px-4 py-2.5 text-left label-md text-on-surface-variant">Student</th>
                                    <th className="px-4 py-2.5 text-left label-md text-on-surface-variant">Relation</th>
                                    <th className="px-4 py-2.5 text-left label-md text-on-surface-variant">Purpose</th>
                                    <th className="px-4 py-2.5 text-left label-md text-on-surface-variant">Entry</th>
                                    <th className="px-4 py-2.5 text-left label-md text-on-surface-variant">Exit</th>
                                    <th className="px-4 py-2.5 text-left label-md text-on-surface-variant">Guard</th>
                                </tr>
                            </thead>
                            <tbody>
                                {visitors.length === 0 ? (
                                    <tr><td colSpan={7} className="px-4 py-12 text-center text-on-surface-variant text-sm">No visitor records</td></tr>
                                ) : visitors.map((v, i) => (
                                    <tr key={v.visitor_id} className={`border-b border-outline-variant/50 hover:bg-surface-container-high/40 transition-colors ${i % 2 === 1 ? 'bg-surface-container-lowest' : 'bg-background'}`}>
                                        <td className="px-4 py-2 data-tabular font-semibold text-on-surface">{v.visitor_name}</td>
                                        <td className="px-4 py-2 data-tabular text-on-surface">{v.student_name}</td>
                                        <td className="px-4 py-2 data-tabular text-on-surface">{v.relation_to_student}</td>
                                        <td className="px-4 py-2 data-tabular text-on-surface">{v.purpose}</td>
                                        <td className="px-4 py-2 data-tabular text-on-surface-variant">{new Date(v.entry_time).toLocaleString()}</td>
                                        <td className="px-4 py-2 data-tabular text-on-surface-variant">{v.exit_time ? new Date(v.exit_time).toLocaleString() : "Still in"}</td>
                                        <td className="px-4 py-2 data-tabular text-on-surface-variant">{v.guard_name}</td>
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
