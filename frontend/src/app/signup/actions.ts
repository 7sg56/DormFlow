"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { fetchApi } from "@/lib/api";

interface SignupResponse {
    access_token: string;
    refresh_token: string;
    user: {
        user_id: string;
        email: string;
        role: string;
    };
}

export async function signupAction(formData: FormData) {
    const email = formData.get("email");
    const password = formData.get("password");
    const role = formData.get("role") || "student"; // Default to student
    // student_id is optional but required for students in the DB down the line, we'll keep it simple for now and omit during signup since we don't have the student profile yet.

    if (!email || !password) {
        return { error: "Email and password are required" };
    }

    try {
        const data = await fetchApi<SignupResponse>("/auth/register", {
            method: "POST",
            body: JSON.stringify({ email, password, role }),
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
        return { error: "Failed to create account. Please try again or use a different email." };
    }
}
