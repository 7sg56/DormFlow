"use client";
import { useEffect, useState } from "react";
import { fetchApi } from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
/* eslint-disable @typescript-eslint/no-explicit-any */

export default function BedsPage() {
    const [beds, setBeds] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        fetchApi("/beds").then((d: any) => setBeds(d)).catch(console.error).finally(() => setLoading(false));
    }, []);

    if (loading) return (
        <div className="flex items-center justify-center py-16">
            <div className="flex flex-col items-center gap-3">
                <div className="h-6 w-6 animate-spin rounded-full border-[3px] border-primary border-t-transparent" />
                <span className="text-sm font-ui text-on-surface-variant">Loading beds...</span>
            </div>
        </div>
    );

    return (
        <div className="space-y-5 animate-fade-in">
            <div>
                <h1 className="font-headline text-2xl font-bold tracking-tight text-on-surface">Beds</h1>
                <p className="text-sm text-on-surface-variant mt-0.5">{beds.length} beds across all hostels</p>
            </div>
            <Card className="overflow-hidden">
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-surface-container border-b border-outline-variant sticky top-0 z-10">
                                <tr>
                                    <th className="px-4 py-2.5 text-left label-md text-on-surface-variant">Hostel</th>
                                    <th className="px-4 py-2.5 text-left label-md text-on-surface-variant">Room</th>
                                    <th className="px-4 py-2.5 text-left label-md text-on-surface-variant">Floor</th>
                                    <th className="px-4 py-2.5 text-left label-md text-on-surface-variant">Bed No</th>
                                    <th className="px-4 py-2.5 text-left label-md text-on-surface-variant">Type</th>
                                    <th className="px-4 py-2.5 text-left label-md text-on-surface-variant">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {beds.map((b, i) => (
                                    <tr key={b.bed_id} className={`border-b border-outline-variant/50 hover:bg-surface-container-high/40 transition-colors ${i % 2 === 1 ? 'bg-surface-container-lowest' : 'bg-background'}`}>
                                        <td className="px-4 py-2 data-tabular text-on-surface">{b.hostel_name}</td>
                                        <td className="px-4 py-2 data-tabular text-on-surface">{b.room_number}</td>
                                        <td className="px-4 py-2 data-tabular text-on-surface">{b.floor}</td>
                                        <td className="px-4 py-2 data-tabular font-semibold text-on-surface">{b.bed_number}</td>
                                        <td className="px-4 py-2 data-tabular text-on-surface">{b.bed_type}</td>
                                        <td className="px-4 py-2">
                                            <StatusBadge
                                                status={b.occupied ? "error" : "success"}
                                                text={b.occupied ? "Occupied" : "Vacant"}
                                            />
                                        </td>
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
