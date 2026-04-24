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

    if (loading) return <div className="text-muted-foreground py-10 text-center">Loading...</div>;

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Mess Information</h2>
                <p className="text-muted-foreground mt-1">{messes.length} messes across hostels</p>
            </div>
            <div className="grid gap-6 md:grid-cols-2">
                {messes.map((m) => (
                    <Card key={m.mess_id}>
                        <CardHeader>
                            <CardTitle className="flex items-center justify-between">
                                <span>{m.mess_name}</span>
                                <span className={`text-xs px-2 py-0.5 rounded-full ${m.mess_type === "Veg" ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"}`}>
                                    {m.mess_type}
                                </span>
                            </CardTitle>
                            <p className="text-sm text-muted-foreground">{m.hostel_name}</p>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="grid grid-cols-2 gap-2 text-sm">
                                <div><span className="text-muted-foreground">Monthly Fee:</span> <span className="font-medium">Rs. {Number(m.monthly_fee).toLocaleString()}</span></div>
                                <div><span className="text-muted-foreground">Capacity:</span> <span className="font-medium">{m.capacity}</span></div>
                                <div><span className="text-muted-foreground">Manager:</span> <span className="font-medium">{m.manager_name}</span></div>
                                <div><span className="text-muted-foreground">Rating:</span> <span className="font-medium">{m.hygiene_rating}/5</span></div>
                            </div>
                            {m.menu_description && (
                                <div className="text-xs text-muted-foreground bg-muted/50 rounded-md p-3 whitespace-pre-wrap">
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
