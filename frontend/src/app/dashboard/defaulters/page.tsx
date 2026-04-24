"use client";

import { useEffect, useState } from "react";
import { fetchApi } from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";

/* eslint-disable @typescript-eslint/no-explicit-any */

export default function DefaultersPage() {
    const [defaulters, setDefaulters] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchApi("/dashboard/fee-defaulters")
            .then((data: any) => setDefaulters(data))
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <div className="text-muted-foreground py-10 text-center">Loading...</div>;

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Fee Defaulters</h2>
                <p className="text-muted-foreground mt-1">{defaulters.length} students with outstanding fees</p>
            </div>
            <Card>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-muted/50">
                                <tr>
                                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Reg No</th>
                                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Name</th>
                                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Phone</th>
                                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Room</th>
                                    <th className="px-4 py-3 text-right font-medium text-muted-foreground">Outstanding</th>
                                    <th className="px-4 py-3 text-right font-medium text-muted-foreground">Overdue Count</th>
                                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Latest Due</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {defaulters.length === 0 ? (
                                    <tr><td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">No defaulters</td></tr>
                                ) : defaulters.map((d, i) => (
                                    <tr key={i} className="hover:bg-muted/30">
                                        <td className="px-4 py-3 font-mono text-xs">{d.reg_no}</td>
                                        <td className="px-4 py-3 font-medium">{d.name}</td>
                                        <td className="px-4 py-3 text-muted-foreground">{d.phone_primary}</td>
                                        <td className="px-4 py-3">{d.room_number}/{d.bed_number}</td>
                                        <td className="px-4 py-3 text-right font-medium text-red-600">Rs. {Number(d.total_outstanding).toLocaleString()}</td>
                                        <td className="px-4 py-3 text-right text-orange-600">{d.overdue_count}</td>
                                        <td className="px-4 py-3 text-muted-foreground">{d.latest_due_date?.split("T")[0]}</td>
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
