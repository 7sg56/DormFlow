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

    if (loading) return <div className="text-muted-foreground py-10 text-center">Loading...</div>;

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Visitor Logs</h2>
                <p className="text-muted-foreground mt-1">{visitors.length} visitor records</p>
            </div>
            <Card>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-muted/50">
                                <tr>
                                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Visitor</th>
                                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Student</th>
                                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Relation</th>
                                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Purpose</th>
                                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Entry</th>
                                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Exit</th>
                                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Guard</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {visitors.length === 0 ? (
                                    <tr><td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">No visitor records</td></tr>
                                ) : visitors.map((v) => (
                                    <tr key={v.visitor_id} className="hover:bg-muted/30">
                                        <td className="px-4 py-3 font-medium">{v.visitor_name}</td>
                                        <td className="px-4 py-3">{v.student_name}</td>
                                        <td className="px-4 py-3">{v.relation_to_student}</td>
                                        <td className="px-4 py-3">{v.purpose}</td>
                                        <td className="px-4 py-3 text-muted-foreground">{new Date(v.entry_time).toLocaleString()}</td>
                                        <td className="px-4 py-3 text-muted-foreground">{v.exit_time ? new Date(v.exit_time).toLocaleString() : "Still in"}</td>
                                        <td className="px-4 py-3 text-muted-foreground">{v.guard_name}</td>
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
