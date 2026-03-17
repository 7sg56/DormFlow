import { fetchApi } from "@/lib/api";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { CreditCard, Plus } from "lucide-react";

interface Fee {
    id: string;
    receipt_no: string;
    student_name: string;
    amount: number;
    paid_date: string;
    month: string;
    year: number;
    status: string;
}

export default async function FeesPage() {
    let fees: Fee[] = [];
    try {
        fees = await fetchApi<Fee[]>("/fees") || [];
    } catch (err) {
        console.error("Failed to load fees:", err);
    }

    // Pre-fill some mock data if DB is empty or fails to connect
    if (fees.length === 0) {
        fees = [
            { id: "f1", receipt_no: "RCPT-001", student_name: "Arjun Mehta", amount: 4500, paid_date: "2024-03-15", month: "March", year: 2024, status: "Paid" },
            { id: "f2", receipt_no: "RCPT-002", student_name: "Priya Sharma", amount: 3000, paid_date: "2024-03-14", month: "March", year: 2024, status: "Pending" },
            { id: "f3", receipt_no: "RCPT-003", student_name: "Rahul Verma", amount: 6500, paid_date: "2024-03-10", month: "March", year: 2024, status: "Overdue" },
        ];
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Fee Payments</h2>
                    <p className="text-muted-foreground mt-1 text-sm">
                        Track student monthly rents and transaction history.
                    </p>
                </div>
                <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Record Payment
                </Button>
            </div>

            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Transaction</TableHead>
                        <TableHead>Student</TableHead>
                        <TableHead>Period</TableHead>
                        <TableHead>Amount (₹)</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {fees.map((fee) => (
                        <TableRow key={fee.id || fee.receipt_no}>
                            <TableCell className="font-medium">
                                <div className="flex items-center gap-2">
                                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                        <CreditCard className="h-4 w-4" />
                                    </div>
                                    <div>
                                        <div className="font-semibold">{fee.receipt_no}</div>
                                        <div className="text-xs text-muted-foreground">{fee.paid_date}</div>
                                    </div>
                                </div>
                            </TableCell>
                            <TableCell>{fee.student_name}</TableCell>
                            <TableCell>{fee.month} {fee.year}</TableCell>
                            <TableCell className="font-medium text-foreground">{fee.amount}</TableCell>
                            <TableCell>
                                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${fee.status === 'Paid' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                                    fee.status === 'Pending' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' :
                                        'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                                    }`}>
                                    {fee.status}
                                </span>
                            </TableCell>
                            <TableCell className="text-right">
                                <Button variant="ghost" size="sm">Details</Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}
