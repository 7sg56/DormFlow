import { Sidebar } from "@/components/layout/sidebar";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex min-h-screen flex-col md:flex-row bg-surface">
            <Sidebar />
            <main className="flex-1 px-6 py-6 md:px-8 md:py-8 max-w-[1280px] mx-auto w-full">
                {children}
            </main>
        </div>
    );
}
