import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isProtectedRoute = createRouteMatcher(["/dashboard(.*)"]);
const isAuthRoute = createRouteMatcher(["/sign-in(.*)", "/sign-up(.*)"]);
const isOnboardingRoute = createRouteMatcher(["/onboarding(.*)"]);

export default clerkMiddleware(async (auth, req) => {
    const { userId, sessionClaims } = await auth();

    // Redirect signed-in users away from auth pages
    if (userId && isAuthRoute(req)) {
        return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    // Check if user has completed onboarding (has a role set)
    const userRole = (sessionClaims?.publicMetadata as Record<string, unknown>)?.role;
    const onboardingComplete = (sessionClaims?.publicMetadata as Record<string, unknown>)?.onboardingComplete;

    // Signed-in user without onboarding hitting a protected route -> redirect to onboarding
    if (userId && !onboardingComplete && !userRole && isProtectedRoute(req) && !isOnboardingRoute(req)) {
        return NextResponse.redirect(new URL("/onboarding", req.url));
    }

    // Signed-in user who completed onboarding hitting the onboarding page -> redirect to dashboard
    if (userId && onboardingComplete && isOnboardingRoute(req)) {
        return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    // Signed-in user on root page -> redirect to dashboard (if onboarded) or onboarding
    if (userId && req.nextUrl.pathname === "/") {
        if (onboardingComplete || userRole) {
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
