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

    if (loading) return (
        <div className="flex items-center justify-center py-16">
            <div className="flex flex-col items-center gap-3">
                <div className="h-6 w-6 animate-spin rounded-full border-[3px] border-primary border-t-transparent" />
                <span className="text-sm font-ui text-on-surface-variant">Loading defaulters...</span>
            </div>
        </div>
    );

    return (
        <div className="space-y-5 animate-fade-in">
            <div>
                <h1 className="font-headline text-2xl font-bold tracking-tight text-on-surface">Fee Defaulters</h1>
                <p className="text-sm text-on-surface-variant mt-0.5">{defaulters.length} students with outstanding fees</p>
            </div>
            <Card className="overflow-hidden">
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-surface-container border-b border-outline-variant sticky top-0 z-10">
                                <tr>
                                    <th className="px-4 py-2.5 text-left label-md text-on-surface-variant">Reg No</th>
                                    <th className="px-4 py-2.5 text-left label-md text-on-surface-variant">Name</th>
                                    <th className="px-4 py-2.5 text-left label-md text-on-surface-variant">Phone</th>
                                    <th className="px-4 py-2.5 text-left label-md text-on-surface-variant">Room</th>
                                    <th className="px-4 py-2.5 text-right label-md text-on-surface-variant">Outstanding</th>
                                    <th className="px-4 py-2.5 text-right label-md text-on-surface-variant">Overdue Count</th>
                                    <th className="px-4 py-2.5 text-left label-md text-on-surface-variant">Latest Due</th>
                                </tr>
                            </thead>
                            <tbody>
                                {defaulters.length === 0 ? (
                                    <tr><td colSpan={7} className="px-4 py-12 text-center text-on-surface-variant text-sm">No defaulters</td></tr>
                                ) : defaulters.map((d, i) => (
                                    <tr key={i} className={`border-b border-outline-variant/50 hover:bg-surface-container-high/40 transition-colors ${i % 2 === 1 ? 'bg-surface-container-lowest' : 'bg-background'}`}>
                                        <td className="px-4 py-2 font-mono text-xs text-on-surface">{d.reg_no}</td>
                                        <td className="px-4 py-2 data-tabular font-semibold text-on-surface">{d.name}</td>
                                        <td className="px-4 py-2 data-tabular text-on-surface-variant">{d.phone_primary}</td>
                                        <td className="px-4 py-2 data-tabular text-on-surface">{d.room_number}/{d.bed_number}</td>
                                        <td className="px-4 py-2 text-right data-tabular font-semibold text-danger-text">Rs. {Number(d.total_outstanding).toLocaleString()}</td>
                                        <td className="px-4 py-2 text-right data-tabular text-warning-text font-semibold">{d.overdue_count}</td>
                                        <td className="px-4 py-2 data-tabular text-on-surface-variant">{d.latest_due_date?.split("T")[0]}</td>
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
