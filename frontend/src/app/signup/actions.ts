"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
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

interface FormState {
    error?: string;
}

/**
 * Helper function to sync tokens to localStorage for client-side components
 * This is needed because client-side fetchApi in auth-utils.ts uses localStorage
 */
interface TokensForLocalStorage {
    access_token: string;
    refresh_token: string;
    user: {
        user_id: string;
        email: string;
        role: string;
    };
}

async function syncTokensToLocalStorage(tokens: TokensForLocalStorage): Promise<void> {
    if (typeof window === "undefined") return;

    try {
        localStorage.setItem("dormflow_access_token", tokens.access_token);
        if (tokens.refresh_token) {
            localStorage.setItem("dormflow_refresh_token", tokens.refresh_token);
        }
        if (tokens.user) {
            localStorage.setItem("dormflow_user", JSON.stringify(tokens.user));
        }
    } catch (error) {
        console.error("Error syncing tokens to localStorage:", error);
    }
}

export async function signupAction(_prevState: FormState | null, formData: FormData) {
    const email = formData.get("email");
    const password = formData.get("password");
    const confirmPassword = formData.get("confirmPassword");
    const role = "student"; // Always student for public registration

    if (!email || !password) {
        return { error: "Email and password are required" };
    }

    // Server-side validation for password match
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

            // Store user object (NOT httpOnly so client-side can read for sidebar)
            // Token and refresh_token remain httpOnly for security
            cookieStore.set("user", JSON.stringify(data.user), {
                httpOnly: false,
                secure: process.env.NODE_ENV === "production",
                sameSite: "lax",
                path: "/",
                maxAge: 60 * 60, // 1 hour
            });

            // Also sync tokens to localStorage for client-side components
            await syncTokensToLocalStorage({
                access_token: data.access_token,
                refresh_token: data.refresh_token,
                user: data.user,
            });

            // Redirect to dashboard after successful signup
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
