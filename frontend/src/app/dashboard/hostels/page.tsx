import { fetchApi } from "@/lib/api";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Building2, Plus } from "lucide-react";

interface Hostel {
    id: string;
    hostel_name: string;
    type: string;
    total_floors: number;
    warden_name: string;
}

export default async function HostelsPage() {
    let hostels: Hostel[] = [];
    try {
        hostels = await fetchApi<Hostel[]>("/hostels") || [];
    } catch (err) {
        console.error("Failed to load hostels:", err);
    }

    // Pre-fill some mock data if DB is empty or fails to connect
    if (hostels.length === 0) {
        hostels = [
            { id: "h1", hostel_name: "Sunrise Boys Hostel", type: "Boys", total_floors: 5, warden_name: "Mr. Ramesh Kumar" },
            { id: "h2", hostel_name: "Moonlight Girls Hostel", type: "Girls", total_floors: 4, warden_name: "Mrs. Sunita Sharma" },
            { id: "h3", hostel_name: "Starlight PG", type: "Co-ed", total_floors: 3, warden_name: "Mr. Anil Das" }
        ];
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Hostels</h2>
                    <p className="text-muted-foreground mt-1 text-sm">
                        Manage your dormitory buildings and basic information.
                    </p>
                </div>
                <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Hostel
                </Button>
            </div>

            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Floors</TableHead>
                        <TableHead>Warden</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {hostels.map((hostel) => (
                        <TableRow key={hostel.id || hostel.hostel_name}>
                            <TableCell className="font-medium flex items-center gap-2">
                                <div className="h-8 w-8 rounded bg-primary/10 flex items-center justify-center text-primary">
                                    <Building2 className="h-4 w-4" />
                                </div>
                                {hostel.hostel_name}
                            </TableCell>
                            <TableCell>{hostel.type}</TableCell>
                            <TableCell>{hostel.total_floors}</TableCell>
                            <TableCell>{hostel.warden_name}</TableCell>
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
