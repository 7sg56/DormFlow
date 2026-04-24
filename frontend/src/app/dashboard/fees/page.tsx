"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";
import { fetchApi } from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";

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

    if (loading) return <div className="text-muted-foreground py-10 text-center">Loading...</div>;

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Fee Payments</h2>
                <p className="text-muted-foreground mt-1">
                    {user?.role === "student" ? "Your fee payment history" : "Fee payments for your hostel"}
                </p>
            </div>
            <Card>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-muted/50">
                                <tr>
                                    {user?.role !== "student" && <th className="px-4 py-3 text-left font-medium text-muted-foreground">Student</th>}
                                    {user?.role !== "student" && <th className="px-4 py-3 text-left font-medium text-muted-foreground">Room</th>}
                                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Month</th>
                                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Semester</th>
                                    <th className="px-4 py-3 text-right font-medium text-muted-foreground">Due</th>
                                    <th className="px-4 py-3 text-right font-medium text-muted-foreground">Paid</th>
                                    <th className="px-4 py-3 text-right font-medium text-muted-foreground">Balance</th>
                                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Mode</th>
                                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Due Date</th>
                                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {fees.length === 0 ? (
                                    <tr><td colSpan={10} className="px-4 py-8 text-center text-muted-foreground">No fee records</td></tr>
                                ) : fees.map((f) => (
                                    <tr key={f.payment_id} className="hover:bg-muted/30">
                                        {user?.role !== "student" && <td className="px-4 py-3">{f.student_name}</td>}
                                        {user?.role !== "student" && <td className="px-4 py-3">{f.room_number}</td>}
                                        <td className="px-4 py-3">{f.fee_month}</td>
                                        <td className="px-4 py-3">{f.semester}</td>
                                        <td className="px-4 py-3 text-right">Rs. {Number(f.amount_due).toLocaleString()}</td>
                                        <td className="px-4 py-3 text-right">Rs. {Number(f.paid_amount).toLocaleString()}</td>
                                        <td className="px-4 py-3 text-right font-medium">{Number(f.balance_due) > 0 ? `Rs. ${Number(f.balance_due).toLocaleString()}` : "-"}</td>
                                        <td className="px-4 py-3 text-muted-foreground">{f.payment_mode || "-"}</td>
                                        <td className="px-4 py-3 text-muted-foreground">{f.due_date?.split("T")[0] || "-"}</td>
                                        <td className="px-4 py-3">
                                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${(f.display_status || f.status) === "Paid" ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" :
                                                    (f.display_status || f.status) === "Overdue" ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" :
                                                        (f.display_status || f.status) === "Partial" ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400" :
                                                            "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400"
                                                }`}>{f.display_status || f.status}</span>
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
