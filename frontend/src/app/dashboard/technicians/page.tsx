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

    if (loading) return (
        <div className="flex items-center justify-center py-16">
            <div className="flex flex-col items-center gap-3">
                <div className="h-6 w-6 animate-spin rounded-full border-[3px] border-primary border-t-transparent" />
                <span className="text-sm font-ui text-on-surface-variant">Loading technicians...</span>
            </div>
        </div>
    );

    return (
        <div className="space-y-5 animate-fade-in">
            <h1 className="font-headline text-2xl font-bold tracking-tight text-on-surface">Technicians</h1>
            <Card className="overflow-hidden">
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-surface-container border-b border-outline-variant sticky top-0 z-10">
                                <tr>
                                    <th className="px-4 py-2.5 text-left label-md text-on-surface-variant">ID</th>
                                    <th className="px-4 py-2.5 text-left label-md text-on-surface-variant">Name</th>
                                    <th className="px-4 py-2.5 text-left label-md text-on-surface-variant">Hostel</th>
                                    <th className="px-4 py-2.5 text-left label-md text-on-surface-variant">Phone</th>
                                    <th className="px-4 py-2.5 text-left label-md text-on-surface-variant">Availability</th>
                                    <th className="px-4 py-2.5 text-left label-md text-on-surface-variant">Type</th>
                                    <th className="px-4 py-2.5 text-right label-md text-on-surface-variant">Salary</th>
                                </tr>
                            </thead>
                            <tbody>
                                {techs.map((t, i) => (
                                    <tr key={t.technician_id} className={`border-b border-outline-variant/50 hover:bg-surface-container-high/40 transition-colors ${i % 2 === 1 ? 'bg-surface-container-lowest' : 'bg-background'}`}>
                                        <td className="px-4 py-2 font-mono text-xs text-on-surface">{t.technician_id}</td>
                                        <td className="px-4 py-2 data-tabular font-semibold text-on-surface">{t.name}</td>
                                        <td className="px-4 py-2 data-tabular text-on-surface">{t.hostel_name}</td>
                                        <td className="px-4 py-2 data-tabular text-on-surface-variant">{t.phone}</td>
                                        <td className="px-4 py-2 data-tabular text-on-surface">{t.availability}</td>
                                        <td className="px-4 py-2 data-tabular text-on-surface">{t.employment_type}</td>
                                        <td className="px-4 py-2 text-right data-tabular text-on-surface">Rs. {Number(t.salary).toLocaleString()}</td>
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
