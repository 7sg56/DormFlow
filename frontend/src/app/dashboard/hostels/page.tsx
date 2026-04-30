"use client";
import { useEffect, useState } from "react";
import { fetchApi } from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
/* eslint-disable @typescript-eslint/no-explicit-any */

export default function HostelsPage() {
    const [hostels, setHostels] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        fetchApi("/hostels").then((d: any) => setHostels(d)).catch(console.error).finally(() => setLoading(false));
    }, []);

    if (loading) return (
        <div className="flex items-center justify-center py-16">
            <div className="flex flex-col items-center gap-3">
                <div className="h-6 w-6 animate-spin rounded-full border-[3px] border-primary border-t-transparent" />
                <span className="text-sm font-ui text-on-surface-variant">Loading hostels...</span>
            </div>
        </div>
    );

    return (
        <div className="space-y-5 animate-fade-in">
            <h1 className="font-headline text-2xl font-bold tracking-tight text-on-surface">Hostels</h1>
            <Card className="overflow-hidden">
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-surface-container border-b border-outline-variant sticky top-0 z-10">
                                <tr>
                                    <th className="px-4 py-2.5 text-left label-md text-on-surface-variant">Name</th>
                                    <th className="px-4 py-2.5 text-left label-md text-on-surface-variant">Type</th>
                                    <th className="px-4 py-2.5 text-left label-md text-on-surface-variant">Floors</th>
                                    <th className="px-4 py-2.5 text-left label-md text-on-surface-variant">Warden</th>
                                    <th className="px-4 py-2.5 text-left label-md text-on-surface-variant">Phone</th>
                                    <th className="px-4 py-2.5 text-left label-md text-on-surface-variant">City</th>
                                </tr>
                            </thead>
                            <tbody>
                                {hostels.map((h, i) => (
                                    <tr key={h.hostel_id} className={`border-b border-outline-variant/50 hover:bg-surface-container-high/40 transition-colors ${i % 2 === 1 ? 'bg-surface-container-lowest' : 'bg-background'}`}>
                                        <td className="px-4 py-2 data-tabular font-semibold text-on-surface">{h.hostel_name}</td>
                                        <td className="px-4 py-2 data-tabular text-on-surface">{h.type}</td>
                                        <td className="px-4 py-2 data-tabular text-on-surface">{h.total_floors}</td>
                                        <td className="px-4 py-2 data-tabular text-on-surface">{h.warden_name || "-"}</td>
                                        <td className="px-4 py-2 data-tabular text-on-surface-variant">{h.warden_phone || "-"}</td>
                                        <td className="px-4 py-2 data-tabular text-on-surface-variant">{h.city || "-"}</td>
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
