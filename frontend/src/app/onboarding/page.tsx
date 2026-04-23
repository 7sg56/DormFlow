"use client";

import { useState, useEffect } from "react";
import { useUser, useClerk } from "@clerk/nextjs";

import { Building2, Users, Wrench, ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api";

/**
 * Cookie name matching the middleware check.
 * Set here after successful onboarding link so the middleware
 * immediately recognises the user as onboarded.
 */
const ONBOARDING_COOKIE = "dormflow_onboarded";

type Role = "student" | "warden" | "technician";

interface RoleOption {
    role: Role;
    title: string;
    description: string;
    identifierLabel: string;
    identifierPlaceholder: string;
    identifierHint: string;
    icon: typeof Building2;
    color: string;
}

const ROLE_OPTIONS: RoleOption[] = [
    {
        role: "student",
        title: "Student",
        description: "Access your room, fees, complaints, and hostel services.",
        identifierLabel: "Registration Number",
        identifierPlaceholder: "e.g. REG2024001",
        identifierHint: "Enter the registration number provided by your institution.",
        icon: Users,
        color: "border-emerald-500/40 hover:border-emerald-500 bg-emerald-500/5 hover:bg-emerald-500/10",
    },
    {
        role: "warden",
        title: "Warden",
        description: "Manage your hostel, students, rooms, and maintenance.",
        identifierLabel: "Warden Email",
        identifierPlaceholder: "e.g. warden@hostel.edu",
        identifierHint: "Enter the email address registered in the hostel system.",
        icon: Building2,
        color: "border-blue-500/40 hover:border-blue-500 bg-blue-500/5 hover:bg-blue-500/10",
    },
    {
        role: "technician",
        title: "Technician",
        description: "View assigned tasks, resolve complaints, update status.",
        identifierLabel: "Phone Number",
        identifierPlaceholder: "e.g. 9790100001",
        identifierHint: "Enter the phone number registered in the hostel system.",
        icon: Wrench,
        color: "border-orange-500/40 hover:border-orange-500 bg-orange-500/5 hover:bg-orange-500/10",
    },
];

/** Set a simple cookie readable by the Next.js middleware. */
function setOnboardingCookie() {
    document.cookie = `${ONBOARDING_COOKIE}=true; path=/; max-age=${60 * 60 * 24 * 365}; SameSite=Lax`;
}

export default function OnboardingPage() {
    const { user } = useUser();
    const { session } = useClerk();

    const [selectedRole, setSelectedRole] = useState<RoleOption | null>(null);
    const [identifier, setIdentifier] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [checking, setChecking] = useState(true);

    // On mount, check if the user is already linked in the DB.
    // If so, set the cookie and redirect immediately.
    useEffect(() => {
        async function checkStatus() {
            try {
                const token = await session?.getToken();
                if (!token) {
                    setChecking(false);
                    return;
                }

                const res = await fetch(`${API_BASE}/onboarding/status`, {
                    headers: { Authorization: `Bearer ${token}` },
                    credentials: "include",
                });
                const data = await res.json();

                if (data.success && data.data?.onboarded) {
                    // Already linked — set cookie and go to dashboard
                    setOnboardingCookie();
                    window.location.href = "/dashboard";
                    return;
                }
            } catch {
                // Ignore — user just stays on onboarding page
            }
            setChecking(false);
        }

        if (session) {
            checkStatus();
        } else {
            setChecking(false);
        }
    }, [session]);

    async function handleLink() {
        if (!selectedRole || !identifier.trim()) return;

        setLoading(true);
        setError(null);

        try {
            const token = await session?.getToken();

            const res = await fetch(`${API_BASE}/onboarding/link`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
                credentials: "include",
                body: JSON.stringify({
                    role: selectedRole.role,
                    identifier: identifier.trim(),
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.error || "Something went wrong. Please try again.");
                return;
            }

            // Set the cookie so the middleware immediately lets us through
            setOnboardingCookie();

            // Hard redirect to dashboard
            window.location.href = "/dashboard";
        } catch {
            setError("Network error. Please check your connection and try again.");
        } finally {
            setLoading(false);
        }
    }

    // Show a loading state while checking existing onboarding status
    if (checking) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-muted/30 to-background">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-muted/30 to-background p-4">
            <div className="w-full max-w-2xl space-y-8">
                {/* Header */}
                <div className="text-center space-y-2">
                    <div className="flex items-center justify-center gap-2 mb-4">
                        <Building2 className="h-8 w-8 text-primary" />
                        <span className="text-2xl font-bold tracking-tight text-primary">DormFlow</span>
                    </div>
                    <h1 className="text-3xl font-bold tracking-tight">Welcome to DormFlow</h1>
                    <p className="text-muted-foreground text-lg">
                        Select your role and verify your identity to get started.
                    </p>
                    {user?.primaryEmailAddress && (
                        <p className="text-sm text-muted-foreground">
                            Signed in as <span className="font-medium text-foreground">{user.primaryEmailAddress.emailAddress}</span>
                        </p>
                    )}
                </div>

                {/* Role Selection */}
                {!selectedRole ? (
                    <div className="space-y-4">
                        <h2 className="text-lg font-semibold text-center">I am a...</h2>
                        <div className="grid gap-4 md:grid-cols-3">
                            {ROLE_OPTIONS.map((option) => (
                                <button
                                    key={option.role}
                                    onClick={() => setSelectedRole(option)}
                                    className={`rounded-xl border-2 p-6 text-left transition-all duration-200 ${option.color} cursor-pointer`}
                                >
                                    <option.icon className="h-8 w-8 mb-3 text-foreground" />
                                    <h3 className="font-semibold text-lg mb-1">{option.title}</h3>
                                    <p className="text-sm text-muted-foreground">{option.description}</p>
                                </button>
                            ))}
                        </div>
                    </div>
                ) : (
                    /* Identity Verification */
                    <Card className="border-2">
                        <CardHeader className="pb-4">
                            <div className="flex items-center justify-between">
                                <CardTitle className="flex items-center gap-2">
                                    <selectedRole.icon className="h-5 w-5" />
                                    Link as {selectedRole.title}
                                </CardTitle>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                        setSelectedRole(null);
                                        setIdentifier("");
                                        setError(null);
                                    }}
                                >
                                    Change Role
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <label
                                    htmlFor="identifier"
                                    className="text-sm font-medium leading-none"
                                >
                                    {selectedRole.identifierLabel}
                                </label>
                                <input
                                    id="identifier"
                                    type="text"
                                    value={identifier}
                                    onChange={(e) => setIdentifier(e.target.value)}
                                    placeholder={selectedRole.identifierPlaceholder}
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter") handleLink();
                                    }}
                                    autoFocus
                                />
                                <p className="text-xs text-muted-foreground">
                                    {selectedRole.identifierHint}
                                </p>
                            </div>

                            {error && (
                                <div className="rounded-md bg-destructive/10 border border-destructive/20 p-3 text-sm text-destructive">
                                    {error}
                                </div>
                            )}

                            <Button
                                onClick={handleLink}
                                disabled={loading || !identifier.trim()}
                                className="w-full"
                                size="lg"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Verifying...
                                    </>
                                ) : (
                                    <>
                                        Continue
                                        <ArrowRight className="ml-2 h-4 w-4" />
                                    </>
                                )}
                            </Button>

                            <p className="text-xs text-center text-muted-foreground">
                                Can&apos;t find your record? Contact your hostel administrator.
                            </p>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
}
