import { fetchApi } from "@/lib/api";
import { cookies } from "next/headers";

/**
 * Get token from cookies (Server Component Only)
 */
export async function getServerToken(): Promise<string | null> {
    try {
        const cookieStore = await cookies();
        return cookieStore.get("token")?.value || null;
    } catch {
        return null;
    }
}

/**
 * Get refresh token from cookies (Server Component Only)
 */
export async function getServerRefreshToken(): Promise<string | null> {
    try {
        const cookieStore = await cookies();
        return cookieStore.get("refresh_token")?.value || null;
    } catch {
        return null;
    }
}

/**
 * Get user from cookies (Server Component Only)
 */
export async function getServerUser(): Promise<any | null> {
    try {
        const cookieStore = await cookies();
        const userCookie = cookieStore.get("user");
        return userCookie ? JSON.parse(userCookie.value) : null;
    } catch {
        return null;
    }
}

/**
 * Get user role from cookies (Server Component Only)
 */
export async function getServerUserRole(): Promise<string | null> {
    const user = await getServerUser();
    return user?.role || null;
}

/**
 * API fetch function for Server Components
 */
export async function fetchServerApi<T>(endpoint: string, options: any = {}): Promise<T> {
    const token = await getServerToken();
    return fetchApi<T>(endpoint, { ...options, token });
}
