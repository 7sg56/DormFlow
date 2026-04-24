import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Simple middleware: redirect unauthenticated users to /login.
 * Checks for the session cookie set by @fastify/session.
 */
export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Public routes (no auth required)
    const publicPaths = ["/login", "/api", "/_next", "/favicon.ico"];
    if (publicPaths.some((p) => pathname.startsWith(p)) || pathname === "/") {
        return NextResponse.next();
    }

    // Check for session cookie (fastify-session sets this)
    const sessionCookie = request.cookies.get("sessionId") ||
        request.cookies.get("session") ||
        request.cookies.get("connect.sid");

    if (!sessionCookie) {
        return NextResponse.redirect(new URL("/login", request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
