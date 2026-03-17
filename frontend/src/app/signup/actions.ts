"use server";

import { cookies } from "next/headers";
import { fetchServerApi } from "@/lib/server-api";

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
    const confirmPassword = formData.get("confirmPassword");
    const role = "student"; // Always student for public registration
    // student_id is optional but required for students in the DB down the line, we'll keep it simple for now and omit during signup since we don't have the student profile yet.

    if (!email || !password) {
        return { error: "Email and password are required" };
    }

    // Client-side validation for password match (server also validates)
    if (password !== confirmPassword) {
        return { error: "Passwords do not match" };
    }

    try {
        const data = await fetchServerApi<SignupResponse>("/auth/register", {
            method: "POST",
            body: JSON.stringify({ email, password, confirm_password: confirmPassword, role }),
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
                maxAge: 60 * 60, // 1 hour (matches JWT ACCESS_TOKEN_EXPIRY)
            });

            // Store refresh token (7 days to match JWT)
            if (data.refresh_token) {
                cookieStore.set("refresh_token", data.refresh_token, {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === "production",
                    sameSite: "lax",
                    path: "/",
                    maxAge: 60 * 60 * 24 * 7, // 7 days (matches JWT REFRESH_TOKEN_EXPIRY)
                });
            }

            // Store user object (1 hour - should match access token)
            cookieStore.set("user", JSON.stringify(data.user), {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "lax",
                path: "/",
                maxAge: 60 * 60, // 1 hour
            });

            return { success: true, data };
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
