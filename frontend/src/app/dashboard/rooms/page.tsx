"use client";

import { useEffect, useState } from "react";
import { fetchApi } from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";

/* eslint-disable @typescript-eslint/no-explicit-any */

export default function RoomsPage() {
    const [rooms, setRooms] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchApi("/dashboard/room-occupancy")
            .then((data: any) => setRooms(data))
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    if (loading) return (
        <div className="flex items-center justify-center py-16">
            <div className="flex flex-col items-center gap-3">
                <div className="h-6 w-6 animate-spin rounded-full border-[3px] border-primary border-t-transparent" />
                <span className="text-sm font-ui text-on-surface-variant">Loading rooms...</span>
            </div>
        </div>
    );

    return (
        <div className="space-y-5 animate-fade-in">
            <div>
                <h1 className="font-headline text-2xl font-bold tracking-tight text-on-surface">Room Occupancy</h1>
                <p className="text-sm text-on-surface-variant mt-0.5">{rooms.length} rooms</p>
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
                                    <th className="px-4 py-2.5 text-left label-md text-on-surface-variant">Type</th>
                                    <th className="px-4 py-2.5 text-right label-md text-on-surface-variant">Capacity</th>
                                    <th className="px-4 py-2.5 text-right label-md text-on-surface-variant">Occupied</th>
                                    <th className="px-4 py-2.5 text-right label-md text-on-surface-variant">Vacant</th>
                                    <th className="px-4 py-2.5 text-left label-md text-on-surface-variant">Occupancy</th>
                                </tr>
                            </thead>
                            <tbody>
                                {rooms.map((r, i) => {
                                    const pct = r.capacity > 0 ? Math.round((r.occupied_beds / r.capacity) * 100) : 0;
                                    return (
                                        <tr key={r.room_id} className={`border-b border-outline-variant/50 hover:bg-surface-container-high/40 transition-colors ${i % 2 === 1 ? 'bg-surface-container-lowest' : 'bg-background'}`}>
                                            <td className="px-4 py-2 data-tabular text-on-surface">{r.hostel_name}</td>
                                            <td className="px-4 py-2 data-tabular font-semibold text-on-surface">{r.room_number}</td>
                                            <td className="px-4 py-2 data-tabular text-on-surface">{r.floor}</td>
                                            <td className="px-4 py-2 data-tabular text-on-surface">{r.room_type}</td>
                                            <td className="px-4 py-2 text-right data-tabular text-on-surface">{r.capacity}</td>
                                            <td className="px-4 py-2 text-right data-tabular text-on-surface">{r.occupied_beds}</td>
                                            <td className="px-4 py-2 text-right data-tabular text-on-surface">{r.vacant_beds}</td>
                                            <td className="px-4 py-2">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-16 h-1.5 rounded-[var(--radius-full)] bg-surface-container-highest overflow-hidden">
                                                        <div className={`h-full rounded-[var(--radius-full)] transition-all ${pct >= 100 ? "bg-danger" : pct >= 50 ? "bg-warning" : "bg-success"}`} style={{ width: `${pct}%` }} />
                                                    </div>
                                                    <span className="text-xs data-tabular text-on-surface-variant">{pct}%</span>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
