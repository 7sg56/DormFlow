"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { fetchServerApi } from "@/lib/server-api";

interface LoginResponse {
    access_token: string;
    refresh_token: string;
    user: {
        user_id: string;
        email: string;
        role: string;
    };
}

interface FormState {
    error?: string;
}

export async function loginAction(_prevState: FormState | null, formData: FormData) {
    const email = formData.get("email");
    const password = formData.get("password");

    if (!email || !password) {
        return { error: "Email and password are required" };
    }

    try {
        const data = await fetchServerApi<LoginResponse>("/auth/login", {
            method: "POST",
            body: JSON.stringify({ email, password }),
            requireAuth: false,
        });

        if (data?.access_token) {
            const cookieStore = await cookies();

            // Store access token (1 hour expiry to match JWT)
            cookieStore.set("token", data.access_token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "lax",
                path: "/",
                maxAge: 60 * 60,
            });

            // Store refresh token (7 days to match JWT)
            if (data.refresh_token) {
                cookieStore.set("refresh_token", data.refresh_token, {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === "production",
                    sameSite: "lax",
                    path: "/",
                    maxAge: 60 * 60 * 24 * 7,
                });
            }

            // Store user object (NOT httpOnly so client-side can read for sidebar)
            cookieStore.set("user", JSON.stringify(data.user), {
                httpOnly: false,
                secure: process.env.NODE_ENV === "production",
                sameSite: "lax",
                path: "/",
                maxAge: 60 * 60,
            });

            redirect("/dashboard");
        } else {
            return { error: "Invalid response from server." };
        }
    } catch (error: unknown) {
        if (error instanceof Error) {
            return { error: error.message };
        }
        return { error: "An unknown error occurred." };
    }
}

export async function logoutAction() {
    try {
        await fetchServerApi("/auth/logout", {
            method: "POST",
            requireAuth: true,
        });
    } catch (error) {
        console.error("Error during backend logout:", error);
    } finally {
        const cookieStore = await cookies();
        cookieStore.delete("token");
        cookieStore.delete("refresh_token");
        cookieStore.delete("user");
        redirect("/login");
    }
}
