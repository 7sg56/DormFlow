"use client";
import { useEffect, useState } from "react";
import { fetchApi } from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
/* eslint-disable @typescript-eslint/no-explicit-any */

export default function TechniciansPage() {
    const [techs, setTechs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        fetchApi("/technicians").then((d: any) => setTechs(d)).catch(console.error).finally(() => setLoading(false));
    }, []);
    if (loading) return <div className="text-muted-foreground py-10 text-center">Loading...</div>;
    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold tracking-tight">Technicians</h2>
            <Card><CardContent className="p-0"><div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead className="bg-muted/50"><tr>
                        <th className="px-4 py-3 text-left font-medium text-muted-foreground">ID</th>
                        <th className="px-4 py-3 text-left font-medium text-muted-foreground">Name</th>
                        <th className="px-4 py-3 text-left font-medium text-muted-foreground">Hostel</th>
                        <th className="px-4 py-3 text-left font-medium text-muted-foreground">Phone</th>
                        <th className="px-4 py-3 text-left font-medium text-muted-foreground">Availability</th>
                        <th className="px-4 py-3 text-left font-medium text-muted-foreground">Type</th>
                        <th className="px-4 py-3 text-right font-medium text-muted-foreground">Salary</th>
                    </tr></thead>
                    <tbody className="divide-y divide-border">
                        {techs.map((t) => (
                            <tr key={t.technician_id} className="hover:bg-muted/30">
                                <td className="px-4 py-3 font-mono text-xs">{t.technician_id}</td>
                                <td className="px-4 py-3 font-medium">{t.name}</td>
                                <td className="px-4 py-3">{t.hostel_name}</td>
                                <td className="px-4 py-3 text-muted-foreground">{t.phone}</td>
                                <td className="px-4 py-3">{t.availability}</td>
                                <td className="px-4 py-3">{t.employment_type}</td>
                                <td className="px-4 py-3 text-right">Rs. {Number(t.salary).toLocaleString()}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div></CardContent></Card>
        </div>
    );
}
