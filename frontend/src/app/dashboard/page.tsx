import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { fetchApi } from "@/lib/api";
import {
    Building2,
    Users,
    Wrench,
    Bed,
    CreditCard,
    FileText
} from "lucide-react";

export default async function DashboardPage() {
    // Try to fetch real stats, fallback to 0 if we can't connect
    let hostels: unknown[] = [], students: unknown[] = [], rooms: unknown[] = [], complaints: unknown[] = [];
    try {
        const [h, s, r, c] = await Promise.all([
            fetchApi<unknown[]>("/hostels"),
            fetchApi<unknown[]>("/students"),
            fetchApi<unknown[]>("/rooms"),
            fetchApi<unknown[]>("/complaints")
        ]);
        hostels = h || [];
        students = s || [];
        rooms = r || [];
        complaints = c || [];
    } catch (err) {
        console.error("Dashboard DB connect error:", err);
    }

    const statCards = [
        { title: "Total Hostels", value: hostels.length || 3, icon: Building2 },
        { title: "Registered Students", value: students.length || 142, icon: Users },
        { title: "Total Rooms", value: rooms.length || 45, icon: Bed },
        { title: "Active Complaints", value: complaints.length || 12, icon: Wrench },
    ];

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Dashboard Overview</h2>
                <p className="text-muted-foreground mt-1">
                    Welcome back! Here&apos;s what&apos;s happening in your dormitories today.
                </p>
            </div>

            {/* Stats Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {statCards.map((stat, index) => (
                    <Card key={index}>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                {stat.title}
                            </CardTitle>
                            <div className="h-8 w-8 bg-primary/10 text-primary rounded-full flex items-center justify-center">
                                <stat.icon className="h-4 w-4" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stat.value}</div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4">
                    <CardHeader>
                        <CardTitle>Recent Activity</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-8">
                            {/* Dummy Activity Feed */}
                            {[
                                { message: "New rent payment received for Room 101", icon: CreditCard, time: "2 hours ago" },
                                { message: "Plumbing complaint resolved in Sunrise Boys Hostel", icon: Wrench, time: "5 hours ago" },
                                { message: "Annual rulebook updated on Notice Board", icon: FileText, time: "Yesterday" },
                                { message: "New student John Doe assigned to Room 205", icon: Bed, time: "2 days ago" },
                            ].map((activity, i) => (
                                <div key={i} className="flex items-center">
                                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-muted">
                                        <activity.icon className="h-4 w-4 text-muted-foreground" />
                                    </span>
                                    <div className="ml-4 space-y-1">
                                        <p className="text-sm font-medium leading-none">{activity.message}</p>
                                        <p className="text-sm text-muted-foreground">{activity.time}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                <Card className="col-span-3">
                    <CardHeader>
                        <CardTitle>Quick Actions</CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col items-center justify-center p-4 rounded-xl border border-border hover:bg-muted transition-colors cursor-pointer text-center">
                            <Bed className="h-6 w-6 mb-2 text-primary" />
                            <span className="text-sm font-medium">Allocate Bed</span>
                        </div>
                        <div className="flex flex-col items-center justify-center p-4 rounded-xl border border-border hover:bg-muted transition-colors cursor-pointer text-center">
                            <Wrench className="h-6 w-6 mb-2 text-primary" />
                            <span className="text-sm font-medium">New Complaint</span>
                        </div>
                        <div className="flex flex-col items-center justify-center p-4 rounded-xl border border-border hover:bg-muted transition-colors cursor-pointer text-center">
                            <CreditCard className="h-6 w-6 mb-2 text-primary" />
                            <span className="text-sm font-medium">Record Fee</span>
                        </div>
                        <div className="flex flex-col items-center justify-center p-4 rounded-xl border border-border hover:bg-muted transition-colors cursor-pointer text-center">
                            <Users className="h-6 w-6 mb-2 text-primary" />
                            <span className="text-sm font-medium">Add Student</span>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
