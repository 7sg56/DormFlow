"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";
import { fetchApi } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import type { Status } from "@/components/ui/status-badge";

/* eslint-disable @typescript-eslint/no-explicit-any */

export default function ComplaintsPage() {
    const { user } = useAuth();
    const [complaints, setComplaints] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({ description: "", complaint_type: "Plumbing", priority: "Medium" });
    const [submitMsg, setSubmitMsg] = useState("");

    useEffect(() => {
        if (!user) return;
        const endpoint =
            user.role === "student" ? "/dashboard/student-complaints" :
                user.role === "technician" ? "/dashboard/my-complaints" :
                    "/dashboard/hostel-complaints";
        fetchApi(endpoint)
            .then((data: any) => setComplaints(data))
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [user]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitMsg("");
        try {
            await fetchApi("/dashboard/raise-complaint", {
                method: "POST",
                body: JSON.stringify(formData),
            });
            setSubmitMsg("Complaint raised successfully");
            setShowForm(false);
            setFormData({ description: "", complaint_type: "Plumbing", priority: "Medium" });
            const data: any = await fetchApi("/dashboard/student-complaints");
            setComplaints(data);
        } catch (err: any) {
            setSubmitMsg(err.message);
        }
    };

    const updateStatus = async (id: string, status: string) => {
        try {
            await fetchApi(`/dashboard/update-complaint/${id}`, {
                method: "PUT",
                body: JSON.stringify({ status }),
            });
            const endpoint = user?.role === "technician" ? "/dashboard/my-complaints" : "/dashboard/hostel-complaints";
            const data: any = await fetchApi(endpoint);
            setComplaints(data);
        } catch (err: any) {
            alert(err.message);
        }
    };

    const priorityMap: Record<string, Status> = { "High": "error", "Medium": "warning", "Low": "success" };
    const statusMap: Record<string, Status> = { "Open": "open", "In Progress": "in-progress", "Resolved": "resolved", "Closed": "success" };

    if (loading) return (
        <div className="flex items-center justify-center py-16">
            <div className="flex flex-col items-center gap-3">
                <div className="h-6 w-6 animate-spin rounded-full border-[3px] border-primary border-t-transparent" />
                <span className="text-sm font-ui text-on-surface-variant">Loading complaints...</span>
            </div>
        </div>
    );

    return (
        <div className="space-y-5 animate-fade-in">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="font-headline text-2xl font-bold tracking-tight text-on-surface">Complaints</h1>
                    <p className="text-sm text-on-surface-variant mt-0.5">
                        {user?.role === "student" ? "Your complaints" :
                            user?.role === "technician" ? "Assigned to you" :
                                "All complaints in your hostel"}
                    </p>
                </div>
                {user?.role === "student" && (
                    <button
                        onClick={() => setShowForm(!showForm)}
                        className="px-4 py-2 bg-primary-container text-on-primary rounded-[var(--radius)] font-ui text-sm font-semibold hover:bg-primary shadow-[var(--shadow-sm)] transition-all duration-150 cursor-pointer"
                    >
                        {showForm ? "Cancel" : "Raise Complaint"}
                    </button>
                )}
            </div>

            {submitMsg && (
                <div className="px-3 py-2.5 rounded-[var(--radius)] bg-success-bg text-success-text font-ui text-sm border border-success/20">
                    {submitMsg}
                </div>
            )}

            {showForm && (
                <Card>
                    <CardHeader><CardTitle>New Complaint</CardTitle></CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="label-md text-on-surface-variant mb-1.5 block">Description</label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full px-3 py-2.5 rounded-[var(--radius)] border border-outline-variant bg-background font-ui text-sm text-on-surface min-h-[100px] focus:outline-none focus:ring-2 focus:ring-ring focus:border-primary transition-all duration-150 placeholder:text-outline"
                                    placeholder="Describe the issue..."
                                    required
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="label-md text-on-surface-variant mb-1.5 block">Type</label>
                                    <select
                                        value={formData.complaint_type}
                                        onChange={(e) => setFormData({ ...formData, complaint_type: e.target.value })}
                                        className="w-full px-3 py-2.5 rounded-[var(--radius)] border border-outline-variant bg-background font-ui text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-ring focus:border-primary transition-all duration-150"
                                    >
                                        {["Plumbing", "Electrical", "Carpentry", "AC & Appliances", "Maintenance"].map((t) => (
                                            <option key={t} value={t}>{t}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="label-md text-on-surface-variant mb-1.5 block">Priority</label>
                                    <select
                                        value={formData.priority}
                                        onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                                        className="w-full px-3 py-2.5 rounded-[var(--radius)] border border-outline-variant bg-background font-ui text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-ring focus:border-primary transition-all duration-150"
                                    >
                                        {["Low", "Medium", "High"].map((p) => (
                                            <option key={p} value={p}>{p}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <button type="submit" className="px-4 py-2 bg-primary-container text-on-primary rounded-[var(--radius)] font-ui text-sm font-semibold hover:bg-primary shadow-[var(--shadow-sm)] transition-all duration-150 cursor-pointer">
                                Submit Complaint
                            </button>
                        </form>
                    </CardContent>
                </Card>
            )}

            <Card className="overflow-hidden">
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-surface-container border-b border-outline-variant sticky top-0 z-10">
                                <tr>
                                    <th className="px-4 py-2.5 text-left label-md text-on-surface-variant">Type</th>
                                    <th className="px-4 py-2.5 text-left label-md text-on-surface-variant">Description</th>
                                    {user?.role !== "student" && <th className="px-4 py-2.5 text-left label-md text-on-surface-variant">Student</th>}
                                    <th className="px-4 py-2.5 text-left label-md text-on-surface-variant">Room</th>
                                    <th className="px-4 py-2.5 text-left label-md text-on-surface-variant">Priority</th>
                                    <th className="px-4 py-2.5 text-left label-md text-on-surface-variant">Status</th>
                                    <th className="px-4 py-2.5 text-left label-md text-on-surface-variant">Days</th>
                                    {(user?.role === "technician" || user?.role === "warden" || user?.role === "admin") && (
                                        <th className="px-4 py-2.5 text-left label-md text-on-surface-variant">Actions</th>
                                    )}
                                </tr>
                            </thead>
                            <tbody>
                                {complaints.length === 0 ? (
                                    <tr><td colSpan={8} className="px-4 py-12 text-center text-on-surface-variant text-sm">No complaints found</td></tr>
                                ) : complaints.map((c, i) => (
                                    <tr key={c.complaint_id} className={`border-b border-outline-variant/50 hover:bg-surface-container-high/40 transition-colors ${i % 2 === 1 ? 'bg-surface-container-lowest' : 'bg-background'}`}>
                                        <td className="px-4 py-2 data-tabular text-on-surface">{c.complaint_type}</td>
                                        <td className="px-4 py-2 data-tabular text-on-surface max-w-[200px] truncate">{c.description}</td>
                                        {user?.role !== "student" && <td className="px-4 py-2 data-tabular text-on-surface">{c.student_name || c.reg_no}</td>}
                                        <td className="px-4 py-2 data-tabular text-on-surface">{c.room_number || "-"}</td>
                                        <td className="px-4 py-2">
                                            <StatusBadge status={priorityMap[c.priority] || "info"} text={c.priority} />
                                        </td>
                                        <td className="px-4 py-2">
                                            <StatusBadge status={statusMap[c.status] || "open"} text={c.status} />
                                        </td>
                                        <td className="px-4 py-2 data-tabular text-on-surface-variant">{c.days_open ?? "-"}</td>
                                        {(user?.role === "technician" || user?.role === "warden" || user?.role === "admin") && (
                                            <td className="px-4 py-2">
                                                {c.status === "Open" && (
                                                    <button onClick={() => updateStatus(c.complaint_id, "In Progress")}
                                                        className="font-ui text-xs px-2.5 py-1 bg-info text-white rounded-[var(--radius)] hover:brightness-90 transition-all cursor-pointer">Start</button>
                                                )}
                                                {c.status === "In Progress" && (
                                                    <button onClick={() => updateStatus(c.complaint_id, "Resolved")}
                                                        className="font-ui text-xs px-2.5 py-1 bg-success text-white rounded-[var(--radius)] hover:brightness-90 transition-all cursor-pointer">Resolve</button>
                                                )}
                                            </td>
                                        )}
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
