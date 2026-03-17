import { fetchApi } from "@/lib/api";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Wrench, Plus, CheckCircle2, Clock } from "lucide-react";

interface Complaint {
    id: string;
    complaint_type: string;
    description: string;
    priority: string;
    status: string;
    room: string;
    reported_by: string;
    created_at: string;
}

export default async function ComplaintsPage() {
    let complaints: Complaint[] = [];
    try {
        complaints = await fetchApi<Complaint[]>("/complaints") || [];
    } catch (err) {
        console.error("Failed to load complaints:", err);
    }

    if (complaints.length === 0) {
        complaints = [
            { id: "c1", complaint_type: "Plumbing", description: "Leaking tap in bathroom", priority: "Medium", status: "Pending", room: "101", reported_by: "Arjun Mehta", created_at: "2024-03-16" },
            { id: "c2", complaint_type: "Electrical", description: "Fan not working", priority: "High", status: "Resolved", room: "102", reported_by: "Priya Sharma", created_at: "2024-03-15" },
            { id: "c3", complaint_type: "Carpentry", description: "Broken chair", priority: "Low", status: "In Progress", room: "201", reported_by: "Rahul Verma", created_at: "2024-03-14" },
        ];
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Complaints</h2>
                    <p className="text-muted-foreground mt-1 text-sm">
                        Monitor and assign maintenance requests from students.
                    </p>
                </div>
                <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Log Complaint
                </Button>
            </div>

            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Complaint</TableHead>
                        <TableHead>Reported By</TableHead>
                        <TableHead>Location</TableHead>
                        <TableHead>Priority</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {complaints.map((c) => (
                        <TableRow key={c.id}>
                            <TableCell className="font-medium max-w-[300px]">
                                <div className="flex items-center gap-2">
                                    <div className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 ${c.status === 'Resolved' ? 'bg-green-100 text-green-600 dark:bg-green-900/30' : 'bg-primary/10 text-primary'
                                        }`}>
                                        {c.status === 'Resolved' ? <CheckCircle2 className="h-4 w-4" /> : <Wrench className="h-4 w-4" />}
                                    </div>
                                    <div className="truncate">
                                        <div className="font-semibold">{c.complaint_type}</div>
                                        <div className="text-xs text-muted-foreground truncate">{c.description}</div>
                                    </div>
                                </div>
                            </TableCell>
                            <TableCell>
                                <div className="text-sm">{c.reported_by}</div>
                                <div className="text-xs text-muted-foreground">{c.created_at}</div>
                            </TableCell>
                            <TableCell>Room {c.room}</TableCell>
                            <TableCell>
                                <span className={`text-xs font-semibold ${c.priority === 'High' ? 'text-red-500' :
                                    c.priority === 'Medium' ? 'text-yellow-500' :
                                        'text-blue-500'
                                    }`}>
                                    {c.priority}
                                </span>
                            </TableCell>
                            <TableCell>
                                <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${c.status === 'Resolved' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                                    c.status === 'In Progress' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' :
                                        'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                                    }`}>
                                    {c.status === 'Pending' && <Clock className="h-3 w-3" />}
                                    {c.status}
                                </span>
                            </TableCell>
                            <TableCell className="text-right">
                                <Button variant="ghost" size="sm">Manage</Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}
