import { fetchServerApi } from "@/lib/server-api";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Utensils, Plus } from "lucide-react";

interface Mess {
    id: string;
    name: string;
    capacity: number;
    meal_type: string;
    status: string;
    contractor: string;
}

export default async function MessesPage() {
    let messes: Mess[] = [];
    try {
        messes = await fetchServerApi<Mess[]>("/messes") || [];
    } catch (err) {
        console.error("Failed to load messes:", err);
    }

    // Pre-fill some mock data if DB is empty or fails to connect
    if (messes.length === 0) {
        messes = [
            { id: "m1", name: "North Indian Mess", capacity: 200, meal_type: "Veg/Non-Veg", status: "Active", contractor: "Ramesh Catering" },
            { id: "m2", name: "South Indian Mess", capacity: 150, meal_type: "Veg Only", status: "Active", contractor: "Suresh Food Services" },
            { id: "m3", name: "Diet Mess", capacity: 50, meal_type: "Healthy/Diet", status: "Inactive", contractor: "FitMeals Co." },
        ];
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Mess & Menu</h2>
                    <p className="text-muted-foreground mt-1 text-sm">
                        Manage cafeteria facilities, meal plans, and subscriptions.
                    </p>
                </div>
                <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Mess
                </Button>
            </div>

            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Mess Details</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Capacity</TableHead>
                        <TableHead>Contractor</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {messes.map((mess) => (
                        <TableRow key={mess.id || mess.name}>
                            <TableCell className="font-medium">
                                <div className="flex items-center gap-2">
                                    <div className="h-8 w-8 rounded bg-primary/10 flex items-center justify-center text-primary">
                                        <Utensils className="h-4 w-4" />
                                    </div>
                                    <div>
                                        <div className="font-semibold">{mess.name}</div>
                                    </div>
                                </div>
                            </TableCell>
                            <TableCell>{mess.meal_type}</TableCell>
                            <TableCell>{mess.capacity}</TableCell>
                            <TableCell className="text-muted-foreground">{mess.contractor}</TableCell>
                            <TableCell>
                                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${mess.status === 'Active'
                                    ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                                    : 'bg-muted text-muted-foreground dark:bg-muted/50'
                                    }`}>
                                    {mess.status}
                                </span>
                            </TableCell>
                            <TableCell className="text-right">
                                <Button variant="ghost" size="sm">View Menu</Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}
