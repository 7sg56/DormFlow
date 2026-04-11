import { fetchServerApi } from "@/lib/server-api";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Wrench, Plus, CheckCircle2, Clock } from "lucide-react";

interface Complaint {
    complaint_id: string;
    complaint_type: string;
    description: string;
    priority: string;
    status: string;
    room?: { room_id: string; room_number: string };
    student?: { student_id: string; reg_no: string; first_name: string; last_name: string };
    technician?: { technician_id: string; name: string; specialization: string };
    created_at: string;
    resolved_at?: string;
    is_resolved?: boolean;
    resolution_notes?: string;
}

export default async function ComplaintsPage() {
    let complaints: Complaint[] = [];
    try {
        complaints = await fetchServerApi<Complaint[]>("/complaints") || [];
    } catch (err) {
        console.error("Failed to load complaints:", err);
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

            {complaints.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                    No complaints found.
                </div>
            ) : (
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
                            <TableRow key={c.complaint_id}>
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
                                    <div className="text-sm">
                                        {c.student ? `${c.student.first_name} ${c.student.last_name}` : '-'}
                                    </div>
                                    <div className="text-xs text-muted-foreground">
                                        {new Date(c.created_at).toLocaleDateString()}
                                    </div>
                                </TableCell>
                                <TableCell>Room {c.room?.room_number || '-'}</TableCell>
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
            )}
        </div>
    );
}
