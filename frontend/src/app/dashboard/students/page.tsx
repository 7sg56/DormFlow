import { fetchServerApi } from "@/lib/server-api";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Users, Plus } from "lucide-react";

interface Student {
    id: string;
    reg_no: string;
    first_name: string;
    last_name: string;
    email_institutional?: string;
    course: string;
    department: string;
    status: string;
}

export default async function StudentsPage() {
    let students: Student[] = [];
    try {
        students = await fetchServerApi<Student[]>("/students") || [];
    } catch (err) {
        console.error("Failed to load students:", err);
    }

    // Pre-fill some mock data if DB is empty or fails to connect
    if (students.length === 0) {
        students = [
            { id: "s1", reg_no: "REG2024001", first_name: "Arjun", last_name: "Mehta", course: "B.Tech", department: "Computer Science", status: "Active" },
            { id: "s2", reg_no: "REG2024002", first_name: "Priya", last_name: "Sharma", course: "B.Tech", department: "Information Technology", status: "Active" },
            { id: "s3", reg_no: "REG2023045", first_name: "Rahul", last_name: "Verma", course: "MBA", department: "Management", status: "Inactive" },
        ];
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Students</h2>
                    <p className="text-muted-foreground mt-1 text-sm">
                        Manage student records and their current accommodation status.
                    </p>
                </div>
                <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Student
                </Button>
            </div>

            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Student</TableHead>
                        <TableHead>Reg. No</TableHead>
                        <TableHead>Course</TableHead>
                        <TableHead>Department</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {students.map((student) => (
                        <TableRow key={student.id || student.reg_no}>
                            <TableCell className="font-medium">
                                <div className="flex items-center gap-2">
                                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                        <Users className="h-4 w-4" />
                                    </div>
                                    <div>
                                        <div className="font-semibold">{student.first_name} {student.last_name}</div>
                                        <div className="text-xs text-muted-foreground">{student.email_institutional || `${student.first_name.toLowerCase()}@college.edu`}</div>
                                    </div>
                                </div>
                            </TableCell>
                            <TableCell>{student.reg_no}</TableCell>
                            <TableCell>{student.course}</TableCell>
                            <TableCell className="text-muted-foreground">{student.department}</TableCell>
                            <TableCell>
                                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${student.status === 'Active'
                                    ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                                    : 'bg-muted text-muted-foreground dark:bg-muted/50'
                                    }`}>
                                    {student.status}
                                </span>
                            </TableCell>
                            <TableCell className="text-right">
                                <Button variant="ghost" size="sm">View</Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}
