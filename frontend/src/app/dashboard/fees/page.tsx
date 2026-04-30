"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";
import { fetchApi } from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { FeeStatusBadge } from "@/components/ui/status-badge";

/* eslint-disable @typescript-eslint/no-explicit-any */

export default function FeesPage() {
    const { user } = useAuth();
    const [fees, setFees] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) return;
        const endpoint = user.role === "student" ? "/dashboard/student-fees" : "/dashboard/hostel-fees";
        fetchApi(endpoint)
            .then((data: any) => setFees(data))
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [user]);

    if (loading) return (
        <div className="flex items-center justify-center py-16">
            <div className="flex flex-col items-center gap-3">
                <div className="h-6 w-6 animate-spin rounded-full border-[3px] border-primary border-t-transparent" />
                <span className="text-sm font-ui text-on-surface-variant">Loading fees...</span>
            </div>
        </div>
    );

    return (
        <div className="space-y-5 animate-fade-in">
            <div>
                <h1 className="font-headline text-2xl font-bold tracking-tight text-on-surface">Fee Payments</h1>
                <p className="text-sm text-on-surface-variant mt-0.5">
                    {user?.role === "student" ? "Your fee payment history" : "Fee payments for your hostel"}
                </p>
            </div>
            <Card className="overflow-hidden">
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-surface-container border-b border-outline-variant sticky top-0 z-10">
                                <tr>
                                    {user?.role !== "student" && <th className="px-4 py-2.5 text-left label-md text-on-surface-variant">Student</th>}
                                    {user?.role !== "student" && <th className="px-4 py-2.5 text-left label-md text-on-surface-variant">Room</th>}
                                    <th className="px-4 py-2.5 text-left label-md text-on-surface-variant">Month</th>
                                    <th className="px-4 py-2.5 text-left label-md text-on-surface-variant">Semester</th>
                                    <th className="px-4 py-2.5 text-right label-md text-on-surface-variant">Due</th>
                                    <th className="px-4 py-2.5 text-right label-md text-on-surface-variant">Paid</th>
                                    <th className="px-4 py-2.5 text-right label-md text-on-surface-variant">Balance</th>
                                    <th className="px-4 py-2.5 text-left label-md text-on-surface-variant">Mode</th>
                                    <th className="px-4 py-2.5 text-left label-md text-on-surface-variant">Due Date</th>
                                    <th className="px-4 py-2.5 text-left label-md text-on-surface-variant">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {fees.length === 0 ? (
                                    <tr><td colSpan={10} className="px-4 py-12 text-center text-on-surface-variant text-sm">No fee records</td></tr>
                                ) : fees.map((f, i) => (
                                    <tr key={f.payment_id} className={`border-b border-outline-variant/50 hover:bg-surface-container-high/40 transition-colors ${i % 2 === 1 ? 'bg-surface-container-lowest' : 'bg-background'}`}>
                                        {user?.role !== "student" && <td className="px-4 py-2 data-tabular text-on-surface">{f.student_name}</td>}
                                        {user?.role !== "student" && <td className="px-4 py-2 data-tabular text-on-surface">{f.room_number}</td>}
                                        <td className="px-4 py-2 data-tabular text-on-surface">{f.fee_month}</td>
                                        <td className="px-4 py-2 data-tabular text-on-surface">{f.semester}</td>
                                        <td className="px-4 py-2 text-right data-tabular text-on-surface">Rs. {Number(f.amount_due).toLocaleString()}</td>
                                        <td className="px-4 py-2 text-right data-tabular text-on-surface">Rs. {Number(f.paid_amount).toLocaleString()}</td>
                                        <td className="px-4 py-2 text-right data-tabular font-semibold">{Number(f.balance_due) > 0 ? <span className="text-danger-text">Rs. {Number(f.balance_due).toLocaleString()}</span> : <span className="text-on-surface-variant">-</span>}</td>
                                        <td className="px-4 py-2 data-tabular text-on-surface-variant">{f.payment_mode || "-"}</td>
                                        <td className="px-4 py-2 data-tabular text-on-surface-variant">{f.due_date?.split("T")[0] || "-"}</td>
                                        <td className="px-4 py-2">
                                            <FeeStatusBadge status={f.display_status || f.status} />
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
