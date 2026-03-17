import { fetchApi } from "@/lib/api";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { BedDouble, Plus } from "lucide-react";

interface Room {
    id: string;
    room_number: string;
    floor: number;
    capacity: number;
    room_type: string;
    hostel_name: string;
    monthly_rent: number;
    room_condition: string;
}

export default async function RoomsPage() {
    let rooms: Room[] = [];
    try {
        rooms = await fetchApi<Room[]>("/rooms") || [];
    } catch (err) {
        console.error("Failed to load rooms:", err);
    }

    // Pre-fill some mock data if DB is empty or fails to connect
    if (rooms.length === 0) {
        rooms = [
            { id: "r1", room_number: "101", floor: 1, capacity: 2, room_type: "Double", hostel_name: "Sunrise Boys Hostel", monthly_rent: 4500, room_condition: "Good" },
            { id: "r2", room_number: "102", floor: 1, capacity: 1, room_type: "Single", hostel_name: "Sunrise Boys Hostel", monthly_rent: 6500, room_condition: "Excellent" },
            { id: "r3", room_number: "201", floor: 2, capacity: 3, room_type: "Triple", hostel_name: "Moonlight Girls", monthly_rent: 3000, room_condition: "Needs Repair" }
        ];
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Rooms</h2>
                    <p className="text-muted-foreground mt-1 text-sm">
                        Manage all the rooms across different hostels.
                    </p>
                </div>
                <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Room
                </Button>
            </div>

            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Location</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Capacity</TableHead>
                        <TableHead>Rent (₹)</TableHead>
                        <TableHead>Condition</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {rooms.map((room) => (
                        <TableRow key={room.id || room.room_number}>
                            <TableCell className="font-medium">
                                <div className="flex items-center gap-2">
                                    <div className="h-8 w-8 rounded bg-primary/10 flex items-center justify-center text-primary">
                                        <BedDouble className="h-4 w-4" />
                                    </div>
                                    <div>
                                        <div className="font-semibold">{room.room_number}</div>
                                        <div className="text-xs text-muted-foreground">{room.hostel_name} • Floor {room.floor}</div>
                                    </div>
                                </div>
                            </TableCell>
                            <TableCell>{room.room_type}</TableCell>
                            <TableCell>{room.capacity}</TableCell>
                            <TableCell>{room.monthly_rent}</TableCell>
                            <TableCell>
                                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${room.room_condition === 'Excellent' || room.room_condition === 'Good'
                                    ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                                    : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                                    }`}>
                                    {room.room_condition}
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
