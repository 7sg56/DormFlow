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
    if (loading) return <div className="text-muted-foreground py-10 text-center">Loading...</div>;
    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold tracking-tight">Hostels</h2>
            <Card><CardContent className="p-0"><div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead className="bg-muted/50"><tr>
                        <th className="px-4 py-3 text-left font-medium text-muted-foreground">Name</th>
                        <th className="px-4 py-3 text-left font-medium text-muted-foreground">Type</th>
                        <th className="px-4 py-3 text-left font-medium text-muted-foreground">Floors</th>
                        <th className="px-4 py-3 text-left font-medium text-muted-foreground">Warden</th>
                        <th className="px-4 py-3 text-left font-medium text-muted-foreground">Phone</th>
                        <th className="px-4 py-3 text-left font-medium text-muted-foreground">City</th>
                    </tr></thead>
                    <tbody className="divide-y divide-border">
                        {hostels.map((h) => (
                            <tr key={h.hostel_id} className="hover:bg-muted/30">
                                <td className="px-4 py-3 font-medium">{h.hostel_name}</td>
                                <td className="px-4 py-3">{h.type}</td>
                                <td className="px-4 py-3">{h.total_floors}</td>
                                <td className="px-4 py-3">{h.warden_name || "-"}</td>
                                <td className="px-4 py-3 text-muted-foreground">{h.warden_phone || "-"}</td>
                                <td className="px-4 py-3 text-muted-foreground">{h.city || "-"}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div></CardContent></Card>
        </div>
    );
}
