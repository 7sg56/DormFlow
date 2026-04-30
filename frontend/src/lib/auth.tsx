"use client";

import { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";

export type UserRole = "admin" | "warden" | "student" | "technician";

export interface AuthUser {
    id: string;
    role: UserRole;
    name: string;
    reg_no?: string;
    hostel_id?: string;
    hostel_name?: string;
    specializations?: string;
}

interface AuthContextType {
    user: AuthUser | null;
    loading: boolean;
    login: (role: UserRole, identifier: string, password: string) => Promise<string | null>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    loading: true,
    login: async () => null,
    logout: async () => { },
});

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api";

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check existing session on mount
        fetch(`${API_BASE}/auth/me`, { credentials: "include" })
            .then((res) => (res.ok ? res.json() : null))
            .then((data) => {
                if (data?.success) setUser(data.data);
            })
            .catch(() => { })
            .finally(() => setLoading(false));
    }, []);

    const login = async (role: UserRole, identifier: string, password: string) => {
        try {
            const res = await fetch(`${API_BASE}/auth/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ role, identifier, password }),
            });
            const data = await res.json();
            if (data.success) {
                setUser(data.data);
                return null; // no error
            }
            return data.error || "Login failed";
        } catch {
            return "Network error";
        }
    };

    const logout = async () => {
        await fetch(`${API_BASE}/auth/logout`, {
            method: "POST",
            credentials: "include",
        });
        setUser(null);
        window.location.href = "/login";
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);
