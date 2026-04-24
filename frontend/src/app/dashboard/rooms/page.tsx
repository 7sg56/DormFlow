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

    if (loading) return <div className="text-muted-foreground py-10 text-center">Loading...</div>;

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Room Occupancy</h2>
                <p className="text-muted-foreground mt-1">{rooms.length} rooms</p>
            </div>
            <Card>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-muted/50">
                                <tr>
                                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Hostel</th>
                                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Room</th>
                                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Floor</th>
                                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Type</th>
                                    <th className="px-4 py-3 text-right font-medium text-muted-foreground">Capacity</th>
                                    <th className="px-4 py-3 text-right font-medium text-muted-foreground">Occupied</th>
                                    <th className="px-4 py-3 text-right font-medium text-muted-foreground">Vacant</th>
                                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Occupancy</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {rooms.map((r) => {
                                    const pct = r.capacity > 0 ? Math.round((r.occupied_beds / r.capacity) * 100) : 0;
                                    return (
                                        <tr key={r.room_id} className="hover:bg-muted/30">
                                            <td className="px-4 py-3">{r.hostel_name}</td>
                                            <td className="px-4 py-3 font-medium">{r.room_number}</td>
                                            <td className="px-4 py-3">{r.floor}</td>
                                            <td className="px-4 py-3">{r.room_type}</td>
                                            <td className="px-4 py-3 text-right">{r.capacity}</td>
                                            <td className="px-4 py-3 text-right">{r.occupied_beds}</td>
                                            <td className="px-4 py-3 text-right">{r.vacant_beds}</td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-16 h-2 rounded-full bg-muted overflow-hidden">
                                                        <div className={`h-full rounded-full ${pct >= 100 ? "bg-red-500" : pct >= 50 ? "bg-yellow-500" : "bg-green-500"}`} style={{ width: `${pct}%` }} />
                                                    </div>
                                                    <span className="text-xs text-muted-foreground">{pct}%</span>
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
