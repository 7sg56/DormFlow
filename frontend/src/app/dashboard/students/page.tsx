"use client";

import { useEffect, useState } from "react";
import { fetchApi } from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";

/* eslint-disable @typescript-eslint/no-explicit-any */

export default function StudentsPage() {
    const [students, setStudents] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchApi("/dashboard/students")
            .then((data: any) => setStudents(data))
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <div className="text-muted-foreground py-10 text-center">Loading...</div>;

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Students</h2>
                <p className="text-muted-foreground mt-1">{students.length} allocated students</p>
            </div>
            <Card>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-muted/50">
                                <tr>
                                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Reg No</th>
                                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Name</th>
                                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Dept</th>
                                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Year</th>
                                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Room</th>
                                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Hostel</th>
                                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Mess</th>
                                    <th className="px-4 py-3 text-right font-medium text-muted-foreground">Pending Fees</th>
                                    <th className="px-4 py-3 text-right font-medium text-muted-foreground">Open Comp.</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {students.map((s) => (
                                    <tr key={s.student_id} className="hover:bg-muted/30">
                                        <td className="px-4 py-3 font-mono text-xs">{s.reg_no}</td>
                                        <td className="px-4 py-3 font-medium">{s.name}</td>
                                        <td className="px-4 py-3">{s.department}</td>
                                        <td className="px-4 py-3">{s.academic_year}</td>
                                        <td className="px-4 py-3">{s.room_number} (F{s.floor})</td>
                                        <td className="px-4 py-3">{s.hostel_name}</td>
                                        <td className="px-4 py-3 text-muted-foreground">{s.mess}</td>
                                        <td className="px-4 py-3 text-right">
                                            {Number(s.pending_fees) > 0
                                                ? <span className="text-orange-600 font-medium">Rs. {Number(s.pending_fees).toLocaleString()}</span>
                                                : <span className="text-green-600">0</span>}
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            {Number(s.open_complaints) > 0
                                                ? <span className="text-orange-600 font-medium">{s.open_complaints}</span>
                                                : <span className="text-muted-foreground">0</span>}
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
