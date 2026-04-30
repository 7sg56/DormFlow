"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import type { UserRole } from "@/lib/auth";
import { Building2, Shield, ChevronRight } from "lucide-react";

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
        <div className="min-h-screen flex items-center justify-center bg-surface-dim p-4">
            {/* Subtle background pattern */}
            <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,var(--surface-container-low)_0%,var(--surface-dim)_70%)]" />

            <div className="relative w-full max-w-[420px] animate-fade-in">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center gap-2.5 mb-4">
                        <div className="h-10 w-10 rounded-[var(--radius-md)] bg-primary-container flex items-center justify-center">
                            <Building2 className="h-5 w-5 text-on-primary-container" />
                        </div>
                        <h1 className="font-headline text-[28px] font-bold text-on-surface tracking-tight">DormFlow</h1>
                    </div>
                    <p className="text-sm text-on-surface-variant">Hostel Management System</p>
                </div>

                {/* Card */}
                <div className="bg-card rounded-[var(--radius-lg)] border border-outline-variant shadow-[var(--shadow-md)] p-6">
                    {/* Security badge */}
                    <div className="flex items-center gap-2 mb-5">
                        <Shield className="h-4 w-4 text-tertiary" />
                        <h2 className="font-headline text-base font-semibold text-on-surface">Sign In</h2>
                    </div>

                    {/* Role Tabs */}
                    <div className="grid grid-cols-4 gap-1 bg-surface-container p-1 rounded-[var(--radius)] mb-6">
                        {roles.map((role) => (
                            <button
                                key={role.value}
                                type="button"
                                onClick={() => { setSelectedRole(role.value); setError(""); }}
                                className={`py-2 px-1 font-ui text-xs font-medium rounded-[var(--radius-sm)] transition-all duration-150 ${selectedRole === role.value
                                        ? "bg-card text-on-surface shadow-[var(--shadow-sm)]"
                                        : "text-on-surface-variant hover:text-on-surface"
                                    }`}
                            >
                                {role.label}
                            </button>
                        ))}
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="label-md text-on-surface-variant mb-1.5 block">
                                {selectedRole === "admin" ? "Username" : "ID"}
                            </label>
                            <input
                                type="text"
                                value={identifier}
                                onChange={(e) => setIdentifier(e.target.value)}
                                placeholder={currentRole.placeholder}
                                className="w-full px-3 py-2.5 rounded-[var(--radius)] border border-outline-variant bg-background font-ui text-sm text-on-surface placeholder:text-outline focus:outline-none focus:ring-2 focus:ring-ring focus:border-primary transition-all duration-150"
                                required
                            />
                        </div>

                        <div>
                            <label className="label-md text-on-surface-variant mb-1.5 block">
                                Password
                            </label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Enter password"
                                className="w-full px-3 py-2.5 rounded-[var(--radius)] border border-outline-variant bg-background font-ui text-sm text-on-surface placeholder:text-outline focus:outline-none focus:ring-2 focus:ring-ring focus:border-primary transition-all duration-150"
                                required
                            />
                            <p className="text-xs text-outline mt-1.5">{currentRole.hint}</p>
                        </div>

                        {error && (
                            <div className="text-sm font-ui text-danger-text bg-danger-bg border border-error/20 px-3 py-2.5 rounded-[var(--radius)]">
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-2.5 px-4 bg-primary-container text-on-primary rounded-[var(--radius)] font-ui font-semibold text-sm hover:bg-primary active:bg-primary shadow-[var(--shadow-sm)] transition-all duration-150 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
                        >
                            {loading ? (
                              <>
                                <div className="h-4 w-4 animate-spin rounded-full border-2 border-on-primary border-t-transparent" />
                                Signing in...
                              </>
                            ) : (
                              <>
                                Sign In
                                <ChevronRight className="h-4 w-4" />
                              </>
                            )}
                        </button>
                    </form>
                </div>

                {/* Footer */}
                <p className="text-center text-xs text-outline mt-6">
                    Institutional access only. Unauthorized use is prohibited.
                </p>
            </div>
        </div>
    );
}
