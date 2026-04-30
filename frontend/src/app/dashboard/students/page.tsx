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

    if (loading) return (
        <div className="flex items-center justify-center py-16">
            <div className="flex flex-col items-center gap-3">
                <div className="h-6 w-6 animate-spin rounded-full border-[3px] border-primary border-t-transparent" />
                <span className="text-sm font-ui text-on-surface-variant">Loading students...</span>
            </div>
        </div>
    );

    return (
        <div className="space-y-5 animate-fade-in">
            <div>
                <h1 className="font-headline text-2xl font-bold tracking-tight text-on-surface">Students</h1>
                <p className="text-sm text-on-surface-variant mt-0.5">{students.length} allocated students</p>
            </div>
            <Card className="overflow-hidden">
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-surface-container border-b border-outline-variant sticky top-0 z-10">
                                <tr>
                                    <th className="px-4 py-2.5 text-left label-md text-on-surface-variant">Reg No</th>
                                    <th className="px-4 py-2.5 text-left label-md text-on-surface-variant">Name</th>
                                    <th className="px-4 py-2.5 text-left label-md text-on-surface-variant">Dept</th>
                                    <th className="px-4 py-2.5 text-left label-md text-on-surface-variant">Year</th>
                                    <th className="px-4 py-2.5 text-left label-md text-on-surface-variant">Room</th>
                                    <th className="px-4 py-2.5 text-left label-md text-on-surface-variant">Hostel</th>
                                    <th className="px-4 py-2.5 text-left label-md text-on-surface-variant">Mess</th>
                                    <th className="px-4 py-2.5 text-right label-md text-on-surface-variant">Pending Fees</th>
                                    <th className="px-4 py-2.5 text-right label-md text-on-surface-variant">Open Comp.</th>
                                </tr>
                            </thead>
                            <tbody>
                                {students.map((s, i) => (
                                    <tr key={s.student_id} className={`border-b border-outline-variant/50 hover:bg-surface-container-high/40 transition-colors ${i % 2 === 1 ? 'bg-surface-container-lowest' : 'bg-background'}`}>
                                        <td className="px-4 py-2 font-mono text-xs text-on-surface">{s.reg_no}</td>
                                        <td className="px-4 py-2 data-tabular font-semibold text-on-surface">{s.name}</td>
                                        <td className="px-4 py-2 data-tabular text-on-surface">{s.department}</td>
                                        <td className="px-4 py-2 data-tabular text-on-surface">{s.academic_year}</td>
                                        <td className="px-4 py-2 data-tabular text-on-surface">{s.room_number} (F{s.floor})</td>
                                        <td className="px-4 py-2 data-tabular text-on-surface">{s.hostel_name}</td>
                                        <td className="px-4 py-2 data-tabular text-on-surface-variant">{s.mess}</td>
                                        <td className="px-4 py-2 text-right data-tabular">
                                            {Number(s.pending_fees) > 0
                                                ? <span className="text-warning-text font-semibold">Rs. {Number(s.pending_fees).toLocaleString()}</span>
                                                : <span className="text-success-text">0</span>}
                                        </td>
                                        <td className="px-4 py-2 text-right data-tabular">
                                            {Number(s.open_complaints) > 0
                                                ? <span className="text-warning-text font-semibold">{s.open_complaints}</span>
                                                : <span className="text-on-surface-variant">0</span>}
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
