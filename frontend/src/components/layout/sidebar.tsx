"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard,
    Building2,
    Bed,
    Users,
    UserSquare2,
    CreditCard,
    Wrench,
    FileText,
    Utensils,
    LogOut,
    Menu
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { logoutAction } from "@/app/login/actions";

const navItems = [
    {
        group: "Core", items: [
            { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
            { title: "Hostels & Rooms", href: "/dashboard/hostels", icon: Building2 },
            { title: "Beds", href: "/dashboard/beds", icon: Bed },
        ]
    },
    {
        group: "People", items: [
            { title: "Students", href: "/dashboard/students", icon: Users },
            { title: "Technicians", href: "/dashboard/technicians", icon: UserSquare2 },
        ]
    },
    {
        group: "Operations", items: [
            { title: "Fee Payments", href: "/dashboard/fees", icon: CreditCard },
            { title: "Complaints", href: "/dashboard/complaints", icon: Wrench },
            { title: "Mess & Menu", href: "/dashboard/messes", icon: Utensils },
        ]
    },
    {
        group: "Logs & Info", items: [
            { title: "Notice Board", href: "/dashboard/notices", icon: FileText },
        ]
    }
];

export function Sidebar() {
    const pathname = usePathname();
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            {/* Mobile Nav Toggle */}
            <div className="md:hidden p-4 border-b border-border flex items-center justify-between">
                <div className="flex items-center gap-2 font-semibold">
                    <Building2 className="h-5 w-5 text-primary" />
                    <span>DormFlow</span>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setIsOpen(!isOpen)}>
                    <Menu className="h-5 w-5" />
                </Button>
            </div>

            <div className={`fixed inset-y-0 left-0 z-50 w-64 transform flex-col bg-card border-r border-border transition-transform md:relative md:flex md:translate-x-0 ${isOpen ? "translate-x-0" : "-translate-x-full"}`}>
                <div className="flex h-16 items-center border-b border-border px-6 mt-16 md:mt-0 font-bold tracking-tight text-xl text-primary">
                    <Building2 className="mr-2 h-6 w-6" />
                    DormFlow
                </div>

                <div className="flex-1 overflow-y-auto py-4">
                    <nav className="space-y-6 px-4">
                        {navItems.map((group) => (
                            <div key={group.group}>
                                <h4 className="mb-2 px-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                    {group.group}
                                </h4>
                                <ul className="space-y-1">
                                    {group.items.map((item) => {
                                        const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
                                        return (
                                            <li key={item.title}>
                                                <Link
                                                    href={item.href}
                                                    onClick={() => setIsOpen(false)}
                                                    className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors ${isActive
                                                        ? "bg-primary/10 text-primary"
                                                        : "text-muted-foreground hover:bg-muted"
                                                        }`}
                                                >
                                                    <item.icon className="h-4 w-4" />
                                                    {item.title}
                                                </Link>
                                            </li>
                                        );
                                    })}
                                </ul>
                            </div>
                        ))}
                    </nav>
                </div>

                <div className="p-4 border-t border-border mt-auto">
                    <form action={logoutAction}>
                        <Button variant="ghost" className="w-full justify-start text-muted-foreground hover:text-foreground" type="submit">
                            <LogOut className="mr-2 h-4 w-4" />
                            Sign Out
                        </Button>
                    </form>
                </div>
            </div>

            {isOpen && (
                <div
                    className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm md:hidden"
                    onClick={() => setIsOpen(false)}
                />
            )}
        </>
    );
}
