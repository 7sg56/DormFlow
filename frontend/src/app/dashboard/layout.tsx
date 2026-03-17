import { Sidebar } from "@/components/layout/sidebar";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex min-h-screen flex-col md:flex-row bg-muted/20">
            <Sidebar />
            <main className="flex-1 px-4 py-8 md:px-8 max-w-7xl mx-auto w-full">
                {children}
            </main>
        </div>
    );
}
