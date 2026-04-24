const API_BASE_URL = typeof window === "undefined"
    ? (process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api")
    : (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api");

/**
 * Simplified API fetch — no JWT, no token refresh.
 * Uses cookie-based sessions via credentials: 'include'.
 */
export async function fetchApi<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const headers = new Headers(options.headers);
    if (!headers.has("Content-Type")) {
        headers.set("Content-Type", "application/json");
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers,
        credentials: "include",
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.error || "An error occurred while fetching data.");
    }

    return data.data;
}

/**
 * Fetch with pagination support.
 */
export async function fetchPaginatedApi<T>(
    endpoint: string,
    page: number = 1,
    limit: number = 20,
): Promise<{ data: T[]; pagination: { page: number; limit: number; total: number; totalPages: number } }> {
    const separator = endpoint.includes("?") ? "&" : "?";
    const response = await fetch(`${API_BASE_URL}${endpoint}${separator}page=${page}&limit=${limit}`, {
        credentials: "include",
    });

    const result = await response.json();
    if (!response.ok) {
        throw new Error(result.error || "API-Related Error occurred");
    }

    return { data: result.data, pagination: result.pagination };
}
