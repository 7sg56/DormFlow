"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import type { UserRole } from "@/lib/auth";
import { Building2 } from "lucide-react";

const roles: { value: UserRole; label: string; placeholder: string; hint: string }[] = [
    { value: "student", label: "Student", placeholder: "e.g. REG2021001", hint: "Password = your Registration Number" },
    { value: "warden", label: "Warden", placeholder: "e.g. hw-001", hint: "Password = your Warden ID" },
    { value: "technician", label: "Technician", placeholder: "e.g. t-001", hint: "Password = your Technician ID" },
    { value: "admin", label: "Admin", placeholder: "admin", hint: "Credentials from .env file" },
];

export default function LoginPage() {
    const router = useRouter();
    const { login } = useAuth();
    const [selectedRole, setSelectedRole] = useState<UserRole>("student");
    const [identifier, setIdentifier] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const currentRole = roles.find((r) => r.value === selectedRole)!;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        const err = await login(selectedRole, identifier, password);
        if (err) {
            setError(err);
            setLoading(false);
        } else {
            router.push("/dashboard");
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
            <div className="w-full max-w-md">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center gap-2 mb-4">
                        <Building2 className="h-8 w-8 text-primary" />
                        <h1 className="text-3xl font-bold text-foreground">DormFlow</h1>
                    </div>
                    <p className="text-muted-foreground">Hostel Management System</p>
                </div>

                {/* Card */}
                <div className="bg-card rounded-lg border border-border shadow-sm p-6">
                    <h2 className="text-lg font-semibold mb-6 text-card-foreground">Sign In</h2>

                    {/* Role Tabs */}
                    <div className="grid grid-cols-4 gap-1 bg-muted p-1 rounded-lg mb-6">
                        {roles.map((role) => (
                            <button
                                key={role.value}
                                type="button"
                                onClick={() => { setSelectedRole(role.value); setError(""); }}
                                className={`py-2 px-1 text-xs font-medium rounded-md transition-all ${selectedRole === role.value
                                        ? "bg-card text-foreground shadow-sm"
                                        : "text-muted-foreground hover:text-foreground"
                                    }`}
                            >
                                {role.label}
                            </button>
                        ))}
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-foreground mb-1.5">
                                {selectedRole === "admin" ? "Username" : "ID"}
                            </label>
                            <input
                                type="text"
                                value={identifier}
                                onChange={(e) => setIdentifier(e.target.value)}
                                placeholder={currentRole.placeholder}
                                className="w-full px-3 py-2 rounded-md border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-foreground mb-1.5">
                                Password
                            </label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Enter password"
                                className="w-full px-3 py-2 rounded-md border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
                                required
                            />
                            <p className="text-xs text-muted-foreground mt-1">{currentRole.hint}</p>
                        </div>

                        {error && (
                            <div className="text-sm text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400 px-3 py-2 rounded-md">
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-2.5 px-4 bg-primary text-primary-foreground rounded-md font-medium text-sm hover:opacity-90 transition-opacity disabled:opacity-50"
                        >
                            {loading ? "Signing in..." : "Sign In"}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
