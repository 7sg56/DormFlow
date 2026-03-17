import { cookies } from "next/headers";

const API_BASE_URL = typeof window === "undefined"
    ? (process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api")
    : (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api");

type FetchOptions = RequestInit & {
    requireAuth?: boolean;
    skipRefresh?: boolean; // Skip automatic token refresh
};

interface ErrorDetail {
    field: string;
    message: string;
}

/**
 * Get token from cookies (works in both server and client)
 */
async function getToken(): Promise<string | null> {
    if (typeof window === "undefined") {
        const cookieStore = await cookies();
        return cookieStore.get("token")?.value || null;
    }
    // Client-side: read from document.cookie
    const match = document.cookie.match(/(^|;)\s*token\s*=\s*([^;]+)/);
    return match ? decodeURIComponent(match[2]) : null;
}

/**
 * Get refresh token from cookies
 */
async function getRefreshToken(): Promise<string | null> {
    if (typeof window === "undefined") {
        const cookieStore = await cookies();
        return cookieStore.get("refresh_token")?.value || null;
    }
    const match = document.cookie.match(/(^|;)\s*refresh_token\s*=\s*([^;]+)/);
    return match ? decodeURIComponent(match[2]) : null;
}

/**
 * Set cookie (works in both server and client)
 */
function setCookie(name: string, value: string, maxAge: number): void {
    if (typeof window === "undefined") {
        // Server-side: can't set cookies directly, this is handled by server actions
        return;
    }
    const isSecure = window.location.protocol === "https:";
    document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${maxAge}; SameSite=lax${isSecure ? "; Secure" : ""}`;
}

/**
 * Delete cookie
 */
function deleteCookie(name: string): void {
    if (typeof window === "undefined") {
        return;
    }
    document.cookie = `${name}=; path=/; max-age=0`;
}

/**
 * Refresh access token using refresh token
 */
async function refreshAccessToken(): Promise<boolean> {
    const refreshToken = await getRefreshToken();
    if (!refreshToken) {
        return false;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ refresh_token: refreshToken }),
        });

        if (response.ok) {
            const data = await response.json();
            if (data.data?.access_token) {
                // Update access token
                setCookie("token", data.data.access_token, 60 * 60); // 1 hour
                // Update refresh token (new one issued)
                if (data.data.refresh_token) {
                    setCookie("refresh_token", data.data.refresh_token, 60 * 60 * 24 * 7); // 7 days
                }
                return true;
            }
        }
    } catch (error) {
        console.error("Token refresh failed:", error);
    }

    // If refresh fails, clear tokens
    deleteCookie("token");
    deleteCookie("refresh_token");
    deleteCookie("user");
    return false;
}

let isRefreshing = false;
let refreshPromise: Promise<boolean> | null = null;

/**
 * Main API fetch function with automatic token refresh
 */
export async function fetchApi<T>(endpoint: string, options: FetchOptions = {}): Promise<T> {
    const { requireAuth = true, skipRefresh = false, headers, ...restOptions } = options;

    const requestHeaders = new Headers(headers);
    requestHeaders.set("Content-Type", "application/json");

    if (requireAuth) {
        const token = await getToken();
        if (token) {
            requestHeaders.set("Authorization", `Bearer ${token}`);
        }
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...restOptions,
        headers: requestHeaders,
    });

    const data = await response.json();

    // Handle unauthorized - try refresh token
    if (response.status === 401 && !skipRefresh && endpoint !== "/auth/login" && endpoint !== "/auth/register") {
        if (!isRefreshing) {
            isRefreshing = true;
            refreshPromise = refreshAccessToken();
        }

        const refreshed = await refreshPromise;
        isRefreshing = false;
        refreshPromise = null;

        if (refreshed) {
            // Retry original request with new token
            const newToken = await getToken();
            if (newToken) {
                requestHeaders.set("Authorization", `Bearer ${newToken}`);
            }
            const retryResponse = await fetch(`${API_BASE_URL}${endpoint}`, {
                ...restOptions,
                headers: requestHeaders,
            });
            const retryData = await retryResponse.json();

            if (!retryResponse.ok) {
                if (retryData.details) {
                    const detailErrors = Array.isArray(retryData.details)
                        ? retryData.details.map((d: ErrorDetail) => `${d.field}: ${d.message}`).join(", ")
                        : JSON.stringify(retryData.details);
                    throw new Error(`${retryData.error}: ${detailErrors}`);
                }
                throw new Error(retryData.error || "An error occurred while fetching the data.");
            }

            return retryData.data;
        }

        // Refresh failed - throw auth error
        throw new Error("Session expired. Please log in again.");
    }

    if (!response.ok) {
        if (data.details) {
            const detailErrors = Array.isArray(data.details)
                ? data.details.map((d: ErrorDetail) => `${d.field}: ${d.message}`).join(", ")
                : JSON.stringify(data.details);
            throw new Error(`${data.error}: ${detailErrors}`);
        }
        throw new Error(data.error || "An error occurred while fetching the data.");
    }

    return data.data;
}
