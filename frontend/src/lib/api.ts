const API_BASE_URL = typeof window === "undefined"
    ? (process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api")
    : (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api");

export type FetchOptions = RequestInit & {
    requireAuth?: boolean;
    skipRefresh?: boolean; // Skip automatic token refresh
    token?: string | null; // Manually provide token (e.g. from server cookies)
};

interface ErrorDetail {
    field: string;
    message: string;
}

/**
 * Refresh access token using refresh token
 * Note: Since cookies are httpOnly, we cannot read the refresh token from client-side JS.
 * The browser will automatically send the httpOnly refresh_token cookie with credentials: 'include'.
 * However, the /auth/refresh endpoint expects the refresh_token in the request body.
 * We need to use a server action for this since server-side code can read httpOnly cookies.
 */
async function refreshAccessToken(): Promise<boolean> {
    try {
        // For client-side calls, we need to use a server action to access httpOnly cookies
        if (typeof window !== "undefined") {
            // Call a server action to refresh tokens
            const response = await fetch("/api/auth/refresh", {
                method: "POST",
                credentials: 'include',
            });
            return response.ok;
        }

        // Server-side path - would use server-to-server approach
        return false;
    } catch (error) {
        console.error("Token refresh failed:", error);
        return false;
    }
}

let isRefreshing = false;
let refreshPromise: Promise<boolean> | null = null;

/**
 * Main API fetch function with automatic token refresh
 */
export async function fetchApi<T>(endpoint: string, options: FetchOptions = {}): Promise<T> {
    const { requireAuth = true, skipRefresh = false, token: manualToken, headers, ...restOptions } = options;

    const requestHeaders = new Headers(headers);
    requestHeaders.set("Content-Type", "application/json");

    // Only set Authorization header if we have a manual token (server-side)
    // Client-side will rely on httpOnly cookies being sent automatically
    if (requireAuth && manualToken !== undefined && manualToken !== null) {
        requestHeaders.set("Authorization", `Bearer ${manualToken}`);
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...restOptions,
        headers: requestHeaders,
        credentials: 'include', // Include httpOnly cookies
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
            // Retry original request with new token (cookies will be sent automatically)
            const retryResponse = await fetch(`${API_BASE_URL}${endpoint}`, {
                ...restOptions,
                headers: requestHeaders,
                credentials: 'include',
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
