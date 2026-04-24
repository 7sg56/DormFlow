"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";
import { fetchApi } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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

    if (loading) return <div className="text-muted-foreground py-10 text-center">Loading...</div>;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Complaints</h2>
                    <p className="text-muted-foreground mt-1">
                        {user?.role === "student" ? "Your complaints" :
                            user?.role === "technician" ? "Assigned to you" :
                                "All complaints in your hostel"}
                    </p>
                </div>
                {user?.role === "student" && (
                    <button
                        onClick={() => setShowForm(!showForm)}
                        className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:opacity-90"
                    >
                        {showForm ? "Cancel" : "Raise Complaint"}
                    </button>
                )}
            </div>

            {submitMsg && (
                <div className="px-3 py-2 rounded-md bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 text-sm">
                    {submitMsg}
                </div>
            )}

            {showForm && (
                <Card>
                    <CardHeader><CardTitle>New Complaint</CardTitle></CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Description</label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full px-3 py-2 rounded-md border border-border bg-background text-foreground text-sm min-h-[100px]"
                                    placeholder="Describe the issue..."
                                    required
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Type</label>
                                    <select
                                        value={formData.complaint_type}
                                        onChange={(e) => setFormData({ ...formData, complaint_type: e.target.value })}
                                        className="w-full px-3 py-2 rounded-md border border-border bg-background text-foreground text-sm"
                                    >
                                        {["Plumbing", "Electrical", "Carpentry", "AC & Appliances", "Maintenance"].map((t) => (
                                            <option key={t} value={t}>{t}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Priority</label>
                                    <select
                                        value={formData.priority}
                                        onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                                        className="w-full px-3 py-2 rounded-md border border-border bg-background text-foreground text-sm"
                                    >
                                        {["Low", "Medium", "High"].map((p) => (
                                            <option key={p} value={p}>{p}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <button type="submit" className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm">
                                Submit Complaint
                            </button>
                        </form>
                    </CardContent>
                </Card>
            )}

            <Card>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-muted/50">
                                <tr>
                                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Type</th>
                                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Description</th>
                                    {user?.role !== "student" && <th className="px-4 py-3 text-left font-medium text-muted-foreground">Student</th>}
                                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Room</th>
                                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Priority</th>
                                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Status</th>
                                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Days</th>
                                    {(user?.role === "technician" || user?.role === "warden" || user?.role === "admin") && (
                                        <th className="px-4 py-3 text-left font-medium text-muted-foreground">Actions</th>
                                    )}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {complaints.length === 0 ? (
                                    <tr><td colSpan={8} className="px-4 py-8 text-center text-muted-foreground">No complaints found</td></tr>
                                ) : complaints.map((c) => (
                                    <tr key={c.complaint_id} className="hover:bg-muted/30">
                                        <td className="px-4 py-3">{c.complaint_type}</td>
                                        <td className="px-4 py-3 max-w-[200px] truncate">{c.description}</td>
                                        {user?.role !== "student" && <td className="px-4 py-3">{c.student_name || c.reg_no}</td>}
                                        <td className="px-4 py-3">{c.room_number || "-"}</td>
                                        <td className="px-4 py-3">
                                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${c.priority === "High" ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" :
                                                    c.priority === "Medium" ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400" :
                                                        "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                                                }`}>{c.priority}</span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${c.status === "Resolved" ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" :
                                                    c.status === "In Progress" ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" :
                                                        "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400"
                                                }`}>{c.status}</span>
                                        </td>
                                        <td className="px-4 py-3 text-muted-foreground">{c.days_open ?? "-"}</td>
                                        {(user?.role === "technician" || user?.role === "warden" || user?.role === "admin") && (
                                            <td className="px-4 py-3">
                                                {c.status === "Open" && (
                                                    <button onClick={() => updateStatus(c.complaint_id, "In Progress")}
                                                        className="text-xs px-2 py-1 bg-blue-600 text-white rounded">Start</button>
                                                )}
                                                {c.status === "In Progress" && (
                                                    <button onClick={() => updateStatus(c.complaint_id, "Resolved")}
                                                        className="text-xs px-2 py-1 bg-green-600 text-white rounded">Resolve</button>
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
