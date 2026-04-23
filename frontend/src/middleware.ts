import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isProtectedRoute = createRouteMatcher(["/dashboard(.*)"]);
const isAuthRoute = createRouteMatcher(["/sign-in(.*)", "/sign-up(.*)"]);
const isOnboardingRoute = createRouteMatcher(["/onboarding(.*)"]);

/**
 * Cookie name used to track onboarding completion.
 * Set by the frontend after a successful POST /api/onboarding/link.
 *
 * We use a cookie instead of Clerk publicMetadata because the Clerk JWT
 * has a propagation delay — after the backend updates publicMetadata via
 * the Clerk API, the client-side JWT can take 60+ seconds to reflect
 * the change, causing a redirect loop between /onboarding and /dashboard.
 */
const ONBOARDING_COOKIE = "dormflow_onboarded";

export default clerkMiddleware(async (auth, req) => {
    const { userId } = await auth();

    // Redirect signed-in users away from auth pages
    if (userId && isAuthRoute(req)) {
        return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    // Check onboarding status from cookie (instant, no JWT delay)
    const onboarded = req.cookies.get(ONBOARDING_COOKIE)?.value === "true";

    // Signed-in user without onboarding hitting a protected route -> redirect to onboarding
    if (userId && !onboarded && isProtectedRoute(req) && !isOnboardingRoute(req)) {
        return NextResponse.redirect(new URL("/onboarding", req.url));
    }

    // Signed-in user who completed onboarding hitting the onboarding page -> redirect to dashboard
    if (userId && onboarded && isOnboardingRoute(req)) {
        return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    // Signed-in user on root page -> redirect to dashboard (if onboarded) or onboarding
    if (userId && req.nextUrl.pathname === "/") {
        if (onboarded) {
            return NextResponse.redirect(new URL("/dashboard", req.url));
        }
        return NextResponse.redirect(new URL("/onboarding", req.url));
    }

    // Protect dashboard routes
    if (isProtectedRoute(req)) {
        await auth.protect();
    }
});

export const config = {
    matcher: [
        "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
        "/(api|trpc)(.*)",
    ],
};
