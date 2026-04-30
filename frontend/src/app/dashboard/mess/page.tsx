"use client";

import { useEffect, useState } from "react";
import { fetchApi } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

/* eslint-disable @typescript-eslint/no-explicit-any */

export default function MessPage() {
    const [messes, setMesses] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchApi("/dashboard/mess-info")
            .then((data: any) => setMesses(data))
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    if (loading) return (
        <div className="flex items-center justify-center py-16">
            <div className="flex flex-col items-center gap-3">
                <div className="h-6 w-6 animate-spin rounded-full border-[3px] border-primary border-t-transparent" />
                <span className="text-sm font-ui text-on-surface-variant">Loading mess info...</span>
            </div>
        </div>
    );

    return (
        <div className="space-y-5 animate-fade-in">
            <div>
                <h1 className="font-headline text-2xl font-bold tracking-tight text-on-surface">Mess Information</h1>
                <p className="text-sm text-on-surface-variant mt-0.5">{messes.length} messes across hostels</p>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
                {messes.map((m) => (
                    <Card key={m.mess_id} className="relative overflow-hidden">
                        <div className="absolute top-0 left-0 right-0 h-[3px] bg-tertiary" />
                        <CardHeader className="pt-5">
                            <CardTitle className="flex items-center justify-between">
                                <span>{m.mess_name}</span>
                                <span className={`text-[11px] px-2 py-0.5 rounded-[var(--radius-xl)] font-ui font-semibold ${m.mess_type === "Veg" ? "bg-success-bg text-success-text" : "bg-danger-bg text-danger-text"}`}>
                                    {m.mess_type}
                                </span>
                            </CardTitle>
                            <p className="text-sm text-on-surface-variant">{m.hostel_name}</p>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="grid grid-cols-2 gap-2 text-sm">
                                <div><span className="text-on-surface-variant">Monthly Fee:</span> <span className="data-tabular font-medium text-on-surface">Rs. {Number(m.monthly_fee).toLocaleString()}</span></div>
                                <div><span className="text-on-surface-variant">Capacity:</span> <span className="data-tabular font-medium text-on-surface">{m.capacity}</span></div>
                                <div><span className="text-on-surface-variant">Manager:</span> <span className="font-medium text-on-surface">{m.manager_name}</span></div>
                                <div><span className="text-on-surface-variant">Rating:</span> <span className="data-tabular font-medium text-on-surface">{m.hygiene_rating}/5</span></div>
                            </div>
                            {m.menu_description && (
                                <div className="text-xs text-on-surface-variant bg-surface-container rounded-[var(--radius)] p-3 whitespace-pre-wrap">
                                    {m.menu_description}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
