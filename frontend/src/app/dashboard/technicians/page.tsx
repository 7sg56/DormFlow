import { fetchServerApi } from "@/lib/server-api";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { UserSquare2, Plus } from "lucide-react";

interface Technician {
    id: string;
    name: string;
    specialization: string;
    phone: string;
    shift: string;
    status: string;
}

export default async function TechniciansPage() {
    let technicians: Technician[] = [];
    try {
        technicians = await fetchServerApi<Technician[]>("/technicians") || [];
    } catch (err) {
        console.error("Failed to load technicians:", err);
    }

    // Pre-fill some mock data if DB is empty or fails to connect
    if (technicians.length === 0) {
        technicians = [
            { id: "t1", name: "Ramesh Singh", specialization: "Plumber", phone: "9876543210", shift: "Morning", status: "Available" },
            { id: "t2", name: "Suresh Kumar", specialization: "Electrician", phone: "9876543211", shift: "Evening", status: "Busy" },
            { id: "t3", name: "Mahesh Babu", specialization: "Carpenter", phone: "9876543212", shift: "Night", status: "Available" },
        ];
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Technicians</h2>
                    <p className="text-muted-foreground mt-1 text-sm">
                        Manage your maintenance staff and their current availability.
                    </p>
                </div>
                <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Technician
                </Button>
            </div>

            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Technician</TableHead>
                        <TableHead>Specialization</TableHead>
                        <TableHead>Shift</TableHead>
                        <TableHead>Available</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {technicians.map((person) => (
                        <TableRow key={person.id || person.name}>
                            <TableCell className="font-medium">
                                <div className="flex items-center gap-2">
                                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                        <UserSquare2 className="h-4 w-4" />
                                    </div>
                                    <div>
                                        <div className="font-semibold">{person.name}</div>
                                        <div className="text-xs text-muted-foreground">{person.phone}</div>
                                    </div>
                                </div>
                            </TableCell>
                            <TableCell>{person.specialization}</TableCell>
                            <TableCell>{person.shift}</TableCell>
                            <TableCell>
                                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${person.status === 'Available'
                                    ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                                    : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                                    }`}>
                                    {person.status}
                                </span>
                            </TableCell>
                            <TableCell className="text-right">
                                <Button variant="ghost" size="sm">Edit</Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}
