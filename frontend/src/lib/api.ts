import { cookies } from "next/headers";

const API_BASE_URL = typeof window === "undefined"
    ? (process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api")
    : (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api");

type FetchOptions = RequestInit & {
    requireAuth?: boolean;
};

export async function fetchApi<T>(endpoint: string, options: FetchOptions = {}): Promise<T> {
    const { requireAuth = true, headers, ...restOptions } = options;

    const requestHeaders = new Headers(headers);
    requestHeaders.set("Content-Type", "application/json");

    if (requireAuth) {
        const cookieStore = await cookies();
        const token = cookieStore.get("token")?.value;

        if (token) {
            requestHeaders.set("Authorization", `Bearer ${token}`);
        }
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...restOptions,
        headers: requestHeaders,
    });

    const data = await response.json();

    if (!response.ok) {
        if (data.details) {
            const detailErrors = Array.isArray(data.details)
                ? data.details.map((d: any) => `${d.field}: ${d.message}`).join(", ")
                : JSON.stringify(data.details);
            throw new Error(`${data.error}: ${detailErrors}`);
        }
        throw new Error(data.error || "An error occurred while fetching the data.");
    }

    return data.data; // Standardizing to return the data payload based on backend spec
}
