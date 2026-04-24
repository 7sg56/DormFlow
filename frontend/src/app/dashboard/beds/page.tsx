"use client";
import { useEffect, useState } from "react";
import { fetchApi } from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
/* eslint-disable @typescript-eslint/no-explicit-any */

export default function BedsPage() {
    const [beds, setBeds] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        fetchApi("/beds").then((d: any) => setBeds(d)).catch(console.error).finally(() => setLoading(false));
    }, []);
    if (loading) return <div className="text-muted-foreground py-10 text-center">Loading...</div>;
    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold tracking-tight">Beds</h2>
            <p className="text-muted-foreground">{beds.length} beds across all hostels</p>
            <Card><CardContent className="p-0"><div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead className="bg-muted/50"><tr>
                        <th className="px-4 py-3 text-left font-medium text-muted-foreground">Hostel</th>
                        <th className="px-4 py-3 text-left font-medium text-muted-foreground">Room</th>
                        <th className="px-4 py-3 text-left font-medium text-muted-foreground">Floor</th>
                        <th className="px-4 py-3 text-left font-medium text-muted-foreground">Bed No</th>
                        <th className="px-4 py-3 text-left font-medium text-muted-foreground">Type</th>
                        <th className="px-4 py-3 text-left font-medium text-muted-foreground">Status</th>
                    </tr></thead>
                    <tbody className="divide-y divide-border">
                        {beds.map((b) => (
                            <tr key={b.bed_id} className="hover:bg-muted/30">
                                <td className="px-4 py-3">{b.hostel_name}</td>
                                <td className="px-4 py-3">{b.room_number}</td>
                                <td className="px-4 py-3">{b.floor}</td>
                                <td className="px-4 py-3 font-medium">{b.bed_number}</td>
                                <td className="px-4 py-3">{b.bed_type}</td>
                                <td className="px-4 py-3">
                                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${b.occupied ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" : "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"}`}>
                                        {b.occupied ? "Occupied" : "Vacant"}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div></CardContent></Card>
        </div>
    );
}
