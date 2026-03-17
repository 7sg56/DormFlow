import { fetchApi } from "@/lib/api";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { FileText, Plus, Bell } from "lucide-react";

interface Notice {
    id: string;
    title: string;
    category: string;
    date: string;
    author: string;
    status: string;
}

export default async function NoticesPage() {
    let notices: Notice[] = [];
    try {
        notices = await fetchApi<Notice[]>("/notices") || [];
    } catch (err) {
        console.error("Failed to load notices:", err);
    }

    if (notices.length === 0) {
        notices = [
            { id: "n1", title: "Hostel Fee Submission Deadline", category: "Urgent", date: "2024-03-20", author: "Mgmt", status: "Active" },
            { id: "n2", title: "New Mess Menu for April", category: "Info", date: "2024-03-25", author: "Mess Secretary", status: "Draft" },
            { id: "n3", title: "Maintenance Alert: Water Supply", category: "Alert", date: "2024-03-15", author: "Warden", status: "Archived" },
        ];
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Notice Board</h2>
                    <p className="text-muted-foreground mt-1 text-sm">
                        Publish announcements and alerts to students and staff.
                    </p>
                </div>
                <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    New Notice
                </Button>
            </div>

            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Notice</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Author</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {notices.map((notice) => (
                        <TableRow key={notice.id || notice.title}>
                            <TableCell className="font-medium">
                                <div className="flex items-center gap-2">
                                    <div className={`h-8 w-8 rounded bg-primary/10 flex items-center justify-center ${notice.category === "Urgent" ? "text-red-500 bg-red-500/10" : "text-primary bg-primary/10"
                                        }`}>
                                        {notice.category === "Urgent" ? <Bell className="h-4 w-4" /> : <FileText className="h-4 w-4" />}
                                    </div>
                                    <div>
                                        <div className="font-semibold">{notice.title}</div>
                                    </div>
                                </div>
                            </TableCell>
                            <TableCell>
                                <span className={`text-xs font-semibold ${notice.category === 'Urgent' ? 'text-red-500' :
                                    notice.category === 'Alert' ? 'text-yellow-500' :
                                        'text-blue-500'
                                    }`}>
                                    {notice.category}
                                </span>
                            </TableCell>
                            <TableCell className="text-muted-foreground">{notice.author}</TableCell>
                            <TableCell>{notice.date}</TableCell>
                            <TableCell>
                                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${notice.status === 'Active' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                                    notice.status === 'Draft' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' :
                                        'bg-muted text-muted-foreground dark:bg-muted/50'
                                    }`}>
                                    {notice.status}
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
