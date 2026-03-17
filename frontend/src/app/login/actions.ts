"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { fetchApi } from "@/lib/api";

interface LoginResponse {
    access_token: string;
    user: {
        user_id: string;
        email: string;
        role: string;
    };
}

export async function loginAction(formData: FormData) {
    const email = formData.get("email");
    const password = formData.get("password");

    if (!email || !password) {
        return { error: "Email and password are required" };
    }

    try {
        const data = await fetchApi<LoginResponse>("/auth/login", {
            method: "POST",
            body: JSON.stringify({ email, password }),
            requireAuth: false,
        });

        if (data?.access_token) {
            const cookieStore = await cookies();
            cookieStore.set("token", data.access_token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "lax",
                path: "/",
                maxAge: 60 * 60 * 24, // 1 day
            });

            // Store user object too if needed, or fetch it on the server
            cookieStore.set("user", JSON.stringify(data.user), {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "lax",
                path: "/",
                maxAge: 60 * 60 * 24,
            });

            redirect("/dashboard");
        } else {
            return { error: "Invalid response from server." };
        }
    } catch (error: unknown) {
        if (error instanceof Error) {
            return { error: error.message };
        }
    }
}

export async function logoutAction() {
    try {
        await fetchApi("/auth/logout", {
            method: "POST",
            requireAuth: true,
        });
    } catch (error) {
        console.error("Error during backend logout:", error);
    } finally {
        const cookieStore = await cookies();
        cookieStore.delete("token");
        cookieStore.delete("user");
        redirect("/login");
    }
}
