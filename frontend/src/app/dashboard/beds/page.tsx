import { fetchApi } from "@/lib/api";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Bed, Plus } from "lucide-react";

interface Bed {
    id: string;
    bed_number: string;
    room_number: string;
    hostel_name: string;
    status: string;
}

export default async function BedsPage() {
    let beds: Bed[] = [];
    try {
        beds = await fetchApi<Bed[]>("/beds") || [];
    } catch (err) {
        console.error("Failed to load beds:", err);
    }

    // Pre-fill some mock data if DB is empty or fails to connect
    if (beds.length === 0) {
        beds = [
            { id: "b1", bed_number: "A", room_number: "101", hostel_name: "Sunrise Boys", status: "Occupied" },
            { id: "b2", bed_number: "B", room_number: "101", hostel_name: "Sunrise Boys", status: "Available" },
            { id: "b3", bed_number: "A", room_number: "201", hostel_name: "Moonlight Girls", status: "Available" },
            { id: "b4", bed_number: "B", room_number: "201", hostel_name: "Moonlight Girls", status: "Under Maintenance" },
        ];
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Beds</h2>
                    <p className="text-muted-foreground mt-1 text-sm">
                        Manage individual beds within rooms.
                    </p>
                </div>
                <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Bed
                </Button>
            </div>

            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Location</TableHead>
                        <TableHead>Bed Number</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {beds.map((bed) => (
                        <TableRow key={bed.id || `${bed.room_number}-${bed.bed_number}`}>
                            <TableCell className="font-medium">
                                <div className="flex items-center gap-2">
                                    <div className="h-8 w-8 rounded bg-primary/10 flex items-center justify-center text-primary">
                                        <Bed className="h-4 w-4" />
                                    </div>
                                    <div>
                                        <div className="font-semibold">Room {bed.room_number}</div>
                                        <div className="text-xs text-muted-foreground">{bed.hostel_name}</div>
                                    </div>
                                </div>
                            </TableCell>
                            <TableCell>Bed {bed.bed_number}</TableCell>
                            <TableCell>
                                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${bed.status === 'Available' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                                    bed.status === 'Occupied' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' :
                                        'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                                    }`}>
                                    {bed.status}
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
